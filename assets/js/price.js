// assets/js/price.js
const WORKER_URL = 'https://supabase-link.velutinx.workers.dev/';

async function fetchPriceData() {
  const cacheKey = 'velutinx_price_data';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return data;
  }
  try {
    const response = await fetch(WORKER_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (err) {
    console.warn('Failed to fetch from worker, using fallback data', err);
    // Fallback: return hardcoded values (only for development)
    return {
      keys: [
        { key: 'PRICE_1', usd: 1.50 },
        { key: 'PRICE_2', usd: 3.00 },
        { key: 'PRICE_3', usd: 5.00 },
        { key: 'PRICE_4', usd: 9.00 },
        { key: 'PRICE_5', usd: 14.00 },
        { key: 'PRICE_6', usd: 29.00 },
        { key: 'PRICE_7', usd: 39.00 }
      ],
      tiers: [
        { usd: 1.50, cny: 10.00, jpy: 250, mxn: 25 },
        { usd: 3.00, cny: 20.00, jpy: 500, mxn: 50 },
        { usd: 5.00, cny: 35.00, jpy: 800, mxn: 100 },
        { usd: 9.00, cny: 60.00, jpy: 1500, mxn: 150 },
        { usd: 14.00, cny: 95.00, jpy: 2000, mxn: 250 },
        { usd: 29.00, cny: 200.00, jpy: 4500, mxn: 500 },
        { usd: 39.00, cny: 270.00, jpy: 6000, mxn: 700 }
      ]
    };
  }
}

  // Build key -> USD map
  const keyMap = {};
  keys.forEach(k => { keyMap[k.key] = k.usd; });
  window.priceKeyMap = keyMap;

  // Build USD -> currency object map
  const usdMap = {};
  tiers.forEach(t => { usdMap[t.usd] = { usd: t.usd, cny: t.cny, jpy: t.jpy, mxn: t.mxn }; });
  window.priceUsdMap = usdMap;

  document.dispatchEvent(new CustomEvent('priceMapReady'));
}

// Helper: convert a symbolic key to USD, then to formatted price
window.getFormattedPrice = function(priceKey, currency = null) {
  if (!window.priceKeyMap || !window.priceUsdMap) return `$${priceKey}`;
  const usd = window.priceKeyMap[priceKey];
  if (!usd) return `$${priceKey}`;
  return window.formatPrice(usd, currency);
};

// Original formatPrice (expects numeric USD)
window.formatPrice = function(usd, currency = null) {
  if (!window.priceUsdMap) return `$${usd.toFixed(2)}`;
  const priceObj = window.priceUsdMap[usd];
  if (!priceObj) return `$${usd.toFixed(2)}`;

  const curr = currency || (window.currentLanguage === 'en' ? 'usd' :
                            window.currentLanguage === 'ja' ? 'jpy' :
                            window.currentLanguage === 'zh' ? 'cny' : 'mxn');
  const value = priceObj[curr];
  const symbol = curr === 'usd' ? '$' : curr === 'cny' ? '¥' : curr === 'jpy' ? '¥' : 'MX$';
  if (curr === 'jpy' || curr === 'mxn') {
    return `${symbol}${Math.round(value)}`;
  }
  return `${symbol}${value.toFixed(2)}`;
};

initPriceMap();
