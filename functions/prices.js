// functions/prices.js
export async function onRequest(context) {
  const low  = context.env.PRICE_LOW  || "1.5";
  const med  = context.env.PRICE_MED  || "3";
  const high = context.env.PRICE_HIGH || "10";

  const prices = {
    low:  parseFloat(low),
    med:  parseFloat(med),
    high: parseFloat(high)
  };

  return new Response(JSON.stringify(prices), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
