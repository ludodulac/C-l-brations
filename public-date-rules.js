const FIXED_STEPS_PUBLIC=['Préparation','Mercredi','Jeudi','Vendredi','Samedi','Dimanche','Après célébration'];
function publicStepKey(label){return String(label||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
function isPublicAfterCelebration(label){return ['apres-celebration','celebration','celebration-principale'].includes(publicStepKey(label))}
function ensurePublicSteps(c){
  if(!c)return;
  const old=c.days||[],used=new Set();
  c.days=FIXED_STEPS_PUBLIC.map(label=>{
    const wanted=publicStepKey(label);
    let d=old.find(x=>!used.has(x)&&publicStepKey(x.label)===wanted);
    if(!d&&label==='Après célébration')d=old.find(x=>!used.has(x)&&isPublicAfterCelebration(x.label));
    if(d){used.add(d);d.label=label;d.contentIds=Array.isArray(d.contentIds)?d.contentIds:[];return d}
    return {key:`${wanted}-${c.id}`,label,startDate:'',endDate:'',text:'',links:[],contentIds:[]};
  });
}
state.celebrations.forEach(ensurePublicSteps);

function publicDayDate(d){
  if(d.label==='Après célébration')return '';
  if(d.label==='Préparation'){
    if(d.startDate&&d.endDate&&d.startDate!==d.endDate)return `${formatDate(d.startDate,{day:'numeric',month:'short'})} – ${formatDate(d.endDate,{day:'numeric',month:'short'})}`;
    return d.startDate?formatDate(d.startDate,{day:'numeric',month:'short'}):'';
  }
  return d.startDate?formatDate(d.startDate,{day:'numeric',month:'short'}):'';
}

function contentVisual(c){
  const style='display:block!important;width:96px!important;height:96px!important;min-width:96px!important;max-width:96px!important;min-height:96px!important;max-height:96px!important;aspect-ratio:1/1!important;object-fit:cover!important;border-radius:10px;margin:0!important;background:#f3f4f6';
  if(c.type==='Image'&&c.sourceType==='file')return `<img data-image-id="${c.id}" alt="${esc(c.name)}" class="public-inline-image" style="${style}">`;
  if(c.hasCover)return `<img data-cover-id="${c.id}" alt="Illustration de ${esc(c.name)}" class="public-inline-image" style="${style}">`;
  return '';
}
function sharedContentButtons(c){
  if(c.type==='Audio'&&c.sourceType==='file')return `<span style="width:100%"><div data-audio-id="${c.id}"></div><button class="resource-link" onclick="openStoredFile(state.contents.find(x=>x.id===${c.id}),true)">Télécharger</button></span>`;
  if((c.type==='PDF'||c.type==='Image')&&c.sourceType==='file')return `<button class="resource-link" onclick="openStoredFile(state.contents.find(x=>x.id===${c.id}),false)">Voir</button><button class="resource-link" onclick="openStoredFile(state.contents.find(x=>x.id===${c.id}),true)">Télécharger</button>`;
  if(c.type==='Texte'&&c.sourceType==='text')return `<button class="resource-link" onclick="alert(${JSON.stringify(c.text||'')})">Voir</button>`;
  if(c.url)return `<a class="resource-link" href="${esc(c.url)}" target="_blank" rel="noopener">Voir</a>`;
  if(c.sourceType==='file')return `<button class="resource-link" onclick="openStoredFile(state.contents.find(x=>x.id===${c.id}),false)">Voir</button><button class="resource-link" onclick="openStoredFile(state.contents.find(x=>x.id===${c.id}),true)">Télécharger</button>`;
  return '';
}
function contentWithVisual(c){
  const visual=contentVisual(c);
  const layout=visual?'display:grid!important;grid-template-columns:96px minmax(0,1fr)!important;gap:10px!important;align-items:start!important;width:100%!important':'width:100%';
  const actions=sharedContentButtons(c);
  return `<div class="public-content ${visual?'has-public-visual':''}" style="${layout}">${visual}<div class="public-content-body" style="min-width:0">${c.name?`<div style="font-weight:700;margin:0 0 6px">${icon(c.type)} ${esc(c.name)}</div>`:''}<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px">${c.description?`<span class="muted" style="white-space:pre-line;flex:1 1 260px">${esc(c.description)}</span>`:''}${actions?`<span class="resources" style="display:flex;flex-wrap:wrap;gap:6px;margin:0">${actions}</span>`:''}</div></div></div>`
}

dayIntro=function(d){
  const links=(d.links||[]).filter(l=>l.url);
  const contents=(d.contentIds||[]).map(id=>state.contents.find(c=>c.id===id)).filter(Boolean).filter(c=>audienceOk(c.audience));
  const date=publicDayDate(d);
  return `<div class="card" style="margin:8px 0 14px;border-left:5px solid var(--accent)"><h3 style="margin-top:0">${esc(d.label)}</h3>${date?`<div class="meta">${esc(date)}</div>`:''}${d.text?`<p>${esc(d.text).replace(/\n/g,'<br>')}</p>`:''}${links.length?`<div class="resources">${links.map(l=>`<a class="resource-link" href="${esc(l.url)}" target="_blank" rel="noopener">↗ ${esc(l.label||l.url)}</a>`).join('')}</div>`:''}${contents.length?`<div style="margin-top:12px;display:grid;gap:8px">${contents.map(contentWithVisual).join('')}</div>`:''}</div>`;
};

eventHtml=function(e){
  const c=current(),d=dayForEvent(c,e);
  const contents=(e.contentIds||[]).map(id=>state.contents.find(x=>x.id===id)).filter(Boolean).filter(x=>audienceOk(x.audience));
  return `<article class="event"><div class="time">${esc(e.time||'—')}</div><div><h3 style="margin:0 0 5px">${esc(e.title)}</h3><div class="meta">${esc(d?.label||'')} · ${esc(groupName(state,e.audience))}</div>${e.description?`<p>${esc(e.description)}</p>`:''}${contents.length?`<div class="public-event-contents" style="display:grid;gap:8px;margin-top:8px">${contents.map(contentWithVisual).join('')}</div>`:''}</div></article>`;
};

function keepActiveDayVisible(smooth=false){
  requestAnimationFrame(()=>{
    const active=program.querySelector('.days [data-day].active');
    if(active)active.scrollIntoView({behavior:smooth?'smooth':'auto',block:'nearest',inline:'center'});
  });
}

renderProgram=function(){
  const c=current();ensurePublicSteps(c);
  const days=dayList();if(!days.some(d=>d.key===activeDay))activeDay=days[0]?.key||'';
  const day=(c?.days||[]).find(d=>d.key===activeDay);
  const events=state.events.filter(e=>e.celebrationId===c?.id&&e.dayKey===activeDay&&audienceOk(e.audience)).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  program.innerHTML=`<div class="section-head"><div><div class="eyebrow">Programme</div><h2>Les rendez-vous</h2></div></div>${days.length?`<div class="days" style="scroll-padding-inline:24px">${days.map(d=>`<button class="chip day ${d.key===activeDay?'active':''}" data-day="${esc(d.key)}">${esc(d.label)}${d.short?`<span class="sub">${esc(d.short)}</span>`:''}</button>`).join('')}</div>${day?dayIntro(day):''}<div class="agenda">${events.length?events.map(eventHtml).join(''):'<div class="notice">Aucun rendez-vous pour ce jour.</div>'}</div>`:'<div class="notice">Le programme sera publié prochainement.</div>'}`;
  program.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{activeDay=b.dataset.day;renderProgram();keepActiveDayVisible(true)});
  hydrateDynamic(program);keepActiveDayVisible(false);
};

renderHero();renderProgram();