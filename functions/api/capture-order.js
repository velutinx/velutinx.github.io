export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { orderID, cart } = body;

    if (!orderID || !cart || !Array.isArray(cart)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
    }

    // 1️⃣ Get PayPal Access Token
    const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);

    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "PayPal auth failed" }), { status: 500 });
    }

    // 2️⃣ Capture Order Server-Side
    const captureRes = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const captureData = await captureRes.json();

    if (captureData.status !== "COMPLETED") {
      return new Response(JSON.stringify({ error: "Payment not completed" }), { status: 400 });
    }

    const paidAmount =
      captureData.purchase_units[0].payments.captures[0].amount.value;

    // 3️⃣ Recalculate Total SERVER-SIDE
    const productDatabase = {
      "pack1": 10.00,
      "pack2": 15.00,
      "pack3": 25.00
    };

    let serverTotal = 0;

    for (const item of cart) {
      if (!productDatabase[item.id]) {
        return new Response(JSON.stringify({ error: "Invalid product" }), { status: 400 });
      }
      serverTotal += productDatabase[item.id] * item.qty;
    }

    serverTotal = serverTotal.toFixed(2);

    if (serverTotal !== paidAmount) {
      return new Response(JSON.stringify({ error: "Amount mismatch" }), { status: 400 });
    }

    // 4️⃣ Generate Secure Reference
    const purchaseRef = crypto.randomUUID();

    // 5️⃣ Insert Into Supabase (SERVER ONLY)
    await fetch(`${env.SUPABASE_URL}/rest/v1/purchases`, {
      method: "POST",
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        reference: purchaseRef,
        order_id: orderID,
        amount: serverTotal,
        cart: cart
      })
    });

    return new Response(JSON.stringify({
      success: true,
      ref: purchaseRef
    }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
