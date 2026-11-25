/* ERALUNE — состояние: избранное и корзина (сохраняются в localStorage) */
(function (E) {
  'use strict';

  const KEY = 'eralune:v1';
  const listeners = new Set();
  let state = { favorites: [], cart: [] };

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && Array.isArray(saved.favorites) && Array.isArray(saved.cart)) state = saved;
  } catch (_) { /* приватный режим — работаем без сохранения */ }

  // Удаляем товары, которых больше нет в каталоге
  const exists = (id) => E.products.some((p) => p.id === id);
  state.favorites = state.favorites.filter(exists);
  state.cart = state.cart.filter((i) => exists(i.id) && i.qty > 0);

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* ignore */ }
  };
  const emit = (type) => { save(); listeners.forEach((fn) => fn(type, state)); };

  const MAX_QTY = 20;

  const S = {
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    get: () => state,

    isFav: (id) => state.favorites.includes(id),
    toggleFav(id) {
      const on = !S.isFav(id);
      state.favorites = on ? [...state.favorites, id] : state.favorites.filter((x) => x !== id);
      emit('favorites');
      return on;
    },

    cartItem: (id) => state.cart.find((i) => i.id === id),
    add(id, qty = 1) {
      const item = S.cartItem(id);
      if (item) item.qty = Math.min(MAX_QTY, item.qty + qty);
      else state.cart.push({ id, qty });
      emit('cart');
    },
    setQty(id, qty) {
      const item = S.cartItem(id);
      if (!item) return;
      if (qty <= 0) state.cart = state.cart.filter((i) => i.id !== id);
      else item.qty = Math.min(MAX_QTY, qty);
      emit('cart');
    },
    remove(id) { state.cart = state.cart.filter((i) => i.id !== id); emit('cart'); },
    clear() { state.cart = []; emit('cart'); },

    cartCount: () => state.cart.reduce((s, i) => s + i.qty, 0),
    /** Сумма только по товарам с указанной ценой */
    cartTotal: () => state.cart.reduce((s, i) => {
      const p = E.utils.product(i.id);
      return s + (p && p.price != null ? p.price * i.qty : 0);
    }, 0),
    hasUnpriced: () => state.cart.some((i) => { const p = E.utils.product(i.id); return p && p.price == null; }),
    maxQty: MAX_QTY,
  };

  // Синхронизация между вкладками
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = JSON.parse(e.newValue); emit('sync'); } catch (_) { /* ignore */ }
  });

  E.store = S;
})(window.ERALUNE);
