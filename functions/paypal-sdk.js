export async function onRequest(context) {
  const clientId = context.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    return new Response('console.error("PAYPAL_CLIENT_ID not set");', {
      headers: { "Content-Type": "application/javascript" }
    });
  }

  // Clean and encode ONLY the client-id
  const cleanId = clientId.trim();
  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cleanId)}&currency=USD`;

  // Build safe JS code without template literal issues
  const escapedUrl = sdkUrl.replace(/"/g, '\\"').replace(/\\/g, '\\\\');

  const jsCode = `
    (function() {
      var script = document.createElement("script");
      script.src = "${escapedUrl}";
      script.async = true;
      script.onload = function() { console.log("PayPal SDK loaded"); };
      script.onerror = function(err) { console.error("PayPal SDK load failed", err); };
      document.head.appendChild(script);
    })();
  `;

  return new Response(jsCode.trim(), {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
