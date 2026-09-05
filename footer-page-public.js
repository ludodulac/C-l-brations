function footerPageEsc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]))}
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
(async function(){
  const slug=document.body.dataset.legalPage;
  const def=FOOTER_PAGE_DEFS[slug];
  document.title=`${def?.title||'Informations'} — Célébrations des Archanges`;
  const title=document.getElementById('legalTitle');if(title)title.textContent=def?.title||'Informations';
  const target=document.getElementById('legalContent');if(!target)return;

  let published=null;
  try{
    const url=`https://jwyayfkssyagvnablttg.supabase.co/rest/v1/celebrations_footer_drafts?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=content,title,updated_at&limit=1`;
    const res=await fetch(url,{headers:{apikey:'sb_publishable_qm8yJyH_5LfP-oZ1sz4QLg_r9J5VdnA'}});
    if(res.ok){const rows=await res.json();published=rows?.[0]||null}
  }catch(e){}

  if(published?.content){target.innerHTML=footerPageHtml(published.content);return}

  const data=loadFooterPagesState();
  const draft=getActiveFooterPageDraft(data,slug);
  target.innerHTML=draft?.saved?footerPageHtml(draft.text):'<div class="legal-empty"><h2>Page en préparation</h2><p>Cette page sera publiée dès qu’un brouillon aura été validé dans l’administration.</p></div>';
})();