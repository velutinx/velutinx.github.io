export async function onRequest(context) {
  const clientId = context.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    return new Response('console.error("Cloudflare Error: PAYPAL_CLIENT_ID is not defined in environment variables.");', {
      headers: { "Content-Type": "application/javascript" }
    });
  }

  // Construct the official PayPal URL
  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId.trim()}&currency=USD`;

  try {
    const response = await fetch(sdkUrl);
    const scriptContent = await response.text();

    return new Response(scriptContent, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (err) {
    return new Response(`console.error("PayPal Proxy Error: ${err.message}");`, {
      headers: { "Content-Type": "application/javascript" }
    });
  }
}
