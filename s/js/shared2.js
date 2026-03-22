// shared2.js — Header, sidebar, cart injection (minimal for membership page)

(function() {
  // Your translations (keep only what's needed)
  const translations = {
    en: {
      cartTitle: "Shopping Cart",
      totalLabel: "Total",
      emptyCart: "Your cart is empty",
      addedMsg: "Added successfully",
      removedMsg: "Removed from cart",
      checkoutBtn: "Proceed to checkout (DEMO)",
      menuHome: "HOME",
      menuCommissions: "COMMISSIONS",
      menuArtwork: "ARTWORK",
      menuPoll: "POLL",
      menuStore: "STORE",
      menuContact: "CONTACT",
      websiteBtn: "Website"
    }
    // add ja/zh/es if needed
  };

  let cart = JSON.parse(localStorage.getItem('velutinx_cart') || '[]');
  let currentLang = localStorage.getItem('language') || 'en';

  window.getCart = () => cart;

  window.addOrToggleCart = function(item) {
    const idx = cart.findIndex(i => i.id === item.id);
    if (idx > -1) {
      cart.splice(idx, 1);
    } else {
      cart.push(item);
    }
    localStorage.setItem('velutinx_cart', JSON.stringify(cart));
    // Trigger UI update
    document.dispatchEvent(new CustomEvent('cartChanged'));
  };

  // Header HTML string (your original top-nav)
  const headerHTML = `
    <nav class="top-nav">
      <div class="nav-left">
        <button class="menu-toggle" id="menuToggle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="logo">VELUTINX</div>
      </div>
      <div class="nav-actions">
        <a href="https://velutinx.com" class="login-btn" id="loginBtn">Website</a>
        <!-- Language, theme, cart icons here - add if needed -->
        <div class="cart-wrapper">
          <button class="nav-icon" id="cartBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 17h-11v-14h-2"></path><path d="M6 5l14 1l-.86 6.017m-2.64 .983h-10.5"></path></svg>
          </button>
          <span class="cart-badge" id="cartCount">0</span>
        </div>
      </div>
    </nav>
  `;

  function injectHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
      placeholder.innerHTML = headerHTML;
      // Re-attach any event listeners if needed (menu toggle, cart btn, etc.)
      document.dispatchEvent(new CustomEvent('headerReady'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }
})();
