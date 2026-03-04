// Remove the hard-coded PRODUCTS object completely

// ===============================
async function getProducts() {
  try {
    const res = await fetch("https://velutinx.github.io/store.js");
    const text = await res.text();

    // Extract just the productsData array from the file
    const start = text.indexOf('const productsData = [');
    const end = text.lastIndexOf('];') + 1;
    const arrayStr = text.slice(start + 'const productsData = '.length, end);

    // Parse it safely (eval is ok here since it's YOUR file on YOUR domain)
    const products = new Function('return ' + arrayStr)();

    // Convert to Worker-friendly format
    const PRODUCTS = {};
    products.forEach(p => {
      PRODUCTS[p.id] = { price: p.price, link: env[p.id.toUpperCase()] || null };
    });

    return PRODUCTS;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return {}; // fallback to empty
  }
}

// In your capture block (replace the old validation part):
if (action === "capture" && request.method === "POST") {
  const { orderID, cart } = await request.json();
  if (!orderID || !cart || !Array.isArray(cart)) return new Response("Invalid request", { status: 400 });

  // Fetch product list dynamically from your GitHub file
  const PRODUCTS = await getProducts();

  let serverTotal = 0;
  for (const item of cart) {
    if (!PRODUCTS[item.id]) return new Response(`Invalid product: ${item.id}`, { status: 400 });
    serverTotal += PRODUCTS[item.id].price * (item.qty || 1);
  }
  serverTotal = serverTotal.toFixed(2);

  // ... rest of your capture code (PayPal fetch, amount check, etc.) ...

  // Save full cart to Supabase
  await fetch(`${env.SUPABASE_URL}/rest/v1/purchases`, {
    method: "POST",
    headers: { /* your headers */ },
    body: JSON.stringify({
      reference: ref,
      order_id: orderID,
      amount: serverTotal,
      cart: cart,                    // full array saved
      paypal_email: captureData.payer?.email_address || null
    })
  });

  // ... return success ...
}
