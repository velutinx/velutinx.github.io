(async function() {
  const navContainer = document.getElementById('navContainer');
  if (!navContainer) return;

  try {
    const response = await fetch('/assets/includes/header.html');
    const html = await response.text();
    navContainer.innerHTML = html;

    // --- DOM elements after injection ---
    const logo = document.querySelector('.logo');
    const langBtn = document.getElementById('langBtn');
    const langPopover = document.getElementById('languagePopover');
    const themeBtn = document.getElementById('themeBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarMenuToggle = document.getElementById('sidebarMenuToggle');
    const snackbar = document.getElementById('snackbar');


    // --- Helper functions ---
    function showSnackbar(msg, isRemove = false) {
      const sb = document.getElementById('snackbar');
      const text = document.getElementById('snackText');
      const icon = sb?.querySelector('svg');
      if (!sb || !text || !icon) return;
      sb.classList.toggle('remove', isRemove);
      icon.innerHTML = isRemove
        ? `<path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M20 6L9 17l-5-5"></path>`;
      text.textContent = msg;
      sb.classList.add('show');
      setTimeout(() => sb.classList.remove('show'), 2500);
    }

    function formatPrice(value, currency = currentCurrency) {
      if (currency === "USD") return `US$${value.toFixed(2)}`;
      const rounded = Math.round(value * 100) / 100;
      if (tierMap[rounded] && tierMap[rounded][currency] !== undefined) {
        const converted = tierMap[rounded][currency];
        const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
        return `${symbol}${converted}`;
      }
      let converted = value * (approxRates[currency] || 1);
      converted = (currency === "JPY" || currency === "MXN") ? Math.ceil(converted) : Math.ceil(converted * 10) / 10;
      const symbol = currency === "JPY" ? "円" : currency === "CNY" ? "元" : "MXN$";
      return `${symbol}${converted}`;
    }

    // --- Sidebar toggle ---
    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (menuToggle && sidebarMenuToggle && sidebarOverlay) {
      menuToggle.addEventListener('click', openSidebar);
      sidebarMenuToggle.addEventListener('click', closeSidebar);
      sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // --- Theme toggle ---
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      });
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
      }
    }

    // --- Language popover ---
    if (langBtn && langPopover) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langPopover.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
        if (!document.getElementById('langContainer')?.contains(e.target)) {
          langPopover.classList.remove('show');
        }
      });
    }

    // --- Apply header translations ---
    function applyHeaderTranslations() {
      const lang = window.currentLanguage || localStorage.getItem('language') || 'en';
      const t = window.translations?.header?.[lang];
      if (!t) return;
      const menuHome = document.getElementById('menuHome');
      const menuCommissions = document.getElementById('menuCommissions');
      const menuArtwork = document.getElementById('menuArtwork');
      const menuPoll = document.getElementById('menuPoll');
      const menuStore = document.getElementById('menuStore');
      const menuContact = document.getElementById('menuContact');
      const totalLabel = document.getElementById('totalLabel');
      const snackText = document.getElementById('snackText');
      if (menuHome) menuHome.textContent = t.menuHome;
      if (menuCommissions) menuCommissions.textContent = t.menuCommissions;
      if (menuArtwork) menuArtwork.textContent = t.menuArtwork;
      if (menuPoll) menuPoll.textContent = t.menuPoll;
      if (menuStore) menuStore.textContent = t.menuStore;
      if (menuContact) menuContact.textContent = t.menuContact;
      if (totalLabel) totalLabel.textContent = t.totalLabel;
      if (snackText) snackText.textContent = t.snackText;
    }

    // --- Language change handler (update currency and prices) ---
    document.addEventListener('languageChanged', () => {
      const lang = window.currentLanguage || localStorage.getItem('language') || 'en';
      currentLang = lang;
      currentCurrency = lang === 'en' ? 'USD' :
                       lang === 'ja' ? 'JPY' :
                       lang === 'zh' ? 'CNY' : 'MXN';
      applyHeaderTranslations();
      // Also update product prices if the store page is loaded
      if (typeof window.updateAllPrices === 'function') window.updateAllPrices();
    });

    // --- Language item clicks ---
    document.querySelectorAll('.lang-item').forEach(item => {
      item.addEventListener('click', () => {
        const newLang = item.dataset.lang;
        if (window.setLanguage) window.setLanguage(newLang);
        langPopover?.classList.remove('show');
      });
    });

    // --- Expose global functions for store page ---
    window.updateAllPrices = function() {
      document.querySelectorAll(".price").forEach(el => {
        const base = parseFloat(el.dataset.price);
        if (!isNaN(base)) el.innerHTML = formatPrice(base);
      });
    };

    // --- Apply store translations if the page is the store ---
    if (document.getElementById('shopTitle')) {
      // The store page is loaded – apply its translations
      if (typeof window.applyTranslations === 'function') {
        window.applyTranslations('store');
      }
    }

    // --- Initial setup ---
    applyHeaderTranslations();

    // --- Notify that header and cart logic are ready ---
    window.dispatchEvent(new CustomEvent('headerReady'));

  } catch (err) {
    console.error('Failed to load header:', err);
  }
})();
