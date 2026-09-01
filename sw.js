const CACHE='controle-financeiro-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./style.css','./app.js','./manifest.json'])));self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c)return c.focus()}if(clients.openWindow)return clients.openWindow('./')}))});