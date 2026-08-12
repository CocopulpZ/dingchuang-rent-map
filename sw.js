const CACHE='dingchuang-rent-v2';
const CORE=['./','index.html','styles.css','app.js','data/dingchuang.json','data/communities.json','data/rentals.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('/data/')) {
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});