export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const token = searchParams.get('token');

    // 1. If there is no token, tell them to go away
    if (!token) {
        return new Response(JSON.stringify({ error: "No token" }), { status: 400 });
    }

    // 2. This is your "Hidden Vault"
    // You can add more rows here as you make more products.
    const vault = {
        "PACK001": "https://mega.nz/file/HIUl3LQI#2qV6CTq4mWazPxmSq6Ua0ePI8EqEOifWScjpJ5UnycU",
        "PACK005": "https://mega.nz/file/6N0WhJrK#AuvjKD8oA8_vv8ELqPut0Dz0CbgQylAyWyN569e89zU"
    };

    // 3. For now, we are giving them BOTH links just to test your success page.
    // Later, Supabase will tell us which ones they actually paid for.
    const result = {
        order_id: "00001",
        items: [
            { title: "PACK001", link: vault["PACK001"] },
            { title: "PACK005", link: vault["PACK005"] }
        ]
    };

    return new Response(JSON.stringify(result), {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
        }
    });
}
