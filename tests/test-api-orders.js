// tests/test-api-orders.js
QUnit.module('api.orders', {
  beforeEach: () => { MOCK.orders = []; MOCK.customers = []; }
});

QUnit.test('submitOrder creates an order with id and status Diterima', async assert => {
  const order = await API.submitOrder({
    customer: { nama: 'Budi', wa: '08123' },
    items: [{ menu_id: 'm1', qty: 2, catatan: 'pedas' }],
    location: { lat: -7.82, lng: 112.02, distance_km: 2.1 },
    payment: { method: 'tunai', cash_given: 50000 }
  });
  assert.ok(order.id.startsWith('ord-'));
  assert.equal(order.status, 'Diterima');
  assert.equal(order.ongkir, 3000);
  assert.equal(MOCK.orders.length, 1);
});

QUnit.test('submitOrder upserts customer by WA', async assert => {
  await API.submitOrder({
    customer: { nama: 'Budi', wa: '08123' }, items: [{menu_id:'m1',qty:1,catatan:''}],
    location: { lat:0, lng:0, distance_km: 1 }, payment: { method:'tunai', cash_given: 20000 }
  });
  await API.submitOrder({
    customer: { nama: 'Budi', wa: '08123' }, items: [{menu_id:'m2',qty:1,catatan:''}],
    location: { lat:0, lng:0, distance_km: 1 }, payment: { method:'tunai', cash_given: 30000 }
  });
  assert.equal(MOCK.customers.length, 1);
  assert.equal(MOCK.customers[0].order_count, 2);
});

QUnit.test('submitOrder computes subtotal from menu prices', async assert => {
  const o = await API.submitOrder({
    customer: { nama:'x', wa:'1' },
    items: [{ menu_id: 'm1', qty: 2, catatan: '' }, { menu_id: 'm5', qty: 1, catatan: '' }],
    location: { lat:0,lng:0,distance_km:4 }, payment: { method:'qris' }
  });
  // m1 Usus Pedas = 18000, m5 Es Teh Manis = 5000 → subtotal 41000 + ongkir 8000 = 49000
  assert.equal(o.subtotal, 41000);
  assert.equal(o.ongkir, 8000);
  assert.equal(o.total, 49000);
});

QUnit.test('getOrder returns order by id', async assert => {
  const created = await API.submitOrder({
    customer:{nama:'a',wa:'1'}, items:[{menu_id:'m1',qty:1,catatan:''}],
    location:{lat:0,lng:0,distance_km:1}, payment:{method:'tunai',cash_given:20000}
  });
  const fetched = await API.getOrder(created.id);
  assert.equal(fetched.id, created.id);
});

QUnit.test('advanceStatus walks through the 5 phases', async assert => {
  const o = await API.submitOrder({
    customer:{nama:'a',wa:'1'}, items:[{menu_id:'m1',qty:1,catatan:''}],
    location:{lat:0,lng:0,distance_km:1}, payment:{method:'tunai',cash_given:20000}
  });
  const phases = ['Dikonfirmasi','Dimasak','Siap','Diantar','Selesai'];
  for (const expected of phases) {
    await API.advanceStatus(o.id);
    const cur = await API.getOrder(o.id);
    assert.equal(cur.status, expected);
  }
});

QUnit.test('submitOrder deducts ingredient stock per recipe', async assert => {
  const beforeUsus = MOCK.ingredients.find(i => i.id === 'usus').stock;
  const beforeNasi = MOCK.ingredients.find(i => i.id === 'nasi').stock;
  await API.submitOrder({
    customer:{nama:'a',wa:'1'}, items:[{menu_id:'m1',qty:2,catatan:''}], // Usus Pedas x2
    location:{lat:0,lng:0,distance_km:1}, payment:{method:'tunai',cash_given:50000}
  });
  const afterUsus = MOCK.ingredients.find(i => i.id === 'usus').stock;
  const afterNasi = MOCK.ingredients.find(i => i.id === 'nasi').stock;
  assert.equal(beforeUsus - afterUsus, 2);
  assert.equal(beforeNasi - afterNasi, 2);
});
