// shared2.js - modified cart logic to guarantee removal + sync
(function() {
  const translations = {
    en: {
      cartTitle: "Shopping Cart", totalLabel: "Total", emptyCart: "Your cart is empty",
      addedMsg: "Added successfully", removedMsg: "Removed from cart",
      checkoutBtn: "Proceed to checkout (DEMO)", menuHome: "HOME", menuCommissions: "COMMISSIONS",
      menuArtwork: "ARTWORK", menuPoll: "POLL", menuStore: "STORE", menuContact: "CONTACT",
      websiteBtn: "Website"
    },
    // ... other languages remain the same ...
  };

  let cart = JSON.parse(localStorage.getItem('velutinx_cart') || '[]');
  let currentLang = localStorage.getItem('language') || 'en';

  window.formatPrice = function(usd = 3.0) {
    return `US$${usd.toFixed(2)}`; // simplified for membership page
  };

  function saveCart() {
    localStorage.setItem('velutinx_cart', JSON.stringify(cart));
    updateCartUI();
    if (window.syncCartButtons) window.syncCartButtons();
    // Force membership page update too
    if (window.updateMembershipButtons) window.updateMembershipButtons();
  }

  function updateCartUI() {
    // ... same as original ...
    // make sure to call membership sync if available
    if (window.updateMembershipButtons) window.updateMembershipButtons();
  }

  window.addOrToggleCart = function(product) {
    const idx = cart.findIndex(i => String(i.id) === String(product.id));
    if (idx > -1) {
      cart.splice(idx, 1);
    } else {
      cart.push(product);
    }
    saveCart();
  };

  window.getCart = function() {
    return cart;
  };

  // ... rest of your original shared.js (header injection, sidebar, cart drawer, language, theme) remains unchanged ...
  // Just make sure that after any cart change, we call:
  // if (window.updateMembershipButtons) window.updateMembershipButtons();

  // At the end of injectHeader() or wherever cart changes happen, add:
  // document.dispatchEvent(new CustomEvent('cartChanged'));

  // And in membership script you can listen to it:
  // document.addEventListener('cartChanged', updateMembershipButtons);
})();
