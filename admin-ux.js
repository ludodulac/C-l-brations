// Ergonomie de navigation : une nouvelle vue repart en haut ;
// un formulaire intégré se place lui-même dans la zone visible.
function adminTop(smooth=true){
  requestAnimationFrame(()=>window.scrollTo({top:0,behavior:smooth?'smooth':'auto'}));
}
function adminFocus(id){
  requestAnimationFrame(()=>{
    const el=document.getElementById(id);
    if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  });
}

const uxSetTab=setTab;
setTab=function(t){uxSetTab(t);adminTop()};

const uxEditDay=editDay;
editDay=function(key){uxEditDay(key);adminTop()};

const uxEditContent=editContent;
editContent=function(id){uxEditContent(id);adminTop()};

const uxShowDayEventForm=showDayEventForm;
showDayEventForm=function(dayKey,eventId=null){
  uxShowDayEventForm(dayKey,eventId);
  const target=document.getElementById('dayEventForm');
  const grid=target?.querySelector('.check-grid');
  const heading=grid?.previousElementSibling;
  if(grid){
    grid.hidden=true;
    const button=document.createElement('button');
    button.type='button';
    button.className='btn small';
    button.textContent='Associer un contenu existant';
    button.setAttribute('aria-expanded','false');
    button.onclick=()=>{
      grid.hidden=!grid.hidden;
      button.setAttribute('aria-expanded',String(!grid.hidden));
      if(!grid.hidden)grid.scrollIntoView({behavior:'smooth',block:'nearest'});
    };
    if(heading){heading.replaceWith(button)}else{grid.before(button)}
  }
  adminFocus('dayEventForm');
};

const uxRenderInlineContentCreator=renderInlineContentCreator;
renderInlineContentCreator=function(targetId,onCreated){uxRenderInlineContentCreator(targetId,onCreated);adminFocus(targetId)};

// Navigation directe : les étapes fixes s'ouvrent en cliquant sur toute la ligne.
// Elles font partie de la structure de la célébration : aucun bouton de suppression ici.
dayCard=function(d){
  const c=selected();
  const events=state.events.filter(e=>e.celebrationId===c.id&&e.dayKey===d.key);
  return `<div class="admin-row admin-clickable" role="button" tabindex="0" onclick="editDay('${d.key}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();editDay('${d.key}')}"><div><strong>${esc(d.label)}</strong><div class="meta">${esc(dayDateLabel(d))} · ${events.length} rendez-vous</div></div></div>`;
};

// Le toast historique est conservé comme point unique de retour utilisateur,
// mais son rendu devient un vrai état d'interface : erreur très visible ou succès confirmé.
const adminToast=document.getElementById('toast');
if(adminToast){
  adminToast.setAttribute('role','status');
  adminToast.setAttribute('aria-live','polite');
  const errorWords=/indiquez|choisissez|saisissez|doit|gardez|existe déjà|attention|impossible|erreur/i;
  const successWords=/enregistr|ajout|modifi|associ|retir|supprim|conserv/i;
  const toastObserver=new MutationObserver(()=>{
    const raw=adminToast.textContent.trim();
    if(!raw)return;
    const isError=errorWords.test(raw);
    adminToast.classList.toggle('error',isError);
    adminToast.classList.toggle('success',!isError&&successWords.test(raw));
    if(isError){
      adminToast.setAttribute('role','alert');
      const clean=raw.replace(/^attention\s*[—:-]?\s*/i,'');
      if(/^indiquez un titre$/i.test(clean))adminToast.textContent='Attention — ajoutez un titre';
      else if(/^choisissez un fichier$/i.test(clean))adminToast.textContent='Attention — choisissez un fichier';
      else if(/^indiquez un lien$/i.test(clean))adminToast.textContent='Attention — ajoutez un lien';
      else if(!/^attention/i.test(raw))adminToast.textContent='Attention — '+clean.charAt(0).toLowerCase()+clean.slice(1);
    }else{
      adminToast.setAttribute('role','status');
      if(successWords.test(raw)&&!raw.startsWith('✓'))adminToast.textContent='✓ '+raw;
    }
  });
  toastObserver.observe(adminToast,{childList:true,characterData:true,subtree:true});
}
