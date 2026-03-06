export async function onRequest(context) {
  const clientId = context.env.PAYPAL_CLIENT_ID;

  if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
    return new Response(
      'console.error("Missing or invalid PAYPAL_CLIENT_ID in Cloudflare environment variables");',
      {
        status: 500,
        headers: { "Content-Type": "application/javascript" }
      }
    );
  }

  // Clean and encode only the client-id part
  const cleanId = clientId.trim();
  const encodedId = encodeURIComponent(cleanId);
  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodedId}&currency=USD`;

  // Safe JS injection: escape quotes and backticks in URL (though not needed for PayPal ID, it's defensive)
  const escapedUrl = sdkUrl.replace(/`/g, '\\`').replace(/"/g, '\\"');

  const jsCode = `
    (function() {
      const script = document.createElement('script');
      script.src = "${escapedUrl}";
      script.async = true;
      script.onload = function() {
        console.log("PayPal SDK loaded successfully");
        // Optional: trigger your initPayPal() if not using interval
        if (typeof window.initPayPal === 'function') window.initPayPal();
      };
      script.onerror = function(err) {
        console.error("PayPal SDK failed to load", err);
      };
      document.head.appendChild(script);
    })();
  `;

  return new Response(jsCode.trim(), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
