let adminLibraryFamily='Audio',adminAudioKind='all';

function adminContentEventMeta(contentId){
  const rows=[];
  state.events.forEach(e=>{
    if(!(e.contentIds||[]).includes(contentId))return;
    const c=state.celebrations.find(x=>x.id===e.celebrationId),d=c?.days?.find(x=>x.key===e.dayKey);
    rows.push(`${d?.label||'Étape'} · ${e.time||'Sans heure'} · ${e.title||'Rendez-vous'}`);
  });
  return rows;
}
function adminLibraryMatches(c){
  if(adminLibraryFamily==='Audio'){
    if(c.type!=='Audio')return false;
    if(adminAudioKind==='chants')return c.category==='Chants audio';
    if(adminAudioKind==='spoken')return c.category!=='Chants audio';
    return true;
  }
  if(adminLibraryFamily==='Vidéo')return c.type==='Vidéo';
  if(adminLibraryFamily==='Texte')return c.type==='Texte';
  if(adminLibraryFamily==='Image')return c.type==='Image';
  return false;
}
function adminLibraryCard(c){
  const metas=adminContentEventMeta(c.id);
  const label=c.type==='Audio'?(c.category==='Chants audio'?'Chant':'Autre audio'):c.type;
  return `<article class="resource-card"><div class="resource-type">${esc(label)}</div><h3>${esc(c.name)}</h3>${c.description?`<p class="muted">${esc(c.description)}</p>`:''}${metas.length?`<div class="meta" style="font-size:.78rem;margin:8px 0">${metas.map(esc).join('<br>')}</div>`:''}<div class="actions"><button class="btn small primary" onclick="editContent(${c.id})">Modifier</button><button class="btn small danger" onclick="removeContent(${c.id})">Supprimer</button></div></article>`;
}
function renderAdminLibraryList(){
  const box=document.getElementById('adminLibraryList');if(!box)return;
  const list=state.contents.filter(adminLibraryMatches);
  box.innerHTML=list.length?`<div class="grid3">${list.map(adminLibraryCard).join('')}</div>`:'<div class="notice">Aucun contenu.</div>';
}
function selectAdminLibraryFamily(family){adminLibraryFamily=family;adminAudioKind='all';renderAdminLibraryView()}
function selectAdminAudioKind(kind){adminAudioKind=kind;renderAdminLibraryView()}
function renderAdminLibraryView(){
  const root=document.getElementById('adminLibraryView');if(!root)return;
  const families=[['Audio','Tous les audios'],['Vidéo','Toutes les vidéos'],['Texte','Tous les textes'],['Image','Toutes les images']];
  root.innerHTML=`<div class="filters">${families.map(([v,l])=>`<button class="chip ${adminLibraryFamily===v?'active':''}" onclick="selectAdminLibraryFamily('${v}')">${l}</button>`).join('')}</div>${adminLibraryFamily==='Audio'?`<div class="filters" style="margin-top:10px"><button class="chip ${adminAudioKind==='all'?'active':''}" onclick="selectAdminAudioKind('all')">Tous</button><button class="chip ${adminAudioKind==='chants'?'active':''}" onclick="selectAdminAudioKind('chants')">Chants</button><button class="chip ${adminAudioKind==='spoken'?'active':''}" onclick="selectAdminAudioKind('spoken')">Autres audios</button></div>`:''}<div id="adminLibraryList" style="margin-top:16px"></div>`;
  renderAdminLibraryList();
}

const renderMediaBeforeAdminLibrary=renderMedia;
renderMedia=function(){
  renderMediaBeforeAdminLibrary();
  const existing=document.querySelector('#panel .card.section');
  if(existing)existing.innerHTML='<h2>Bibliothèque</h2><div id="adminLibraryView"></div>';
  renderAdminLibraryView();
};
