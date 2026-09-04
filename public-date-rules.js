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

dayList=function(){return (current()?.days||[]).map(d=>({key:d.key,label:d.label,short:publicDayDate(d)}))};

function contentVisual(c){
  if(c.type==='Image'&&c.sourceType==='file')return `<img data-image-id="${c.id}" alt="${esc(c.name)}" style="display:block;width:100%;max-width:560px;max-height:360px;object-fit:contain;border-radius:12px;margin:10px 0;background:#f3f4f6">`;
  if(c.hasCover)return `<img data-cover-id="${c.id}" alt="Illustration de ${esc(c.name)}" style="display:block;width:100%;max-width:560px;max-height:360px;object-fit:contain;border-radius:12px;margin:10px 0;background:#f3f4f6">`;
  return '';
}
function contentWithVisual(c){return `<div class="public-content" style="width:100%">${contentVisual(c)}<div class="resources">${contentButtons(c)}</div></div>`}

dayIntro=function(d){
  const links=(d.links||[]).filter(l=>l.url);
  const contents=(d.contentIds||[]).map(id=>state.contents.find(c=>c.id===id)).filter(Boolean).filter(c=>audienceOk(c.audience));
  const date=publicDayDate(d);
  return `<div class="card" style="margin:8px 0 14px;border-left:5px solid var(--accent)"><h3 style="margin-top:0">${esc(d.label)}</h3>${date?`<div class="meta">${esc(date)}</div>`:''}${d.text?`<p>${esc(d.text).replace(/\n/g,'<br>')}</p>`:''}${links.length?`<div class="resources">${links.map(l=>`<a class="resource-link" href="${esc(l.url)}" target="_blank" rel="noopener">↗ ${esc(l.label||l.url)}</a>`).join('')}</div>`:''}${contents.length?`<div style="margin-top:12px">${contents.map(contentWithVisual).join('')}</div>`:''}</div>`;
};

eventHtml=function(e){
  const c=current(),d=dayForEvent(c,e);
  const contents=(e.contentIds||[]).map(id=>state.contents.find(x=>x.id===id)).filter(Boolean).filter(x=>audienceOk(x.audience));
  return `<article class="event"><div class="time">${esc(e.time||'—')}</div><div><h3 style="margin:0 0 5px">${esc(e.title)}</h3><div class="meta">${esc(d?.label||'')} · ${esc(groupName(state,e.audience))}</div>${e.description?`<p>${esc(e.description)}</p>`:''}${contents.length?`<div>${contents.map(contentWithVisual).join('')}</div>`:''}</div></article>`;
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