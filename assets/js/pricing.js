export async function onRequestPost({ request, env }) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items" }), { status: 400 });
    }

    const packsRes = await fetch("https://velutinx.github.io/assets/js/packs-data.js");
    const packsText = await packsRes.text();

    const match = packsText.match(/const packsData = (\[[\s\S]*?\]);/);
    if (!match) throw new Error("Could not read packsData");

    const packsData = JSON.parse(match[1]);

    let total = 0;

    for (const id of items) {
      const pack = packsData.find(p => String(p.id) === String(id));
      if (!pack) continue;

      const tierKey = pack.price.replace("PRICE_", "");
      const price = parseFloat(env[`PRICE_${tierKey}`]) || 3.0;
      total += price;
    }

    return new Response(
      JSON.stringify({ total: total.toFixed(2) }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
