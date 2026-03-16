// Bluesky API base URL
const BSKY_API = 'https://bsky.social/xrpc';

export default {
  async fetch(request, env, ctx) {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse the incoming JSON
      const { account, text } = await request.json();

      // Select the correct secret based on account number
      let password;
      if (account === '1') {
        password = env.BLUESKY1_APP_PASSWORD;
      } else if (account === '2') {
        password = env.BLUESKY2_APP_PASSWORD;
      } else {
        return new Response('Invalid account', { status: 400 });
      }

      // You also need the handle (or email) for each account.
      // You can store these as plain environment variables (not secrets)
      // For simplicity, we'll hardcode them here – replace with your actual handles!
      const handle1 = '‪@velutinx.bsky.social‬';
      const handle2 = '‪@velutinxx.bsky.social‬';
      const handle = account === '1' ? handle1 : handle2;

      // Step 1: Authenticate with Bluesky to get a session token
      const authResponse = await fetch(`${BSKY_API}/com.atproto.server.createSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: handle,
          password: password
        })
      });

      if (!authResponse.ok) {
        const error = await authResponse.text();
        return new Response(`Auth failed: ${error}`, { status: 401 });
      }

      const { accessJwt, did } = await authResponse.json();

      // Step 2: Create the post (record)
      const postResponse = await fetch(`${BSKY_API}/com.atproto.repo.createRecord`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessJwt}`
        },
        body: JSON.stringify({
          repo: did,
          collection: 'app.bsky.feed.post',
          record: {
            text: text,
            createdAt: new Date().toISOString()
            // For images, you would add an 'embed' field here after uploading blobs
          }
        })
      });

      if (!postResponse.ok) {
        const error = await postResponse.text();
        return new Response(`Post failed: ${error}`, { status: 500 });
      }

      const result = await postResponse.json();
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(`Server error: ${err.message}`, { status: 500 });
    }
  }
};
