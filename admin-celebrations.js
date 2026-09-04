const CELEBRATION_CYCLE=['Michaël','Gabriel','Raphaël','Ouriel'];

function celebrationStartYear(c){
  const m=String(c?.year||'').match(/\d{4}/);return m?Number(m[0]):new Date().getFullYear();
}
function nextCelebrationIdentity(last){
  const currentIndex=Math.max(0,CELEBRATION_CYCLE.indexOf(last?.archangel));
  const archangel=CELEBRATION_CYCLE[(currentIndex+1)%CELEBRATION_CYCLE.length];
  const y=celebrationStartYear(last);
  let year;
  if(last?.archangel==='Michaël'&&archangel==='Gabriel')year=`${y}–${y+1}`;
  else if(last?.archangel==='Gabriel'&&archangel==='Raphaël')year=String(y+1);
  else year=String(y+1);
  return {archangel,year};
}
function celebrationOrderValue(c){
  return celebrationStartYear(c)*10+Math.max(0,CELEBRATION_CYCLE.indexOf(c.archangel));
}
function normalizeCelebrationStatuses(){
  state.celebrations.forEach(c=>{
    if(c.id===state.currentCelebrationId)c.status='active';
    else if(c.status==='archived')c.status='finished';
    else if(!['active','planned','finished'].includes(c.status))c.status='planned';
  });
  saveState(state);
}
function celebrationRow(c,statusLabel=''){
  const r=celebrationRange(c),col=ARCHANGELS[c.archangel]||'#999';
  return `<div class="admin-row" style="border-left:5px solid ${col}"><div><strong>Archange ${esc(c.archangel)} ${esc(c.year)}</strong><div class="meta">${r.start?`${formatDate(r.start)} → ${formatDate(r.end)}`:'Dates à définir'}${statusLabel?` · ${statusLabel}`:''}</div></div><button class="btn primary" onclick="editCelebration(${c.id})">Modifier</button></div>`;
}
function createNextCelebration(){
  const ordered=[...state.celebrations].sort((a,b)=>celebrationOrderValue(a)-celebrationOrderValue(b));
  const last=ordered[ordered.length-1];
  const next=nextCelebrationIdentity(last);
  const exists=state.celebrations.some(c=>c.archangel===next.archangel&&String(c.year)===next.year);
  if(exists)return toast('Cette célébration existe déjà');
  const id=Date.now();
  const c={id,archangel:next.archangel,year:next.year,status:'planned',days:[]};
  state.celebrations.push(c);
  if(typeof ensureFixedSteps==='function')ensureFixedSteps(c);
  state.adminCelebrationId=id;saveState(state);renderCelebrations();toast('Célébration ajoutée');
}
function setCelebrationCurrent(id){
  const c=state.celebrations.find(x=>x.id===id);if(!c)return;
  state.celebrations.forEach(x=>{if(x.status==='active')x.status='planned'});
  c.status='active';state.currentCelebrationId=id;state.adminCelebrationId=id;saveState(state);editCelebration(id);toast('Célébration mise en cours');
}
function finishCelebration(id){
  const c=state.celebrations.find(x=>x.id===id);if(!c)return;
  if(!confirm(`Archiver Archange ${c.archangel} ${c.year} ?`))return;
  c.status='finished';
  const next=[...state.celebrations].filter(x=>x.id!==id&&x.status!=='finished').sort((a,b)=>celebrationOrderValue(a)-celebrationOrderValue(b))[0];
  if(next){next.status='active';state.currentCelebrationId=next.id;state.adminCelebrationId=next.id;}
  saveState(state);renderCelebrations();toast('Célébration archivée');
}
function restoreCelebration(id){
  const c=state.celebrations.find(x=>x.id===id);if(!c)return;c.status='planned';saveState(state);renderCelebrations();toast('Célébration restaurée');
}

normalizeCelebrationStatuses();
renderCelebrations=function(){
  normalizeCelebrationStatuses();
  const current=state.celebrations.find(c=>c.id===state.currentCelebrationId&&c.status!=='finished');
  const upcoming=[...state.celebrations].filter(c=>c.status!=='finished'&&c.id!==current?.id).sort((a,b)=>celebrationOrderValue(a)-celebrationOrderValue(b));
  const archives=[...state.celebrations].filter(c=>c.status==='finished').sort((a,b)=>celebrationOrderValue(b)-celebrationOrderValue(a));
  panel.innerHTML=`<div class="card"><div class="eyebrow">Célébrations</div><h2>Célébration actuelle</h2>${current?celebrationRow(current,'en cours'):'<div class="notice">Aucune célébration en cours.</div>'}</div><div class="card section"><div class="section-head"><h2 style="margin:0">Prochaines célébrations</h2><button class="btn primary" id="addNextCelebration">+ Ajouter la suivante</button></div><div class="list">${upcoming.length?upcoming.map(c=>celebrationRow(c,'à venir')).join(''):'<div class="notice">Aucune célébration à venir.</div>'}</div></div><div class="card section"><h2>Archives</h2><div class="list">${archives.length?archives.map(c=>celebrationRow(c,'terminée')).join(''):'<div class="notice">Aucune archive.</div>'}</div></div>`;
  addNextCelebration.onclick=createNextCelebration;
};

editCelebration=function(id){
  state.adminCelebrationId=id;saveState(state);accent();
  const c=selected();if(typeof ensureFixedSteps==='function')ensureFixedSteps(c);saveState(state);
  const archived=c.status==='finished',isCurrent=c.id===state.currentCelebrationId&&!archived;
  const action=archived?`<button class="btn" id="restoreC">Sortir des archives</button>`:isCurrent?`<button class="btn dark" id="finishC">Terminer et archiver</button>`:`<button class="btn dark" id="makeCurrentC">Mettre en cours</button>`;
  panel.innerHTML=`${context()}<div class="card"><div class="eyebrow">${archived?'Archive':isCurrent?'Célébration en cours':'Célébration à venir'}</div><div class="section-head"><h2 style="margin:0">Archange ${esc(c.archangel)} ${esc(c.year)}</h2><div class="actions">${action}</div></div><div class="form-grid" style="margin-top:18px"><label class="field"><span>Archange</span><select id="eArch"><option ${c.archangel==='Michaël'?'selected':''}>Michaël</option><option ${c.archangel==='Gabriel'?'selected':''}>Gabriel</option><option ${c.archangel==='Raphaël'?'selected':''}>Raphaël</option><option ${c.archangel==='Ouriel'?'selected':''}>Ouriel</option></select></label><label class="field"><span>Année / période</span><input id="eYear" value="${esc(c.year)}"></label></div><div class="actions" style="margin-top:14px"><button class="btn primary" id="saveC">Enregistrer</button></div></div><div class="card section"><h2>Étapes</h2><div class="list">${(c.days||[]).map(dayCard).join('')}</div></div>`;
  saveC.onclick=()=>{c.archangel=eArch.value;c.year=eYear.value.trim()||c.year;saveState(state);accent();editCelebration(c.id);toast('Célébration enregistrée')};
  if(document.getElementById('makeCurrentC'))makeCurrentC.onclick=()=>setCelebrationCurrent(c.id);
  if(document.getElementById('finishC'))finishC.onclick=()=>finishCelebration(c.id);
  if(document.getElementById('restoreC'))restoreC.onclick=()=>restoreCelebration(c.id);
};

removeCelebration=function(){return false};
render();