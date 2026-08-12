const state = { destination:null, communities:[], rentals:[], markers:[], map:null };

async function loadJSON(path){ const r=await fetch(path,{cache:'no-store'}); if(!r.ok) throw new Error(path); return r.json(); }

function amapRoute(item, mode){
  const d=state.destination;
  if(item.lon==null || item.lat==null){
    return `https://uri.amap.com/search?keyword=${encodeURIComponent(item.community||item.name)}&city=杭州&src=dingchuang-rent`;
  }
  const from=`${item.lon},${item.lat},${encodeURIComponent(item.community||item.name)}`;
  const to=`${d.lon},${d.lat},${encodeURIComponent(d.name)}`;
  return `https://uri.amap.com/navigation?from=${from}&to=${to}&mode=${mode}&src=dingchuang-rent&coordinate=gaode&callnative=1`;
}

function tierClass(t){
  if((t||'').startsWith('S')) return 's';
  if((t||'').startsWith('A')) return 'a';
  return 'b';
}
function markerHtml(text, cls){ return `<div class="marker ${cls}">${text}</div>`; }

function setupMap(){
  state.map=L.map('map',{zoomControl:true}).setView([state.destination.lat,state.destination.lon],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19, attribution:'&copy; OpenStreetMap contributors'
  }).addTo(state.map);

  const workIcon=L.divIcon({html:markerHtml('★','work'),className:'',iconSize:[36,36],iconAnchor:[18,18]});
  L.marker([state.destination.lat,state.destination.lon],{icon:workIcon})
    .addTo(state.map).bindTooltip(state.destination.name).on('click',()=>showDestination());

  L.circle([state.destination.lat,state.destination.lon],{radius:2000,color:'#3f7bdc',weight:1,fill:false,dashArray:'5 6'}).addTo(state.map);
  L.circle([state.destination.lat,state.destination.lon],{radius:5000,color:'#7fa3d6',weight:1,fill:false,dashArray:'5 6'}).addTo(state.map);

  renderMarkers();
}
function renderMarkers(){
  state.markers.forEach(m=>m.remove()); state.markers=[];
  const maxRent=Number(document.getElementById('maxRent').value);
  const onlyActionable=document.getElementById('onlyActionable').checked;
  let visible=state.rentals.filter(r=>r.rent<=maxRent && (!onlyActionable || ['A','A-','A+','S','S-','S+'].some(x=>r.recommendation.startsWith(x))));
  visible.forEach(r=>{
    if(r.lat==null||r.lon==null) return;
    const cls=tierClass(r.recommendation);
    const icon=L.divIcon({html:markerHtml(r.point_id.replace('R-',''),cls),className:'',iconSize:[30,30],iconAnchor:[15,15]});
    const m=L.marker([r.lat,r.lon],{icon}).addTo(state.map).bindTooltip(`${r.point_id} ${r.community} ¥${r.rent}`);
    m.on('click',()=>showRental(r)); state.markers.push(m);
  });
  renderCards(visible);
}

function renderCards(items){
  const box=document.getElementById('cards'); box.innerHTML='';
  document.getElementById('count').textContent=`${items.length} 套`;
  items.sort((a,b)=>{
    const score=x=>x.recommendation.startsWith('S')?0:x.recommendation.startsWith('A')?1:2;
    return score(a)-score(b)||a.rent-b.rent;
  }).forEach(r=>{
    const transit=r.transit?.verified?`${r.transit.minutes}分钟 / ${r.transit.stops}站`:'待核';
    const div=document.createElement('div'); div.className='card'; div.onclick=()=>showRental(r);
    div.innerHTML=`<div class="row"><div><span class="pid">${r.point_id}</span> <b>${r.community}</b></div><div class="price">¥${r.rent}</div></div>
      <div style="margin-top:6px">${r.title}</div>
      <div class="tags"><span class="tag">${r.status}</span><span class="tag good">${r.recommendation}</span><span class="tag warn">公交 ${transit}</span></div>
      <div class="muted">${r.property_type}<br>水电：${r.electricity}</div>`;
    box.appendChild(div);
  });
}

function showDestination(){
  document.getElementById('detail').innerHTML=`<h3>${state.destination.name}</h3><div class="kv"><div>地址</div><div>${state.destination.address}</div><div>作用</div><div>所有通勤计算的固定终点</div></div>`;
}

function showRental(r){
  const transit=r.transit?.verified?`${r.transit.minutes}分钟，${r.transit.stops}站；${r.transit.route}`:'待核（不猜）';
  document.getElementById('detail').innerHTML=`<h3>${r.point_id}｜${r.community}｜¥${r.rent}/月</h3>
  <div class="kv">
    <div>状态</div><div>${r.status}</div>
    <div>户型</div><div>${r.title}${r.area?`｜${r.area}㎡`:''}</div>
    <div>朝向</div><div>${r.orientation}</div>
    <div>公交/地铁</div><div>${transit}</div>
    <div>住宅属性</div><div>${r.property_type}</div>
    <div>水电</div><div>${r.electricity}</div>
    <div>独立入户</div><div>${r.independent_entrance}</div>
    <div>独立厨卫</div><div>${r.independent_kitchen_bath}</div>
    <div>来源新鲜度</div><div>${r.source_freshness}</div>
    <div>推荐</div><div><b>${r.recommendation}</b>｜${r.reason}</div>
  </div>
  <div class="btns">
    <a class="btn" href="${r.source_url}" target="_blank">查看房源原页</a>
    <a class="btn" href="${amapRoute(r,'bus')}" target="_blank">高德公交</a>
    <a class="btn secondary" href="${amapRoute(r,'ride')}" target="_blank">高德骑行</a>
    <a class="btn secondary" href="${amapRoute(r,'walk')}" target="_blank">高德步行</a>
  </div>`;
  if(r.lat!=null&&r.lon!=null) state.map.setView([r.lat,r.lon],16);
}

function bindControls(){
  const slider=document.getElementById('maxRent'), out=document.getElementById('rentValue');
  slider.addEventListener('input',()=>{out.textContent=slider.value; renderMarkers();});
  document.getElementById('onlyActionable').addEventListener('change',renderMarkers);
  document.getElementById('fitAll').addEventListener('click',()=>{
    const pts=[[state.destination.lat,state.destination.lon],...state.rentals.filter(r=>r.lat!=null).map(r=>[r.lat,r.lon])];
    state.map.fitBounds(pts,{padding:[35,35]});
  });
}

async function boot(){
  try{
    [state.destination,state.communities,state.rentals]=await Promise.all([
      loadJSON('data/dingchuang.json'), loadJSON('data/communities.json'), loadJSON('data/rentals.json')
    ]);
    document.getElementById('lastUpdate').textContent=`页面数据：${new Date().toLocaleString('zh-CN')}`;
    setupMap(); bindControls();
  }catch(e){
    document.getElementById('detail').innerHTML='<b>数据载入失败。</b> 请确认通过网页服务器或 GitHub Pages 打开，不要直接用 file:// 方式读取。';
    console.error(e);
  }
}
boot();
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{})); }