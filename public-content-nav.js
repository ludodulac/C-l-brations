const CONTENT_FAMILIES=[
  {label:'Chants audio',category:'Chants audio'},
  {label:'Audios parlés',category:'Audios parlés'},
  {label:'PDF',category:'PDF'},
  {label:'Textes',category:'Textes'},
  {label:'Vidéos',category:'Vidéos'}
];

function contentMatchesFamily(c,category){
  if(category==='Audios parlés')return c.type==='Audio'&&(c.category==='Audios parlés'||c.category==='Audio'||!c.category);
  if(category==='Chants audio')return c.type==='Audio'&&c.category==='Chants audio';
  if(category==='PDF')return c.type==='PDF';
  if(category==='Textes')return c.type==='Texte';
  if(category==='Vidéos')return c.type==='Vidéo';
  return c.category===category;
}

function renderContentFamily(category){
  const label=CONTENT_FAMILIES.find(x=>x.category===category)?.label||category;
  const list=state.contents.filter(c=>audienceOk(c.audience)&&contentMatchesFamily(c,category));
  library.innerHTML=`<div class="family-title"><div><div class="eyebrow">Bibliothèque</div><h2 style="margin:4px 0 0">${esc(label)}</h2></div><button class="btn" id="allLibrary">Tous les contenus</button></div><div class="grid3">${list.length?list.map(contentCard).join(''):'<div class="notice">Aucun contenu dans cette rubrique.</div>'}</div>`;
  document.getElementById('allLibrary').onclick=()=>{filter='Tous';renderLibrary()};
  hydrateDynamic(library);
}

function openContentFamily(category){
  showTab('library');
  renderContentFamily(category);
  requestAnimationFrame(()=>library.scrollIntoView({behavior:'smooth',block:'start'}));
}

function contentFamilyNav(){
  return `<div class="content-family-nav"><h3>Contenus</h3><div class="content-family-grid">${CONTENT_FAMILIES.map(x=>`<button class="btn content-family-btn" data-content-family="${esc(x.category)}">${esc(x.label)}</button>`).join('')}</div></div>`;
}

renderProgram=function(){
  const c=current();ensurePublicSteps(c);
  const days=dayList();if(!days.some(d=>d.key===activeDay))activeDay=days[0]?.key||'';
  const day=(c?.days||[]).find(d=>d.key===activeDay);
  const events=state.events.filter(e=>e.celebrationId===c?.id&&e.dayKey===activeDay&&audienceOk(e.audience)).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  program.innerHTML=`<div class="section-head"><div><div class="eyebrow">Programme</div><h2>Les rendez-vous</h2></div></div>${days.length?`<div class="days days-fixed">${days.map(d=>`<button class="chip day ${d.key===activeDay?'active':''}" data-day="${esc(d.key)}">${esc(d.label)}${d.short?`<span class="sub">${esc(d.short)}</span>`:''}</button>`).join('')}</div>${day?dayIntro(day):''}<div class="agenda">${events.length?events.map(eventHtml).join(''):'<div class="notice">Aucun rendez-vous pour ce jour.</div>'}</div>${contentFamilyNav()}`:'<div class="notice">Le programme sera publié prochainement.</div>${contentFamilyNav()}`;
  program.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{activeDay=b.dataset.day;renderProgram()});
  program.querySelectorAll('[data-content-family]').forEach(b=>b.onclick=()=>openContentFamily(b.dataset.contentFamily));
  hydrateDynamic(program);
};

renderProgram();