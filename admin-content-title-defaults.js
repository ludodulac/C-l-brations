(function(){
  function fileBaseName(file){
    const name=String(file?.name||'').trim();
    return name||'';
  }
  function inlineCard(el){return el?.closest?.('.card')||null}
  function inlineTitle(card){return card?.querySelector?.('[data-f="title"]')||null}
  function inlineType(card){return card?.querySelector?.('[data-f="type"]')?.value||''}
  function globalTitle(){return document.getElementById('mTitle')}
  function globalType(){return document.querySelector('.type-card.active')?.dataset.type||''}
  function fillFromFile(input){
    const file=input?.files?.[0];if(!file)return;
    const card=inlineCard(input),title=inlineTitle(card)||globalTitle();
    if(title&&!title.value.trim())title.value=fileBaseName(file);
  }
  function ensureTitleBeforeSave(button){
    const card=inlineCard(button),inline=button.matches('[data-a="save"]')&&card?.querySelector('[data-f="type"]');
    const type=inline?inlineType(card):globalType();
    const title=inline?inlineTitle(card):globalTitle();
    if(!title||title.value.trim())return;
    if(type==='Lien')return;
    const scope=inline?card:document.getElementById('mediaForm');
    const file=scope?.querySelector('input[type="file"][data-f="file"],#mFile,input[type="file"]:not([data-f="cover"]):not(#mCover)')?.files?.[0];
    title.value=fileBaseName(file)||(type||'Contenu');
  }
  document.addEventListener('change',e=>{
    const input=e.target;if(!(input instanceof HTMLInputElement)||input.type!=='file')return;
    if(input.matches('[data-f="cover"],#mCover'))return;
    fillFromFile(input);
  },true);
  document.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.matches('[data-a="save"]'))ensureTitleBeforeSave(button);
    else if(button.closest('#mediaForm')&&button.classList.contains('primary'))ensureTitleBeforeSave(button);
  },true);
})();
