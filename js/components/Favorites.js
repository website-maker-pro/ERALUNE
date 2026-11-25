/* ERALUNE — Favorites: избранное (выдвижная панель) */
(function (E) {
  'use strict';
  const U = E.utils;
  let drawer;

  function update() {
    if (!drawer) return;
    const favs = E.store.get().favorites.map(U.product).filter(Boolean);
    drawer.count.textContent = favs.length ? `(${favs.length})` : '';
    drawer.foot.hidden = true;
    if (!favs.length) {
      drawer.body.innerHTML = `
        <div class="drawer__empty">
          <span class="empty__icon">${U.icon('heart')}</span>
          <h3 class="h3">В избранном пока пусто</h3>
          <p>Нажмите на сердечко на карточке украшения, чтобы сохранить его здесь.</p>
          <a href="#/catalog" class="btn btn--dark btn--sm" data-close>Перейти в каталог</a>
        </div>`;
      return;
    }
    drawer.body.innerHTML = `<ul class="lines">${favs.map((p) => `
      <li class="line">
        <a href="${U.productUrl(p)}" class="line__img" data-close>${p.images.length ? U.picture(p.images[0], { alt: p.name, sizes: '88px' }) : U.placeholder('')}</a>
        <div class="line__info">
          <a href="${U.productUrl(p)}" class="line__name" data-close>${U.esc(p.name)}</a>
          <p class="line__price">${U.price(p.price)}</p>
          <div class="line__row">
            ${p.price != null
              ? `<button type="button" class="btn btn--dark btn--xs" data-action="add-cart" data-id="${p.id}">${U.icon('bag')}В корзину</button>`
              : `<a class="btn btn--line btn--xs" href="${U.wa(`${E.config.askGreeting} «${p.name}»`) || U.tel()}" target="_blank" rel="noopener">Узнать цену</a>`}
            <button type="button" class="line__remove" data-action="toggle-fav" data-id="${p.id}" aria-label="Убрать из избранного ${U.esc(p.name)}">${U.icon('trash')}</button>
          </div>
        </div>
      </li>`).join('')}</ul>`;
  }

  /** Синхронизирует все кнопки-сердечки на странице */
  function syncButtons() {
    document.querySelectorAll('[data-action="toggle-fav"][data-id]').forEach((b) => {
      if (b.classList.contains('line__remove')) return;
      const on = E.store.isFav(b.dataset.id);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function mount() {
    drawer = E.Drawer('fav-drawer', 'Избранное', 'heart');
    E.store.subscribe(() => { update(); syncButtons(); });
    update();
  }

  E.actions['open-favorites'] = () => drawer.open();
  E.actions['toggle-fav'] = (el) => {
    const p = U.product(el.dataset.id);
    if (!p) return;
    const on = E.store.toggleFav(p.id);
    if (on && !el.classList.contains('line__remove')) { el.classList.remove('is-burst'); void el.offsetWidth; el.classList.add('is-burst'); }
    U.toast(on ? 'Добавлено в избранное' : 'Удалено из избранного', 'heart');
  };

  E.components.Favorites = { mount, open: () => drawer.open(), close: () => drawer && drawer.close(), isOpen: () => drawer && drawer.isOpen(), syncButtons };
})(window.ERALUNE);
