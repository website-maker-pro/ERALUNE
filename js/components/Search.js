/* ERALUNE — Search: поиск по названию (оверлей с живыми подсказками) */
(function (E) {
  'use strict';
  const U = E.utils;
  let el, input, results, opener;

  function renderResults(q) {
    const list = q ? E.components.ProductCatalog.filter({ q }) : [];
    const cats = q ? E.categories.filter((c) => E.components.ProductCatalog.norm(c.name).includes(E.components.ProductCatalog.norm(q))) : E.categories;
    results.innerHTML = `
      ${cats.length ? `<div class="sr__group"><p class="eyebrow">${q ? 'Категории' : 'Популярные разделы'}</p>
        <div class="sr__chips">${cats.map((c) => `<a class="chip" href="#/catalog?cat=${c.id}" data-close>${U.esc(c.name)}</a>`).join('')}</div></div>` : ''}
      ${q ? (list.length
        ? `<div class="sr__group"><p class="eyebrow">Украшения</p><ul class="sr__list">${list.slice(0, 6).map((p) => `
            <li><a href="${U.productUrl(p)}" class="sr__item" data-close>
              <span class="sr__thumb">${p.images.length ? U.picture(p.images[0], { alt: '', sizes: '56px' }) : U.placeholder('')}</span>
              <span class="sr__name">${U.esc(p.name)}</span><span class="sr__price">${U.price(p.price)}</span>
            </a></li>`).join('')}</ul>
            <a class="link-u link-u--arrow" href="#/catalog?q=${encodeURIComponent(q)}" data-close>Все результаты (${list.length}) ${U.icon('arrow')}</a></div>`
        : `<p class="sr__none">По запросу «${U.esc(q)}» ничего не найдено.</p>`) : ''}`;
  }

  function open() {
    E.closeOverlays && E.closeOverlays();
    opener = document.activeElement;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    U.lockScroll(true);
    renderResults(input.value.trim());
    setTimeout(() => input.focus(), 60);
  }
  function close() {
    if (!el.classList.contains('is-open')) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    U.lockScroll(false);
    opener && opener.focus && opener.focus({ preventScroll: true });
  }

  function mount() {
    el = document.createElement('div');
    el.className = 'search';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="search__backdrop" data-close></div>
      <div class="search__panel" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Поиск по каталогу">
        <div class="container">
          <form class="search__form" role="search">
            ${U.icon('search')}
            <label class="sr-only" for="search-input">Поиск украшений</label>
            <input id="search-input" type="search" placeholder="Серьги, колье, жемчуг…" autocomplete="off" enterkeyhint="search">
            <button type="button" class="icon-btn" data-close aria-label="Закрыть поиск">${U.icon('close')}</button>
          </form>
          <div class="search__results"></div>
        </div>
      </div>`;
    document.getElementById('overlays-root').appendChild(el);
    input = el.querySelector('input');
    results = el.querySelector('.search__results');
    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => renderResults(input.value.trim()), 120); });
    el.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      close();
      location.hash = `#/catalog${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    });
    el.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') U.trapFocus(e, el.querySelector('.search__panel'));
    });
  }

  E.actions['open-search'] = open;
  E.components.Search = { mount, open, close };
})(window.ERALUNE);
