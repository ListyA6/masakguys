// tests/test-store.js
QUnit.module('store', {
  beforeEach: () => localStorage.clear()
});

QUnit.test('cart: add, increment, decrement, remove', assert => {
  Store.cart.add('menu-1', 'pedas level 5');
  assert.deepEqual(Store.cart.get(), [{ menu_id: 'menu-1', qty: 1, catatan: 'pedas level 5' }]);

  Store.cart.setQty('menu-1', 3);
  assert.equal(Store.cart.get()[0].qty, 3);

  Store.cart.setQty('menu-1', 0);
  assert.deepEqual(Store.cart.get(), []);
});

QUnit.test('cart: count sums quantities', assert => {
  Store.cart.add('a'); Store.cart.setQty('a', 2);
  Store.cart.add('b'); Store.cart.setQty('b', 3);
  assert.equal(Store.cart.count(), 5);
});

QUnit.test('love: toggle persists', assert => {
  assert.equal(Store.love.has('menu-1'), false);
  Store.love.toggle('menu-1');
  assert.equal(Store.love.has('menu-1'), true);
  Store.love.toggle('menu-1');
  assert.equal(Store.love.has('menu-1'), false);
});

QUnit.test('customer: set and get', assert => {
  Store.customer.set({ nama: 'Budi', wa: '081234' });
  assert.deepEqual(Store.customer.get(), { nama: 'Budi', wa: '081234' });
});

QUnit.test('chat: session id is stable', assert => {
  const id1 = Store.chat.sessionId();
  const id2 = Store.chat.sessionId();
  assert.equal(id1, id2);
  assert.ok(id1.length > 4);
});
