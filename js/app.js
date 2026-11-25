/* ERALUNE — приложение: страницы, переходы, делегирование событий */
(function (E) {
  'use strict';
  const U = E.utils;
  const C = () => E.components;
  const main = document.getElementById('main');
  const BASE_TITLE = 'ERALUNE — ювелирный бутик в Томске';

  /* ---------- Страницы ---------- */
  const pages = {
    home: () => ({
      title: 'ERALUNE — ювелирный интернет-магазин и бутик в Томске | Серьги, колье, браслеты',
      desc: 'Интернет-магазин ювелирных украшений ERALUNE в ТРЦ «Изумрудный город», Томск. Серьги, колье, браслеты, кольца и украшения с жемчугом.',
      html: C().Hero.render()
        + C().ProductCatalog.renderServiceStrip()
        + C().Categories.render()
        + C().ProductCatalog.renderFeatured()
        + C().Gallery.renderBanner()
        + C().Why.render()
        + C().Contacts.render(),
      mount: (root) => {
        C().ProductCatalog.bindHomeShop && C().ProductCatalog.bindHomeShop(root);
        C().Contacts.mount(root);
      },
      nav: 'home',
    }),
    catalog: (r) => {
      const params = { cat: r.params.cat || '', q: r.params.q || '', price: r.params.price || '', sort: r.params.sort || '' };
      const cat = U.category(params.cat);
      return {
        title: `${cat ? cat.name : 'Каталог украшений'} — ERALUNE`,
        desc: `${cat ? cat.name : 'Каталог украшений'} в ювелирном бутике ERALUNE, Томск. Выберите украшение онлайн и оформите заказ по телефону или в WhatsApp.`,
        html: C().ProductCatalog.renderCatalog(params),
        mount: (root) => C().ProductCatalog.mountCatalog(root, params),
        nav: 'catalog',
      };
    },
    product: (r) => {
      const html = C().ProductDetails.render(r.arg);
      if (!html) return pages.notfound();
      const p = U.product(r.arg);
      return {
        title: `${p.name} — ERALUNE`,
        desc: `${p.name}${p.price != null ? ` — ${U.price(p.price)}` : ''}. Ювелирный бутик ERALUNE, ТРЦ «Изумрудный город», Томск.`,
        html,
        mount: (root) => C().ProductDetails.mount(root, r.arg),
        nav: 'catalog',
      };
    },
    collections: () => ({
      title: `Коллекции — ${BASE_TITLE}`,
      desc: 'Коллекции украшений ERALUNE: украшения с жемчугом, колье и подвески, серьги.',
      html: C().Collections.render(),
      nav: 'collections',
    }),
    about: () => ({
      title: `О бренде — ${BASE_TITLE}`,
      desc: 'ERALUNE — пространство изысканных украшений, где эстетика, детали и красота создают особенное настроение.',
      html: `<div class="page-top"></div>${C().About.render({ page: true })}${C().Why.render()}${C().Gallery.render({ title: 'Бутик и украшения' })}
        <section class="section section--white cta-band"><div class="container cta-band__inner" data-reveal>
          <h2 class="h2">Приходите за&nbsp;своим украшением</h2>
          <p>${U.esc(E.config.address.mall)}, ${U.esc(E.config.address.street)}. ${U.esc(E.config.hoursShort)}.</p>
          <div class="cta-band__btns"><a class="btn btn--dark" href="#/catalog">Смотреть каталог ${U.icon('arrow')}</a><a class="btn btn--line" href="#/contacts">Контакты</a></div>
        </div></section>`,
      nav: 'about',
    }),
    contacts: () => ({
      title: `Контакты — ${BASE_TITLE}`,
      desc: 'ERALUNE: ТРЦ «Изумрудный город», Комсомольский проспект, 13Б, 1 этаж, Томск. Телефон +7 929 374-79-27. Ежедневно 10:00–22:00.',
      html: `<div class="page-top"></div>${C().Contacts.render({ page: true })}`,
      mount: (root) => C().Contacts.mount(root),
      nav: 'contacts',
    }),
    privacy: () => ({
      title: `Политика конфиденциальности — ERALUNE`,
      desc: 'Политика конфиденциальности сайта ERALUNE.',
      html: `
      <section class="page-hero"><div class="container">
        <nav class="crumbs" aria-label="Хлебные крошки"><a href="#/">Главная</a><span>/</span><span aria-current="page">Политика конфиденциальности</span></nav>
        <h1 class="h1 anim-up">Политика конфиденциальности</h1>
      </div></section>
      <section class="section section--white"><div class="container prose" data-reveal>
        <p>Настоящая политика описывает, как сайт ERALUNE обращается с информацией посетителей.</p>
        <h2 class="h3">Какие данные хранятся</h2>
        <p>Сайт не требует регистрации и не собирает персональные данные через формы. Содержимое корзины и избранного сохраняется только в памяти вашего браузера (localStorage) и не передаётся на сервер.</p>
        <h2 class="h3">Связь с магазином</h2>
        <p>При оформлении заказа через WhatsApp или по телефону вы самостоятельно передаёте магазину данные, необходимые для связи. Они используются исключительно для обработки вашего обращения.</p>
        <h2 class="h3">Сторонние сервисы</h2>
        <p>На странице контактов используется интерактивная карта, на сайте — шрифты Google Fonts. Эти сервисы могут обрабатывать технические данные в соответствии со своими политиками.</p>
        <h2 class="h3">Контакты</h2>
        <p>По вопросам обработки данных: <a href="${U.tel()}">${U.esc(E.config.phone)}</a>, ${U.esc(E.config.address.mall)}, ${U.esc(E.config.address.street)}, ${U.esc(E.config.address.city)}.</p>
        <p class="muted">Текст носит информационный характер и может быть дополнен владельцем магазина.</p>
      </div></section>`,
      nav: '',
    }),
    notfound: () => ({
      title: `Страница не найдена — ERALUNE`,
      desc: 'Страница не найдена.',
      html: `<section class="page-hero page-hero--center"><div class="container">
        <p class="eyebrow">404</p><h1 class="h1">Страница не найдена</h1>
        <p class="page-hero__sub">Возможно, украшение было перемещено или ссылка устарела.</p>
        <div class="cta-band__btns"><a class="btn btn--dark" href="#/catalog">В каталог</a><a class="btn btn--line" href="#/">На главную</a></div>
      </div></section>`,
      nav: '',
    }),
  };

  /* ---------- Мета-теги ---------- */
  function setMeta(title, desc) {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
  }

  /* ---------- Рендер маршрута ---------- */
  let rendered = false;
  function render(route, prev) {
    // Служебные маршруты: открывают панели поверх текущей страницы
    if (route.name === 'cart' || route.name === 'favorites') {
      const back = prev && !['cart', 'favorites'].includes(prev.name) ? location.href.split('#')[0] + prevHash : '#/';
      history.replaceState(null, '', rendered ? back : '#/');
      if (!rendered) { E.router.current = { name: 'home', arg: '', params: {} }; draw(E.router.current, null); }
      (route.name === 'cart' ? C().Cart : C().Favorites).open();
      return;
    }
    E.closeOverlays();
    prevHash = location.hash || '#/';

    const swap = () => draw(route, prev);
    if (rendered && document.startViewTransition && !U.reducedMotion()) {
      document.startViewTransition(swap);
    } else {
      swap();
    }
  }
  let prevHash = '#/';

  function draw(route, prev) {
    const page = (pages[route.name] || pages.notfound)(route);
    main.innerHTML = page.html;
    setMeta(page.title, page.desc);
    C().Header.setActive(page.nav);
    document.body.dataset.page = route.name;
    const sameCatalog = prev && prev.name === 'catalog' && route.name === 'catalog';
    if (!sameCatalog) {
      if (E.motion) E.motion.scrollToTop();
      else window.scrollTo(0, 0);
    }
    page.mount && page.mount(main);
    if (E.motion) E.motion.mountPage(main);
    else U.reveal(main);
    if (rendered && !sameCatalog) main.focus({ preventScroll: true });
    rendered = true;
  }

  /* ---------- Делегирование событий ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = E.actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') C().Header.closeMenu();
  });

  E.closeOverlays = () => {
    C().Header.closeMenu();
    C().Cart.close();
    C().Favorites.close();
    C().Search.close();
    C().Gallery.close();
    C().ProductCatalog.closeQuickView && C().ProductCatalog.closeQuickView();
  };

  /* ---------- Запуск ---------- */
  C().Header.mount(document.getElementById('header-root'));
  C().Footer.mount(document.getElementById('footer-root'));
  C().Cart.mount();
  C().Favorites.mount();
  C().Search.mount();
  C().Gallery.mountLightbox();
  E.router.start(render);
  requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
})(window.ERALUNE);
