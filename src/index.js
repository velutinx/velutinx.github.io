// i2-uploader worker – R2 upload + MEGA link proxy (via Discord bot)

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

    // ---------- MEGA link proxy (GET) ----------
    if (url.pathname === '/mega-link' && request.method === 'GET') {
      const filename = url.searchParams.get('filename');
      if (!filename) {
        return new Response(JSON.stringify({ error: 'Missing filename' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Forward to the bot
      const botUrl = `${env.BOT_API_BASE}/api/mega-link?filename=${encodeURIComponent(filename)}`;
      try {
        const botResp = await fetch(botUrl);
        const data = await botResp.json();

        return new Response(JSON.stringify(data), {
          status: botResp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Bot unreachable: ' + err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
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
