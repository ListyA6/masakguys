// tests/test-utils.js
QUnit.module('utils');

QUnit.test('formatRupiah formats integer', assert => {
  assert.equal(formatRupiah(3000), 'Rp3.000');
  assert.equal(formatRupiah(15000), 'Rp15.000');
  assert.equal(formatRupiah(0), 'Rp0');
  assert.equal(formatRupiah(1234567), 'Rp1.234.567');
});

QUnit.test('clamp clamps values', assert => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

QUnit.test('deliveryFee returns correct tier', assert => {
  assert.equal(deliveryFee(1), 3000);
  assert.equal(deliveryFee(3), 3000);
  assert.equal(deliveryFee(3.5), 8000);
  assert.equal(deliveryFee(4), 8000);
  assert.equal(deliveryFee(5), 10000);
  assert.equal(deliveryFee(6), 15000);
  assert.equal(deliveryFee(20), 15000);
});

QUnit.test('haversineKm computes distance between two points', assert => {
  // Jakarta-ish → Bandung-ish ~ 120 km
  const d = haversineKm(-6.2, 106.8, -6.9, 107.6);
  assert.ok(d > 110 && d < 130, `expected ~120km, got ${d}`);
});
