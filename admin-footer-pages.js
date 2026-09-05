(function(){
  const host=document.getElementById('footerPagesAdmin');if(!host)return;
  let data=loadFooterPagesState();
  let currentSlug='mentions-legales';
  let currentDraftId=data.pages[currentSlug].drafts[0].id;
  const publicUrl=slug=>slug==='mentions-legales'?'mentions-legales.html':slug==='confidentialite'?'confidentialite.html':'cookies.html';
  const fmt=v=>v?new Date(v).toLocaleString('fr-FR'):'Jamais enregistré';

  function selectDraft(slug,id){currentSlug=slug;currentDraftId=id;render()}
  function createDraft(){
    const p=data.pages[currentSlug],n=p.nextNumber||1;
    const id=Date.now();
    p.drafts.push({id,number:n,title:`Brouillon ${n}`,text:FOOTER_PAGE_DEFS[currentSlug].template,saved:false,updatedAt:null});
    p.nextNumber=n+1;currentDraftId=id;saveFooterPagesState(data);render();
  }
  function saveDraft(){
    const p=data.pages[currentSlug],d=getFooterPageDraft(data,currentSlug,currentDraftId);if(!d)return;
    const text=document.getElementById('footerDraftText')?.value||'';
    d.text=text;d.saved=true;d.updatedAt=new Date().toISOString();p.activeId=d.id;
    saveFooterPagesState(data);render();
    const note=document.getElementById('footerDraftSaved');if(note){note.textContent=`${d.title} enregistré et utilisé pour l’aperçu public.`;note.hidden=false}
  }
  function render(){
    data=loadFooterPagesState();
    const p=data.pages[currentSlug],def=FOOTER_PAGE_DEFS[currentSlug];
    let draft=getFooterPageDraft(data,currentSlug,currentDraftId)||p.drafts[0];currentDraftId=draft.id;
    const tabs=Object.entries(FOOTER_PAGE_DEFS).map(([slug,x])=>`<button type="button" class="btn ${slug===currentSlug?'primary':''}" data-footer-slug="${slug}">${x.title}</button>`).join('');
    const drafts=p.drafts.map(d=>`<div class="admin-row footer-draft-row ${String(d.id)===String(p.activeId)?'selected':''}"><div><strong>${esc(d.title)}</strong><div class="meta">${d.saved?`Enregistré · ${esc(fmt(d.updatedAt))}`:'Nouveau brouillon non enregistré'}${String(d.id)===String(p.activeId)?' · aperçu public':''}</div></div><button type="button" class="btn small" data-edit-footer-draft="${d.id}">Éditer ce brouillon</button></div>`).join('');
    host.innerHTML=`<div class="footer-admin-head"><h2>Rédiger les pages de bas de page</h2><p>Les textes proposés sont des trames à compléter. Les indications entre crochets expliquent ce qui doit être renseigné et peuvent être remplacées, déplacées ou supprimées.</p></div><div class="footer-admin-tabs">${tabs}</div><div class="footer-admin-grid"><div class="footer-draft-list"><div class="section-head"><h3>${esc(def.title)} — brouillons</h3><button type="button" class="btn" id="newFooterDraft">Générer un nouveau brouillon</button></div>${drafts}</div><div class="card footer-draft-editor"><div class="section-head"><div><div class="eyebrow">${esc(def.title)}</div><h3>${esc(draft.title)}</h3></div><a class="btn" href="${publicUrl(currentSlug)}" target="_blank" rel="noopener">Aperçu sur le site</a></div><div class="notice footer-guidance">Complétez les champs entre crochets avec les informations réelles du site. Vérifiez notamment l’identité de l’éditeur et de l’hébergeur, les traitements de données réellement effectués et les traceurs réellement utilisés.</div><label class="field full"><span>Texte du brouillon</span><textarea id="footerDraftText" class="footer-draft-text">${esc(draft.text||'')}</textarea></label><div class="actions"><button type="button" class="btn primary" id="saveFooterDraft">Valider comme brouillon ${draft.number}</button><span class="meta" id="footerDraftSaved" hidden></span></div></div></div><div class="admin-footer-links"><span>Copyright © 2023-2026</span><button type="button" data-footer-slug="mentions-legales">Mentions légales</button><button type="button" data-footer-slug="confidentialite">Déclaration de confidentialité</button><button type="button" data-footer-slug="cookies">Politique de cookies</button></div>`;
    host.querySelectorAll('[data-footer-slug]').forEach(b=>b.onclick=()=>{currentSlug=b.dataset.footerSlug;currentDraftId=data.pages[currentSlug].drafts[0].id;render();host.scrollIntoView({behavior:'smooth',block:'start'})});
    host.querySelectorAll('[data-edit-footer-draft]').forEach(b=>b.onclick=()=>selectDraft(currentSlug,b.dataset.editFooterDraft));
    document.getElementById('newFooterDraft').onclick=createDraft;
    document.getElementById('saveFooterDraft').onclick=saveDraft;
  }
  render();
})();