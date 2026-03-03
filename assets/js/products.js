const productsData = [
  { id: 1, title: "Junie & Friends - Summer Mix Vol.4", price: 0.01, originalPrice: 0.01, discount: 20, image: "storeassets/1.jpg" },
  { id: 2, title: "Collection 45 / コレクション45 Bonus Pack", price: 12.50, originalPrice: 15.00, discount: 17, image: "storeassets/2.jpg" },
  { id: 3, title: "Chen Sisters - Midnight Expressions", price: 5.49, originalPrice: null, discount: 0, image: "storeassets/3.jpg" },
  { id: 4, title: "The Sisters Corner - Special Dreamscapes", price: 8.25, originalPrice: 10.50, discount: 21, image: "storeassets/4.jpg" },
  { id: 5, title: "Mama's Secret Art Pack 2026", price: 14.80, originalPrice: null, discount: 0, image: "storeassets/5.jpg" },
  { id: 6, title: "Wedding Day Illustrations Vol.2", price: 6.75, originalPrice: 8.90, discount: 24, image: "storeassets/6.jpg" },
  { id: 7, title: "Night Vibes - Neon & Shadows Mix", price: 9.30, originalPrice: null, discount: 0, image: "storeassets/7.jpg" },
  { id: 8, title: "Collection 38 / Ultra Rare Bonus Set", price: 11.20, originalPrice: 14.00, discount: 20, image: "storeassets/8.jpg" },
  { id: 9, title: "Junie Holiday Special - Cozy Edition", price: 4.99, originalPrice: 7.50, discount: 33, image: "storeassets/9.jpg" }
];

productsData.forEach((p, i) => {
  p.date = new Date(2026, 2, 20 - i*3).getTime();
  p.element = null;
  p.inCart = false;
});
