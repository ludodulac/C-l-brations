// Couche de sécurité relationnelle : retirer un lien ou un contenu ne supprime jamais un rendez-vous.
function eventContentActions(e){
  if(!state.contents.length)return '<div class="notice">Aucun contenu dans la bibliothèque.</div>';
  const ids=new Set(e?.contentIds||[]);
  return `<div class="list">${state.contents.map(c=>{const linked=ids.has(c.id);return `<div class="admin-row"><div><strong>${icon(c.type)} ${esc(c.name)}</strong><div class="meta">${esc(c.type)}${linked?' · associé à ce rendez-vous':''}</div></div><button type="button" class="btn ${linked?'':'primary'}" onclick="toggleEventContent(${e.id},${c.id})">${linked?'Retirer':'Associer'}</button></div>`}).join('')}</div>`;
}

function toggleEventContent(eventId,contentId){
  const e=state.events.find(x=>x.id===eventId);if(!e)return;
  const ids=new Set(e.contentIds||[]),wasLinked=ids.has(contentId);
  if(wasLinked)ids.delete(contentId);else ids.add(contentId);
  e.contentIds=[...ids];
  saveState(state);
  showDayEventForm(e.dayKey,e.id);
  toast(wasLinked?'Contenu retiré du rendez-vous':'Contenu associé au rendez-vous');
}

function safeEventLinkRow(l={}){
  return `<div class="form-grid" data-event-link-row style="margin-bottom:8px"><label class="field"><span>Titre du lien</span><input data-event-link-label value="${esc(l.label||'')}"></label><label class="field"><span>URL</span><input data-event-link-url type="url" value="${esc(l.url||'')}"></label><button type="button" class="btn small danger" onclick="this.closest('[data-event-link-row]').remove()">Retirer ce lien</button></div>`;
}

showDayEventForm=function(dayKey,eventId=null){
  const c=selected(),e=eventId?state.events.find(x=>x.id===eventId):null,target=document.getElementById('dayEventForm');if(!target)return;
  if(e&&!Array.isArray(e.links))e.links=[];
  const contentBlock=e?`<h4>Contenus du rendez-vous</h4>${eventContentActions(e)}<div class="actions" style="margin-top:10px"><button class="btn small" id="createEventContent">+ Créer un contenu</button></div><div id="eventInlineContent"></div>`:'';
  target.innerHTML=`<div class="notice" style="margin-bottom:14px"><div class="form-grid"><label class="field"><span>Heure</span><input id="evtTime" type="time" value="${esc(e?.time||'')}"></label><label class="field"><span>Visible pour</span><select id="evtGroup">${groupOptions(e?.audience||'all')}</select></label><label class="field full"><span>Titre</span><input id="evtTitle" value="${esc(e?.title||'')}"></label><label class="field full"><span>Description</span><textarea id="evtDesc">${esc(e?.description||'')}</textarea></label></div><h4>Liens du rendez-vous</h4><div id="eventLinks">${(e?.links||[]).map(safeEventLinkRow).join('')}</div><button type="button" class="btn small" id="addEventLink">+ Ajouter un lien</button>${contentBlock}<div class="actions" style="margin-top:14px"><button class="btn primary" id="saveEventBtn">${e?'Enregistrer le rendez-vous':'Ajouter le rendez-vous'}</button><button type="button" class="btn" onclick="document.getElementById('dayEventForm').innerHTML=''">Annuler</button></div></div>`;
  addEventLink.onclick=()=>eventLinks.insertAdjacentHTML('beforeend',safeEventLinkRow());
  if(e&&document.getElementById('createEventContent'))createEventContent.onclick=()=>renderInlineContentCreator('eventInlineContent',id=>{e.contentIds=[...new Set([...(e.contentIds||[]),id])];saveState(state);showDayEventForm(dayKey,e.id)});
  saveEventBtn.onclick=()=>{
    const title=evtTitle.value.trim();if(!title)return toast('Indiquez un titre');
    const links=[...document.querySelectorAll('[data-event-link-row]')].map(r=>({label:r.querySelector('[data-event-link-label]').value.trim(),url:r.querySelector('[data-event-link-url]').value.trim()})).filter(x=>x.url);
    const data={celebrationId:c.id,dayKey,time:evtTime.value,title,audience:evtGroup.value,description:evtDesc.value,links};
    if(e){Object.assign(e,data);saveState(state);editDay(dayKey);toast('Rendez-vous enregistré');}
    else{const ne={id:Date.now(),...data,contentIds:[]};state.events.push(ne);saveState(state);editDay(dayKey);toast('Rendez-vous ajouté');}
  };
};

eventRow=function(e){
  const links=(e.links||[]).length,contents=(e.contentIds||[]).length;
  return `<div class="admin-row"><div><strong>${esc(e.time||'—')} — ${esc(e.title)}</strong><div class="meta">${esc(groupName(state,e.audience))}${links?` · ${links} lien${links>1?'s':''}`:''}${contents?` · ${contents} contenu${contents>1?'s':''}`:''}</div></div><div class="row-actions"><button class="btn small" onclick="showDayEventForm('${e.dayKey}',${e.id})">Modifier</button><button class="btn small danger" onclick="removeEvent(${e.id},'${e.dayKey}')">Supprimer le rendez-vous</button></div></div>`;
};

removeEvent=function(id,key){
  const e=state.events.find(x=>x.id===id);if(!e)return;
  if(!confirm(`Supprimer uniquement le rendez-vous « ${e.time||''} ${e.title||''} » ?\n\nSes contenus et fichiers resteront dans la bibliothèque.`))return;
  state.events=state.events.filter(x=>x.id!==id);
  saveState(state);editDay(key);toast('Rendez-vous supprimé');
};

removeContent=async function(id){
  const c=state.contents.find(x=>x.id===id);if(!c)return;
  const a=typeof contentAssociationData==='function'?contentAssociationData(id):{days:[],events:[]};
  const used=(a.days?.length||0)+(a.events?.length||0);
  const msg=used?`Supprimer le contenu « ${c.name} » ?\n\nIl sera retiré de ${used} association${used>1?'s':''}, mais aucun jour ni rendez-vous ne sera supprimé.`:`Supprimer le contenu « ${c.name} » ?`;
  if(!confirm(msg))return;
  // On ne retire que les références vers le contenu. Les objets parent restent intacts.
  state.celebrations.forEach(cel=>(cel.days||[]).forEach(d=>{d.contentIds=(d.contentIds||[]).filter(x=>x!==id)}));
  state.events.forEach(e=>{e.contentIds=(e.contentIds||[]).filter(x=>x!==id)});
  state.contents=state.contents.filter(x=>x.id!==id);
  try{await deleteMedia(id);await deleteMedia('cover-'+id)}catch(err){}
  saveState(state);renderMedia();toast('Contenu supprimé, rendez-vous conservés');
};
