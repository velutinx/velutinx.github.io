export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const token = searchParams.get('token');
    const itemsParam = searchParams.get('items');

    if (!token) {
        return new Response(JSON.stringify({ error: "No token" }), { status: 400 });
    }

    const vault = {
        "PACK001": "https://mega.nz/file/HE9zFQCA#4Q0od_bgqFSCyqlP42u3YvK-0AE29ffzjyojYckKsPU",
        "PACK175": "https://mega.nz/file/yNEXHaaT#QdLyraYfzXST9VAwbQurSJih4Ftcy2qIFUx6IdNVWi4",
        "PACK176": "https://mega.nz/file/vAMCwRaC#Ri6JzFpFJ8jZWWlfpIOe3X-3R7nVG2-bQDbCivFfTLA",
        "PACK177": "https://mega.nz/file/CEMRyI7a#g7euNAwOnAhUJNr34o8995j7t_W4wYtYAy8eYMZ2OSE",
        "PACK178": "https://mega.nz/file/bUdgmASK#TnNMZ8tUWHaOS7hne4VxncEea5fCwLBbaQQ4dkeyAG8"
    };

    const requestedPacks = itemsParam ? itemsParam.split(',') : [];

    const itemsToReturn = requestedPacks.map(pkg => {
        // Clean the name just in case
        const cleanName = pkg.trim().toUpperCase();
        return {
            title: cleanName,
            link: vault[cleanName] || null
        };
    }).filter(item => item.link !== null);

    return new Response(JSON.stringify({ order_id: "00001", items: itemsToReturn }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
}
