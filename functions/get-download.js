export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const token = searchParams.get('token');

    if (!token) {
        return new Response(JSON.stringify({ error: "No token" }), { status: 400 });
    }

    // --- YOUR LINK VAULT ---
    // Add as many as you want here. Just follow the pattern.
    const vault = {
        "PACK001": "https://mega.nz/file/HIUl3LQI#2qV6CTq4mWazPxmSq6Ua0ePI8EqEOifWScjpJ5UnycU",
        "PACK178": "https://mega.nz/file/6N0WhJrK#AuvjKD8oA8_vv8ELqPut0Dz0CbgQylAyWyN569e89zU",
        "PACK003": "https://mega.nz/another-link-here",
        "PACK010": "https://mega.nz/yet-another-link"
    };

    // For now, it returns what is in the vault to test the success page
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
