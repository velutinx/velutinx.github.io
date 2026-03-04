export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Get PayPal access token
  const auth = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(env.PAYPAL_CLIENT_ID + ":" + env.PAYPAL_SECRET),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const authData = await auth.json();

  // Verify order
  const order = await fetch(
    `https://api-m.paypal.com/v2/checkout/orders/${token}`,
    {
      headers: {
        "Authorization": `Bearer ${authData.access_token}`
      }
    }
  );

  const orderData = await order.json();

  if (orderData.status !== "COMPLETED") {
    return new Response(JSON.stringify({ error: "Payment not completed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const product = orderData.purchase_units[0].custom_id;

  const downloadLinks = {
    pack001: env.PACK001,
    pack002: env.PACK002,
    pack003: env.PACK003
  };

  const link = downloadLinks[product];

  if (!link) {
    return new Response(JSON.stringify({ error: "Invalid product" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Redirect instead of exposing link
  return Response.redirect(link, 302);
}
