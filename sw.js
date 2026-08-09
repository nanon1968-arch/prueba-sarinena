// Service worker mínimo de Brigada de Sariñena
// Guarda en caché el cascarón de la app para que abra rápido y
// cumple el requisito técnico para que el navegador ofrezca "Instalar app".
// Los datos (tareas, usuarios, fotos) siempre se piden en vivo a Supabase,
// así que hace falta conexión a internet para usar la app con normalidad.

var CACHE_NAME = 'brigada-sarinena-v30';
var ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(nombres){
      return Promise.all(
        nombres.filter(function(n){ return n !== CACHE_NAME; })
               .map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  var esCascaron = ARCHIVOS_CACHE.some(function(a){ return url.indexOf(a.replace('./','')) !== -1; });
  if(esCascaron){
    event.respondWith(
      caches.match(event.request).then(function(resp){ return resp || fetch(event.request); })
    );
  }
});

self.addEventListener('push', function(event){
  var data = { title: 'Brigada de Sariñena', body: '' };
  try{ data = event.data.json(); }catch(e){
    if(event.data){ data.body = event.data.text(); }
  }
  var options = {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: data.url || './' }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Brigada de Sariñena', options)
      .then(function(){
        if('setAppBadge' in self.navigator && typeof data.contador === 'number'){
          return self.navigator.setAppBadge(data.contador).catch(function(){});
        }
      })
      .catch(function(err){ console.error('Error mostrando notificación:', err); })
  );
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var destino = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(lista){
      for(var i=0;i<lista.length;i++){
        if('focus' in lista[i]) return lista[i].focus();
      }
      if(clients.openWindow) return clients.openWindow(destino);
    })
  );
});
