/* ERALUNE — Cart: корзина и оформление заказа интернет-магазина */
(function (E) {
  'use strict';
  const U = E.utils;

  /* ---------- Универсальная выдвижная панель ---------- */
  E.Drawer = function (id, title, iconName) {
    const root = document.getElementById('overlays-root');
    const el = document.createElement('div');
    el.className = 'drawer';
    el.id = id;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="drawer__backdrop" data-close></div>
      <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
        <header class="drawer__head">
          <h2 class="drawer__title" id="${id}-title">${U.icon(iconName)}${title} <span class="drawer__count"></span></h2>
          <button type="button" class="icon-btn" data-close aria-label="Закрыть">${U.icon('close')}</button>
        </header>
        <div class="drawer__body" data-lenis-prevent></div>
        <footer class="drawer__foot"></footer>
      </aside>`;
    root.appendChild(el);
    let opener = null;
    const api = {
      el,
      body: el.querySelector('.drawer__body'),
      foot: el.querySelector('.drawer__foot'),
      count: el.querySelector('.drawer__count'),
      isOpen: () => el.classList.contains('is-open'),
      open() {
        if (api.isOpen()) return;
        E.closeOverlays && E.closeOverlays();
        opener = document.activeElement;
        el.classList.add('is-open');
        el.setAttribute('aria-hidden', 'false');
        U.lockScroll(true);
        setTimeout(() => el.querySelector('.drawer__head .icon-btn')?.focus({ preventScroll: true }), 50);
      },
      close() {
        if (!api.isOpen()) return;
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        U.lockScroll(false);
        opener && opener.focus && opener.focus({ preventScroll: true });
      },
    };
    el.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') api.close();
      if (e.key === 'Tab') trap(e, el.querySelector('.drawer__panel'));
    });
    return api;
  };

  function trap(e, box) {
    const f = [...box.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  E.utils.trapFocus = trap;

  /* ---------- Корзина и параметры заказа ---------- */
  let drawer;
  let confirmClear = false;
  const checkout = {
    delivery: 'pickup', // pickup | delivery
    giftWrap: true,
    name: '',
    phone: '',
  };

  function orderText() {
    const S = E.store;
    const lines = S.get().cart.map((i, n) => {
      const p = U.product(i.id);
      const sku = p.sku ? ` [Арт. ${p.sku}]` : '';
      return `${n + 1}. ${p.name}${sku} × ${i.qty} шт. — ${p.price != null ? U.price(p.price * i.qty) : 'цена по запросу'}`;
    });
    const deliv = checkout.delivery === 'pickup'
      ? `Самовывоз из бутика (${E.config.address.mall}, ${E.config.address.floor})`
      : 'Доставка курьером / по адресу';
    const wrap = checkout.giftWrap ? 'Да (бесплатно)' : 'Стандартная';
    const customer = [checkout.name && `Имя: ${checkout.name}`, checkout.phone && `Телефон: ${checkout.phone}`].filter(Boolean).join(', ');
    return [
      E.config.orderGreeting,
      '',
      ...lines,
      '',
      `Получение: ${deliv}`,
      `Подарочная упаковка: ${wrap}`,
      customer && `Покупатель: ${customer}`,
      `Итого: ${U.price(S.cartTotal())}${S.hasUnpriced() ? ' + товары с ценой по запросу' : ''}`,
    ].filter((x) => x !== false && x != null).join('\n');
  }

  function itemRow(i) {
    const p = U.product(i.id);
    if (!p) return '';
    return `
      <li class="line" data-line="${p.id}">
        <a href="${U.productUrl(p)}" class="line__img" data-close>${p.images.length ? U.picture(p.images[0], { alt: p.name, sizes: '88px', focus: p.focus || '50% 50%' }) : U.placeholder('')}</a>
        <div class="line__info">
          <a href="${U.productUrl(p)}" class="line__name" data-close>${U.esc(p.name)}</a>
          <p class="line__price">${p.sku ? `Арт. ${U.esc(p.sku)} · ` : ''}${p.price != null ? U.price(p.price) : 'Цена по запросу'}</p>
          <div class="line__row">
            <div class="qty" role="group" aria-label="Количество: ${U.esc(p.name)}">
              <button type="button" data-action="qty" data-id="${p.id}" data-delta="-1" aria-label="Уменьшить">${U.icon('minus')}</button>
              <output aria-live="polite">${i.qty}</output>
              <button type="button" data-action="qty" data-id="${p.id}" data-delta="1" aria-label="Увеличить" ${i.qty >= E.store.maxQty ? 'disabled' : ''}>${U.icon('plus')}</button>
            </div>
            <button type="button" class="line__remove" data-action="remove-line" data-id="${p.id}" aria-label="Удалить ${U.esc(p.name)}">${U.icon('trash')}</button>
          </div>
        </div>
        <p class="line__sum">${p.price != null ? U.price(p.price * i.qty) : ''}</p>
      </li>`;
  }

  function refreshWaLink() {
    if (!drawer) return;
    const waBtn = drawer.foot.querySelector('[data-wa-order]');
    if (waBtn) waBtn.href = U.wa(orderText());
  }

  function update() {
    if (!drawer) return;
    const S = E.store;
    const cart = S.get().cart;
    drawer.count.textContent = cart.length ? `(${S.cartCount()})` : '';
    if (!cart.length) {
      confirmClear = false;
      drawer.body.innerHTML = `
        <div class="drawer__empty">
          <span class="empty__icon">${U.icon('bag')}</span>
          <h3 class="h3">Корзина пока пуста</h3>
          <p>Добавьте понравившиеся украшения из каталога — мы подготовим их к примерке в бутике или доставке.</p>
          <a href="#/catalog" class="btn btn--dark btn--sm" data-close>Перейти в каталог</a>
        </div>`;
      drawer.foot.innerHTML = '';
      drawer.foot.hidden = true;
      return;
    }
    drawer.foot.hidden = false;

    const clearControl = confirmClear
      ? `<div class="drawer__confirm" role="alertdialog" aria-label="Подтверждение очистки корзины">
          <span>Очистить всю корзину?</span>
          <button type="button" class="btn btn--dark btn--xs" data-action="confirm-clear-cart">Да, очистить</button>
          <button type="button" class="btn btn--line btn--xs" data-action="cancel-clear-cart">Отмена</button>
        </div>`
      : `<button type="button" class="link-u drawer__clear" data-action="clear-cart">Очистить корзину</button>`;

    drawer.body.innerHTML = `
      <ul class="lines">${cart.map(itemRow).join('')}</ul>
      ${clearControl}

      <div class="checkout-box">
        <p class="checkout-box__title">Способ получения</p>
        <div class="checkout-Delivery">
          <label class="checkout-radio ${checkout.delivery === 'pickup' ? 'is-on' : ''}">
            <input type="radio" name="er-delivery" value="pickup" ${checkout.delivery === 'pickup' ? 'checked' : ''}>
            <span><b>Самовывоз из бутика</b><small>${U.esc(E.config.address.mall)}, 1 этаж · Бесплатно</small></span>
          </label>
          <label class="checkout-radio ${checkout.delivery === 'delivery' ? 'is-on' : ''}">
            <input type="radio" name="er-delivery" value="delivery" ${checkout.delivery === 'delivery' ? 'checked' : ''}>
            <span><b>Доставка курьером / по РФ</b><small>Согласуем удобное время и адрес</small></span>
          </label>
        </div>

        <label class="checkout-check">
          <input type="checkbox" id="er-giftwrap" ${checkout.giftWrap ? 'checked' : ''}>
          <span>Фирменная подарочная упаковка ERALUNE <b>Бесплатно</b></span>
        </label>

        <div class="checkout-fields">
          <input type="text" id="er-cust-name" placeholder="Ваше имя (необязательно)" value="${U.esc(checkout.name)}" autocomplete="name">
          <input type="tel" id="er-cust-phone" placeholder="Телефон для связи" value="${U.esc(checkout.phone)}" autocomplete="tel">
        </div>
      </div>`;

    drawer.body.querySelectorAll('input[name="er-delivery"]').forEach((r) => {
      r.addEventListener('change', (e) => {
        checkout.delivery = e.target.value;
        drawer.body.querySelectorAll('.checkout-radio').forEach((l) => l.classList.toggle('is-on', l.contains(e.target)));
        refreshWaLink();
      });
    });
    drawer.body.querySelector('#er-giftwrap')?.addEventListener('change', (e) => {
      checkout.giftWrap = e.target.checked;
      refreshWaLink();
    });
    drawer.body.querySelector('#er-cust-name')?.addEventListener('input', (e) => {
      checkout.name = e.target.value.trim();
      refreshWaLink();
    });
    drawer.body.querySelector('#er-cust-phone')?.addEventListener('input', (e) => {
      checkout.phone = e.target.value.trim();
      refreshWaLink();
    });

    const wa = U.wa(orderText());
    drawer.foot.innerHTML = `
      <div class="total-rows">
        <div class="total-sub"><span>Товаров (${S.cartCount()} шт.)</span><span>${U.price(S.cartTotal())}</span></div>
        <div class="total-sub"><span>Подарочная упаковка</span><span>Бесплатно</span></div>
      </div>
      <div class="total"><span>Итого к заказу</span><b>${U.price(S.cartTotal())}</b></div>
      ${S.hasUnpriced() ? '<p class="total__note">Стоимость позиций «по запросу» уточнит консультант бутика.</p>' : ''}
      <div class="drawer__cta">
        ${wa ? `<a class="btn btn--dark btn--block" data-wa-order href="${wa}" target="_blank" rel="noopener">${U.icon('whatsapp')}Оформить через WhatsApp</a>` : ''}
        <a class="btn ${wa ? 'btn--line' : 'btn--dark'} btn--block" href="${U.tel()}">${U.icon('phone')}Заказать по телефону</a>
        <button type="button" class="link-u" data-action="copy-order">Скопировать список заказа</button>
      </div>`;
  }

  function mount() {
    drawer = E.Drawer('cart-drawer', 'Корзина', 'bag');
    E.store.subscribe(update);
    update();
  }

  E.actions['open-cart'] = () => drawer.open();
  E.actions['add-cart'] = (el) => {
    const p = U.product(el.dataset.id);
    if (!p) return;
    E.store.add(p.id);
    el.classList.remove('is-added'); void el.offsetWidth; el.classList.add('is-added');
    U.toast(`«${p.name.replace(/[«»]/g, '')}» в корзине`, 'bag');
  };
  E.actions.qty = (el) => {
    const item = E.store.cartItem(el.dataset.id);
    if (item) E.store.setQty(item.id, item.qty + Number(el.dataset.delta));
  };
  E.actions['remove-line'] = (el) => {
    const row = el.closest('.line');
    const done = () => E.store.remove(el.dataset.id);
    if (row && !U.reducedMotion()) { row.classList.add('is-leaving'); setTimeout(done, 200); } else done();
  };
  E.actions['clear-cart'] = () => { confirmClear = true; update(); };
  E.actions['cancel-clear-cart'] = () => { confirmClear = false; update(); };
  E.actions['confirm-clear-cart'] = () => { confirmClear = false; E.store.clear(); U.toast('Корзина очищена', 'trash'); };
  E.actions['copy-order'] = async () => {
    try { await navigator.clipboard.writeText(orderText()); U.toast('Список заказа скопирован'); }
    catch (_) { U.toast('Не удалось скопировать', 'close'); }
  };

  E.components.Cart = { mount, open: () => drawer.open(), close: () => drawer && drawer.close(), isOpen: () => drawer && drawer.isOpen() };
})(window.ERALUNE);
