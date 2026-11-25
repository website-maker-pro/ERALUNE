/* ERALUNE — Hero: полноэкранный первый слайд в точности по референсу */
(function (E) {
  'use strict';
  const U = E.utils;

  const SLIDES = [
    {
      image: 'hero-lariat',
      alt: 'Серебряное колье-галстук ERALUNE с голубой каплевидной вставкой',
      focus: '68% 42%',
    },
    {
      image: 'lotus-pearl-necklace',
      alt: 'Галстук «Лотос и жемчуг» ERALUNE',
      focus: '55% 38%',
    },
    {
      image: 'circle-pendant',
      alt: 'Колье с круглой подвеской ERALUNE',
      focus: '55% 42%',
    },
  ];

  function render() {
    return `
    <section class="hero" data-hero aria-labelledby="hero-title">
      <div class="hero__bg">
        <div class="hero__parallax" data-hero-parallax>
          ${SLIDES.map((s, i) => `
            <div class="hero__slide ${i === 0 ? 'is-active' : ''}" data-hero-slide="${i}" aria-hidden="${i !== 0}">
              ${U.picture(s.image, {
                alt: s.alt,
                sizes: '100vw',
                eager: i === 0,
                focus: s.focus,
                cls: 'hero__img',
              })}
            </div>`).join('')}
        </div>
        <div class="hero__shade" aria-hidden="true"></div>
        <span class="hero__curtain" data-hero-curtain aria-hidden="true"></span>
      </div>

      <div class="hero__inner container">
        <div class="hero__content">
          <p class="hero__kicker" data-hero-fade>
            <span>ERALUNE&nbsp;/&nbsp;JEWELRY</span>
            <span class="hero__kicker-line" data-hero-rule aria-hidden="true"></span>
          </p>

          <h1 class="hero__title" id="hero-title">
            <span class="hero__mask"><span class="hero__line" data-hero-line>Искусство быть</span></span>
            <span class="hero__mask"><span class="hero__line" data-hero-line>особенной</span></span>
          </h1>

          <p class="hero__lead" data-hero-fade>
            Украшения, в&nbsp;которых живут ваши чувства,<br>воспоминания и&nbsp;индивидуальность.
          </p>

          <div class="hero__cta" data-hero-fade>
            <a href="#/catalog" class="hero__btn hero__btn--gold">Открыть коллекцию ${U.icon('arrow')}</a>
            <a href="#/about" class="hero__btn hero__btn--ghost">О&nbsp;бренде</a>
          </div>
        </div>

        <div class="hero__bottom" data-hero-caption>
          <div class="hero__pager" role="tablist" aria-label="Слайды главного экрана">
            <span class="hero__count hero__nums"><span data-hero-idx>01</span>&nbsp;&mdash;&nbsp;03</span>
            <div class="hero__bars">
              ${SLIDES.map((_, i) => `
                <button type="button" class="hero__bar ${i === 0 ? 'is-active' : ''}"
                        role="tab" aria-selected="${i === 0}"
                        data-action="hero-slide" data-slide="${i}"
                        aria-label="Слайд ${i + 1} из ${SLIDES.length}">
                  <span></span>
                </button>`).join('')}
            </div>
          </div>

          <div class="hero__discover">
            <span class="hero__discover-line" aria-hidden="true"></span>
            <span>DISCOVER YOUR ELEGANCE</span>
          </div>
        </div>
      </div>
    </section>`;
  }

  E.actions = E.actions || {};
  E.actions['hero-slide'] = (btn) => {
    const hero = btn.closest('[data-hero]');
    if (!hero) return;
    const target = Number(btn.dataset.slide) || 0;
    const slides = hero.querySelectorAll('[data-hero-slide]');
    const bars = hero.querySelectorAll('[data-action="hero-slide"]');
    const idxEl = hero.querySelector('[data-hero-idx]');

    slides.forEach((s, i) => {
      const active = i === target;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', String(!active));
    });
    bars.forEach((b, i) => {
      const active = i === target;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });
    if (idxEl) idxEl.textContent = `0${target + 1}`;
  };

  E.components.Hero = { render };
})(window.ERALUNE);
