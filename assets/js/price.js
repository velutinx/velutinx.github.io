// price.js – Fetches price tiers from Supabase and caches them.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://knbvlyngmjaxndkiqggl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYnZseW5nbWpheG5ka2lxZ2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjI0NzEsImV4cCI6MjA4NjM5ODQ3MX0.mxthCDB6dCaHcEDMFN48pFnaJmcBbilXfP7tL-YAV08";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cache key
const PRICE_CACHE_KEY = 'velutinx_price_tiers';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchPriceTiers() {
  const cached = localStorage.getItem(PRICE_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  const { data, error } = await supabase.from('price_tiers').select('usd, cny, jpy, mxn');
  if (error) throw error;
  localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

// Build a lookup map from USD to currency object
async function initPriceMap() {
  const tiers = await fetchPriceTiers();
  const map = {};
  tiers.forEach(tier => {
    map[tier.usd] = {
      usd: tier.usd,
      cny: tier.cny,
      jpy: tier.jpy,
      mxn: tier.mxn
    };
  });
  window.priceMap = map;
  // Dispatch an event so other scripts know prices are ready
  document.dispatchEvent(new CustomEvent('priceMapReady'));
}

// Expose function to format price for current currency
window.formatPrice = function(usd, currency = null) {
  if (!window.priceMap) return `$${usd.toFixed(2)}`; // fallback
  const priceObj = window.priceMap[usd];
  if (!priceObj) return `$${usd.toFixed(2)}`; // fallback

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

// Start loading
initPriceMap();
