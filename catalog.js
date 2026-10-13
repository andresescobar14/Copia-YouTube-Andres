/* The catalog is independent of the DOM so filters can be tested with Node.js. */
(function (root) {
  'use strict';
  const categories = ['Todos', 'Música', 'Programación', 'Videojuegos', 'En directo', 'Viajes', 'Deportes', 'Ciencia', 'Diseño', 'Podcasts'];
  const videos = [
    { id: 'javascript', title: 'JavaScript desde cero: construye algo increíble', channel: 'Código con Andrés', initials: 'CA', color: '#7353ba', category: 'Programación', tags: ['javascript', 'web', 'css'], image: 'images/thumbnails/javascript.svg', duration: '24:18', views: '128 mil vistas', age: 'hace 2 días', verified: true, description: 'Un recorrido por las bases de JavaScript y las ideas que necesitas para dar vida a tu primera aplicación web.' },
    { id: 'lofi', title: 'Lofi para programar · encuentra tu flow', channel: 'Lofi Studio', initials: 'LS', color: '#786451', category: 'Música', tags: ['lofi', 'mix', 'estudiar'], image: 'images/thumbnails/lofi.svg', duration: 'EN VIVO', views: '12 mil escuchando', age: '', live: true, verified: true, description: 'Una selección de sonidos tranquilos para acompañar tus sesiones de estudio, trabajo o programación.' },
    { id: 'mountains', title: '7 días entre montañas: un viaje que lo cambia todo', channel: 'Fuera de Ruta', initials: 'FR', color: '#377b7c', category: 'Viajes', tags: ['naturaleza', 'montañas', 'aventura'], image: 'images/thumbnails/mountains.svg', duration: '18:42', views: '342 mil vistas', age: 'hace 1 semana', description: 'Senderos, cielos abiertos y pequeños momentos. Una invitación a descubrir el mundo con otros ojos.' },
    { id: 'gaming', title: 'Un mundo nuevo por explorar | Minecraft survival', channel: 'Pixel Play', initials: 'PP', color: '#528444', category: 'Videojuegos', tags: ['minecraft', 'gaming', 'survival'], image: 'images/thumbnails/gaming.svg', duration: '32:06', views: '89 mil vistas', age: 'hace 3 días', verified: true, description: 'Ideas para crear tu próxima aventura, desde tu primera casa hasta un mundo lleno de posibilidades.' },
    { id: 'setup', title: 'Mi espacio creativo: un setup simple y funcional', channel: 'Estudio Norte', initials: 'EN', color: '#777068', category: 'Diseño', tags: ['setup', 'escritorio', 'tecnología'], image: 'images/thumbnails/setup.svg', duration: '12:35', views: '56 mil vistas', age: 'hace 4 días', description: 'Un espacio pensado para trabajar con calma. Diseño, luz y detalles que hacen la diferencia.' },
    { id: 'football', title: 'El fútbol que nos une · momentos para recordar', channel: 'FIFA', initials: 'F', color: '#3264a1', category: 'Deportes', tags: ['fifa', 'fútbol', 'mundial'], image: 'images/images.png', duration: '08:54', views: '1,2 M de vistas', age: 'hace 1 semana', verified: true, description: 'Tarjeta de ejemplo con la miniatura original del proyecto. Vive la pasión y descubre contenido de fútbol en YouTube.' },
    { id: 'space', title: 'El universo es más extraño de lo que imaginas', channel: 'Órbita', initials: 'Ó', color: '#5754a1', category: 'Ciencia', tags: ['espacio', 'universo', 'astronomía'], image: 'images/thumbnails/space.svg', duration: '16:20', views: '215 mil vistas', age: 'hace 5 días', description: 'Una mirada a las preguntas que nos hacemos cuando observamos el cielo: planetas, estrellas y nuevos horizontes.' },
    { id: 'podcast', title: 'Crear sin miedo: una conversación sobre empezar', channel: 'Entre Ideas', initials: 'EI', color: '#aa643f', category: 'Podcasts', tags: ['creatividad', 'conversación'], image: 'images/thumbnails/podcast.svg', duration: '48:12', views: '24 mil vistas', age: 'hace 2 días', description: 'Una conversación sobre la curiosidad, el proceso creativo y la importancia de dar el primer paso.' },
    { id: 'python', title: 'Tu primer proyecto en Python, paso a paso', channel: 'Código con Andrés', initials: 'CA', color: '#7353ba', category: 'Programación', tags: ['python', 'tutorial', 'código'], image: 'images/thumbnails/python.svg', duration: '21:45', views: '73 mil vistas', age: 'hace 1 semana', verified: true, description: 'De una idea sencilla a un pequeño proyecto. Aprende a pensar en pasos y a resolver problemas con Python.' },
    { id: 'beach', title: 'El Caribe en 60 segundos', channel: 'Fuera de Ruta', initials: 'FR', color: '#377b7c', category: 'Viajes', tags: ['caribe', 'playa', 'shorts'], image: 'images/thumbnails/beach.svg', duration: '0:58', views: '410 mil vistas', age: 'hace 6 días', short: true, description: 'Una pausa entre aguas turquesas, palmeras y luz de verano. Descubre destinos para tu próxima aventura.' },
    { id: 'design', title: 'Tres detalles CSS que mejoran cualquier interfaz', channel: 'Estudio Norte', initials: 'EN', color: '#777068', category: 'Diseño', tags: ['css', 'web', 'shorts', 'responsive'], image: 'images/thumbnails/design.svg', duration: '0:46', views: '92 mil vistas', age: 'hace 3 días', short: true, description: 'Espaciado, contraste y jerarquía: tres ideas pequeñas con un gran efecto en tus interfaces.' },
    { id: 'music', title: 'Una melodía para terminar el día', channel: 'Lofi Studio', initials: 'LS', color: '#786451', category: 'Música', tags: ['piano', 'relax', 'shorts'], image: 'images/thumbnails/music.svg', duration: '0:52', views: '38 mil vistas', age: 'hace 1 día', short: true, description: 'Una melodía tranquila y un momento para desconectar. Música para acompañar el final del día.' },
  ];

  const normalize = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const stringList = (value) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string'))].slice(0, 500) : [];
  const defaultState = () => ({ theme: 'dark', saved: [], liked: [], history: [], subscriptions: ['Código con Andrés', 'Lofi Studio', 'Fuera de Ruta'], custom: [] });

  function customVideo(input, id) {
    const title = String(input.title || '').trim().slice(0, 100);
    const channel = String(input.channel || '').trim().slice(0, 40);
    if (!title || !channel || !categories.slice(1).filter((category) => category !== 'En directo').includes(input.category)) return null;
    const sample = videos.find((video) => video.category === input.category) || videos[0];
    return { id, title, channel, category: input.category, initials: channel.split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join('').toUpperCase(), color: '#7353ba', tags: [], image: sample.image, duration: 'DEMO', views: 'Tu creación', age: 'guardada localmente', description: 'Una idea de video creada en este navegador. Esta tarjeta no sube ni reproduce archivos de video.' };
  }

  function readState(raw) {
    const defaults = defaultState();
    try {
      const input = JSON.parse(raw);
      if (!input || typeof input !== 'object') return defaults;
      return { theme: input.theme === 'light' ? 'light' : 'dark', saved: stringList(input.saved), liked: stringList(input.liked), history: stringList(input.history), subscriptions: Array.isArray(input.subscriptions) ? stringList(input.subscriptions) : defaults.subscriptions, custom: Array.isArray(input.custom) ? input.custom.slice(0, 100).map((video) => video && typeof video.id === 'string' && /^custom-[\w-]+$/.test(video.id) ? customVideo(video, video.id) : null).filter(Boolean).filter((video, index, all) => all.findIndex((item) => item.id === video.id) === index) : [] };
    } catch { return defaults; }
  }

  function filterVideos(catalog, { query = '', category = 'Todos', view = 'home', channel = '' } = {}, state = defaultState()) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    let result = catalog.filter((video) => {
      const text = normalize([video.title, video.channel, video.category, ...video.tags].join(' '));
      return terms.every((term) => text.includes(term))
        && (category === 'Todos' || (category === 'En directo' ? video.live : video.category === category))
        && (!channel || video.channel === channel)
        && (view !== 'shorts' || video.short)
        && (view !== 'saved' || state.saved.includes(video.id))
        && (view !== 'liked' || state.liked.includes(video.id))
        && (view !== 'history' || state.history.includes(video.id))
        && (view !== 'subscriptions' || state.subscriptions.includes(video.channel));
    });
    if (view === 'history') result = result.sort((a, b) => state.history.indexOf(a.id) - state.history.indexOf(b.id));
    return result;
  }

  const catalog = { categories, videos, normalize, defaultState, readState, filterVideos, customVideo };
  root.YouTubeCatalog = catalog;
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
})(globalThis);
