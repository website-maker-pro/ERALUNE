/* ERALUNE — Why: «Почему ERALUNE» */
(function (E) {
  'use strict';
  const U = E.utils;

  const ITEMS = [
    { icon: 'design', title: 'Изысканный дизайн', text: 'Украшения с выразительной и деликатной эстетикой — для повседневных и вечерних образов.' },
    { icon: 'detail', title: 'Внимание к деталям', text: 'Мы ценим точность линий, гармонию форм и аккуратность каждой детали.' },
    { icon: 'moment', title: 'Украшения для особенных моментов', text: 'Подарок близкому человеку или знак внимания к себе — для памятных событий.' },
    { icon: 'person', title: 'Персональный подход', text: 'Консультанты бутика помогут подобрать украшение под ваш стиль и повод.' },
  ];

  function render() {
    return `
    <section class="section section--white why" aria-labelledby="why-title">
      <div class="container">
        <div class="section-head section-head--center" data-reveal>
          <p class="eyebrow">Почему ERALUNE</p>
          <h2 class="h2" id="why-title">Красота, продуманная до&nbsp;мелочей</h2>
        </div>
        <ul class="why__grid" role="list">
          ${ITEMS.map((it, i) => `
            <li class="why__item" data-reveal style="--i:${i}">
              <span class="why__num">0${i + 1}</span>
              <span class="why__icon">${U.icon(it.icon)}</span>
              <h3 class="why__title">${it.title}</h3>
              <p class="why__text">${it.text}</p>
            </li>`).join('')}
        </ul>
      </div>
    </section>`;
  }

  E.components.Why = { render };
})(window.ERALUNE);
