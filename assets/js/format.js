/* ==================== STORE PAGE STYLES ==================== */
#shopTitle {
  visibility: hidden;
  transition: visibility 0s linear 0.1s;
}
#shopTitle.loaded {
  visibility: visible;
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 20px;
  line-height: 1;
  vertical-align: middle;
  margin-right: 8px;
  color: inherit;
}

.category-list li, .sort-btn {
  display: flex;
  align-items: center;
}

.shop-header {
  padding: 2.2rem 2.8rem 1.6rem;
  background: var(--bg);
}
.shop-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  flex-wrap: wrap;
}
.shop-left {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.shop-title {
  font-size: 2.3rem;
  font-weight: 800;
  color: #000;
  margin: 0;
}
body.dark .shop-title {
  color: var(--accent);
}

.main-container {
  display: flex;
  max-width: 1480px;
  margin: 0 auto;
  padding: 1.5rem 2.5rem;
  gap: 2.5rem;
}
.sidebar {
  width: 268px;
  flex-shrink: 0;
}
.products-section {
  flex: 1;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.9rem;
  color: var(--text);
  padding-left: 0.5rem;
}

.category-list {
  list-style: none;
  background: var(--card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  padding: 0;
}
.category-list li {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: var(--text);
  cursor: pointer;
  transition: 0.2s;
}
.category-list li:hover {
  background: #c0bcaa;
}
.category-list li.active {
  background: var(--accent);
  color: #1f1a12;
  font-weight: 600;
}

.sort-options {
  margin-top: 2rem;
}
.sort-btn {
  width: 100%;
  padding: 1rem 1.25rem;
  background: var(--card);
  border: 1px solid var(--border);
  text-align: left;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: var(--text);
}
.sort-btn.active {
  background: var(--accent);
  color: #1f1a12;
}
.sort-btn:hover:not(.active) {
  background: #c0bcaa;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.8rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.products-header h2 {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--text);
}

.search-bar-wrapper {
  width: 340px;
  max-width: 100%;
}
.input-base {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--card);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  padding-left: 12px;
  transition: border-color 0.2s;
}
.input-base:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(170,158,118,0.2);
}
.input-element {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.95rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
  gap: 1.8rem;
}
.product-card {
  background: var(--card);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.25s;
  border: 1px solid var(--border);
  cursor: pointer;
  position: relative;
}
.product-card.hidden {
  display: none;
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.2);
}
.card-image {
  width: 100%;
  aspect-ratio: 3 / 3.7;
  object-fit: cover;
  display: block;
}
.card-content {
  padding: 1.2rem;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
}
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
}
.cart-btn {
  width: 44px;
  height: 44px;
  background: var(--btn-cart);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.cart-btn:hover {
  background: var(--btn-cart-hover);
  transform: scale(1.08);
}
.cart-btn.added {
  background: #22c55e;
}
