const baseEventHtml=eventHtml;
eventHtml=function(e){
  const html=baseEventHtml(e),links=(e.links||[]).filter(l=>l&&l.url);
  if(!links.length)return html;
  const extra=`<div class="resources" style="margin-top:10px">${links.map(l=>`<a class="resource-link" href="${esc(l.url)}" target="_blank" rel="noopener">↗ ${esc(l.label||l.url)}</a>`).join('')}</div>`;
  return html.replace('</div></article>',`${extra}</div></article>`);
};
renderProgram();
