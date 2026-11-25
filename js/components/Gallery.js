/* ERALUNE — Gallery: кинематографичный баннер бутика для главной, фотогалерея для «О бренде» и лайтбокс */
(function (E) {
  'use strict';
  const U = E.utils;
  const sets = {};
  let lb, img, cap, counter, current = { set: null, index: 0 }, opener;

  const registerSet = (name, items) => { sets[name] = items; };

  /* ---------- Главная: кинематографичный тёмный баннер бутика с крупным заголовком ---------- */
  function renderBanner() {
    const C = E.config;
    return `
    <section class="boutique-banner" aria-labelledby="boutique-banner-title">
      <div class="boutique-banner__media">
        <img src="assets/img/boutique-banner.jpg"
             alt="Бутик ERALUNE в ТРЦ «Изумрудный город», Томск"
             loading="lazy"
             decoding="async">
        <div class="boutique-banner__shade" aria-hidden="true"></div>
      </div>

      <div class="container boutique-banner__inner">
        <div class="boutique-banner__content" data-reveal>
          <p class="eyebrow eyebrow--light">Бутик в ${U.esc(C.address.city)}е</p>
          <h2 class="boutique-banner__title" id="boutique-banner-title">
            ERALUNE&nbsp;—<br><em>больше, чем украшения</em>
          </h2>
          <p class="boutique-banner__meta">
            ${U.esc(C.address.mall)}, ${U.esc(C.address.floor)} · ${U.esc(C.hoursShort)}
          </p>
          <div class="boutique-banner__cta">
            <a href="${U.mapLink()}" target="_blank" rel="noopener" class="hero__btn hero__btn--gold">
              Проложить маршрут ${U.icon('arrow')}
            </a>
            <a href="#/about" class="hero__btn hero__btn--ghost">О бренде</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ---------- Страница «О бренде»: фотогалерея ---------- */
  function render(opts = {}) {
    registerSet('gallery', E.gallery);
    const areas = ['a', 'e', 'd', 'b', 'c']; // соответствие плиток областям сетки
    return `
    <section class="section section--dark gallery" aria-labelledby="gallery-title">
      <div class="container">
        <div class="section-head section-head--row" data-reveal>
          <div>
            <p class="eyebrow eyebrow--light">Атмосфера</p>
            <h2 class="h2" id="gallery-title">${opts.title || 'Мир ERALUNE'}</h2>
          </div>
          <p class="gallery__lead">Украшения и детали нашего бутика в ТРЦ «Изумрудный город». Нажмите на фото, чтобы рассмотреть его ближе.</p>
        </div>
        <ul class="gallery__grid" role="list">
          ${E.gallery.map((g, i) => `
            <li class="gallery__item gallery__item--${areas[i] || 'x'} gallery__item--${g.size}" data-reveal style="--i:${i}">
              <button type="button" class="gallery__btn" data-action="lightbox" data-set="gallery" data-index="${i}" aria-label="Открыть фото: ${U.esc(g.alt)}">
                ${U.picture(g.image, { alt: g.alt, sizes: g.size === 'wide' ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw', focus: g.focus || (g.image === 'boutique-interior' ? '68% 35%' : '50% 40%') })}
                <span class="gallery__zoom">${U.icon('expand')}</span>
              </button>
            </li>`).join('')}
        </ul>
      </div>
    </section>`;
  }

  /* ---------- Полноэкранный просмотр ---------- */
  function mountLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
      <div class="lightbox__inner" role="dialog" aria-modal="true" aria-label="Просмотр фотографии">
        <button type="button" class="lightbox__close icon-btn" data-lb="close" aria-label="Закрыть">${U.icon('close')}</button>
        <button type="button" class="lightbox__nav lightbox__nav--prev" data-lb="prev" aria-label="Предыдущее фото">${U.icon('arrowLeft')}</button>
        <figure class="lightbox__figure" data-lb="close-bg">
          <div class="lightbox__stage"></div>
          <figcaption class="lightbox__cap"><span class="lightbox__text"></span><span class="lightbox__counter"></span></figcaption>
        </figure>
        <button type="button" class="lightbox__nav lightbox__nav--next" data-lb="next" aria-label="Следующее фото">${U.icon('arrow')}</button>
      </div>`;
    document.getElementById('overlays-root').appendChild(lb);
    img = lb.querySelector('.lightbox__stage');
    cap = lb.querySelector('.lightbox__text');
    counter = lb.querySelector('.lightbox__counter');

    lb.addEventListener('click', (e) => {
      const a = e.target.closest('[data-lb]');
      if (!a) return;
      if (a.dataset.lb === 'close') close();
      if (a.dataset.lb === 'close-bg' && e.target === a) close();
      if (a.dataset.lb === 'prev') step(-1);
      if (a.dataset.lb === 'next') step(1);
    });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'Tab') U.trapFocus(e, lb);
    });
    // Свайпы на смартфонах
    let x0 = null, y0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      else if (dy > 90) close();
      x0 = null;
    }, { passive: true });
  }

  function show(dir = 0) {
    const items = sets[current.set] || [];
    const it = items[current.index];
    if (!it) return;
    const next = document.createElement('div');
    next.className = 'lightbox__slide';
    if (dir) next.style.setProperty('--from', `${dir * 40}px`);
    next.innerHTML = U.picture(it.image, { alt: it.alt, sizes: '95vw', fit: 'contain', eager: true });
    const old = img.querySelector('.lightbox__slide:not(.is-out)');
    if (old) { old.classList.add('is-out'); setTimeout(() => old.remove(), 450); }
    img.appendChild(next);
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add('is-in')));
    cap.textContent = it.alt || '';
    counter.textContent = items.length > 1 ? `${current.index + 1} / ${items.length}` : '';
    lb.classList.toggle('is-single', items.length < 2);
  }

  function open(set, index) {
    if (!sets[set] || !sets[set].length) return;
    E.closeOverlays && E.closeOverlays();
    opener = document.activeElement;
    current = { set, index };
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    U.lockScroll(true);
    show();
    setTimeout(() => lb.querySelector('.lightbox__close').focus({ preventScroll: true }), 50);
  }
  function step(d) {
    const n = (sets[current.set] || []).length;
    if (n < 2) return;
    current.index = (current.index + d + n) % n;
    show(d);
  }
  function close() {
    if (!lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    U.lockScroll(false);
    setTimeout(() => { if (!lb.classList.contains('is-open')) img.innerHTML = ''; }, 400);
    opener && opener.focus && opener.focus({ preventScroll: true });
  }

  E.actions.lightbox = (el) => open(el.dataset.set, Number(el.dataset.index));
  E.actions['zoom-product'] = (el) => {
    const p = U.product(el.dataset.id);
    if (!p || !p.images.length) return;
    const allItems = E.products
      .filter((x) => x.images && x.images.length)
      .map((x) => ({ id: x.id, image: x.images[0], alt: `${x.name}${x.price != null ? ` — ${U.price(x.price)}` : ''}` }));
    registerSet('catalog-zoom', allItems);
    const idx = Math.max(0, allItems.findIndex((x) => x.id === p.id));
    open('catalog-zoom', idx);
  };
  E.components.Gallery = { render, renderBanner, mountLightbox, registerSet, open, close };
})(window.ERALUNE);
