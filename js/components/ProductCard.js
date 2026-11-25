/* ERALUNE — ProductCard: коммерческая карточка товара интернет-магазина */
(function (E) {
  'use strict';
  const U = E.utils;

  function favBtn(p, cls = '') {
    const on = E.store.isFav(p.id);
    return `<button type="button" class="fav-btn ${cls} ${on ? 'is-on' : ''}" data-action="toggle-fav" data-id="${p.id}"
      aria-pressed="${on}" aria-label="${on ? 'Убрать из избранного' : 'Добавить в избранное'}: ${U.esc(p.name)}">${U.icon('heart')}</button>`;
  }

  function actionRow(p) {
    const item = E.store.cartItem(p.id);
    const url = U.productUrl(p);

    if (p.price == null) {
      const href = U.wa(`${E.config.askGreeting} «${p.name}»`) || U.tel();
      return `
        <div class="card__cta" data-card-cta="${p.id}">
          <a class="btn btn--line btn--sm card__buy" href="${href}" target="_blank" rel="noopener">${U.icon('whatsapp')}Узнать цену</a>
          <a class="card__details" href="${url}" aria-label="Подробнее: ${U.esc(p.name)}">Подробнее</a>
        </div>`;
    }

    if (item && item.qty > 0) {
      return `
        <div class="card__cta is-in-cart" data-card-cta="${p.id}">
          <div class="card__stepper" role="group" aria-label="Количество в корзине: ${U.esc(p.name)}">
            <button type="button" class="card__step" data-action="qty" data-id="${p.id}" data-delta="-1" aria-label="Уменьшить количество">${U.icon('minus')}</button>
            <button type="button" class="card__in-bag" data-action="open-cart" aria-label="Открыть корзину">В корзине · <b>${item.qty}</b></button>
            <button type="button" class="card__step" data-action="qty" data-id="${p.id}" data-delta="1" aria-label="Увеличить количество">${U.icon('plus')}</button>
          </div>
          <a class="card__details" href="${url}">Подробнее</a>
        </div>`;
    }

    return `
      <div class="card__cta" data-card-cta="${p.id}">
        <button type="button" class="btn btn--dark btn--sm card__buy" data-action="add-cart" data-id="${p.id}">${U.icon('bag')}В корзину</button>
        <a class="card__details" href="${url}">Подробнее</a>
      </div>`;
  }

  function render(p, i = 0, opts = {}) {
    const url = U.productUrl(p);
    const cat = U.category(p.categories[0]);
    const focus = p.focus || '50% 50%';
    const media = p.images.length
      ? U.picture(p.images[0], {
          alt: p.name,
          sizes: opts.sizes || '(min-width: 1100px) 25vw, (min-width: 640px) 33vw, 50vw',
          cls: 'card__img',
          focus,
          fit: 'contain',
        })
      : U.placeholder();

    return `
    <article class="card ${opts.cls || ''}" data-reveal data-product-card="${p.id}" style="--i:${i % 4}">
      <div class="card__media">
        <button type="button" class="card__img-link" data-action="zoom-product" data-id="${p.id}" aria-label="Открыть фото полностью: ${U.esc(p.name)}">${media}</button>
        ${p.badge ? `<span class="card__badge">${U.esc(p.badge)}</span>` : ''}
        ${favBtn(p, 'card__fav')}
        <button type="button" class="card__zoom-btn" data-action="zoom-product" data-id="${p.id}" aria-label="Посмотреть фото полностью: ${U.esc(p.name)}">${U.icon('expand')}</button>
        <button type="button" class="card__quick" data-action="quick-view" data-id="${p.id}" aria-label="Быстрый просмотр: ${U.esc(p.name)}">Быстрый просмотр</button>
      </div>
      <div class="card__body">
        <div class="card__meta">
          ${cat ? `<span class="card__cat">${U.esc(cat.name)}</span>` : ''}
          ${p.sku ? `<span class="card__sku">Арт. ${U.esc(p.sku)}</span>` : ''}
        </div>
        <h3 class="card__title"><a href="${url}">${U.esc(p.name)}</a></h3>
        <div class="card__price-row">
          <p class="card__price ${p.price == null ? 'is-request' : ''}">
            ${p.oldPrice ? `<s>${U.price(p.oldPrice)}</s>` : ''}${U.price(p.price)}
          </p>
          <span class="card__stock"><i aria-hidden="true"></i>В бутике</span>
        </div>
        ${actionRow(p)}
      </div>
    </article>`;
  }

  /** Живое обновление кнопок «В корзину / В корзине» на всех карточках страницы */
  function syncCartButtons() {
    document.querySelectorAll('[data-card-cta]').forEach((box) => {
      const p = U.product(box.dataset.cardCta);
      if (!p) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = actionRow(p).trim();
      if (tmp.firstElementChild) box.replaceWith(tmp.firstElementChild);
    });
  }

  if (E.store && E.store.subscribe) {
    E.store.subscribe((type) => {
      if (type === 'cart' || type === 'sync') syncCartButtons();
    });
  }

  E.components.ProductCard = { render, favBtn, syncCartButtons };
})(window.ERALUNE);
