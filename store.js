// store.js

// Wait for packsData to be ready (small safety delay)
window.addEventListener('load', () => {
  if (typeof packsData === 'undefined' || !Array.isArray(packsData)) {
    console.error("packsData not loaded - check packs-data.js");
    document.getElementById("productGrid").innerHTML = "<p>Error loading products. Check console.</p>";
    return;
  }

  // Transform packsData into productsData format
  const productsData = packsData.map((pack, index) => {
    const numericId = parseInt(pack.id, 10);
    const priceNum = pack.illustrationCount < 46 ? 1.50 : 3.00;

    return {
      id: numericId,
      title: pack.title,
      price: priceNum,
      originalPrice: priceNum, // no discount for now
      discount: 0,
      image: `storeassets/${numericId}.jpg`,
      date: new Date(2026, 2, 20 - index * 3).getTime(),
      element: null,
      inCart: false
    };
  });

  // Optional: sort newest first
  productsData.sort((a, b) => b.date - a.date);

  // Now proceed with your existing shop logic
  const translations = { /* your translations object */ };

  const grid = document.getElementById("productGrid");
  const searchInput = document.getElementById("searchInput");
  const sortButtons = document.querySelectorAll(".sort-btn");
  // ... all your other variables ...

  // ... your formatPrice, updateAllPrices, setLanguage, etc. functions ...

  function createCards() {
    productsData.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.dataset.title = p.title.toLowerCase();
      card.dataset.price = p.price;
      card.dataset.date = p.date;
      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}" class="card-image" width="248" height="300" loading="lazy">
        <div class="card-content">
          <div class="card-title">${p.title}</div>
          <div class="price-row">
            <div class="price" data-price="${p.price}" data-original="${p.originalPrice || p.price}">
              ${formatPrice(p.price, currentCurrency)}
              ${p.originalPrice && p.originalPrice > p.price ? `<del>${formatPrice(p.originalPrice, currentCurrency)}</del>` : ""}
            </div>
            <button class="cart-btn" title="Add to Cart" data-in-cart="false">
              <!-- your cart SVG -->
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
      p.element = card;

      // ... your cart button event listener ...
    });
  }

  // ... your updateCartDisplay, filterAndSort, setSort, resetFilters, toggleTheme, events ...

  // Init (call createCards after data is ready)
  createCards();
  filterAndSort();
  updateAllPrices();
  setLanguage(currentLang);

  if (localStorage.getItem("darkMode") === "true") document.body.classList.add("dark");
});
