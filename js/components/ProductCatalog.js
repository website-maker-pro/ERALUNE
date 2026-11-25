/* ERALUNE — ProductCatalog: витрина бестселлеров на главной, полный каталог и быстрый просмотр */
(function (E) {
  'use strict';
  const U = E.utils;
  const Card = () => E.components.ProductCard;
  const HOME_LIMIT = 8;

  const PRICE = [
    { id: '', label: 'Любая цена', test: () => true },
    { id: 'priced', label: 'С указанной ценой', test: (p) => p.price != null },
    { id: 'to12', label: 'До 12 000 ₽', test: (p) => p.price != null && p.price <= 12000 },
    { id: '12-15', label: '12 000 – 15 000 ₽', test: (p) => p.price != null && p.price > 12000 && p.price <= 15000 },
    { id: 'from15', label: 'От 15 000 ₽', test: (p) => p.price != null && p.price > 15000 },
    { id: 'request', label: 'Цена по запросу', test: (p) => p.price == null },
  ];
  const SORT = [
    { id: '', label: 'По популярности' },
    { id: 'price-asc', label: 'Сначала дешевле' },
    { id: 'price-desc', label: 'Сначала дороже' },
    { id: 'name', label: 'По названию' },
  ];

  const norm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"]/g, '').trim();

  function filter({ cat = '', q = '', price = '', sort = '' }) {
    const pf = PRICE.find((x) => x.id === price) || PRICE[0];
    const nq = norm(q);
    let list = E.products.filter((p) =>
      (!cat || p.categories.includes(cat)) &&
      (!nq || norm(p.name).includes(nq) || norm(p.sku).includes(nq) || p.categories.some((c) => norm(U.category(c)?.name || '').includes(nq))) &&
      pf.test(p)
    );
    if (!sort) {
      // Сначала товары с указанной ценой и фото, затем остальные
      list = [...list].sort((a, b) => ((b.price != null) - (a.price != null)) || ((b.images.length > 0) - (a.images.length > 0)));
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    if (sort === 'price-desc') list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return list;
  }

  function serviceStrip() {
    const C = E.config;
    return `
    <div class="shop-strip" aria-label="Преимущества покупки в ERALUNE">
      <div class="container shop-strip__grid">
        <div class="shop-strip__item">
          ${U.icon('pin')}
          <div><b>Самовывоз сегодня</b><span>${U.esc(C.address.mall)}, ${U.esc(C.address.floor)}</span></div>
        </div>
        <div class="shop-strip__item">
          ${U.icon('clock')}
          <div><b>Примерка в бутике</b><span>${U.esc(C.hoursShort)}</span></div>
        </div>
        <div class="shop-strip__item">
          ${U.icon('moment')}
          <div><b>Подарочная упаковка</b><span>Фирменный футляр к заказу</span></div>
        </div>
        <div class="shop-strip__item">
          ${U.icon('phone')}
          <div><b>Быстрый заказ</b><span><a href="${U.tel()}">${U.esc(C.phone)}</a> · WhatsApp</span></div>
        </div>
      </div>
    </div>`;
  }

  /* ---------- Главная: компактная витрина избранных украшений (до 8 позиций) ---------- */
  let homeState = { cat: '', q: '', sort: '' };

  function renderFeatured() {
    homeState = { cat: '', q: '', sort: '' };
    const items = filter(homeState).slice(0, HOME_LIMIT);
    const chips = [
      { id: '', name: 'Избранное', count: Math.min(HOME_LIMIT, E.products.length) },
      ...E.categories.map((c) => ({ id: c.id, name: c.name, count: U.inCategory(c.id).length })),
    ];

    return `
    <section class="section section--milk featured" id="home-shop" aria-labelledby="featured-title">
      <div class="container">
        <div class="section-head section-head--row" data-reveal>
          <div>
            <p class="eyebrow">Бестселлеры бутика</p>
            <h2 class="h2" id="featured-title">Избранные украшения</h2>
          </div>
          <a href="#/catalog" class="link-u link-u--arrow">Весь каталог (${E.products.length}) ${U.icon('arrow')}</a>
        </div>

        <div class="store-toolbar store-toolbar--compact" data-reveal>
          <div class="chips" role="tablist" aria-label="Фильтр по категориям">
            ${chips.map((c) => `
              <button type="button" role="tab"
                      class="chip ${c.id === '' ? 'is-active' : ''}"
                      aria-selected="${c.id === ''}"
                      data-action="home-cat" data-cat="${c.id}">
                <span>${U.esc(c.name)}</span>
                <small class="chip__count">${c.count}</small>
              </button>`).join('')}
          </div>
        </div>

        <div class="grid grid--catalog" id="home-shop-grid">
          ${items.map((p, i) => Card().render(p, i)).join('')}
        </div>

        <div class="featured__foot" data-reveal>
          <a href="#/catalog" id="home-shop-all" class="btn btn--dark">Смотреть весь каталог (${E.products.length}) ${U.icon('arrow')}</a>
        </div>
      </div>
    </section>`;
  }

  function updateHomeShop() {
    const grid = document.getElementById('home-shop-grid');
    if (!grid) return;
    const fullList = filter(homeState);
    const list = fullList.slice(0, HOME_LIMIT);
    grid.innerHTML = list.length
      ? list.map((p, i) => Card().render(p, i)).join('')
      : emptyState(homeState);
    document.querySelectorAll('[data-action="home-cat"]').forEach((btn) => {
      const on = (btn.dataset.cat || '') === homeState.cat;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', String(on));
    });
    const allBtn = document.getElementById('home-shop-all');
    if (allBtn) {
      const catObj = U.category(homeState.cat);
      allBtn.setAttribute('href', homeState.cat ? `#/catalog?cat=${encodeURIComponent(homeState.cat)}` : '#/catalog');
      allBtn.innerHTML = catObj
        ? `Все в категории «${U.esc(catObj.name)}» (${fullList.length}) ${U.icon('arrow')}`
        : `Смотреть весь каталог (${E.products.length}) ${U.icon('arrow')}`;
    }
    U.reveal(grid);
  }

  function bindHomeShop(root) {
    const qInput = root.querySelector('#home-shop-q');
    const sortSel = root.querySelector('#home-shop-sort');
    if (qInput) {
      let t;
      qInput.addEventListener('input', (e) => {
        clearTimeout(t);
        t = setTimeout(() => { homeState.q = e.target.value.trim(); updateHomeShop(); }, 140);
      });
    }
    if (sortSel) {
      sortSel.addEventListener('change', (e) => {
        homeState.sort = e.target.value;
        updateHomeShop();
      });
    }
  }

  E.actions = E.actions || {};
  E.actions['home-cat'] = (btn) => {
    homeState.cat = btn.dataset.cat || '';
    updateHomeShop();
  };

  /* ---------- Страница Каталога ---------- */
  function emptyState(params) {
    const cat = U.category(params.cat);
    const onlyCat = cat && !params.q && !params.price;
    return `
      <div class="empty" data-reveal>
        <span class="empty__icon">${U.icon(onlyCat ? 'moon' : 'search')}</span>
        <h3 class="h3">${onlyCat ? `Раздел «${U.esc(cat.name)}» скоро пополнится` : 'Ничего не найдено'}</h3>
        <p>${onlyCat
          ? 'Узнать об актуальном наличии украшений в бутике можно у консультантов по телефону или в WhatsApp.'
          : 'Попробуйте изменить запрос или сбросить фильтры.'}</p>
        <div class="empty__actions">
          ${onlyCat
            ? `<a class="btn btn--dark btn--sm" href="${U.tel()}">${U.icon('phone')}Позвонить</a>`
            : `<button type="button" class="btn btn--line btn--sm" data-action="reset-catalog">Сбросить фильтры</button>`}
        </div>
      </div>`;
  }

  function renderCatalog(params) {
    const cat = U.category(params.cat);
    const list = filter(params);
    const chips = [
      { id: '', name: 'Все', count: E.products.length },
      ...E.categories.map((c) => ({ id: c.id, name: c.name, count: U.inCategory(c.id).length })),
    ];
    return `
    <section class="page-hero page-hero--catalog">
      <div class="container">
        <nav class="crumbs" aria-label="Хлебные крошки"><a href="#/">Главная</a><span>/</span>${cat ? `<a href="#/catalog">Каталог</a><span>/</span><span aria-current="page">${U.esc(cat.name)}</span>` : '<span aria-current="page">Каталог</span>'}</nav>
        <h1 class="h1 anim-up">${cat ? U.esc(cat.name) : 'Каталог украшений'}</h1>
        <p class="page-hero__sub anim-up" style="--d:.1s">Добавьте украшения в корзину — мы подтвердим наличие в бутике ERALUNE и подготовим заказ к выдаче или доставке.</p>
      </div>
    </section>

    <section class="section section--milk catalog" aria-label="Список украшений">
      <div class="container">
        <div class="filters" role="search">
          <div class="chips" role="tablist" aria-label="Категории">
            ${chips.map((c) => `<a role="tab" data-cat="${c.id}" href="#/catalog${buildQuery({ ...params, cat: c.id })}" class="chip ${params.cat === c.id || (!params.cat && !c.id) ? 'is-active' : ''}" aria-selected="${params.cat === c.id || (!params.cat && !c.id)}"><span>${U.esc(c.name)}</span><small class="chip__count">${c.count}</small></a>`).join('')}
          </div>
          <div class="filters__row">
            <label class="field field--search">
              ${U.icon('search')}
              <span class="sr-only">Поиск по названию</span>
              <input type="search" id="catalog-q" placeholder="Поиск по названию или артикулу…" value="${U.esc(params.q)}" autocomplete="off" enterkeyhint="search">
            </label>
            <label class="field field--select">
              <span class="sr-only">Цена</span>
              <select id="catalog-price">${PRICE.map((x) => `<option value="${x.id}" ${x.id === params.price ? 'selected' : ''}>${x.label}</option>`).join('')}</select>
            </label>
            <label class="field field--select">
              <span class="sr-only">Сортировка</span>
              <select id="catalog-sort">${SORT.map((x) => `<option value="${x.id}" ${x.id === params.sort ? 'selected' : ''}>${x.label}</option>`).join('')}</select>
            </label>
          </div>
          <p class="filters__count" aria-live="polite">${list.length ? `Показано товаров: ${list.length}` : ''}</p>
        </div>

        <div class="grid grid--catalog" id="catalog-grid">
          ${list.length ? list.map((p, i) => Card().render(p, i)).join('') : emptyState(params)}
        </div>
      </div>
    </section>`;
  }

  function buildQuery(p) {
    const q = new URLSearchParams();
    ['cat', 'q', 'price', 'sort'].forEach((k) => p[k] && q.set(k, p[k]));
    const s = q.toString();
    return s ? `?${s}` : '';
  }

  function mountCatalog(root, params) {
    const go = (patch) => {
      const next = { ...params, ...patch };
      history.replaceState(null, '', `#/catalog${buildQuery(next)}`);
      Object.assign(params, next);
      const list = filter(params);
      const grid = root.querySelector('#catalog-grid');
      grid.innerHTML = list.length ? list.map((p, i) => Card().render(p, i)).join('') : emptyState(params);
      root.querySelector('.filters__count').textContent = list.length ? `Показано товаров: ${list.length}` : '';
      root.querySelectorAll('.chip').forEach((ch) => {
        ch.setAttribute('href', `#/catalog${buildQuery({ ...params, cat: ch.dataset.cat })}`);
      });
      U.reveal(grid);
    };
    let t;
    root.querySelector('#catalog-q')?.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => go({ q: e.target.value.trim() }), 160);
    });
    root.querySelector('#catalog-price')?.addEventListener('change', (e) => go({ price: e.target.value }));
    root.querySelector('#catalog-sort')?.addEventListener('change', (e) => go({ sort: e.target.value }));
    root.querySelector('.chip.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  E.actions['reset-catalog'] = () => {
    if (document.getElementById('home-shop-grid')) {
      homeState = { cat: '', q: '', sort: '' };
      const q = document.getElementById('home-shop-q');
      if (q) q.value = '';
      updateHomeShop();
    } else {
      location.hash = '#/catalog';
    }
  };

  /* ---------- Модальное окно «Быстрый просмотр товара» ---------- */
  let qvModal = null;
  let qvOpener = null;

  function ensureQuickView() {
    if (qvModal) return qvModal;
    qvModal = document.createElement('div');
    qvModal.className = 'qview';
    qvModal.id = 'quick-view-modal';
    qvModal.setAttribute('aria-hidden', 'true');
    qvModal.innerHTML = `
      <div class="qview__backdrop" data-qv-close></div>
      <div class="qview__dialog" role="dialog" aria-modal="true" aria-label="Быстрый просмотр украшения">
        <button type="button" class="icon-btn qview__close" data-qv-close aria-label="Закрыть окно">${U.icon('close')}</button>
        <div class="qview__content"></div>
      </div>`;
    document.getElementById('overlays-root').appendChild(qvModal);
    qvModal.addEventListener('click', (e) => {
      if (e.target.closest('[data-qv-close]')) closeQuickView();
    });
    qvModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeQuickView();
      if (e.key === 'Tab' && U.trapFocus) U.trapFocus(e, qvModal.querySelector('.qview__dialog'));
    });
    return qvModal;
  }

  function openQuickView(id) {
    const p = U.product(id);
    if (!p) return;
    const modal = ensureQuickView();
    const C = E.config;
    const cat = U.category(p.categories[0]);
    const fav = E.store.isFav(p.id);
    const ask = U.wa(`${C.askGreeting} «${p.name}»${p.price != null ? ` (${U.price(p.price)})` : ''}`);
    const focus = p.focus || '50% 50%';

    modal.querySelector('.qview__content').innerHTML = `
      <div class="qview__media">
        <button type="button" class="qview__img-btn" data-action="zoom-product" data-id="${p.id}" aria-label="Открыть фото на весь экран">
          ${p.images.length
            ? U.picture(p.images[0], { alt: p.name, sizes: '(min-width: 768px) 440px, 100vw', focus, fit: 'contain', eager: true })
            : U.placeholder()}
          <span class="qview__zoom">${U.icon('expand')}<span>На весь экран</span></span>
        </button>
      </div>
      <div class="qview__body">
        <div class="qview__meta">
          ${cat ? `<span class="eyebrow">${U.esc(cat.name)}</span>` : ''}
          ${p.sku ? `<span class="card__sku">Арт. ${U.esc(p.sku)}</span>` : ''}
        </div>
        <h2 class="h3 qview__title">${U.esc(p.name)}</h2>
        <p class="qview__price ${p.price == null ? 'is-request' : ''}">${U.price(p.price)}</p>
        <p class="qview__stock"><i aria-hidden="true"></i>В наличии в бутике · ${U.esc(C.address.mall)}, ${U.esc(C.address.floor)}</p>
        <p class="qview__desc">
          ${p.description
            ? U.esc(p.description)
            : 'Украшение доступно для примерки и самовывоза в бутике ERALUNE ежедневно с 10:00 до 22:00, а также для заказа с доставкой.'}
        </p>
        <div class="qview__actions">
          ${p.price != null
            ? `<button type="button" class="btn btn--dark btn--block" data-action="add-cart" data-id="${p.id}">${U.icon('bag')}Добавить в корзину</button>`
            : `<a class="btn btn--dark btn--block" href="${ask || U.tel()}" target="_blank" rel="noopener">${U.icon('whatsapp')}Узнать цену в WhatsApp</a>`}
          <button type="button" class="btn btn--line btn--square fav-btn--big ${fav ? 'is-on' : ''}" data-action="toggle-fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="В избранное">${U.icon('heart')}</button>
        </div>
        <div class="qview__links">
          <a href="${U.productUrl(p)}" class="link-u link-u--arrow" data-qv-close>Страница украшения ${U.icon('arrow')}</a>
          ${ask ? `<a href="${ask}" target="_blank" rel="noopener" class="link-u">Задать вопрос в WhatsApp</a>` : ''}
        </div>
      </div>`;

    qvOpener = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    U.lockScroll(true);
    setTimeout(() => modal.querySelector('.qview__close')?.focus({ preventScroll: true }), 40);
  }

  function closeQuickView() {
    if (!qvModal || !qvModal.classList.contains('is-open')) return;
    qvModal.classList.remove('is-open');
    qvModal.setAttribute('aria-hidden', 'true');
    U.lockScroll(false);
    qvOpener && qvOpener.focus && qvOpener.focus({ preventScroll: true });
  }

  E.actions['quick-view'] = (el) => openQuickView(el.dataset.id);

  E.components.ProductCatalog = {
    renderServiceStrip: serviceStrip,
    renderFeatured,
    bindHomeShop,
    renderCatalog,
    mountCatalog,
    filter,
    norm,
    closeQuickView,
  };
})(window.ERALUNE);
