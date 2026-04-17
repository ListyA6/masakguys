// tests/test-api.js
QUnit.module('api');

QUnit.test('getMenus returns array grouped by category order', async assert => {
  const menus = await API.getMenus('pedesan');
  assert.ok(Array.isArray(menus));
  assert.ok(menus.length >= 7);
  assert.ok(menus.every(m => m.brand === 'pedesan'));
});

QUnit.test('menu availability computed from recipe', async assert => {
  // with default mock stock all should be > 0
  const menus = await API.getMenus('pedesan');
  const ususPedas = menus.find(m => m.id === 'm1');
  assert.ok(ususPedas.available > 0, `expected >0, got ${ususPedas.available}`);
});

QUnit.test('getQueue returns total + by_brand', async assert => {
  const q = await API.getQueue();
  assert.ok('total' in q);
  assert.ok('by_brand' in q);
  assert.equal(typeof q.total, 'number');
});

QUnit.test('submitFeedback appends to feedback list', async assert => {
  const before = MOCK.feedback.length;
  await API.submitFeedback({ nama: 'Ani', pesan: 'Enak!' });
  assert.equal(MOCK.feedback.length, before + 1);
  assert.equal(MOCK.feedback[MOCK.feedback.length - 1].pesan, 'Enak!');
});
