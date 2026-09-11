(function(){
  const previousRender = render;

  function committeeLinkRow(item){
    const title = esc(item.title || 'Lien sans titre');
    const type = esc(item.type || 'Lien');
    const url = esc(item.url || '');
    const note = item.note ? `<div class="meta">${esc(item.note)}</div>` : '';
    return `<div class="admin-row"><div style="min-width:0"><strong>↗ ${title}</strong><div class="meta">${type}</div>${note}<div class="meta" style="word-break:break-all;margin-top:4px">${url}</div></div><div class="row-actions"><a class="btn" href="${url}" target="_blank" rel="noopener">Ouvrir</a><button class="btn primary" type="button" data-copy-committee-link="${url}">Copier le lien</button></div></div>`;
  }

  window.renderCommitteeLinks = function(){
    const links = Array.isArray(window.COMMITTEE_LINKS) ? window.COMMITTEE_LINKS : [];
    panel.innerHTML = `<div class="card"><div class="eyebrow">Partage</div><h2>Hyperliens lettres comité</h2><p class="muted">Liens prêts à être copiés dans un mail. Les documents pourront être ajoutés ici au fur et à mesure.</p><div class="list">${links.length ? links.map(committeeLinkRow).join('') : '<div class="notice">Aucun hyperlien ajouté pour le moment.</div>'}</div></div>`;
    panel.querySelectorAll('[data-copy-committee-link]').forEach(btn=>{
      btn.onclick = async()=>{
        const url = btn.dataset.copyCommitteeLink || '';
        try{
          await navigator.clipboard.writeText(url);
          toast('Lien copié');
        }catch(e){
          window.prompt('Copiez ce lien :', url);
        }
      };
    });
  };

  render = function(){
    if(tab === 'committee-links') return window.renderCommitteeLinks();
    return previousRender();
  };
})();
