/* ERALUNE — Categories: «Найдите своё украшение» */
(function (E) {
  'use strict';
  const U = E.utils;

  function card(c, i) {
    const count = U.inCategory(c.id).length;
    const media = c.image
      ? U.picture(c.image, { alt: `${c.name} ERALUNE`, sizes: '(min-width: 1024px) 20vw, (min-width: 640px) 34vw, 66vw', focus: c.focus })
      : `<div class="cat__ph">${U.icon('bracelet')}<span>Скоро в каталоге</span></div>`;
    return `
      <li class="cat" data-reveal style="--i:${i}">
        <a href="#/catalog?cat=${c.id}" class="cat__link">
          <div class="cat__media">${media}</div>
          <div class="cat__body">
            <span class="cat__num">0${i + 1}</span>
            <h3 class="cat__name">${U.esc(c.name)}</h3>
            <span class="cat__more">${count ? `${count} ${plural(count)}` : 'Смотреть'} ${U.icon('arrow')}</span>
          </div>
        </a>
      </li>`;
  }

  function plural(n) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'украшение';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'украшения';
    return 'украшений';
  }

  function render() {
    return `
    <section class="section section--white cats" aria-labelledby="cats-title">
      <div class="container">
        <div class="section-head" data-reveal>
          <p class="eyebrow">Категории</p>
          <h2 class="h2" id="cats-title">Найдите своё украшение</h2>
        </div>
      </div>
      <ul class="cats__list container" role="list">
        ${E.categories.map(card).join('')}
      </ul>
    </section>`;
  }

  E.components.Categories = { render, plural };
})(window.ERALUNE);
