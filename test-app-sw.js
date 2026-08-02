self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ self.clients.claim(); });

self.addEventListener('push', function(event){
  var data = { title: 'Prueba Push', body: 'sin datos' };
  try{ data = event.data.json(); }catch(e){
    if(event.data){ data = { title: 'Prueba Push', body: event.data.text() }; }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Prueba Push', {
      body: data.body || '',
      icon: 'icon-192.png'
    })
  );
});
