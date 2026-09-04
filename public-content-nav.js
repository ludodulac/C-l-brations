const CONTENT_FAMILIES=[
  {label:'Chants audio',category:'Chants audio'},
  {label:'Audios parlés',category:'Audios parlés'},
  {label:'PDF',category:'PDF'},
  {label:'Textes',category:'Textes'},
  {label:'Vidéos',category:'Vidéos'}
];

function openContentFamily(category){
  filter=category;
  showTab('library');
  renderLibrary();
}

function contentFamilyNav(){
  return `<div class="content-family-nav"><div class="content-family-grid">${CONTENT_FAMILIES.map(x=>`<button class="btn content-family-btn" data-content-family="${esc(x.category)}">${esc(x.label)}</button>`).join('')}</div></div>`;
}

renderProgram=function(){
  const c=current();ensurePublicSteps(c);
  const days=dayList();if(!days.some(d=>d.key===activeDay))activeDay=days[0]?.key||'';
  const day=(c?.days||[]).find(d=>d.key===activeDay);
  const events=state.events.filter(e=>e.celebrationId===c?.id&&e.dayKey===activeDay&&audienceOk(e.audience)).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  const body=day?`${dayIntro(day)}<div class="agenda">${events.length?events.map(eventHtml).join(''):'<div class="notice">Aucun rendez-vous pour ce jour.</div>'}</div>`:'<div class="notice">Le programme sera publié prochainement.</div>';
  program.innerHTML=`<div class="program-top"><div class="section-head"><div><div class="eyebrow">Programme</div><h2>Les rendez-vous</h2></div></div>${days.length?`<div class="days days-fixed">${days.map(d=>`<button class="chip day ${d.key===activeDay?'active':''}" data-day="${esc(d.key)}">${esc(d.label)}${d.short?`<span class="sub">${esc(d.short)}</span>`:''}</button>`).join('')}</div>`:''}</div><div class="day-screen-body">${body}</div>${contentFamilyNav()}`;
  program.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{activeDay=b.dataset.day;renderProgram()});
  program.querySelectorAll('[data-content-family]').forEach(b=>b.onclick=()=>openContentFamily(b.dataset.contentFamily));
  hydrateDynamic(program);
};

renderProgram();