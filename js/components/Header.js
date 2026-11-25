/* ERALUNE — Header: архитектурная шапка, мобильное меню (100dvh) и нижняя панель */
(function (E) {
  'use strict';
  const U = E.utils;
  E.components = E.components || {};
  E.actions = E.actions || {};

  const NAV = [
    { href: '#/', label: 'Главная', key: 'home' },
    { href: '#/catalog', label: 'Каталог', key: 'catalog' },
    { href: '#/collections', label: 'Коллекции', key: 'collections' },
    { href: '#/about', label: 'О бренде', key: 'about' },
    { href: '#/contacts', label: 'Контакты', key: 'contacts' },
  ];

  const badge = (id) => `<span class="badge" data-badge="${id}" hidden>0</span>`;

  function render() {
    const C = E.config;
    return `
    <header class="header" id="header">
      <div class="header__inner container">
        <a href="#/" class="header__logo" aria-label="ERALUNE — на главную">${U.logo()}</a>

        <nav class="header__nav" aria-label="Основное меню">
          <ul>${NAV.map((n) => `<li><a href="${n.href}" data-nav="${n.key}">${n.label}</a></li>`).join('')}</ul>
        </nav>

        <div class="header__actions">
          <button class="icon-btn" type="button" data-action="open-search" aria-label="Поиск по каталогу">${U.icon('search')}</button>
          <button class="icon-btn hide-mobile" type="button" data-action="open-favorites" aria-label="Избранное">${U.icon('heart')}${badge('fav')}</button>
          <button class="icon-btn" type="button" data-action="open-cart" aria-label="Корзина">${U.icon('bag')}${badge('cart')}</button>
          <button class="icon-btn header__burger" type="button" data-action="open-menu" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu">${U.icon('menu')}</button>
        </div>
      </div>
    </header>

    <div class="mmenu" id="mobile-menu" data-lenis-prevent aria-hidden="true" role="dialog" aria-modal="true" aria-label="Навигация по сайту">
      <div class="mmenu__top container">
        <a href="#/" class="header__logo" data-action="close-menu" aria-label="ERALUNE — на главную">${U.logo()}</a>
        <button class="icon-btn" type="button" data-action="close-menu" aria-label="Закрыть меню">${U.icon('close')}</button>
      </div>
      <nav class="mmenu__nav container" aria-label="Мобильное меню">
        ${NAV.map((n, i) => `<a href="${n.href}" data-nav="${n.key}" style="--i:${i}"><span class="mmenu__num">0${i + 1}</span><span class="mmenu__label">${n.label}</span></a>`).join('')}
        <a href="#/favorites" data-nav="favorites" style="--i:5"><span class="mmenu__num">06</span><span class="mmenu__label">Избранное</span></a>
      </nav>
      <div class="mmenu__foot container">
        <div class="mmenu__meta">
          <p class="eyebrow">Бутик в Томске</p>
          <p>${U.esc(C.address.mall)}, ${U.esc(C.address.street)}, ${U.esc(C.address.floor)}</p>
          <p class="mmenu__hours">${U.esc(C.hoursShort)}</p>
        </div>
        <div class="mmenu__contacts">
          <a class="btn btn--dark btn--sm" href="${U.tel()}">${U.icon('phone')}Позвонить</a>
          ${C.whatsapp ? `<a class="btn btn--line btn--sm" href="${U.wa()}" target="_blank" rel="noopener">${U.icon('whatsapp')}WhatsApp</a>` : ''}
          ${C.vk ? `<a class="btn btn--line btn--sm" href="${U.esc(C.vk)}" target="_blank" rel="noopener">${U.icon('vk')}ВКонтакте</a>` : ''}
        </div>
      </div>
    </div>

    <nav class="tabbar" aria-label="Быстрая навигация">
      <a href="#/" data-nav="home">${U.icon('home')}<span>Главная</span></a>
      <a href="#/catalog" data-nav="catalog">${U.icon('grid')}<span>Каталог</span></a>
      <button type="button" data-action="open-favorites" aria-label="Избранное">${U.icon('heart')}${badge('fav')}<span>Избранное</span></button>
      <button type="button" data-action="open-cart" aria-label="Корзина">${U.icon('bag')}${badge('cart')}<span>Корзина</span></button>
      <a href="#/contacts" data-nav="contacts">${U.icon('chat')}<span>Контакты</span></a>
    </nav>`;
  }

  function updateBadges() {
    const S = E.store;
    const vals = { fav: S.get().favorites.length, cart: S.cartCount() };
    document.querySelectorAll('[data-badge]').forEach((b) => {
      const v = vals[b.dataset.badge];
      b.textContent = v;
      b.hidden = v === 0;
    });
  }

  function setActive(key) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const on = a.dataset.nav === key;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  let menuOpener = null;
  function menu(open) {
    const m = document.getElementById('mobile-menu');
    const btn = document.querySelector('.header__burger');
    if (!m || m.classList.contains('is-open') === open) return;
    if (open) menuOpener = document.activeElement;
    m.classList.toggle('is-open', open);
    m.setAttribute('aria-hidden', String(!open));
    btn && btn.setAttribute('aria-expanded', String(open));
    U.lockScroll(open);
    if (open) {
      requestAnimationFrame(() => m.querySelector('.mmenu__nav a')?.focus({ preventScroll: true }));
    } else if (menuOpener && menuOpener.focus) {
      menuOpener.focus({ preventScroll: true });
      menuOpener = null;
    }
  }

  function mount(root) {
    root.innerHTML = render();
    const header = document.getElementById('header');
    const m = document.getElementById('mobile-menu');

    if (E.motion && E.motion.bindHeader) {
      E.motion.bindHeader(header);
    }

    if (m) {
      m.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') menu(false);
        if (e.key === 'Tab' && U.trapFocus) U.trapFocus(e, m);
      });
    }

    root.querySelectorAll('.mmenu__nav a').forEach((a) => a.addEventListener('click', () => menu(false)));
    E.store.subscribe(updateBadges);
    updateBadges();
  }

  E.actions['open-menu'] = () => menu(true);
  E.actions['close-menu'] = () => menu(false);

  E.components.Header = { mount, setActive, closeMenu: () => menu(false) };
})(window.ERALUNE);
