// store.js — ONLY FILE YOU EVER EDIT FOR NEW ITEMS

const productsData = [
  { id: "pack001", title: "Junie & Friends - Summer Mix Vol.4", originalPrice: 0.01, discount: 0, image: "storeassets/1.jpg" },
  { id: "pack002", title: "Collection 45 / コレクション45 Bonus Pack", originalPrice: 1.50, discount: 0, image: "storeassets/2.jpg" },
  { id: "pack003", title: "Chen Sisters - Midnight Expressions", originalPrice: 3.00, discount: 0, image: "storeassets/3.jpg" },
  { id: "pack004", title: "The Sisters Corner - Special Dreamscapes", originalPrice: 10.00, discount: 0, image: "storeassets/4.jpg" },
  { id: "pack005", title: "Mama's Secret Art Pack 2026", originalPrice: 0.02, discount: 0, image: "storeassets/5.jpg" },
  { id: "pack006", title: "Wedding Day Illustrations Vol.2", originalPrice: 8.90, discount: 24, image: "storeassets/6.jpg" },
  { id: "pack007", title: "Night Vibes - Neon & Shadows Mix", originalPrice: 9.30, discount: 0, image: "storeassets/7.jpg" },
  { id: "pack008", title: "Collection 38 / Ultra Rare Bonus Set", originalPrice: 14.00, discount: 20, image: "storeassets/8.jpg" },
  { id: "pack009", title: "Junie Holiday Special - Cozy Edition", originalPrice: 7.50, discount: 33, image: "storeassets/9.jpg" }

  // To add new item: just paste a new line here ↓
  // { id: "pack010", title: "New Pack Yo", originalPrice: 5.99, discount: 10, image: "storeassets/10.jpg" },
];

// Auto-calculate price + date (don't touch this)
productsData.forEach((p, i) => {
  const discountRate = (p.discount || 0) / 100;
  p.price = p.originalPrice ? Math.round(p.originalPrice * (1 - discountRate) * 100) / 100 : 0.00;
  p.date = new Date(2026, 2, 20 - i * 3).getTime();
  p.element = null;
  p.inCart = false;
});
