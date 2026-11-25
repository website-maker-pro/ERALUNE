/* ERALUNE — About: «ERALUNE — больше, чем украшения» */
(function (E) {
  'use strict';
  const U = E.utils;

  function render(opts = {}) {
    const C = E.config;
    const H = opts.page ? 'h1' : 'h2';
    return `
    <section class="section section--champagne about ${opts.page ? 'about--page' : ''}" aria-labelledby="about-title">
      <div class="about__inner container">
        <div class="about__media" data-reveal>
          <div class="about__arch" data-parallax="0.05">
            ${U.picture('boutique-interior', { alt: 'Интерьер бутика ERALUNE: подсвеченная арка с логотипом, витрины и живые цветы', sizes: '(min-width: 1024px) 40vw, 86vw', focus: '60% 40%' })}
          </div>
          <span class="about__ring" aria-hidden="true"></span>
          <p class="about__caption">Бутик ERALUNE · Томск</p>
        </div>

        <div class="about__content">
          <p class="eyebrow" data-reveal>О бренде</p>
          <${H} class="h2 about__title" id="about-title" data-reveal>ERALUNE —<br><em>больше, чем украшения</em></${H}>
          <span class="gold-line" data-reveal></span>
          <blockquote class="about__quote" data-reveal>
            Каждое украшение — это маленькая история, отражение индивидуальности и&nbsp;способ выразить себя без слов.
          </blockquote>
          <p class="about__text" data-reveal>
            ERALUNE — пространство изысканных украшений, где эстетика, детали и&nbsp;красота создают особенное настроение.
          </p>
          <dl class="about__facts" data-reveal>
            <div><dt>${E.categories.length}</dt><dd>направлений в коллекции бутика</dd></div>
            <div><dt>10–22</dt><dd>ежедневно ждём вас в бутике</dd></div>
            <div><dt>1 этаж</dt><dd>${U.esc(C.address.mall)}</dd></div>
          </dl>
          ${opts.page ? '' : `<a href="#/about" class="link-u link-u--arrow" data-reveal>Подробнее о бренде ${U.icon('arrow')}</a>`}
        </div>
      </div>
    </section>`;
  }

  E.components.About = { render };
})(window.ERALUNE);
