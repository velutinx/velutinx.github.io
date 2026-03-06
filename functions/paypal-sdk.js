export async function onRequest(context) {
  const clientId = context.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return new Response('console.error("PAYPAL_CLIENT_ID not set");', {
      headers: { "Content-Type": "application/javascript" }
    });
  }
  const cleanId = clientId.trim();
  const sdkUrl = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(cleanId) + "&currency=USD";
  const jsCode = [
    '(function(){',
    ' var s = document.createElement("script");',
    ' s.src = "' + sdkUrl.replace(/"/g, '\\"').replace(/\\/g, '\\\\') + '";',
    ' s.async = true;',
    ' s.onload = function(){ console.log("PayPal SDK loaded"); };',
    ' s.onerror = function(e){ console.error("PayPal SDK load failed", e); };',
    ' document.head.appendChild(s);',
    '})();'
  ].join('\n');
  return new Response(jsCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
