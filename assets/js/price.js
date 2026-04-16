// This is     velutinx.github.io/assets/js/price.js

const PRICE_API_URL = 'https://paypal-checkout-website.velutinx.workers.dev/api/price';

// Hardcoded fallback data (same as before, but also includes annual membership keys)
const FALLBACK_DATA = {
  keys: [
    { key: 'PRICE_1', usd: 1.50 },
    { key: 'PRICE_2', usd: 3.00 },
    { key: 'PRICE_3', usd: 5.00 },
    { key: 'PRICE_4', usd: 10.00 },
    { key: 'PRICE_5', usd: 15.00 },
    { key: 'PRICE_6', usd: 30.00 },
    { key: 'PRICE_7', usd: 40.00 },
    { key: 'MEMBER_1_ANNUAL', usd: 54.00 },
    { key: 'MEMBER_2_ANNUAL', usd: 108.00 },
    { key: 'MEMBER_3_ANNUAL', usd: 162.00 },
    { key: 'MEMBER_4_ANNUAL', usd: 324.00 },
    { key: 'MEMBER_5_ANNUAL', usd: 432.00 }
  ],
  tiers: [
    { usd: 1.50, cny: 10.00, jpy: 250, mxn: 30 },
    { usd: 3.00, cny: 20.00, jpy: 500, mxn: 60 },
    { usd: 5.00, cny: 35.00, jpy: 800, mxn: 100 },
    { usd: 10.00, cny: 70.00, jpy: 1500, mxn: 200 },
    { usd: 15.00, cny: 105.00, jpy: 2500, mxn: 300 },
    { usd: 30.00, cny: 210.00, jpy: 4800, mxn: 550 },
    { usd: 40.00, cny: 280.00, jpy: 6250, mxn: 750 }
  ]
};

async function fetchPriceData() {
  const cacheKey = 'velutinx_price_data';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return data;
  }

  try {
    const response = await fetch(PRICE_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // Transform the response to match our expected structure
    const transformed = {
      keys: data.keys,
      tiers: data.tiers
    };
    localStorage.setItem(cacheKey, JSON.stringify({ data: transformed, timestamp: Date.now() }));
    return transformed;
  } catch (err) {
    console.warn('Failed to fetch from price API, using fallback data', err);
    return FALLBACK_DATA;
  }
}

async function initPriceMap() {
  const { keys, tiers } = await fetchPriceData();

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

window.formatPrice = function(usd, currency = null) {
  if (!window.priceUsdMap) return `$${usd.toFixed(2)}`;
  const priceObj = window.priceUsdMap[usd];
  if (!priceObj) return `$${usd.toFixed(2)}`;

  const lang = localStorage.getItem('language') || 'en';
  const curr = currency || (lang === 'ja' ? 'jpy' :
                            lang === 'zh' ? 'cny' :
                            lang === 'es' ? 'mxn' : 'usd');
  const value = priceObj[curr];
  const symbol = curr === 'usd' ? '$' : curr === 'cny' ? '¥' : curr === 'jpy' ? '¥' : 'MX$';
  if (curr === 'jpy' || curr === 'mxn') {
    return `${symbol}${Math.round(value)}`;
  }
  return `${symbol}${value.toFixed(2)}`;
};

initPriceMap();
