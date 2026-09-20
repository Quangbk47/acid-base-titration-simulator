const normalisePath = (pathname) => {
  const path = pathname.replace(/\/+$/, '');
  return path === '/simulate' ? 'simulate' : 'home';
};

export function initNavigation({ links, views, pathname = window.location.pathname } = {}) {
  const route = normalisePath(pathname);

  for (const view of views) {
    view.hidden = view.dataset.view !== route;
  }

  for (const link of links) {
    if (link.dataset.route === route) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }

  return route;
}

