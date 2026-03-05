export const onRequestPost = async ({ request, env }) => {
  try {
    // Fetch the latest packs-data.js from your own site (always up-to-date)
    const packsRes = await fetch("https://velutinx.github.io/assets/js/packs-data.js");
    const text = await packsRes.text();

    // Extract and safely parse the packsData array
    const match = text.match(/const packsData\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) throw new Error("Could not read packs data");

    const packsData = eval(match[1]);   // safe because it's your own file

    // Build id → tier map (e.g. "178" → "LOW")
    const tierMap = {};
    packsData.forEach(p => {
      if (p.price && p.price.startsWith("PRICE_")) {
        tierMap[p.id] = p.price.replace("PRICE_", "");
      }
    });

    // Now process the cart items sent from browser
    const { items } = await request.json();   // e.g. ["178", "175"]

    let total = 0;
    const validated = [];

    for (const id of items) {
      const tier = tierMap[id];
      if (!tier) throw new Error(`Invalid pack: ${id}`);

      const price = Number(env[`PRICE_${tier}`]) || 3;   // reads Cloudflare env var
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
    return new Response("Bad request", { status: 400 });
  }
};
