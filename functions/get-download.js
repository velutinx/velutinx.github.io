export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const token = searchParams.get('token');

    if (!token) {
        return new Response(JSON.stringify({ error: "Missing token" }), { status: 400 });
    }

    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    try {
        // 1. Ask Supabase for the order details
        const response = await fetch(`${supabaseUrl}/rest/v1/success?paypal_token=eq.${token}&select=cart,id`, {
            headers: { 
                'apikey': supabaseKey, 
                'Authorization': `Bearer ${supabaseKey}` 
            }
        });

        const data = await response.json();
        const order = data[0];

        if (!order) {
            return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
        }

        // 2. Your Protected Link Vault
        const vault = {
            "PACK001": "https://mega.nz/file/HE9zFQCA#4Q0od_bgqFSCyqlP42u3YvK-0AE29ffzjyojYckKsPU",
            "PACK175": "https://mega.nz/file/yNEXHaaT#QdLyraYfzXST9VAwbQurSJih4Ftcy2qIFUx6IdNVWi4",
            "PACK176": "https://mega.nz/file/vAMCwRaC#Ri6JzFpFJ8jZWWlfpIOe3X-3R7nVG2-bQDbCivFfTLA",
            "PACK177": "https://mega.nz/file/CEMRyI7a#g7euNAwOnAhUJNr34o8995j7t_W4wYtYAy8eYMZ2OSE",
            "PACK178": "https://mega.nz/file/bUdgmASK#TnNMZ8tUWHaOS7hne4VxncEea5fCwLBbaQQ4dkeyAG8"
        };

        // 3. Map the 'cart' column to the Vault
        // This part handles "175, 176" AND "PACK175, PACK176"
        const rawItems = order.cart.split(',');
        const results = rawItems.map(item => {
            let id = item.trim().toUpperCase();
            
            // If the ID is just "001", turn it into "PACK001"
            if (!id.startsWith('PACK')) {
                id = 'PACK' + id;
            }

            return {
                title: id,
                link: vault[id] || null
            };
        }).filter(item => item.link !== null);

        return new Response(JSON.stringify({
            order_number: order.id,
            items: results
        }), {
            headers: { 
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Database connection failed" }), { status: 500 });
    }
}
