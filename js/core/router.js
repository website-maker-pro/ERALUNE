/* ERALUNE — маршрутизация на основе hash (#/catalog?cat=earrings, #/product/id …) */
(function (E) {
  'use strict';

  function parse() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, query = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(query));
    return { name: parts[0] || 'home', arg: parts[1] ? decodeURIComponent(parts[1]) : '', params };
  }

  const R = {
    routes: {},
    current: null,
    start(onChange) {
      const run = () => {
        const route = parse();
        const prev = R.current;
        R.current = route;
        onChange(route, prev);
      };
      window.addEventListener('hashchange', run);
      run();
    },
  };

  E.router = R;
})(window.ERALUNE);
