// ===== SHARED HEADER / CART / SIDEBAR / LANGUAGE / THEME / SNACKBAR =====

const translations = {
    en: { /* ... same as your original ... */ },
    ja: { /* ... */ },
    zh: { /* ... */ },
    es: { /* ... */ }
    // copy your full translations object here
};

let cart = JSON.parse(localStorage.getItem('velutinx_cart') || '[]');
let currentLang = localStorage.getItem('language') || 'en';

const STATIC_USD = 3.0;

// ── Format price (very simplified version) ──
function formatPrice(usd = STATIC_USD) {
    if (currentLang === 'en') return `US$${usd.toFixed(2)}`;
    if (currentLang === 'ja') return `円${Math.round(usd * 158)}`;
    if (currentLang === 'zh') return `元${(usd * 6.9).toFixed(1)}`;
    if (currentLang === 'es') return `MXN$${Math.round(usd * 18)}`;
    return `$${usd.toFixed(2)}`;
}

// ── Save & update cart count ──
function saveCart() {
    localStorage.setItem('velutinx_cart', JSON.stringify(cart));
    document.querySelectorAll('#cartCount, #floatingCartCount').forEach(el => {
        el.textContent = cart.length;
    });
}

// ── Snackbar (shared) ──
function showSnack(msg, isError = false) {
    const sb = document.getElementById('snackbar');
    if (!sb) return;
    sb.querySelector('#snackText').textContent = msg;
    sb.classList.toggle('error', isError);
    sb.className = 'show';  // reset animation
    setTimeout(() => sb.classList.remove('show'), 2200);
}

// ── Add / remove from cart (global function for product cards) ──
window.addOrToggleCart = function(product) {
    const t = translations[currentLang] || translations.en;
    const idx = cart.findIndex(i => String(i.id) === String(product.id));

    if (idx > -1) {
        cart.splice(idx, 1);
        showSnack(t.removedMsg || "Removed", true);
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: STATIC_USD,
            image: `https://velutinx.com/i/pack${String(product.id).padStart(3,'0')}-1.jpg`
        });
        showSnack(t.addedMsg || "Added to cart");
    }

    saveCart();
    updateCartDrawer();
};

// ── Render cart items in drawer ──
function updateCartDrawer() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    const t = translations[currentLang] || translations.en;
    container.innerHTML = cart.length === 0
        ? `<div style="padding:1rem;text-align:center;">${t.emptyCart || "Cart is empty"}</div>`
        : '';

    cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" onerror="this.src='https://placehold.co/70x70?text=?'">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div>${formatPrice(item.price)}</div>
            </div>
            <button class="cart-item-remove" data-idx="${idx}">✕</button>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx);
            cart.splice(idx,1);
            saveCart();
            updateCartDrawer();
            showSnack((translations[currentLang]||translations.en).removedMsg, true);
        };
    });

    document.getElementById('cartTotal').textContent = formatPrice(
        cart.reduce((sum, i) => sum + i.price, 0)
    );
}

// ── Drawer open/close (cart & sidebar) ──
function initDrawers() {
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');

    const openCart = () => {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.classList.add('drawer-open');
        updateCartDrawer();
    };

    const closeCart = () => {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
    };

    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('floatingCartBtn')?.addEventListener('click', openCart);
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    // Sidebar (hamburger)
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    document.getElementById('menuToggle')?.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        document.body.classList.add('drawer-open');
    });

    document.getElementById('sidebarMenuToggle')?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
    });
    sidebarOverlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.classList.remove('drawer-open');
    });
}

// ── Language switcher ──
function applyTranslations() {
    const t = translations[currentLang] || translations.en;
    // update all elements with data-i18n or direct ids
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });

    // special cases
    document.getElementById('loginBtn')?.textContent = t.websiteBtn || "Website";
    document.getElementById('cartTitle') && (document.getElementById('cartTitle').textContent = t.cartTitle);
    // ... add other ids you need
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    applyTranslations();
    updateCartDrawer();   // price format may change
    document.getElementById('languagePopover')?.classList.remove('show');
}

// ── Theme toggle ──
function initTheme() {
    const btn = document.getElementById('themeBtn');
    if (!btn) return;

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }

    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    });
}

// ── Language popover ──
function initLanguagePopover() {
    const btn = document.getElementById('langBtn');
    const pop = document.getElementById('languagePopover');
    if (!btn || !pop) return;

    btn.addEventListener('click', e => {
        e.stopPropagation();
        pop.classList.toggle('show');
    });

    pop.querySelectorAll('.lang-item').forEach(item => {
        item.addEventListener('click', () => {
            setLanguage(item.dataset.lang);
        });
    });

    document.addEventListener('click', e => {
        if (!pop.contains(e.target) && e.target !== btn) {
            pop.classList.remove('show');
        }
    });
}

// ── Entry point ──
document.addEventListener('DOMContentLoaded', () => {
    saveCart();               // refresh count
    initDrawers();
    initTheme();
    initLanguagePopover();
    applyTranslations();      // initial translation
});
