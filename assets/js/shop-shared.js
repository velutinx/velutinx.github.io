/* ==================== PAYPAL INTEGRATION ==================== */
  function loadAndInitPayPal() {
    if (window.paypalLoading || window.paypal) return;
    window.paypalLoading = true;

    const loader = document.createElement('script');
    // Note: Cloudflare Pages maps /functions/paypal-sdk.js to /paypal-sdk
    loader.src = "/paypal-sdk"; 
    loader.async = true;
    
    loader.onload = () => {
        console.log("PayPal SDK Script Loaded");
        initPayPalButtons();
    };

    loader.onerror = () => {
        console.error("Failed to load PayPal SDK from /paypal-sdk. Check your Cloudflare Function.");
    };

    document.head.appendChild(loader);
  }

  function initPayPalButtons() {
    const container = document.getElementById("paypal-button-container");
    if (!container || typeof paypal === 'undefined' || getCart().length === 0) {
        if (container) container.innerHTML = ''; 
        return;
    }

    container.innerHTML = ''; // Clear previous instances
    paypal.Buttons({
      createOrder: (data, actions) => {
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
        return actions.order.create({
          purchase_units: [{ amount: { currency_code: "USD", value: total } }]
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        window.location.href = `/success.html?orderID=${details.id}`;
      },
      onError: (err) => {
          console.error("PayPal Button Error:", err);
      }
    }).render("#paypal-button-container");
  }

  /* ==================== GLOBAL EXPORTS & INIT ==================== */
  window.addOrToggleCart = (pack) => {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === pack.id);
    if (index !== -1) {
      cart.splice(index, 1);
    } else {
      cart.push({
        id: pack.id,
        title: pack.title,
        image: pack.image || (pack.images && pack.images[0]) || "",
        price: getPriceForPack(pack)
      });
    }
    saveCart(cart);
    updateCartDisplay();
  };

  window.removeItem = (idx) => {
    let cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    updateCartDisplay();
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();
    const cartBtn = document.getElementById("cartBtn");
    cartBtn?.addEventListener("click", () => {
        document.getElementById("cartDrawer")?.classList.add("open");
        loadAndInitPayPal();
    });
  });

})();
