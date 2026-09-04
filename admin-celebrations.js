// Une célébration est une entrée permanente : un seul bouton ouvre toute sa gestion.
renderCelebrations=function(){
  panel.innerHTML=`<div class="card"><div class="eyebrow">Célébrations</div><h2>Choisir une célébration</h2><div class="list">${state.celebrations.map(c=>{const r=celebrationRange(c),col=ARCHANGELS[c.archangel]||'#999';return `<div class="admin-row ${c.id===state.adminCelebrationId?'selected':''}" style="border-left:5px solid ${col}"><div><strong>Archange ${esc(c.archangel)} ${esc(c.year)}</strong><div class="meta">${r.start?`${formatDate(r.start)} → ${formatDate(r.end)}`:'Dates à définir'}${c.id===state.currentCelebrationId?' · affichée au public':''}</div></div><button class="btn primary" onclick="editCelebration(${c.id})">Modifier</button></div>`}).join('')}</div></div>`;
};

editCelebration=function(id){
  state.adminCelebrationId=id;saveState(state);accent();
  const c=selected();if(typeof ensureFixedDays==='function')ensureFixedDays(c);saveState(state);
  panel.innerHTML=`${context()}<div class="card"><div class="eyebrow">Célébration</div><div class="section-head"><h2 style="margin:0">Archange ${esc(c.archangel)} ${esc(c.year)}</h2>${c.id!==state.currentCelebrationId?'<button class="btn dark" id="publishC">Afficher au public</button>':'<span class="badge">Affichée au public</span>'}</div><div class="form-grid" style="margin-top:18px"><label class="field"><span>Archange</span><select id="eArch"><option ${c.archangel==='Michaël'?'selected':''}>Michaël</option><option ${c.archangel==='Gabriel'?'selected':''}>Gabriel</option><option ${c.archangel==='Raphaël'?'selected':''}>Raphaël</option><option ${c.archangel==='Ouriel'?'selected':''}>Ouriel</option></select></label><label class="field"><span>Année / période</span><input id="eYear" value="${esc(c.year)}"></label></div><div class="actions" style="margin-top:14px"><button class="btn primary" id="saveC">Enregistrer</button></div></div><div class="card section"><h2>Étapes</h2><div class="list">${(c.days||[]).map(dayCard).join('')}</div></div>`;
  saveC.onclick=()=>{c.archangel=eArch.value;c.year=eYear.value.trim()||c.year;saveState(state);accent();editCelebration(c.id);toast('Célébration enregistrée')};
  if(document.getElementById('publishC'))publishC.onclick=()=>{state.currentCelebrationId=c.id;saveState(state);editCelebration(c.id);toast('Célébration affichée au public')};
};

// Les anciennes actions restent inaccessibles dans l'interface.
removeCelebration=function(){return false};
render();