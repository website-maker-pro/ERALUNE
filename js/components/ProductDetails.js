/* ERALUNE — ProductDetails: страница товара */
(function (E) {
  'use strict';
  const U = E.utils;

  function gallery(p) {
    if (!p.images.length) return `<div class="pd__main pd__main--ph">${U.placeholder('Фотография украшения скоро появится')}</div>`;
    const slides = p.images.map((key, i) => `
      <button type="button" class="pd__slide" data-action="lightbox" data-set="product" data-index="${i}" aria-label="Открыть фото ${i + 1} в полноэкранном режиме">
        ${U.picture(key, { alt: `${p.name}${p.images.length > 1 ? ` — фото ${i + 1}` : ''}`, sizes: '(min-width: 1024px) 50vw, 100vw', eager: i === 0, fit: 'contain' })}
        <span class="pd__zoom">${U.icon('expand')}</span>
      </button>`).join('');
    const dots = p.images.length > 1
      ? `<div class="pd__thumbs">${p.images.map((key, i) => `<button type="button" class="pd__thumb ${i ? '' : 'is-active'}" data-thumb="${i}" aria-label="Фото ${i + 1}">${U.picture(key, { alt: '', sizes: '80px' })}</button>`).join('')}</div>`
      : '';
    return `<div class="pd__gallery"><div class="pd__track" id="pd-track">${slides}</div>${dots}</div>`;
  }

  function render(id) {
    const p = U.product(id);
    if (!p) return null;
    const C = E.config;
    const cat = U.category(p.categories[0]);
    const specs = U.filledSpecs(p);
    const fav = E.store.isFav(p.id);
    const ask = U.wa(`${C.askGreeting} «${p.name}»${p.price != null ? ` (${U.price(p.price)})` : ''}`);
    const related = E.products.filter((x) => x.id !== p.id && x.categories.some((c) => p.categories.includes(c)))
      .concat(E.products.filter((x) => x.id !== p.id && !x.categories.some((c) => p.categories.includes(c))))
      .slice(0, 4);

    const buy = p.price != null
      ? `<button type="button" class="btn btn--dark btn--block" data-action="add-cart" data-id="${p.id}">${U.icon('bag')}Добавить в корзину</button>`
      : `<a class="btn btn--dark btn--block" href="${ask || U.tel()}" target="_blank" rel="noopener">${U.icon('chat')}Узнать цену</a>`;

    return `
    <article class="pd section--milk">
      <div class="container">
        <nav class="crumbs" aria-label="Хлебные крошки">
          <a href="#/">Главная</a><span>/</span><a href="#/catalog">Каталог</a><span>/</span>
          ${cat ? `<a href="#/catalog?cat=${cat.id}">${U.esc(cat.name)}</a><span>/</span>` : ''}
          <span aria-current="page">${U.esc(p.name)}</span>
        </nav>

        <div class="pd__grid">
          <div class="pd__media anim-fade">${gallery(p)}</div>

          <div class="pd__info">
            ${cat ? `<p class="eyebrow anim-up">${U.esc(cat.name)}</p>` : ''}
            <h1 class="pd__title anim-up" style="--d:.06s">${U.esc(p.name)}</h1>
            <p class="pd__price anim-up ${p.price == null ? 'is-request' : ''}" style="--d:.12s">${p.oldPrice ? `<s>${U.price(p.oldPrice)}</s>` : ''}${U.price(p.price)}</p>
            <span class="gold-line anim-line" style="--d:.2s"></span>

            <div class="pd__desc anim-up" style="--d:.2s">
              ${p.description
                ? `<p>${U.esc(p.description)}</p>`
                : '<p>Подробную информацию об украшении — материалы, размеры и наличие — уточняйте у консультантов бутика ERALUNE по телефону или в мессенджере.</p>'}
            </div>

            ${specs.length ? `<dl class="pd__specs anim-up" style="--d:.24s">${specs.map(([k, v]) => `<div><dt>${U.esc(k)}</dt><dd>${U.esc(v)}</dd></div>`).join('')}</dl>` : ''}

            <div class="pd__actions anim-up" style="--d:.28s">
              ${buy}
              <button type="button" class="btn btn--line btn--square fav-btn--big ${fav ? 'is-on' : ''}" data-action="toggle-fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? 'Убрать из избранного' : 'Добавить в избранное'}">${U.icon('heart')}</button>
            </div>
            <div class="pd__contact anim-up" style="--d:.32s">
              ${ask ? `<a class="btn btn--line btn--sm" href="${ask}" target="_blank" rel="noopener">${U.icon('whatsapp')}Задать вопрос</a>` : ''}
              <a class="btn btn--line btn--sm" href="${U.tel()}">${U.icon('phone')}${U.esc(C.phone)}</a>
            </div>

            <ul class="pd__notes anim-up" style="--d:.36s">
              <li>${U.icon('chat')}<span><b>Оформление заказа</b>Онлайн-оплата не подключена — отправьте заказ консультанту, и мы свяжемся с вами для подтверждения.</span></li>
              <li>${U.icon('pin')}<span><b>Бутик ERALUNE</b>${U.esc(C.address.mall)}, ${U.esc(C.address.street)}, ${U.esc(C.address.floor)}. ${U.esc(C.hoursShort)}.</span></li>
            </ul>
          </div>
        </div>
      </div>

      ${related.length ? `
      <section class="section related" aria-labelledby="related-title">
        <div class="container">
          <div class="section-head section-head--row" data-reveal>
            <h2 class="h2" id="related-title">Вам может понравиться</h2>
            <a href="#/catalog" class="link-u link-u--arrow">Весь каталог ${U.icon('arrow')}</a>
          </div>
          <div class="grid grid--catalog">${related.map((x, i) => E.components.ProductCard.render(x, i)).join('')}</div>
        </div>
      </section>` : ''}

      <div class="buybar" aria-label="Покупка">
        <div class="buybar__info"><span class="buybar__name">${U.esc(p.name)}</span><b>${U.price(p.price)}</b></div>
        ${p.price != null
          ? `<button type="button" class="btn btn--dark btn--sm" data-action="add-cart" data-id="${p.id}">В корзину</button>`
          : `<a class="btn btn--dark btn--sm" href="${ask || U.tel()}" target="_blank" rel="noopener">Узнать цену</a>`}
      </div>
    </article>`;
  }

  function mount(root, id) {
    const p = U.product(id);
    if (!p) return;
    E.components.Gallery.registerSet('product', p.images.map((key) => ({ image: key, alt: p.name })));
    const track = root.querySelector('#pd-track');
    const thumbs = root.querySelectorAll('.pd__thumb');
    if (track && thumbs.length) {
      thumbs.forEach((t) => t.addEventListener('click', () => {
        const i = Number(t.dataset.thumb);
        track.scrollTo({ left: track.clientWidth * i, behavior: U.reducedMotion() ? 'auto' : 'smooth' });
      }));
      track.addEventListener('scroll', () => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        thumbs.forEach((t, k) => t.classList.toggle('is-active', k === i));
      }, { passive: true });
    }
  }

  E.components.ProductDetails = { render, mount };
})(window.ERALUNE);
