const CACHE='infinity-flow-v1';
const ATIVOS=['./','./index.html','./estilos.css','./jogo.js','./icone.svg','./manifest.webmanifest'];
self.addEventListener('install',evento=>{evento.waitUntil(caches.open(CACHE).then(c=>c.addAll(ATIVOS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',evento=>{evento.waitUntil(caches.keys().then(chaves=>Promise.all(chaves.filter(c=>c!==CACHE).map(c=>caches.delete(c)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',evento=>{if(evento.request.method!=='GET')return;const u=new URL(evento.request.url);if(u.origin!==self.location.origin)return;evento.respondWith(caches.match(evento.request).then(cache=>cache||fetch(evento.request).then(res=>{if(res.ok){const copia=res.clone();caches.open(CACHE).then(c=>c.put(evento.request,copia));}return res;})));});
