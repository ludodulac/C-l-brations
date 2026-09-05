function publicLinkLabel(l){
  const t=String(l?.label||'').toLowerCase();
  if(t.includes('vidéo')||t.includes('video'))return 'Voir la vidéo';
  if(t.includes('audio'))return 'Écouter l’audio';
  if(t.includes('pdf'))return 'Voir le PDF';
  if(t.includes('image'))return 'Voir l’image';
  return 'Voir le lien';
}
const baseEventHtml=eventHtml;
eventHtml=function(e){
  const html=baseEventHtml(e),links=(e.links||[]).filter(l=>l&&l.url);
  if(!links.length)return html;
  const extra=`<div class="resources" style="margin-top:10px">${links.map(l=>`<a class="resource-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(publicLinkLabel(l))}</a>`).join('')}</div>`;
  return html.replace('</div></article>',`${extra}</div></article>`);
};
renderProgram();
