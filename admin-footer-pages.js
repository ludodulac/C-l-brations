(function(){
  const host=document.getElementById('footerPagesAdmin');if(!host)return;
  const PAGE_DEFS={
    'mentions-legales':{title:'Mentions légales',url:'mentions-legales.html'},
    confidentialite:{title:'Déclaration de confidentialité',url:'confidentialite.html'},
    cookies:{title:'Politique de cookies',url:'cookies.html'}
  };
  let currentSlug=null;
  let pages={};
  let adminSession=false;
  let saving=false;
  let status='';

  async function invoke(action,payload={}){
    if(typeof window.celebrationsAccessInvoke!=='function')return {ok:false,error:'Accès serveur indisponible.'};
    return window.celebrationsAccessInvoke(action,payload);
  }

  async function loadPages(){
    const session=await invoke('admin_session');
    adminSession=!!session.ok;
    if(!adminSession)return;
    const result=await invoke('admin_footer_drafts');
    if(!result.ok)return;
    Object.keys(PAGE_DEFS).forEach(slug=>{
      const rows=(result.drafts||[]).filter(r=>r.slug===slug);
      const active=rows.find(r=>r.is_active)||rows.sort((a,b)=>Number(b.draft_number)-Number(a.draft_number))[0]||null;
      pages[slug]={
        draftNumber:Number(active?.draft_number)||1,
        title:PAGE_DEFS[slug].title,
        text:active?.content||''
      };
    });
  }

  async function saveCurrent(){
    if(!currentSlug||saving)return;
    if(!adminSession){status='Accès administrateur requis.';render();return}
    const text=document.getElementById('footerPageText')?.value||'';
    saving=true;status='Enregistrement…';renderEditorStatus();
    const page=pages[currentSlug]||{draftNumber:1,title:PAGE_DEFS[currentSlug].title,text:''};
    const result=await invoke('admin_publish_footer',{
      slug:currentSlug,
      draft_number:page.draftNumber||1,
      title:PAGE_DEFS[currentSlug].title,
      content:text
    });
    saving=false;
    if(!result.ok){status=`Erreur : ${result.error||'enregistrement impossible'}`;renderEditorStatus();return}
    page.text=text;pages[currentSlug]=page;status='Enregistré';renderEditorStatus();
  }

  function renderEditorStatus(){
    const el=document.getElementById('footerEditorStatus');if(el)el.textContent=status;
    const btn=document.getElementById('saveFooterPage');if(btn){btn.disabled=saving;btn.textContent=saving?'Enregistrement…':'Enregistrer'}
  }

  function openPage(slug){currentSlug=slug;status='';render()}

  function pageRow(slug,def){
    return `<button type="button" class="footer-page-row" data-footer-page="${slug}"><span>${esc(def.title)}</span><span aria-hidden="true">›</span></button>`;
  }

  function render(){
    const rows=Object.entries(PAGE_DEFS).map(([slug,def])=>pageRow(slug,def)).join('');
    const editor=currentSlug?(()=>{
      const def=PAGE_DEFS[currentSlug],page=pages[currentSlug]||{text:''};
      return `<div class="footer-editor-card"><div class="footer-editor-head"><button type="button" class="footer-editor-back" id="footerEditorBack">← Pages</button><h3>${esc(def.title)}</h3><a href="${def.url}" target="_blank" rel="noopener">Voir sur le site</a></div><textarea id="footerPageText" class="footer-page-text" aria-label="Texte de ${esc(def.title)}">${esc(page.text||'')}</textarea><div class="footer-editor-actions"><span id="footerEditorStatus" class="footer-editor-status">${esc(status)}</span><button type="button" class="btn primary" id="saveFooterPage">Enregistrer</button></div></div>`;
    })():'';
    host.innerHTML=`<div class="footer-admin-head"><h2>Pages de bas de page</h2></div>${!adminSession?'<div class="notice">Accès administrateur requis.</div>':''}<div class="footer-page-list ${currentSlug?'is-hidden':''}">${rows}</div>${editor}<div class="admin-footer-links"><span>Copyright © 2023-2026</span><button type="button" data-footer-page="mentions-legales">Mentions légales</button><button type="button" data-footer-page="confidentialite">Déclaration de confidentialité</button><button type="button" data-footer-page="cookies">Politique de cookies</button><button type="button" id="participantsFooterLink">Participants</button></div>`;
    host.querySelectorAll('[data-footer-page]').forEach(el=>el.onclick=()=>openPage(el.dataset.footerPage));
    document.getElementById('footerEditorBack')?.addEventListener('click',()=>{currentSlug=null;status='';render()});
    document.getElementById('saveFooterPage')?.addEventListener('click',saveCurrent);
    document.getElementById('participantsFooterLink')?.addEventListener('click',()=>document.getElementById('participantsAdmin')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }

  (async()=>{if(window.celebrationsAdminReady)await window.celebrationsAdminReady;await loadPages();render()})();
})();