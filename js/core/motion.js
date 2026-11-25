/* =====================================================================
   ERALUNE — Единый контроллер анимаций: GSAP + ScrollTrigger + Lenis
   Правила fixing-motion-performance:
   - только compositor-свойства (transform, opacity)
   - ноль чтения layout внутри scroll-событий
   - единый gsap.context() на страницу с полным revert() при переходе
   - полная поддержка prefers-reduced-motion: reduce
   ===================================================================== */
(function (E) {
  'use strict';

  const hasGSAP = () => typeof window.gsap !== 'undefined';
  const hasST = () => typeof window.ScrollTrigger !== 'undefined';
  const hasLenis = () => typeof window.Lenis !== 'undefined';
  const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let lenis = null;
  let lenisTicker = null;
  let pageCtx = null;
  let headerTrigger = null;

  if (hasGSAP() && hasST()) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------- Lenis (только десктоп с мышью и без reduced-motion) ---------- */
  function initLenis() {
    if (lenis || !hasLenis() || prefersReduced() || !isFinePointer()) return;
    lenis = new window.Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
    });

    if (hasGSAP() && hasST()) {
      lenis.on('scroll', window.ScrollTrigger.update);
      lenisTicker = (time) => lenis && lenis.raf(time * 1000);
      window.gsap.ticker.add(lenisTicker);
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => {
        if (!lenis) return;
        lenis.raf(t);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  function destroyLenis() {
    if (!lenis) return;
    if (hasGSAP() && lenisTicker) {
      window.gsap.ticker.remove(lenisTicker);
      lenisTicker = null;
    }
    lenis.destroy();
    lenis = null;
  }

  // Реагируем на смену prefers-reduced-motion в реальном времени
  const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMQ.addEventListener) {
    reducedMQ.addEventListener('change', (e) => {
      if (e.matches) destroyLenis();
      else initLenis();
    });
  }

  /* ---------- Управление скроллом для оверлеев и маршрутов ---------- */
  function stop() {
    if (lenis) lenis.stop();
  }

  function start() {
    if (lenis) lenis.start();
  }

  function scrollToTop() {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }

  /* ---------- Состояние шапки при прокрутке (через ScrollTrigger) ---------- */
  function bindHeader(headerEl) {
    if (!headerEl) return;
    if (headerTrigger) { headerTrigger.kill(); headerTrigger = null; }

    if (hasGSAP() && hasST()) {
      headerTrigger = window.ScrollTrigger.create({
        start: 16,
        end: 'max',
        onEnter: () => headerEl.classList.add('is-scrolled'),
        onLeaveBack: () => headerEl.classList.remove('is-scrolled'),
      });
      headerEl.classList.toggle('is-scrolled', window.scrollY > 16);
    } else {
      let ticking = false;
      const sync = () => {
        headerEl.classList.toggle('is-scrolled', window.scrollY > 16);
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(sync); }
      }, { passive: true });
      sync();
    }
  }

  /* ---------- Фоллбэк: мгновенный показ без GSAP или при reduced-motion ---------- */
  function showAllImmediate(root) {
    root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
    root.querySelectorAll('[data-hero-curtain]').forEach((el) => { el.style.display = 'none'; });
  }

  /* ---------- Кинематографичное раскрытие Hero ---------- */
  function animateHero(root) {
    const hero = root.querySelector('[data-hero]');
    if (!hero) return;

    const gsap = window.gsap;
    const curtain = hero.querySelector('[data-hero-curtain]');
    const photo = hero.querySelector('[data-hero-photo], .hero__img');
    const parallaxWrap = hero.querySelector('[data-hero-parallax]');
    const lines = hero.querySelectorAll('[data-hero-line]');
    const rule = hero.querySelector('[data-hero-rule]');
    const fades = hero.querySelectorAll('[data-hero-fade]');
    const caption = hero.querySelector('[data-hero-caption]');

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay: 0.06,
    });

    if (curtain) {
      tl.fromTo(
        curtain,
        { scaleY: 1 },
        {
          scaleY: 0,
          transformOrigin: 'top center',
          duration: 1.1,
          ease: 'power4.inOut',
          clearProps: 'transform',
          onComplete: () => { curtain.style.visibility = 'hidden'; },
        },
        0
      );
    }

    if (photo) {
      tl.fromTo(
        photo,
        { scale: 1.09 },
        {
          scale: 1,
          duration: 1.55,
          ease: 'power3.out',
          clearProps: 'transform',
        },
        0.08
      );
    }

    if (lines.length) {
      tl.fromTo(
        lines,
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.11,
          clearProps: 'transform,opacity',
        },
        0.18
      );
    }

    if (rule) {
      tl.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 0.85,
          ease: 'power3.inOut',
          clearProps: 'transform',
        },
        0.38
      );
    }

    if (fades.length) {
      tl.fromTo(
        fades,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          clearProps: 'transform,opacity',
        },
        0.42
      );
    }

    if (caption) {
      tl.fromTo(
        caption,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, clearProps: 'transform,opacity' },
        0.65
      );
    }

    // Деликатный GPU-параллакс главного кадра при прокрутке (только десктоп)
    if (parallaxWrap && hasST() && isFinePointer() && window.matchMedia('(min-width: 1024px)').matches) {
      gsap.fromTo(
        parallaxWrap,
        { yPercent: -3.5 },
        {
          yPercent: 5.5,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }
  }

  /* ---------- Появление секций и карточек при прокрутке ---------- */
  function animateReveals(root) {
    const items = [...root.querySelectorAll('[data-reveal]:not(.is-visible)')];
    if (!items.length) return;

    if (!hasGSAP() || !hasST() || prefersReduced()) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const gsap = window.gsap;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const rise = isMobile ? 16 : 26;

    const lines = items.filter((el) => el.classList.contains('gold-line') || el.dataset.reveal === 'line');
    const blocks = items.filter((el) => !lines.includes(el));

    if (blocks.length) {
      gsap.set(blocks, { opacity: 0, y: rise });
      window.ScrollTrigger.batch(blocks, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.65 : 0.85,
            stagger: isMobile ? 0.04 : 0.07,
            ease: 'power3.out',
            overwrite: true,
            clearProps: 'transform,opacity',
            onComplete: () => batch.forEach((el) => el.classList.add('is-visible')),
          });
        },
      });
    }

    if (lines.length) {
      gsap.set(lines, { scaleX: 0, opacity: 1, transformOrigin: 'left center' });
      lines.forEach((line) => {
        gsap.to(line, {
          scaleX: 1,
          duration: 0.8,
          ease: 'power3.inOut',
          clearProps: 'transform',
          onComplete: () => line.classList.add('is-visible'),
          scrollTrigger: { trigger: line, start: 'top 90%', once: true },
        });
      });
    }
  }

  /* ---------- Жизненный цикл страницы ---------- */
  function mountPage(root) {
    if (pageCtx) {
      pageCtx.revert();
      pageCtx = null;
    }

    initLenis();

    if (!hasGSAP() || prefersReduced()) {
      showAllImmediate(root);
      return;
    }

    pageCtx = window.gsap.context(() => {
      animateHero(root);
      animateReveals(root);
    }, root);

    if (hasST()) {
      requestAnimationFrame(() => window.ScrollTrigger.refresh());
    }
  }

  /** Для динамических обновлений внутри страницы (например, фильтрация каталога) */
  function reveal(root = document) {
    if (!hasGSAP() || !hasST() || prefersReduced()) {
      root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      return;
    }
    if (pageCtx) {
      pageCtx.add(() => animateReveals(root));
    } else {
      animateReveals(root);
    }
    window.ScrollTrigger.refresh();
  }

  E.motion = {
    initLenis,
    bindHeader,
    mountPage,
    reveal,
    stop,
    start,
    scrollToTop,
  };
})(window.ERALUNE);
