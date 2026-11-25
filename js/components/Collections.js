/* ERALUNE — Collections: страница коллекций (данные — js/data/products.js → collections) */
(function (E) {
  'use strict';
  const U = E.utils;

  function itemsOf(c) {
    return rawItems(c).sort((a, b) => (b.images.length > 0) - (a.images.length > 0));
  }

  function rawItems(c) {
    if (c.products) return c.products.map(U.product).filter(Boolean);
    if (c.category) return U.inCategory(c.category);
    if (c.featured) return E.products.filter((p) => p.featured);
    return [];
  }

  function render() {
    return `
    <section class="page-hero">
      <div class="container">
        <nav class="crumbs" aria-label="Хлебные крошки"><a href="#/">Главная</a><span>/</span><span aria-current="page">Коллекции</span></nav>
        <h1 class="h1 anim-up">Коллекции</h1>
        <p class="page-hero__sub anim-up" style="--d:.1s">Подборки украшений ERALUNE — для настроения, подарка и особенного повода.</p>
      </div>
    </section>
    ${E.collections.map((c, i) => {
      const items = itemsOf(c);
      return `
      <section class="section ${i % 2 ? 'section--white' : 'section--milk'} coll" id="coll-${c.id}" aria-labelledby="coll-${c.id}-t">
        <div class="container coll__inner ${i % 2 ? 'coll__inner--rev' : ''}">
          <div class="coll__banner" data-reveal>
            ${U.picture(c.image, { alt: c.title, sizes: '(min-width: 1024px) 34vw, 100vw', focus: c.focus })}
          </div>
          <div class="coll__body">
            <p class="eyebrow" data-reveal>Коллекция 0${i + 1}</p>
            <h2 class="h2" id="coll-${c.id}-t" data-reveal>${U.esc(c.title)}</h2>
            <p class="coll__text" data-reveal>${U.esc(c.text)}</p>
            ${items.length
              ? `<div class="grid grid--coll">${items.slice(0, 4).map((p, k) => E.components.ProductCard.render(p, k, { sizes: '(min-width: 1024px) 18vw, 50vw' })).join('')}</div>`
              : '<p class="coll__soon" data-reveal>Украшения этой коллекции скоро появятся в онлайн-каталоге.</p>'}
            ${c.category ? `<a class="link-u link-u--arrow" href="#/catalog?cat=${c.category}" data-reveal>Смотреть в каталоге ${U.icon('arrow')}</a>` : ''}
          </div>
        </div>
      </section>`;
    }).join('')}`;
  }

  E.components.Collections = { render };
})(window.ERALUNE);
