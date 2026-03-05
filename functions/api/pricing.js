export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const items = body.items || [];

    return new Response(JSON.stringify({
      status: "FUNCTION_WORKING",
      message: "✅ Function is running!",
      itemsReceived: items,
      priceLow: env.PRICE_LOW || "MISSING",
      priceMed: env.PRICE_MED || "MISSING",
      priceHigh: env.PRICE_HIGH || "MISSING",
      note: "If you see this JSON, everything is set up correctly"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      status: "ERROR",
      message: err.message,
      stack: err.stack
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
