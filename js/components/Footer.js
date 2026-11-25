/* ERALUNE — Footer */
(function (E) {
  'use strict';
  const U = E.utils;

  function render() {
    const C = E.config;
    const socials = [
      C.whatsapp && `<a href="${U.wa()}" target="_blank" rel="noopener" aria-label="WhatsApp">${U.icon('whatsapp')}</a>`,
      C.vk && `<a href="${U.esc(C.vk)}" target="_blank" rel="noopener" aria-label="ВКонтакте">${U.icon('vk')}</a>`,
      `<a href="${U.tel()}" aria-label="Позвонить">${U.icon('phone')}</a>`,
    ].filter(Boolean).join('');
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer__top">
          <div class="footer__brand">
            <a href="#/" aria-label="ERALUNE — на главную">${U.logo('logo--light')}</a>
            <p>Искусство быть особенной.</p>
          </div>
          <nav class="footer__nav" aria-label="Навигация в подвале">
            <a href="#/">Главная</a>
            <a href="#/catalog">Каталог</a>
            <a href="#/collections">Коллекции</a>
            <a href="#/about">О бренде</a>
            <a href="#/contacts">Контакты</a>
            <a href="#/privacy">Политика конфиденциальности</a>
          </nav>
          <div class="footer__contacts">
            <a class="footer__phone" href="${U.tel()}">${U.esc(C.phone)}</a>
            <p>${U.esc(C.address.mall)}<br>${U.esc(C.address.street)}, ${U.esc(C.address.floor)}, ${U.esc(C.address.city)}</p>
            <p>${U.esc(C.hoursShort)}</p>
            <div class="footer__social">${socials}</div>
          </div>
        </div>
        <div class="footer__bottom">
          <p>ERALUNE © 2026. Все права защищены.</p>
          <a href="#/privacy">Политика конфиденциальности</a>
        </div>
      </div>
    </footer>`;
  }

  E.components.Footer = { mount: (root) => { root.innerHTML = render(); } };
})(window.ERALUNE);
