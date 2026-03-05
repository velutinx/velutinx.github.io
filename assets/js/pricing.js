export const onRequestPost = async ({ request, env }) => {
  try {
    // Always gets the latest packs-data.js (no duplication)
    const packsRes = await fetch("https://velutinx.github.io/assets/js/packs-data.js");
    const text = await packsRes.text();

    const match = text.match(/const packsData\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) throw new Error("Cannot read packs-data.js");

    const packsData = eval(match[1]);

    // Build map from your new PRICE_ tokens
    const tierMap = {};
    packsData.forEach(p => {
      if (p.price && p.price.startsWith("PRICE_")) {
        tierMap[p.id] = p.price.replace("PRICE_", "");
      }
    });

    const { items } = await request.json();

    let total = 0;
    const validated = [];

    for (const id of items) {
      const tier = tierMap[id];
      if (!tier) throw new Error(`Invalid pack: ${id}`);

      const price = Number(env[`PRICE_${tier}`]) || 3.0;
      total += price;
      validated.push({ id: Number(id), price });
    }

    return new Response(JSON.stringify({ 
      total: total.toFixed(2), 
      items: validated 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error(e);
    return new Response("Bad request", { status: 400 });
  }
};
