// Gestion explicite des relations étape <-> contenus.
// Un retrait ici ne supprime jamais le contenu de la bibliothèque.
let dayContentPickerOpen=false;

function dayLinkedContentRows(d){
  const ids=d.contentIds||[];
  const rows=ids.map(id=>state.contents.find(c=>c.id===id)).filter(Boolean);
  if(!rows.length)return '<div class="notice">Aucun contenu associé à cette étape.</div>';
  return `<div class="list">${rows.map(c=>`<div class="admin-row"><div><strong>${icon(c.type)} ${esc(c.name)}</strong><div class="meta">${esc(c.type)} · associé à cette étape</div></div><div class="row-actions"><button type="button" class="btn small" onclick="editDayLinkedContent(${c.id},'${d.key}')">Modifier</button><button type="button" class="btn small danger" onclick="unlinkDayContent('${d.key}',${c.id})">Retirer de ${esc(d.label)}</button></div></div>`).join('')}</div>`;
}

function dayContentPicker(d){
  if(!dayContentPickerOpen)return '';
  const linked=new Set(d.contentIds||[]);
  const available=state.contents.filter(c=>!linked.has(c.id));
  return `<div class="card" style="margin-top:12px"><div class="section-head"><h3 style="margin:0">Associer un contenu existant</h3><button type="button" class="btn small" onclick="dayContentPickerOpen=false;editDay('${d.key}')">Fermer</button></div>${available.length?`<div class="list">${available.map(c=>`<div class="admin-row"><div><strong>${icon(c.type)} ${esc(c.name)}</strong><div class="meta">${esc(c.type)}</div></div><button type="button" class="btn small primary" onclick="linkDayContent('${d.key}',${c.id})">Associer</button></div>`).join('')}</div>`:'<div class="notice">Tous les contenus de la bibliothèque sont déjà associés à cette étape.</div>'}</div>`;
}

function linkDayContent(dayKey,contentId){
  const d=selected()?.days?.find(x=>x.key===dayKey);if(!d)return;
  d.contentIds=[...new Set([...(d.contentIds||[]),contentId])];saveState(state);dayContentPickerOpen=false;editDay(dayKey);toast('Contenu associé à cette étape');
}
function unlinkDayContent(dayKey,contentId){
  const d=selected()?.days?.find(x=>x.key===dayKey);if(!d)return;
  d.contentIds=(d.contentIds||[]).filter(id=>id!==contentId);saveState(state);editDay(dayKey);toast('Contenu retiré de cette étape, conservé dans la bibliothèque');
}
function editDayLinkedContent(contentId,dayKey){
  editContent(contentId);
  const back=[...panel.querySelectorAll('button')].find(b=>b.textContent.trim()==='Retour');
  if(back){back.onclick=()=>editDay(dayKey);back.textContent='Retour à l’étape';}
}

editDay=function(key){
  const c=selected(),d=c.days.find(x=>x.key===key);if(!d)return renderProgram();
  if(!Array.isArray(d.contentIds))d.contentIds=[];
  const events=state.events.filter(e=>e.celebrationId===c.id&&e.dayKey===key).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  panel.innerHTML=`${context()}<div class="card"><div class="eyebrow">Étape</div><h2>${esc(d.label)}</h2><div class="form-grid"><label class="field"><span>Nom de l’étape</span><input id="dLabel" value="${esc(d.label)}"></label><label class="field"><span>Date de début</span><input id="dStart" type="date" value="${esc(d.startDate||'')}"></label><label class="field"><span>Date de fin</span><input id="dEnd" type="date" value="${esc(d.endDate||'')}"></label><label class="field full"><span>Texte de l’étape</span><textarea id="dText">${esc(d.text||'')}</textarea></label></div><h3>Liens</h3><div id="dayLinks">${(d.links||[]).map((l,i)=>linkRow(l,i)).join('')}</div><button type="button" class="btn small" id="addLink">+ Ajouter un lien</button><div class="actions" style="margin-top:18px"><button class="btn primary" id="saveDay">Enregistrer l’étape</button><button class="btn" onclick="renderProgram()">Retour</button></div></div><div class="card section"><div class="section-head"><div><div class="eyebrow">Bibliothèque</div><h2 style="margin:0">Contenus de ${esc(d.label)}</h2></div><div class="row-actions"><button type="button" class="btn" id="associateDayContent">Associer un contenu</button><button type="button" class="btn primary" id="createDayContent">+ Créer un contenu</button></div></div>${dayLinkedContentRows(d)}${dayContentPicker(d)}<div id="dayInlineContent"></div></div><div class="card section"><div class="section-head"><h2 style="margin:0">Rendez-vous</h2><button class="btn primary" onclick="showDayEventForm('${key}')">+ Ajouter un rendez-vous</button></div><div id="dayEventForm"></div><div class="list">${events.length?events.map(eventRow).join(''):'<div class="notice">Aucun rendez-vous.</div>'}</div></div>`;
  document.getElementById('addLink').onclick=()=>dayLinks.insertAdjacentHTML('beforeend',linkRow({label:'',url:''},dayLinks.children.length));
  document.getElementById('associateDayContent').onclick=()=>{dayContentPickerOpen=!dayContentPickerOpen;editDay(key)};
  document.getElementById('createDayContent').onclick=()=>renderInlineContentCreator('dayInlineContent',id=>{d.contentIds=[...new Set([...(d.contentIds||[]),id])];saveState(state);editDay(key)});
  document.getElementById('saveDay').onclick=()=>{const s=dStart.value,e=dEnd.value||s;if(s&&e&&e<s)return toast('La date de fin doit suivre la date de début');d.label=dLabel.value.trim()||d.label;d.startDate=s;d.endDate=e;d.text=dText.value;d.links=[...dayLinks.querySelectorAll('[data-link-row]')].map(r=>({label:r.querySelector('[data-link-label]').value.trim(),url:r.querySelector('[data-link-url]').value.trim()})).filter(x=>x.url);saveState(state);editDay(key);toast('Étape enregistrée')};
};