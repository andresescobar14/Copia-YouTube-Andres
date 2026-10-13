/* No framework or network request is required to explore the demo. */
(() => {
  'use strict';
  const { categories, videos, readState, filterVideos, customVideo } = YouTubeCatalog;
  const storageKey = 'youtube-andres:v1';
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  let state;
  try { state = readState(localStorage.getItem(storageKey)); } catch { state = readState(null); }
  let filters = { query: '', category: 'Todos', view: 'home', channel: '' };
  let activeVideo = null;
  let toastTimer;
  let searchTimer;
  const mobile = matchMedia('(max-width: 760px)');
  const catalog = () => [...state.custom, ...videos];
  const navigation = [
    { view: 'home', label: 'Inicio', icon: 'home' },
    { view: 'shorts', label: 'Shorts', icon: 'shorts' },
    { view: 'subscriptions', label: 'Suscripciones', icon: 'subscriptions' },
    { view: 'saved', label: 'Ver más tarde', icon: 'saved' },
    { view: 'history', label: 'Historial', icon: 'history' },
    { view: 'liked', label: 'Videos que me gustan', icon: 'like' },
  ];

  function notify(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3200);
  }

  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { notify('El almacenamiento no está disponible. Los cambios durarán esta sesión.'); return false; }
    return true;
  }

  function renderNavigation() {
    const button = (item, label = item.label) => `<button class="nav-item" data-view="${item.view}"${filters.view === item.view && !filters.channel ? ' aria-current="page"' : ''}>${icon(item.icon)}<span>${escapeHTML(label)}</span></button>`;
    const subscriptions = state.subscriptions.map((channel) => {
      const video = catalog().find((item) => item.channel === channel);
      if (!video) return '';
      return `<button class="nav-item" data-channel="${escapeHTML(channel)}"${filters.channel === channel ? ' aria-current="page"' : ''}><span class="nav-avatar" style="background:${video.color}">${escapeHTML(video.initials)}</span><span>${escapeHTML(channel)}</span><span class="subscription-dot" aria-hidden="true"></span></button>`;
    }).join('');
    const html = `<div class="nav-group">${navigation.slice(0, 3).map((item) => button(item)).join('')}${button(navigation[3], 'Tú')}</div><div class="nav-group"><h2>Tu biblioteca</h2>${navigation.slice(3).map((item) => button(item)).join('')}</div><div class="nav-group"><h2>Suscripciones</h2>${subscriptions || '<p class="drawer-note">Sigue un canal desde su vista previa.</p>'}</div><div class="nav-group"><h2>Explorar</h2>${[['Música', 'music'], ['Videojuegos', 'game'], ['Programación', 'code'], ['Viajes', 'compass']].map(([category, name]) => `<button class="nav-item" data-explore="${category}">${icon(name)}<span>${category}</span></button>`).join('')}</div>`;
    document.querySelectorAll('.navigation').forEach((element) => { element.innerHTML = html; });
    document.querySelector('.mobile-navigation').innerHTML = navigation.slice(0, 4).map((item) => button(item, item.view === 'saved' ? 'Tú' : item.label)).join('');
  }

  function renderCategories() {
    $('categories').innerHTML = categories.map((category) => `<button class="category" data-category="${category}" aria-pressed="${filters.category === category}">${category}</button>`).join('');
  }

  function card(video) {
    const saved = state.saved.includes(video.id);
    return `<article class="video-card"><button class="thumbnail-button" data-video="${video.id}" aria-label="Ver vista previa: ${escapeHTML(video.title)}"><img src="${video.image}" alt="" width="1280" height="720" loading="lazy" decoding="async"><span class="thumbnail-play">${icon('play')}</span>${video.live ? '<span class="live-badge">EN DIRECTO · DEMO</span>' : `<span class="duration">${video.duration}</span>`}</button><div class="video-info"><span class="channel-avatar" style="background:${video.color}" aria-hidden="true">${escapeHTML(video.initials)}</span><div><h2 class="video-title"><button data-video="${video.id}">${escapeHTML(video.title)}</button></h2><p class="channel-name">${escapeHTML(video.channel)}${video.verified ? '<span class="verified" aria-label="Canal destacado de demostración">✓</span>' : ''}</p><p class="video-meta">${escapeHTML(video.views)}${video.age ? ` · ${escapeHTML(video.age)}` : ''}</p></div><button class="icon-button card-save" data-save="${video.id}" aria-label="${saved ? 'Quitar de Ver más tarde' : 'Guardar en Ver más tarde'}: ${escapeHTML(video.title)}" aria-pressed="${saved}" title="${saved ? 'Quitar de Ver más tarde' : 'Ver más tarde'}">${icon('saved')}</button></div></article>`;
  }

  function renderFeed() {
    const result = filterVideos(catalog(), filters, state);
    const titles = { home: 'Para ti', shorts: 'Un minuto de inspiración', subscriptions: 'Tus suscripciones', saved: 'Ver más tarde', history: 'Tu historial', liked: 'Videos que te gustan' };
    $('feed-title').textContent = filters.query ? `Resultados para “${filters.query}”` : filters.channel || (filters.category !== 'Todos' ? filters.category : titles[filters.view]);
    $('feed-eyebrow').textContent = filters.view === 'home' && !filters.query && !filters.channel ? 'TU PRÓXIMO DESCUBRIMIENTO' : 'EXPLORA A TU MANERA';
    const filtered = filters.query || filters.category !== 'Todos' || filters.view !== 'home' || filters.channel;
    $('results-summary').textContent = filtered ? `${result.length} ${result.length === 1 ? 'video' : 'videos'}${filters.category !== 'Todos' ? ` · ${filters.category}` : ''}` : '';
    const focused = document.activeElement;
    const focusId = focused?.dataset.save;
    const previousCards = [...$('video-grid').querySelectorAll('[data-save]')];
    const previousIndex = previousCards.findIndex((element) => element === focused);
    $('video-grid').innerHTML = result.map(card).join('');
    $('empty-state').hidden = result.length > 0;
    $('empty-title').textContent = filters.view === 'saved' ? 'Tu próxima lista empieza aquí' : filters.view === 'history' ? 'Todavía no has explorado videos' : 'No encontramos videos';
    $('empty-description').textContent = filters.view === 'saved' ? 'Guarda una tarjeta con el marcador y vuelve a ella cuando quieras.' : filters.view === 'history' ? 'Abre una vista previa para añadirla a tu historial.' : 'Prueba otra búsqueda o explora todas las categorías.';
    if (focusId) {
      const buttons = [...$('video-grid').querySelectorAll('[data-save]')];
      const target = buttons.find((element) => element.dataset.save === focusId) || buttons[Math.min(previousIndex, buttons.length - 1)] || $('reset-filters');
      target.focus({ preventScroll: true });
    }
  }

  function render() { renderNavigation(); renderCategories(); renderFeed(); }

  function navigate(view, category = 'Todos', channel = '') {
    clearTimeout(searchTimer);
    filters = { query: '', category, view, channel };
    $('search-input').value = '';
    if ($('drawer').open) $('drawer').close();
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('main').focus({ preventScroll: true });
  }

  function renderPreviewActions() {
    for (const [id, list, value, name, off, on] of [
      ['subscribe-button', 'subscriptions', activeVideo.channel, 'check', 'Suscribirme', 'Suscrito'],
      ['save-button', 'saved', activeVideo.id, 'saved', 'Ver más tarde', 'Guardado'],
      ['like-button', 'liked', activeVideo.id, 'like', 'Me gusta', 'Te gusta'],
    ]) {
      const selected = state[list].includes(value);
      $(id).setAttribute('aria-pressed', String(selected));
      $(id).innerHTML = `${icon(name)}${selected ? on : off}`;
    }
  }

  function openPreview(id) {
    activeVideo = catalog().find((video) => video.id === id);
    if (!activeVideo) return;
    state.history = [id, ...state.history.filter((value) => value !== id)].slice(0, 500);
    persist();
    $('video-title').textContent = activeVideo.title;
    $('preview-meta').textContent = `${activeVideo.channel} · ${activeVideo.views}`;
    $('preview-description').textContent = activeVideo.description;
    $('preview-image').src = activeVideo.image;
    $('preview-image').alt = `Miniatura de ${activeVideo.title}`;
    $('watch-link').href = `https://www.youtube.com/results?search_query=${encodeURIComponent(activeVideo.title)}`;
    renderPreviewActions();
    $('video-dialog').showModal();
  }

  function toggle(list, value) {
    const selected = state[list].includes(value);
    state[list] = selected ? state[list].filter((item) => item !== value) : [value, ...state[list]].slice(0, 500);
    const stored = persist();
    renderNavigation();
    renderFeed();
    if ($('video-dialog').open) renderPreviewActions();
    if (stored) notify(list === 'saved' ? (selected ? 'Quitado de Ver más tarde' : 'Guardado en Ver más tarde') : list === 'liked' ? (selected ? 'Me gusta eliminado' : 'Añadido a tus favoritos') : (selected ? 'Suscripción eliminada' : `Siguiendo a ${value}`));
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $('theme-toggle').setAttribute('aria-label', `Activar tema ${state.theme === 'dark' ? 'claro' : 'oscuro'}`);
    $('theme-toggle').innerHTML = icon(state.theme === 'dark' ? 'sun' : 'moon');
    document.querySelector('.brand img').src = state.theme === 'dark' ? 'images/youtube.svg' : 'images/youtube-light.svg';
    document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#0f0f0f' : '#ffffff';
  }

  function syncMenu() {
    $('menu-toggle').setAttribute('aria-controls', mobile.matches ? 'drawer' : 'sidebar');
    const expanded = mobile.matches ? $('drawer').open : !document.body.classList.contains('sidebar-collapsed');
    $('menu-toggle').setAttribute('aria-expanded', String(expanded));
    $('menu-toggle').setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
  }

  function showSearch(show) {
    document.body.classList.toggle('search-open', show);
    $('mobile-search').setAttribute('aria-expanded', String(show));
    $('mobile-search').setAttribute('aria-label', show ? 'Ocultar búsqueda' : 'Mostrar búsqueda');
    if (show) $('search-input').focus();
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.view) navigate(target.dataset.view);
    else if (target.dataset.channel) navigate('home', 'Todos', target.dataset.channel);
    else if (target.dataset.explore) navigate('home', target.dataset.explore);
    else if (target.dataset.category) {
      filters.category = target.dataset.category;
      document.querySelectorAll('[data-category]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === filters.category)));
      renderFeed();
    } else if (target.dataset.video) openPreview(target.dataset.video);
    else if (target.dataset.save) toggle('saved', target.dataset.save);
    else if (target.hasAttribute('data-close')) target.closest('dialog').close();
  });

  $('menu-toggle').addEventListener('click', () => {
    if (mobile.matches) $('drawer').showModal();
    else document.body.classList.toggle('sidebar-collapsed');
    syncMenu();
  });
  $('drawer').addEventListener('close', syncMenu);
  mobile.addEventListener('change', () => { if ($('drawer').open) $('drawer').close(); showSearch(false); syncMenu(); });
  $('mobile-search').addEventListener('click', () => showSearch(!document.body.classList.contains('search-open')));
  const search = () => { filters.query = $('search-input').value.trim(); renderFeed(); };
  $('search-input').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(search, 150); });
  $('search-form').addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(searchTimer); search(); });
  $('theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); persist(); });
  $('profile-button').addEventListener('click', () => navigate('saved'));
  $('reset-filters').addEventListener('click', () => navigate('home'));
  $('save-button').addEventListener('click', () => toggle('saved', activeVideo.id));
  $('like-button').addEventListener('click', () => toggle('liked', activeVideo.id));
  $('subscribe-button').addEventListener('click', () => toggle('subscriptions', activeVideo.channel));
  $('video-dialog').addEventListener('close', () => {
    if (filters.view === 'history') renderFeed();
    const trigger = [...$('video-grid').querySelectorAll('[data-video]')].find((button) => button.dataset.video === activeVideo?.id);
    (trigger || $('main')).focus({ preventScroll: true });
  });
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  }

  const create = () => { if ($('drawer').open) $('drawer').close(); $('create-dialog').showModal(); };
  $('create-button').addEventListener('click', create);
  $('drawer-create').addEventListener('click', create);
  $('new-category').innerHTML = categories.slice(1).filter((category) => category !== 'En directo').map((category) => `<option>${category}</option>`).join('');
  $('create-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.custom.length >= 100) { notify('Has alcanzado el límite de 100 tarjetas en este navegador.'); return; }
    const video = customVideo(Object.fromEntries(new FormData(event.currentTarget)), `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    if (!video) { notify('Escribe un título y un nombre de canal.'); return; }
    state.custom.unshift(video);
    const stored = persist();
    $('create-dialog').close();
    event.currentTarget.reset();
    navigate('home');
    if (stored) notify('Tu tarjeta está lista y guardada en este navegador');
  });

  document.addEventListener('keydown', (event) => {
    const editing = event.target.matches('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !editing && !document.querySelector('dialog[open]')) { event.preventDefault(); if (mobile.matches) showSearch(true); else $('search-input').focus(); }
    if (event.key === 'Escape' && !document.querySelector('dialog[open]') && document.body.classList.contains('search-open')) { showSearch(false); $('mobile-search').focus(); }
  });
  applyTheme();
  syncMenu();
  render();
})();
