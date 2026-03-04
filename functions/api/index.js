export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // ===============================
  // Fetch products dynamically from your public store.js (only file you edit)
  // ===============================
  async function getProducts() {
    try {
      const res = await fetch("https://velutinx.github.io/store.js");
      const text = await res.text();

      const start = text.indexOf('const productsData = [');
      const end = text.lastIndexOf('];') + 1;
      const arrayStr = text.slice(start + 'const productsData = '.length, end);

      // Safe parse (your own file)
      const products = new Function('return ' + arrayStr)();

      const PRODUCTS = {};
      products.forEach(p => {
        PRODUCTS[p.id] = { price: p.price, link: env[p.id.toUpperCase()] || null };
      });

      return PRODUCTS;
    } catch (err) {
      console.error("Failed to load products:", err);
      return {}; // empty fallback
    }
  }

  async function getAccessToken() {
    const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);
    const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
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
    if (!cart || !Array.isArray(cart)) return new Response("Invalid cart", { status: 400 });

    const PRODUCTS = await getProducts();

    let total = 0;
    for (const item of cart) {
      if (!PRODUCTS[item.id]) return new Response(`Invalid product: ${item.id}`, { status: 400 });
      total += PRODUCTS[item.id].price * (item.qty || 1);
    }
    total = total.toFixed(2);

    const token = await getAccessToken();
    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ amount: { currency_code: "USD", value: total } }] })
    });

    const orderData = await orderRes.json();
    return new Response(JSON.stringify({ orderID: orderData.id }), { status: 200 });
  }

  // ===============================
  // CAPTURE ORDER + SAVE FULL CART
  // ===============================
  if (action === "capture" && request.method === "POST") {
    const { orderID, cart } = await request.json();
    if (!orderID || !cart || !Array.isArray(cart)) return new Response("Invalid request", { status: 400 });

    const PRODUCTS = await getProducts();

    let serverTotal = 0;
    for (const item of cart) {
      if (!PRODUCTS[item.id]) return new Response(`Invalid product: ${item.id}`, { status: 400 });
      serverTotal += PRODUCTS[item.id].price * (item.qty || 1);
    }
    serverTotal = serverTotal.toFixed(2);

    const token = await getAccessToken();
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const captureData = await captureRes.json();
    if (captureData.status !== "COMPLETED") return new Response("Payment not completed", { status: 400 });

    const paidAmount = captureData.purchase_units[0].payments.captures[0].amount.value;
    if (serverTotal !== paidAmount) return new Response("Amount mismatch", { status: 400 });

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
        cart: cart,  // ← full cart array saved
        paypal_email: captureData.payer?.email_address || null
      })
    });

    return new Response(JSON.stringify({ success: true, ref }), { status: 200 });
  }

  // ===============================
  // MULTIPLE DOWNLOADS ENDPOINT
  // ===============================
  if (action === "get-downloads" && request.method === "GET") {
    const token = url.searchParams.get("token");
    if (!token) return new Response(JSON.stringify({ error: "Missing token" }), { status: 400 });

    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/purchases?paypal_order_id=eq.${token}&select=cart,purchase_number,paypal_order_id`,
      {
        headers: {
          "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const data = await res.json();
    if (!data || data.length === 0) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });

    const order = data[0];
    const PRODUCTS = await getProducts();
    const links = [];

    for (const item of order.cart || []) {
      const pack = PRODUCTS[item.id];
      if (pack && pack.link) {
        links.push({
          name: `Download ${item.id}`,
          url: pack.link
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      order_id: order.paypal_order_id,
      purchase_number: order.purchase_number,
      downloads: links
    }), { headers: { "Content-Type": "application/json" } });
  }

  // ===============================
  // OLD SINGLE DOWNLOAD (keep for now)
  // ===============================
  if (action === "download") {
    const ref = url.searchParams.get("ref");
    if (!ref) return new Response("Missing ref", { status: 400 });

    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/purchases?reference=eq.${ref}`, {
      headers: { "apikey": env.SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
    });

    const data = await res.json();
    if (!data.length) return new Response("Invalid reference", { status: 403 });

    const firstItem = data[0].cart[0].id;
    const PRODUCTS = await getProducts();
    const link = PRODUCTS[firstItem]?.link;

    if (!link) return new Response("No download link", { status: 404 });
    return Response.redirect(link, 302);
  }

  return new Response("Invalid route", { status: 404 });
}
