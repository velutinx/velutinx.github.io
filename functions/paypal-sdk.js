export async function onRequest(context) {
  const clientId = context.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    return new Response("Missing PAYPAL_CLIENT_ID variable", { status: 500 });
  }

  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&debug=false`;

  // Return just the <script> tag (simplest & most compatible with your current HTML)
  const scriptTag = `<script src="${sdkUrl}"></script>`;

  return new Response(scriptTag, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
