// assets/js/price.js – fetches price data from Cloudflare Worker
const WORKER_URL = 'https://your-worker.your-subdomain.workers.dev'; // <-- replace with your worker URL

async function fetchPriceData() {
  const cacheKey = 'velutinx_price_data';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return data;
  }
  const response = await fetch(WORKER_URL);
  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
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
