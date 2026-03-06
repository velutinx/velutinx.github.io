export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const token = searchParams.get('token');
    const itemsParam = searchParams.get('items'); // Get the list of packs from the URL

    if (!token) {
        return new Response(JSON.stringify({ error: "No token" }), { status: 400 });
    }

    // --- YOUR FULL VAULT ---
    const vault = {
        "PACK001": "https://mega.nz/file/HE9zFQCA#4Q0od_bgqFSCyqlP42u3YvK-0AE29ffzjyojYckKsPU",
        "PACK175": "https://mega.nz/file/yNEXHaaT#QdLyraYfzXST9VAwbQurSJih4Ftcy2qIFUx6IdNVWi4",
        "PACK176": "https://mega.nz/file/vAMCwRaC#Ri6JzFpFJ8jZWWlfpIOe3X-3R7nVG2-bQDbCivFfTLA",
        "PACK177": "https://mega.nz/file/CEMRyI7a#g7euNAwOnAhUJNr34o8995j7t_W4wYtYAy8eYMZ2OSE",
        "PACK178": "https://mega.nz/file/bUdgmASK#TnNMZ8tUWHaOS7hne4VxncEea5fCwLBbaQQ4dkeyAG8"
    };

    // Split the items (e.g., "PACK001,PACK175") into an array
    const requestedPacks = itemsParam ? itemsParam.split(',') : [];

    // Filter the vault to only include what was requested
    const itemsToReturn = requestedPacks.map(pkg => {
        return {
            title: pkg,
            link: vault[pkg] || "#" // Returns # if the pack name is misspelled
        };
    }).filter(item => item.link !== "#");

    const result = {
        order_id: "00001",
        items: itemsToReturn
    };

    return new Response(JSON.stringify(result), {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
        }
    });
}
