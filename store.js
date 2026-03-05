// store.js

// Load the master pack data
// (make sure this script tag comes AFTER <script src="assets/js/packs-data.js"></script> in your HTML)
const productsData = packsData.map((pack, index) => {
  // Extract numeric ID from string "001" → 1
  const numericId = parseInt(pack.id, 10);

  // Price logic: under 46 images = 1.50, else 3.00
  const price = pack.illustrationCount < 46 ? 1.50 : 3.00;

  return {
    id: numericId,                        // 1, 2, 3...
    title: pack.title,
    price: price,
    originalPrice: price,                 // no discount for now
    discount: 0,
    image: `storeassets/${numericId}.jpg`, // 1.jpg, 2.jpg, ...
    date: new Date(2026, 2, 20 - index * 3).getTime(), // your date logic
    element: null,
    inCart: false
  };
});

// Optional: sort by date descending (newest first)
productsData.sort((a, b) => b.date - a.date);

// Now use productsData as before in createCards(), filterAndSort(), etc.
