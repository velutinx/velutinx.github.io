export async function onRequestPost({ request, env }) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items" }), { status: 400 });
    }

    // Hardcoded prices for testing (remove later once env works)
    const prices = {
      LOW: 1.5,
      MED: 3.0,
      HIGH: 10.0
    };

    // Debug: log what env actually contains
    console.log("Available env keys:", Object.keys(env || {}));

    let total = 0;

    // Fetch packs-data.js (your source of truth)
    const packsRes = await fetch("https://velutinx.github.io/assets/js/packs-data.js");
    const packsText = await packsRes.text();

    const match = packsText.match(/const packsData = (\[[\s\S]*?\]);/);
    if (!match) throw new Error("Cannot parse packsData");

    const packsData = JSON.parse(match[1]);

    for (const id of items) {
      const pack = packsData.find(p => String(p.id) === String(id));
      if (!pack) continue;

      const tier = pack.price.replace("PRICE_", ""); // LOW / MED / HIGH
      const price = prices[tier] || 3.0;
      total += price;
    }

    return new Response(
      JSON.stringify({ total: total.toFixed(2) }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Pricing error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
