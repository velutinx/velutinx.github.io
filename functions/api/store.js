export async function onRequest(context) {

  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // ===============================
  // 🔹 PRODUCT DATABASE (EDIT HERE ONLY)
  // ===============================
  const PRODUCTS = {
    pack001: { price: 1.50, link: env.PACK001 },
    pack002: { price: 2.00, link: env.PACK002 },
    pack003: { price: 3.00, link: env.PACK003 }
  };
  // ===============================

  async function getAccessToken() {
    const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);

    const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const data = await res.json();
    return data.access_token;
  }

  // ===============================
  // CREATE ORDER
  // ===============================
  if (action === "create" && request.method === "POST") {

    const { cart } = await request.json();
    if (!cart || !Array.isArray(cart))
      return new Response("Invalid cart", { status: 400 });

    let total = 0;

    for (const item of cart) {
      if (!PRODUCTS[item.id])
        return new Response("Invalid product", { status: 400 });
      total += PRODUCTS[item.id].price * item.qty;
    }

    total = total.toFixed(2);

    const token = await getAccessToken();

    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: total
          }
        }]
      })
    });

    const orderData = await orderRes.json();

    return new Response(JSON.stringify({
      orderID: orderData.id
    }), { status: 200 });
  }

  // ===============================
  // CAPTURE ORDER
  // ===============================
  if (action === "capture" && request.method === "POST") {

    const { orderID, cart } = await request.json();
    if (!orderID || !cart)
      return new Response("Invalid request", { status: 400 });

    const token = await getAccessToken();

    const captureRes = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const captureData = await captureRes.json();

    if (captureData.status !== "COMPLETED")
      return new Response("Payment not completed", { status: 400 });

    const paidAmount =
      captureData.purchase_units[0].payments.captures[0].amount.value;

    let serverTotal = 0;

    for (const item of cart) {
      if (!PRODUCTS[item.id])
        return new Response("Invalid product", { status: 400 });
      serverTotal += PRODUCTS[item.id].price * item.qty;
    }

    serverTotal = serverTotal.toFixed(2);

    if (serverTotal !== paidAmount)
      return new Response("Amount mismatch", { status: 400 });

    const ref = crypto.randomUUID();

    await fetch(`${env.SUPABASE_URL}/rest/v1/purchases`, {
      method: "POST",
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        reference: ref,
        order_id: orderID,
        amount: serverTotal,
        cart: cart
      })
    });

    return new Response(JSON.stringify({
      success: true,
      ref
    }), { status: 200 });
  }

  // ===============================
  // DOWNLOAD
  // ===============================
  if (action === "download") {

    const ref = url.searchParams.get("ref");
    if (!ref)
      return new Response("Missing ref", { status: 400 });

    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/purchases?reference=eq.${ref}`,
      {
        headers: {
          "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const data = await res.json();
    if (!data.length)
      return new Response("Invalid reference", { status: 403 });

    const firstItem = data[0].cart[0].id;
    const link = PRODUCTS[firstItem].link;

    return Response.redirect(link, 302);
  }

  return new Response("Invalid route", { status: 404 });
}
