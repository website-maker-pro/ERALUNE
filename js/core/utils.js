/* ERALUNE — вспомогательные функции и иконки */
(function (E) {
  'use strict';

  const U = {};

  U.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  U.price = (n) => (n == null ? 'Цена по запросу' : `${rub.format(n)}\u00A0₽`);

  U.reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  U.isDesktop = () => window.matchMedia('(min-width: 1024px) and (hover: hover)').matches;

  /* ---------- Изображения ---------- */
  /**
   * Адаптивное изображение: AVIF → WebP → JPEG, с размерами (без CLS) и LQIP-фоном.
   * key — имя из js/data/images.js или прямой путь к файлу.
   */
  U.picture = (key, opts = {}) => {
    const { alt = '', sizes = '100vw', cls = '', eager = false, focus = '50% 50%', fit = 'cover' } = opts;
    const meta = E.images && E.images[key];
    const common = `alt="${U.esc(alt)}" class="img ${cls}" decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}
      style="object-position:${focus};object-fit:${fit}" onload="this.classList.add('is-loaded')"`;
    if (!meta) {
      return `<img src="${U.esc(key)}" ${common}>`;
    }
    const set = (ext) => meta.widths.map((w) => `assets/img/${key}-${w}.${ext} ${w}w`).join(', ');
    return `<picture class="pic" style="background-image:url('${meta.lqip}')">
      <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
      <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
      <img src="assets/img/${key}.jpg" width="${meta.w}" height="${meta.h}" ${common}>
    </picture>`;
  };

  U.imageSrc = (key, ext = 'jpg') => {
    const meta = E.images && E.images[key];
    if (!meta) return key;
    return ext === 'jpg' ? `assets/img/${key}.jpg` : `assets/img/${key}-${meta.widths[meta.widths.length - 1]}.${ext}`;
  };

  /** Изящная заглушка для товаров без фото */
  U.placeholder = (label = 'Фото скоро появится') => `
    <div class="ph" role="img" aria-label="${U.esc(label)}">
      <span class="ph__mark">${U.icon('moon')}</span>
      <span class="ph__brand">ERALUNE</span>
      <span class="ph__label">${U.esc(label)}</span>
    </div>`;

  /* ---------- Связь ---------- */
  U.tel = () => `tel:${E.config.phoneHref}`;
  U.wa = (text = '') => E.config.whatsapp
    ? `https://wa.me/${E.config.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`
    : '';
  U.mapLink = () => `https://yandex.ru/maps/?text=${encodeURIComponent(E.config.mapQuery)}`;

  /* ---------- Данные ---------- */
  U.product = (id) => E.products.find((p) => p.id === id);
  U.category = (id) => E.categories.find((c) => c.id === id);
  U.productUrl = (p) => `#/product/${encodeURIComponent(p.id)}`;
  U.inCategory = (cat) => E.products.filter((p) => p.categories.includes(cat));
  U.filledSpecs = (p) => Object.entries(p.specs || {}).filter(([, v]) => v !== '' && v != null);

  /* ---------- Уведомления ---------- */
  let toastTimer;
  U.toast = (msg, icon = 'check') => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.innerHTML = `<div class="toast">${U.icon(icon)}<span>${U.esc(msg)}</span></div>`;
    requestAnimationFrame(() => el.firstElementChild.classList.add('is-in'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.firstElementChild && el.firstElementChild.classList.remove('is-in'), 2400);
  };

  /* ---------- Появление при прокрутке (делегируется GSAP в motion.js) ---------- */
  U.reveal = (root = document) => {
    if (E.motion && E.motion.reveal) {
      E.motion.reveal(root);
      return;
    }
    root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  };

  /* ---------- Блокировка прокрутки для оверлеев ---------- */
  let locks = 0;
  U.lockScroll = (on) => {
    locks = Math.max(0, locks + (on ? 1 : -1));
    const locked = locks > 0;
    document.documentElement.classList.toggle('is-locked', locked);
    if (E.motion) {
      if (locked) E.motion.stop();
      else E.motion.start();
    }
  };

  /* ---------- Иконки (тонкие линии, 24×24) ---------- */
  const I = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>',
    bag: '<path d="M5.5 8.5h13l-1 11.5h-11z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
    menu: '<path d="M4 8h16M4 16h10"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
    arrowLeft: '<path d="M20 12H5m5-5-5 5 5 5"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    plus: '<path d="M12 6v12M6 12h12"/>',
    minus: '<path d="M6 12h12"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    phone: '<path d="M6.6 4h2.6l1.3 4-1.8 1.2a11 11 0 0 0 5.1 5.1l1.2-1.8 4 1.3v2.6A1.6 1.6 0 0 1 17.4 18 13.4 13.4 0 0 1 5 5.6 1.6 1.6 0 0 1 6.6 4Z"/>',
    whatsapp: '<path d="M4.5 19.5l1.1-3.9A8 8 0 1 1 8.6 18.6z"/><path d="M9.2 8.6c.2-.5.6-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.5.6c.6 1.1 1.5 2 2.7 2.6l.6-.6c.2-.2.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.6.4-1.6.6-3-.1a8.3 8.3 0 0 1-3.6-3.6c-.7-1.4-.6-2.4-.4-3.1z"/>',
    vk: '<path d="M3.5 7.5h3c.8 3.6 2.6 5.6 4 6V7.5h2.8v3.6c1.4-.2 2.9-1.9 3.4-3.6h2.8a8.8 8.8 0 0 1-3.8 5.2 8.6 8.6 0 0 1 4.4 4.8h-3.1a5.6 5.6 0 0 0-3.7-3.6v3.6h-.4C7.4 17.5 4.4 13.9 3.5 7.5Z"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
    check: '<path d="m5 12.5 4.2 4L19 7"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
    home: '<path d="M4 11 12 4.5l8 6.5"/><path d="M6 9.8V19.5h12V9.8"/>',
    grid: '<rect x="4.5" y="4.5" width="6" height="6" rx=".5"/><rect x="13.5" y="4.5" width="6" height="6" rx=".5"/><rect x="4.5" y="13.5" width="6" height="6" rx=".5"/><rect x="13.5" y="13.5" width="6" height="6" rx=".5"/>',
    chat: '<path d="M5 6.5h14v9.5H10l-4 3.5v-3.5H5z"/>',
    moon: '<path d="M15.5 4.6a8 8 0 1 0 3.9 11.7A7 7 0 0 1 15.5 4.6Z"/>',
    // иконки преимуществ
    design: '<path d="M12 3.5 15 9l-3 11.5L9 9z"/><path d="M5 9h14M7.5 5h9L19 9l-7 11.5L5 9z"/>',
    detail: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m14.5 14.5 5 5"/><path d="M10.5 8v5M8 10.5h5"/>',
    moment: '<path d="M4.5 10h15v9.5h-15z"/><path d="M3.5 7h17v3h-17zM12 7v12.5"/><path d="M12 7c-1.5-3-5-3.2-5-1.2S10 7 12 7Zm0 0c1.5-3 5-3.2 5-1.2S14 7 12 7Z"/>',
    person: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    bracelet: '<ellipse cx="12" cy="12" rx="8" ry="5.5"/><ellipse cx="12" cy="12" rx="5.6" ry="3.4"/>',
  };
  U.icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[name] || ''}</svg>`;

  U.logo = (cls = '') => `<span class="logo ${cls}"><span class="logo__word">ERALUNE</span></span>`;

  U.stars = (v) => {
    const pct = Math.round((v / 5) * 100);
    return `<span class="stars" aria-hidden="true"><span class="stars__fill" style="width:${pct}%">★★★★★</span>★★★★★</span>`;
  };

  E.utils = U;
})(window.ERALUNE);
