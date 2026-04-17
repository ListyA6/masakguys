// js/utils.js
/** Format an integer as rupiah like "Rp3.000". */
function formatRupiah(n) {
  const abs = Math.abs(Math.trunc(n));
  const s = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-Rp' : 'Rp') + s;
}

/** Clamp v into [min, max]. */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/** Delivery fee from distance in km, per spec. */
function deliveryFee(km) {
  if (km <= 3) return 3000;
  if (km <= 4) return 8000;
  if (km <= 5) return 10000;
  return 15000;
}

/** Great-circle distance in kilometers between two lat/lng points. */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Debounce f by delay ms. */
function debounce(f, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => f(...args), delay);
  };
}

/** Random id (for mock orders/sessions). */
function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10);
}

/** Shallow-random pick N items from array, with replacement. */
function sampleN(arr, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(Math.random() * arr.length)]);
  return out;
}
