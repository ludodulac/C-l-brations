let publicCelebrationOpen=false;

function celebrationPublicLabel(c){return `Archange ${c.archangel} ${c.year}`}
function publicCelebrationChoices(){
  const list=[...state.celebrations].sort((a,b)=>String(a.year).localeCompare(String(b.year)));
  return `<div class="celebration-home"><div class="public-page-title"><div class="eyebrow">Bienvenue</div><h1>Célébrations des Archanges</h1><p>Choisissez une célébration</p></div><div class="celebration-choice-grid">${list.map(c=>`<button class="celebration-choice" data-open-celebration="${c.id}" style="--celebration-color:${ARCHANGELS[c.archangel]||'#172033'}"><span class="eyebrow">Célébration</span><strong>${esc(celebrationPublicLabel(c))}</strong><span>${esc(c.year)}</span></button>`).join('')}</div></div>`;
}
function showCelebrationHome(){
  publicCelebrationOpen=false;
  hero.innerHTML=publicCelebrationChoices();
  program.classList.add('hidden');library.classList.add('hidden');info.classList.add('hidden');
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.remove('active'));
  hero.querySelectorAll('[data-open-celebration]').forEach(b=>b.onclick=()=>openPublicCelebration(Number(b.dataset.openCelebration)));
}
function openPublicCelebration(id){
  const c=state.celebrations.find(x=>x.id===id);if(!c)return;
  state.currentCelebrationId=id;saveState(state);activeDay='';publicCelebrationOpen=true;setAccent();
  const r=celebrationRange(c);
  hero.innerHTML=`<div class="celebration-page-head"><button class="btn small celebration-back" id="celebrationBack">‹ Célébrations</button><div><div class="eyebrow">Célébration</div><h1>${esc(celebrationPublicLabel(c))}</h1>${r.start?`<div class="date-range">${formatDate(r.start)} → ${formatDate(r.end)}</div>`:''}</div><div class="chips" id="profiles"></div></div>`;
  const box=document.getElementById('profiles');box.innerHTML=state.groups.map(g=>`<button class="chip ${state.profile===g.id?'active':''}" data-profile="${esc(g.id)}">${g.id==='all'?'Tous':esc(g.name)}</button>`).join('');
  box.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{state.profile=b.dataset.profile;saveState(state);openPublicCelebration(id)});
  celebrationBack.onclick=showCelebrationHome;
  document.querySelector('[data-tab="program"]')?.classList.add('active');program.classList.remove('hidden');library.classList.add('hidden');info.classList.add('hidden');
  renderProgram();
}
const baseShowTab=showTab;
showTab=function(tab){if(!publicCelebrationOpen){const c=current();if(c)openPublicCelebration(c.id);else return}baseShowTab(tab)};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
showCelebrationHome();