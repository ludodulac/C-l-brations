(function(){
  const host=document.getElementById('footerPagesAdmin');if(!host)return;
  const sb=window.celebrationsSupabase||null;
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

  async function checkAdmin(){
    adminSession=false;
    if(!sb)return false;
    const {data:{session}}=await sb.auth.getSession();
    if(!session?.user?.id)return false;
    const {data:row,error}=await sb.from('app_admins').select('user_id').eq('user_id',session.user.id).maybeSingle();
    adminSession=!!row&&!error;
    return adminSession;
  }

  async function loadSupabaseDrafts(){
    if(!adminSession||!sb)return;
    const {data:rows,error}=await sb.from('celebrations_footer_drafts').select('id,slug,draft_number,title,content,is_active,updated_at').order('slug').order('draft_number');
    if(error||!rows?.length)return;
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
    if(!adminSession||!sb)return {ok:false,message:'Brouillon enregistré sur cet appareil, mais non publié : connexion administrateur requise.'};
    const now=new Date().toISOString();
    const {error:offError}=await sb.from('celebrations_footer_drafts').update({is_active:false,updated_at:now}).eq('slug',currentSlug).eq('is_active',true);
    if(offError)return {ok:false,message:`Publication impossible : ${offError.message}`};
    const {data:row,error}=await sb.from('celebrations_footer_drafts').upsert({
      slug:currentSlug,
      draft_number:Number(d.number),
      title:d.title||`Brouillon ${d.number}`,
      content:d.text||'',
      is_active:true,
      updated_at:now
    },{onConflict:'slug,draft_number'}).select('id,updated_at').single();
    if(error)return {ok:false,message:`Publication impossible : ${error.message}`};
    if(row?.id){d.id=row.id;currentDraftId=row.id;data.pages[currentSlug].activeId=row.id;d.updatedAt=row.updated_at||now;saveFooterPagesState(data)}
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

  async function loginAdmin(){
    if(!sb){authMessage='Le client Supabase n’est pas chargé.';render();return}
    const email=document.getElementById('footerAdminEmail')?.value.trim();
    const password=document.getElementById('footerAdminPassword')?.value||'';
    if(!email||!password){authMessage='Indiquez l’e-mail et le mot de passe administrateur.';render();return}
    const {error}=await sb.auth.signInWithPassword({email,password});
    if(error){authMessage='Connexion impossible : '+error.message;render();return}
    if(!(await checkAdmin())){
      await sb.auth.signOut();authMessage='Ce compte n’a pas les droits administrateur.';render();return;
    }
    authMessage='Connexion administrateur active. Les brouillons peuvent être publiés dans Supabase.';
    await loadSupabaseDrafts();render();
  }

  async function logoutAdmin(){if(sb)await sb.auth.signOut();adminSession=false;authMessage='Déconnecté de Supabase.';render()}

  function authBlock(){
    if(adminSession)return `<div class="notice" style="margin-bottom:14px"><strong>Publication Supabase active</strong><div class="meta">Les brouillons validés sont enregistrés dans la base et deviennent visibles sur le site.</div><button type="button" class="btn small" id="footerAdminLogout" style="margin-top:8px">Déconnexion</button>${authMessage?`<div class="meta" style="margin-top:8px">${esc(authMessage)}</div>`:''}</div>`;
    return `<div class="notice" style="margin-bottom:14px"><strong>Connexion administrateur requise pour publier</strong><div class="meta">Sans connexion, vous pouvez préparer les textes localement, mais ils ne seront pas publiés aux autres visiteurs.</div><div class="form-grid" style="margin-top:10px"><label class="field"><span>E-mail</span><input id="footerAdminEmail" type="email" autocomplete="username"></label><label class="field"><span>Mot de passe</span><input id="footerAdminPassword" type="password" autocomplete="current-password"></label></div><button type="button" class="btn primary" id="footerAdminLogin" style="margin-top:10px">Se connecter pour publier</button>${authMessage?`<div class="meta" style="margin-top:8px">${esc(authMessage)}</div>`:''}</div>`;
  }

  function render(){
    data=loadFooterPagesState();
    const p=data.pages[currentSlug],def=FOOTER_PAGE_DEFS[currentSlug];
    let draft=getFooterPageDraft(data,currentSlug,currentDraftId)||p.drafts[0];currentDraftId=draft.id;
    const tabs=Object.entries(FOOTER_PAGE_DEFS).map(([slug,x])=>`<button type="button" class="btn ${slug===currentSlug?'primary':''}" data-footer-slug="${slug}">${x.title}</button>`).join('');
    const drafts=p.drafts.map(d=>`<div class="admin-row footer-draft-row ${String(d.id)===String(p.activeId)?'selected':''}"><div><strong>${esc(d.title)}</strong><div class="meta">${d.saved?`Enregistré · ${esc(fmt(d.updatedAt))}`:'Nouveau brouillon non enregistré'}${String(d.id)===String(p.activeId)?' · aperçu public':''}</div></div><button type="button" class="btn small" data-edit-footer-draft="${d.id}">Éditer ce brouillon</button></div>`).join('');
    host.innerHTML=`<div class="footer-admin-head"><h2>Rédiger les pages de bas de page</h2><p>Les textes proposés sont des trames à compléter. Les indications entre crochets expliquent ce qui doit être renseigné et peuvent être remplacées, déplacées ou supprimées.</p></div>${authBlock()}<div class="footer-admin-tabs">${tabs}</div><div class="footer-admin-grid"><div class="footer-draft-list"><div class="section-head"><h3>${esc(def.title)} — brouillons</h3><button type="button" class="btn" id="newFooterDraft">Générer un nouveau brouillon</button></div>${drafts}</div><div class="card footer-draft-editor"><div class="section-head"><div><div class="eyebrow">${esc(def.title)}</div><h3>${esc(draft.title)}</h3></div><a class="btn" href="${publicUrl(currentSlug)}" target="_blank" rel="noopener">Aperçu sur le site</a></div><div class="notice footer-guidance">Complétez les champs entre crochets avec les informations réelles du site. Vérifiez notamment l’identité de l’éditeur et de l’hébergeur, les traitements de données réellement effectués et les traceurs réellement utilisés.</div><label class="field full"><span>Texte du brouillon</span><textarea id="footerDraftText" class="footer-draft-text">${esc(draft.text||'')}</textarea></label><div class="actions"><button type="button" class="btn primary" id="saveFooterDraft">Valider comme brouillon ${draft.number}</button></div></div></div><div class="admin-footer-links"><span>Copyright © 2023-2026</span><button type="button" data-footer-slug="mentions-legales">Mentions légales</button><button type="button" data-footer-slug="confidentialite">Déclaration de confidentialité</button><button type="button" data-footer-slug="cookies">Politique de cookies</button></div>`;
    host.querySelectorAll('[data-footer-slug]').forEach(b=>b.onclick=()=>{currentSlug=b.dataset.footerSlug;currentDraftId=data.pages[currentSlug].drafts[0].id;render();host.scrollIntoView({behavior:'smooth',block:'start'})});
    host.querySelectorAll('[data-edit-footer-draft]').forEach(b=>b.onclick=()=>selectDraft(currentSlug,b.dataset.editFooterDraft));
    document.getElementById('newFooterDraft').onclick=createDraft;
    document.getElementById('saveFooterDraft').onclick=saveDraft;
    if(document.getElementById('footerAdminLogin'))document.getElementById('footerAdminLogin').onclick=loginAdmin;
    if(document.getElementById('footerAdminLogout'))document.getElementById('footerAdminLogout').onclick=logoutAdmin;
  }

  (async()=>{await checkAdmin();if(adminSession)await loadSupabaseDrafts();render()})();
})();