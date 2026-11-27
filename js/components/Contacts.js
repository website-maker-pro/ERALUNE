/* ERALUNE — Contacts: «Будем рады видеть вас» + чистая карта без рекламы + Telegram */
(function (E) {
  'use strict';
  const U = E.utils;

  const TG_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 5 2 12.5l7 2.2M21 5l-3.2 15-6.8-5.3M21 5 9 14.7m0 0V20l3.2-3.4"/></svg>';

  function buildCleanMapSrc(coords) {
    const lon = coords ? Number(coords[0]) : 84.978515;
    const lat = coords ? Number(coords[1]) : 56.488532;
    const dLon = 0.0045;
    const dLat = 0.0022;
    const bbox = `${(lon - dLon).toFixed(6)},${(lat - dLat).toFixed(6)},${(lon + dLon).toFixed(6)},${(lat + dLat).toFixed(6)}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat.toFixed(6)},${lon.toFixed(6)}`;
  }

  function render(opts = {}) {
    const C = E.config;
    const H = opts.page ? 'h1' : 'h2';
    const mapSrc = buildCleanMapSrc(C.mapCoords);
    return `
    <section class="section section--milk contacts ${opts.page ? 'contacts--page' : ''}" id="contacts" aria-labelledby="contacts-title">
      <div class="container contacts__inner">
        <div class="contacts__info">
          <p class="eyebrow" data-reveal>Контакты</p>
          <${H} class="h2" id="contacts-title" data-reveal>Будем рады<br><em>видеть вас</em></${H}>

          <address class="contacts__card" data-reveal>
            <p class="contacts__brand">${U.logo()}</p>
            <ul class="contacts__list">
              <li>${U.icon('pin')}<span><b>${U.esc(C.address.mall)}</b>${U.esc(C.address.street)}, ${U.esc(C.address.floor)}<br>${U.esc(C.address.city)}, ${U.esc(C.address.country)}</span></li>
              <li>${U.icon('phone')}<span><b>Телефон</b><a href="${U.tel()}">${U.esc(C.phone)}</a></span></li>
              <li>${U.icon('clock')}<span><b>График работы</b>${U.esc(C.hoursShort)}</span></li>
              <li>${U.icon('star')}<span><b>Рейтинг ${String(C.rating.value).replace('.', ',')} из 5</b>${C.rating.count} оценок покупателей</span></li>
            </ul>
          </address>

          <div class="contacts__btns" data-reveal>
            <a class="btn btn--dark" href="${U.tel()}">${U.icon('phone')}Позвонить</a>
            ${C.whatsapp ? `<a class="btn btn--line" href="${U.wa('Здравствуйте! Пишу с сайта ERALUNE.')}" target="_blank" rel="noopener">${U.icon('whatsapp')}WhatsApp</a>` : ''}
            ${C.telegram ? `<a class="btn btn--line" href="${U.esc(C.telegram)}" target="_blank" rel="noopener">${TG_ICON}Telegram</a>` : ''}
            ${C.vk ? `<a class="btn btn--line" href="${U.esc(C.vk)}" target="_blank" rel="noopener">${U.icon('vk')}ВКонтакте</a>` : ''}
            <a class="btn btn--line" href="${U.mapLink()}" target="_blank" rel="noopener">${U.icon('route')}Маршрут</a>
          </div>
        </div>

        <div class="contacts__map" data-reveal>
          <iframe data-src="${mapSrc}" title="Карта: бутик ERALUNE, ${U.esc(C.address.street)}, ${U.esc(C.address.city)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          <a class="contacts__map-btn" href="${U.mapLink()}" target="_blank" rel="noopener">${U.icon('route')}<span>Открыть в Яндекс Картах</span></a>
          <div class="contacts__map-ph" aria-hidden="true">${U.icon('pin')}<span>Загружаем карту…</span></div>
        </div>
      </div>
    </section>`;
  }

  /** Карта подгружается только при приближении к ней — экономим трафик на мобильных */
  function mount(root) {
    const frame = root.querySelector('.contacts__map iframe[data-src]');
    if (!frame) return;
    const load = () => {
      frame.src = frame.dataset.src;
      frame.removeAttribute('data-src');
      frame.addEventListener('load', () => frame.parentElement.classList.add('is-loaded'), { once: true });
    };
    if (!('IntersectionObserver' in window)) return load();
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: '300px' });
    io.observe(frame);
  }

  E.components.Contacts = { render, mount };
})(window.ERALUNE);