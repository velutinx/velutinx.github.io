import { Storage } from 'megajs';

// ==============================================
// Durable Object – persistent MEGA session
// ==============================================
export class MegaSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = null;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const filename = url.searchParams.get('filename');

    if (!filename) {
      return new Response(JSON.stringify({ error: 'Missing filename' }), { status: 400 });
    }

    try {
      // Login only if not already connected (session stays alive)
      if (!this.storage) {
        this.storage = new Storage({
          email: this.env.MEGA_EMAIL,
          password: this.env.MEGA_PASSWORD
        });
        await this.storage.ready;
      }

      const file = this.storage.files.find(f => f.name === filename);
      if (!file) {
        return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
      }

      const link = await file.link();
      return new Response(JSON.stringify({ url: link }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
}

// ==============================================
// Main Worker – R2 uploads + MEGA link proxy
// ==============================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://velutinx.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ---------- NEW: MEGA link endpoint (GET) ----------
    if (url.pathname === '/mega-link' && request.method === 'GET') {
      const id = env.MEGA_SESSION.idFromName('global');
      const stub = env.MEGA_SESSION.get(id);
      const response = await stub.fetch(request);

      // Add CORS headers to the DO response
      const newHeaders = new Headers(response.headers);
      for (const [k, v] of Object.entries(corsHeaders)) {
        newHeaders.set(k, v);
      }
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    }

    // ---------- Existing R2 upload (POST) ----------
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!env.R2_BUCKET) {
      return new Response('R2 bucket binding missing', { status: 500, headers: corsHeaders });
    }

    try {
      const formData = await request.formData();
      const packNumber = formData.get('packNumber');
      const images = formData.getAll('images');

      if (!packNumber || !images.length) {
        return new Response(JSON.stringify({ error: 'Missing packNumber or images' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const bucket = env.R2_BUCKET;
      const urls = [];

      function getMimeType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const map = {
          jpg: 'image/jpeg', jpeg: 'image/jpeg',
          png: 'image/png', gif: 'image/gif', webp: 'image/webp'
        };
        return map[ext] || 'application/octet-stream';
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const ext = img.name.split('.').pop().toLowerCase();
        const newName = `pack${packNumber}-${i + 1}.${ext}`;
        const key = `i/${newName}`;

        await bucket.put(key, img.stream(), {
          httpMetadata: { contentType: getMimeType(img.name) }
        });

        urls.push(`https://www.velutinx.com/${key}`);
      }

      return new Response(JSON.stringify({ success: true, urls }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
