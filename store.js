// =============================================
// store.js — ALL PRODUCT DATA LIVES HERE ONLY
// Add new items here. No other file needs editing.
// =============================================

const productsData = [
  { id: 1, title: "Junie & Friends - Summer Mix Vol.4", originalPrice: 0.01, discount: 0, image: "storeassets/1.jpg" },
  { id: 2, title: "Collection 45 / コレクション45 Bonus Pack", originalPrice: 1.50, discount: 0, image: "storeassets/2.jpg" },
  { id: 3, title: "Chen Sisters - Midnight Expressions", originalPrice: 3.00, discount: 0, image: "storeassets/3.jpg" },
  { id: 4, title: "The Sisters Corner - Special Dreamscapes", originalPrice: 10.00, discount: 0, image: "storeassets/4.jpg" },
  { id: 5, title: "Mama's Secret Art Pack 2026", originalPrice: 0.02, discount: 0, image: "storeassets/5.jpg" },
  { id: 6, title: "Wedding Day Illustrations Vol.2", originalPrice: 8.90, discount: 24, image: "storeassets/6.jpg" },
  { id: 7, title: "Night Vibes - Neon & Shadows Mix", originalPrice: 9.30, discount: 0, image: "storeassets/7.jpg" },
  { id: 8, title: "Collection 38 / Ultra Rare Bonus Set", originalPrice: 14.00, discount: 20, image: "storeassets/8.jpg" },
  { id: 9, title: "Junie Holiday Special - Cozy Edition", originalPrice: 7.50, discount: 33, image: "storeassets/9.jpg" }
];

// Auto-calculate final price + date (never edit this)
productsData.forEach((p, i) => {
  const discountRate = (p.discount || 0) / 100;
  p.price = p.originalPrice ? Math.round(p.originalPrice * (1 - discountRate) * 100) / 100 : 0.00;
  p.date = new Date(2026, 2, 20 - i * 3).getTime();
  p.element = null;
  p.inCart = false;
});
