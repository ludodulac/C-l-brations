function footerPageEsc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function footerPageHtml(text){
  return String(text||'').split(/\n/).map(line=>{
    const s=line.trim();
    if(!s)return '<div class="legal-space"></div>';
    if(s.startsWith('## '))return `<h2>${footerPageEsc(s.slice(3))}</h2>`;
    if(s.startsWith('# '))return `<h1>${footerPageEsc(s.slice(2))}</h1>`;
    const isHint=s.startsWith('[')&&s.endsWith(']');
    return `<p${isHint?' class="legal-hint"':''}>${footerPageEsc(s)}</p>`;
  }).join('');
}
(function(){
  const slug=document.body.dataset.legalPage;
  const def=FOOTER_PAGE_DEFS[slug];
  const data=loadFooterPagesState();
  const draft=getActiveFooterPageDraft(data,slug);
  document.title=`${def?.title||'Informations'} — Célébrations des Archanges`;
  const title=document.getElementById('legalTitle');if(title)title.textContent=def?.title||'Informations';
  const target=document.getElementById('legalContent');
  if(target)target.innerHTML=draft?.saved?footerPageHtml(draft.text):'<div class="legal-empty"><h2>Page en préparation</h2><p>Cette page sera publiée dès qu’un brouillon aura été validé dans l’administration.</p></div>';
})();