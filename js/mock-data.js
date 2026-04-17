// js/mock-data.js — mock fixtures used by api.js. Will be replaced by real fetch later.
const SAMPLE_PICS = ['1.png','2.png','3.png','4.png','5.png','6.png','7.png'];

function _rotateMedia(startIdx, n = 4) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ type: 'image', src: SAMPLE_PICS[(startIdx + i) % SAMPLE_PICS.length] });
  return out;
}

const MOCK = {
  brand: { id: 'pedesan', nama: 'Pedesan', tagline: 'Pedas yang bikin nagih.' },

  ingredients: [
    { id: 'usus',  nama: 'Usus ayam', unit: 'porsi', stock: 30, min_stock: 5,  cost_per_unit: 3000 },
    { id: 'paru',  nama: 'Paru sapi', unit: 'porsi', stock: 20, min_stock: 5,  cost_per_unit: 6000 },
    { id: 'babat', nama: 'Babat',     unit: 'porsi', stock: 15, min_stock: 3,  cost_per_unit: 7000 },
    { id: 'empal', nama: 'Empal',     unit: 'porsi', stock: 25, min_stock: 5,  cost_per_unit: 8000 },
    { id: 'nasi',  nama: 'Nasi',      unit: 'porsi', stock: 200,min_stock: 30, cost_per_unit: 2000 },
    { id: 'bumbu', nama: 'Bumbu pedas',unit: 'porsi',stock: 100,min_stock: 20, cost_per_unit: 1000 },
    { id: 'es',    nama: 'Es teh',    unit: 'gelas', stock: 80, min_stock: 10, cost_per_unit: 2000 },
    { id: 'krupuk',nama: 'Krupuk',    unit: 'pcs',   stock: 100,min_stock: 15, cost_per_unit: 1000 }
  ],

  menus: [
    { id: 'm1', brand: 'pedesan', kategori: 'makanan', nama: 'Usus Pedas',    deskripsi: 'Usus ayam digoreng kering dengan bumbu pedas khas.',       harga: 18000, order: 1, love_count: 42, recipe: [{ingredient_id:'usus',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(0) },
    { id: 'm2', brand: 'pedesan', kategori: 'makanan', nama: 'Paru Crispy',   deskripsi: 'Paru sapi goreng super renyah, bumbu level 1–5.',           harga: 22000, order: 2, love_count: 63, recipe: [{ingredient_id:'paru',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(1) },
    { id: 'm3', brand: 'pedesan', kategori: 'makanan', nama: 'Babat Gongso',  deskripsi: 'Babat bumbu gongso, pedas manis khas Jawa.',                harga: 24000, order: 3, love_count: 28, recipe: [{ingredient_id:'babat',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(2) },
    { id: 'm4', brand: 'pedesan', kategori: 'makanan', nama: 'Empal Suwir',   deskripsi: 'Empal disuwir, dipadu sambal bawang.',                      harga: 25000, order: 4, love_count: 51, recipe: [{ingredient_id:'empal',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(3) },
    { id: 'm5', brand: 'pedesan', kategori: 'minuman', nama: 'Es Teh Manis',  deskripsi: 'Segar, pas buat menyeimbangkan pedas.',                     harga: 5000,  order: 1, love_count: 12, recipe: [{ingredient_id:'es',qty:1}], media: _rotateMedia(4) },
    { id: 'm6', brand: 'pedesan', kategori: 'minuman', nama: 'Es Teh Tawar',  deskripsi: 'Teh tawar dingin.',                                          harga: 4000,  order: 2, love_count: 6,  recipe: [{ingredient_id:'es',qty:1}], media: _rotateMedia(5) },
    { id: 'm7', brand: 'pedesan', kategori: 'tambahan',nama: 'Krupuk',        deskripsi: 'Krupuk renyah pendamping.',                                  harga: 2000,  order: 1, love_count: 3,  recipe: [{ingredient_id:'krupuk',qty:1}], media: _rotateMedia(6) }
  ],

  // aggregate queue across all brands (mocked)
  queue: { total: 14, by_brand: { pedesan: 8, nasi_goreng: 6 } },

  // kitchen origin (for distance calc)
  kitchen_coord: { lat: -7.8167, lng: 112.0167 }, // Kediri approx

  orders: [], // populated at runtime
  customers: [],
  feedback: [],
  expenses: []
};
