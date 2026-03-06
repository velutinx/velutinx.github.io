export async function onRequest(context) {
  const clientId = context.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    return new Response('console.error("PAYPAL_CLIENT_ID not set in Cloudflare env vars");', {
      status: 500,
      headers: { "Content-Type": "application/javascript" }
    });
  }

  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;

  // Return pure JS code that creates and inserts the real PayPal script tag
  const jsCode = `
    (function() {
      const script = document.createElement('script');
      script.src = "${sdkUrl}";
      script.async = true;
      script.onload = function() { console.log("PayPal SDK loaded successfully"); };
      script.onerror = function() { console.error("PayPal SDK failed to load"); };
      document.head.appendChild(script);
    })();
  `;

  return new Response(jsCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
