export async function onRequestPost({ request }) {
  try {
    // Read raw body first to debug
    const rawBody = await request.text();
    console.log("Raw request body:", rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr.message);
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body",
        rawBody: rawBody,
        parseError: parseErr.message
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const items = body.items || [];
    if (!Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "items must be an array" }), { status: 400 });
    }

    // Hardcoded prices for now (we'll fix env later)
    const prices = { LOW: 1.5, MED: 3.0, HIGH: 10.0 };

    let total = 0;

    // Fetch packs-data.js
    const packsRes = await fetch("https://velutinx.github.io/assets/js/packs-data.js");
    const packsText = await packsRes.text();
    const match = packsText.match(/const packsData = (\[[\s\S]*?\]);/);
    if (!match) throw new Error("Cannot parse packsData");

    const packsData = JSON.parse(match[1]);

    for (const id of items) {
      const pack = packsData.find(p => String(p.id) === String(id));
      if (pack) {
        const tier = pack.price.replace("PRICE_", "");
        const price = prices[tier.toUpperCase()] || 3.0;
        total += price;
      }
    }

    return new Response(
      JSON.stringify({ total: total.toFixed(2) }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Pricing crash:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
