export async function onRequestPost(context) {
    try {
        const orderData = await context.request.json();

        const response = await fetch(`${context.env.SUPABASE_URL}/rest/v1/success`, {
            method: 'POST',
            headers: {
                'apikey': context.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${context.env.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(orderData)
        });

        return new Response(JSON.stringify({ success: response.ok }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
