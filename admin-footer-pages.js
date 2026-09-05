(function(){
  const host=document.getElementById('footerPagesAdmin');if(!host)return;
  let data=loadFooterPagesState();
  let currentSlug='mentions-legales';
  let currentDraftId=data.pages[currentSlug].drafts[0].id;
  let adminSession=false;
  let authMessage='';
  const publicUrl=slug=>slug==='mentions-legales'?'mentions-legales.html':slug==='confidentialite'?'confidentialite.html':'cookies.html';
  const fmt=v=>v?new Date(v).toLocaleString('fr-FR'):'Jamais enregistré';

  function selectDraft(slug,id){currentSlug=slug;currentDraftId=id;render()}
  function createDraft(){
    const p=data.pages[currentSlug],n=p.nextNumber||1;
    const id=Date.now();
    p.drafts.push({id,number:n,title:`Brouillon ${n}`,text:FOOTER_PAGE_DEFS[currentSlug].template,saved:false,updatedAt:null});
    p.nextNumber=n+1;currentDraftId=id;saveFooterPagesState(data);render();
  }

  async function invoke(action,payload={}){
    if(typeof window.celebrationsAccessInvoke!=='function')return {ok:false,error:'Accès serveur indisponible.'};
    return window.celebrationsAccessInvoke(action,payload);
  }

  async function checkAdmin(){
    adminSession=false;
    const result=await invoke('admin_session');
    adminSession=!!result.ok;
    return adminSession;
  }

  async function loadSupabaseDrafts(){
    if(!adminSession)return;
    const result=await invoke('admin_footer_drafts');
    const rows=result.drafts||[];
    if(!result.ok||!rows.length)return;
    Object.keys(FOOTER_PAGE_DEFS).forEach(slug=>{
      const matches=rows.filter(r=>r.slug===slug);
      if(!matches.length)return;
      data.pages[slug]={
        activeId:matches.find(r=>r.is_active)?.id||null,
        nextNumber:Math.max(...matches.map(r=>Number(r.draft_number)||0))+1,
        drafts:matches.map(r=>({id:r.id,number:r.draft_number,title:r.title||`Brouillon ${r.draft_number}`,text:r.content||'',saved:true,updatedAt:r.updated_at||null}))
      };
    });
    saveFooterPagesState(data);
    currentDraftId=data.pages[currentSlug].drafts[0]?.id||currentDraftId;
  }

  async function publishDraftToSupabase(d){
    if(!adminSession)return {ok:false,message:'Brouillon enregistré sur cet appareil, mais non publié : accès administrateur requis.'};
    const result=await invoke('admin_publish_footer',{
      slug:currentSlug,
      draft_number:Number(d.number),
      title:d.title||`Brouillon ${d.number}`,
      content:d.text||''
    });
    if(!result.ok)return {ok:false,message:`Publication impossible : ${result.error||'erreur serveur'}`};
    const row=result.draft;
    if(row?.id){d.id=row.id;currentDraftId=row.id;data.pages[currentSlug].activeId=row.id;d.updatedAt=row.updated_at||new Date().toISOString();saveFooterPagesState(data)}
    return {ok:true,message:`${d.title} enregistré dans Supabase et publié sur le site.`};
  }

  async function saveDraft(){
    const p=data.pages[currentSlug],d=getFooterPageDraft(data,currentSlug,currentDraftId);if(!d)return;
    const text=document.getElementById('footerDraftText')?.value||'';
    d.text=text;d.saved=true;d.updatedAt=new Date().toISOString();p.activeId=d.id;
    saveFooterPagesState(data);
    const result=await publishDraftToSupabase(d);
    authMessage=result.message;
    render();
  }

  function authBlock(){
    if(adminSession)return `<div class="notice" style="margin-bottom:14px"><strong>Publication active</strong><div class="meta">L’administration est déverrouillée avec le mot de passe unique. Aucun e-mail administrateur n’est nécessaire.</div>${authMessage?`<div class="meta" style="margin-top:8px">${esc(authMessage)}</div>`:''}</div>`;
    return `<div class="notice" style="margin-bottom:14px"><strong>Accès administrateur requis</strong><div class="meta">Revenez à l’entrée de l’administration et saisissez le mot de passe administrateur.</div>${authMessage?`<div class="meta" style="margin-top:8px">${esc(authMessage)}</div>`:''}</div>`;
  }

  function render(){
    data=loadFooterPagesState();
    const p=data.pages[currentSlug],def=FOOTER_PAGE_DEFS[currentSlug];
    let draft=getFooterPageDraft(data,currentSlug,currentDraftId)||p.drafts[0];currentDraftId=draft.id;
    const tabs=Object.entries(FOOTER_PAGE_DEFS).map(([slug,x])=>`<button type="button" class="btn ${slug===currentSlug?'primary':''}" data-footer-slug="${slug}">${x.title}</button>`).join('');
    const drafts=p.drafts.map(d=>`<div class="admin-row footer-draft-row ${String(d.id)===String(p.activeId)?'selected':''}"><div><strong>${esc(d.title)}</strong><div class="meta">${d.saved?`Enregistré · ${esc(fmt(d.updatedAt))}`:'Nouveau brouillon non enregistré'}${String(d.id)===String(p.activeId)?' · aperçu public':''}</div></div><button type="button" class="btn small" data-edit-footer-draft="${d.id}">Éditer ce brouillon</button></div>`).join('');
    host.innerHTML=`<div class="footer-admin-head"><h2>Rédiger les pages de bas de page</h2><p>Les textes proposés sont des trames à compléter. Les indications entre crochets expliquent ce qui doit être renseigné et peuvent être remplacées, déplacées ou supprimées.</p></div>${authBlock()}<div class="footer-admin-tabs">${tabs}<button type="button" class="btn participants-tab-link" id="participantsTabLink">Participants</button></div><div class="footer-admin-grid"><div class="footer-draft-list"><div class="section-head"><h3>${esc(def.title)} — brouillons</h3><button type="button" class="btn" id="newFooterDraft">Générer un nouveau brouillon</button></div>${drafts}</div><div class="card footer-draft-editor"><div class="section-head"><div><div class="eyebrow">${esc(def.title)}</div><h3>${esc(draft.title)}</h3></div><a class="btn" href="${publicUrl(currentSlug)}" target="_blank" rel="noopener">Aperçu sur le site</a></div><div class="notice footer-guidance">Complétez les champs entre crochets avec les informations réelles du site. Vérifiez notamment l’identité de l’éditeur et de l’hébergeur, les traitements de données réellement effectués et les traceurs réellement utilisés.</div><label class="field full"><span>Texte du brouillon</span><textarea id="footerDraftText" class="footer-draft-text">${esc(draft.text||'')}</textarea></label><div class="actions"><button type="button" class="btn primary" id="saveFooterDraft">Valider comme brouillon ${draft.number}</button></div></div></div><div class="admin-footer-links"><span>Copyright © 2023-2026</span><button type="button" data-footer-slug="mentions-legales">Mentions légales</button><button type="button" data-footer-slug="confidentialite">Déclaration de confidentialité</button><button type="button" data-footer-slug="cookies">Politique de cookies</button><button type="button" id="participantsFooterLink">Participants</button></div>`;
    host.querySelectorAll('[data-footer-slug]').forEach(b=>b.onclick=()=>{currentSlug=b.dataset.footerSlug;currentDraftId=data.pages[currentSlug].drafts[0].id;render();host.scrollIntoView({behavior:'smooth',block:'start'})});
    host.querySelectorAll('[data-edit-footer-draft]').forEach(b=>b.onclick=()=>selectDraft(currentSlug,b.dataset.editFooterDraft));
    document.getElementById('newFooterDraft').onclick=createDraft;
    document.getElementById('saveFooterDraft').onclick=saveDraft;
    const goParticipants=()=>document.getElementById('participantsAdmin')?.scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('participantsTabLink').onclick=goParticipants;
    document.getElementById('participantsFooterLink').onclick=goParticipants;
  }

  (async()=>{if(window.celebrationsAdminReady)await window.celebrationsAdminReady;await checkAdmin();if(adminSession)await loadSupabaseDrafts();render()})();
})();