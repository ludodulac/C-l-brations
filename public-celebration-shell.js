let publicCelebrationOpen=false;

function celebrationPublicLabel(c){return `Archange ${c.archangel} ${c.year}`}
function publicCelebrationChoices(){
  const list=[...state.celebrations].sort((a,b)=>String(a.year).localeCompare(String(b.year)));
  return `<div class="celebration-home"><div class="public-page-title"><div class="eyebrow">Bienvenue</div><p>Choisissez une célébration</p></div><div class="celebration-choice-grid">${list.map(c=>`<button class="celebration-choice" data-open-celebration="${c.id}" style="--celebration-color:${ARCHANGELS[c.archangel]||'#172033'}"><strong>${esc(celebrationPublicLabel(c))}</strong></button>`).join('')}</div></div>`;
}
function showCelebrationHome(updateHistory=false){
  publicCelebrationOpen=false;
  hero.innerHTML=publicCelebrationChoices();
  program.classList.add('hidden');library.classList.add('hidden');info.classList.add('hidden');
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.remove('active'));
  hero.querySelectorAll('[data-open-celebration]').forEach(b=>b.onclick=()=>openPublicCelebration(Number(b.dataset.openCelebration),true));
  if(updateHistory)history.pushState({screen:'home'},'',location.pathname+location.search);
}
function goPublicHome(){
  if(publicCelebrationOpen&&history.state?.screen==='celebration')history.back();
  else showCelebrationHome(false);
}
function openPublicCelebration(id,pushHistory=false){
  const c=state.celebrations.find(x=>x.id===id);if(!c)return;
  state.currentCelebrationId=id;saveState(state);activeDay='';publicCelebrationOpen=true;setAccent();
  if(pushHistory)history.pushState({screen:'celebration',id},'',`#celebration-${id}`);
  const r=celebrationRange(c);
  hero.innerHTML=`<div class="celebration-page-head"><div class="celebration-title-block"><h1>${esc(celebrationPublicLabel(c))}</h1>${r.start?`<div class="date-range">${formatDate(r.start)} → ${formatDate(r.end)}</div>`:''}</div><div class="chips" id="profiles"></div></div>`;
  const box=document.getElementById('profiles');box.innerHTML=state.groups.map(g=>`<button class="chip ${state.profile===g.id?'active':''}" data-profile="${esc(g.id)}">${g.id==='all'?'Tous':esc(g.name)}</button>`).join('');
  box.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{state.profile=b.dataset.profile;saveState(state);openPublicCelebration(id,false)});
  document.querySelector('[data-tab="program"]')?.classList.add('active');program.classList.remove('hidden');library.classList.add('hidden');info.classList.add('hidden');
  renderProgram();
}
const baseShowTab=showTab;
showTab=function(tab){if(!publicCelebrationOpen){const c=current();if(c)openPublicCelebration(c.id,true);else return}baseShowTab(tab)};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
document.getElementById('brandHome')?.addEventListener('click',goPublicHome);

window.addEventListener('popstate',e=>{
  const s=e.state;
  if(s?.screen==='celebration'&&state.celebrations.some(c=>c.id===Number(s.id)))openPublicCelebration(Number(s.id),false);
  else showCelebrationHome(false);
});

const initialMatch=location.hash.match(/^#celebration-(\d+)$/);
if(initialMatch&&state.celebrations.some(c=>c.id===Number(initialMatch[1]))){
  const id=Number(initialMatch[1]);history.replaceState({screen:'celebration',id},'',location.href);openPublicCelebration(id,false);
}else{
  history.replaceState({screen:'home'},'',location.pathname+location.search);showCelebrationHome(false);
}