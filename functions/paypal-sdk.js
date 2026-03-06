export async function onRequest(context) {
  const clientId = context.env.PAYPAL_CLIENT_ID;

  if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
    return new Response(
      'console.error("PAYPAL_CLIENT_ID missing or invalid in Cloudflare env vars");',
      {
        status: 500,
        headers: { "Content-Type": "application/javascript" }
      }
    );
  }

  // Clean client-id (strip any accidental prefixes/suffixes)
  const cleanClientId = clientId.trim();

  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cleanClientId)}&currency=USD`;

  // Pure JS that injects the script safely
  const jsCode = `
    (function() {
      const script = document.createElement('script');
      script.src = "${sdkUrl.replace(/"/g, '\\"')}";  // escape any quotes
      script.async = true;
      script.onload = () => console.log("PayPal SDK loaded OK");
      script.onerror = (err) => console.error("PayPal SDK load failed", err);
      document.head.appendChild(script);
    })();
  `;

  return new Response(jsCode, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
