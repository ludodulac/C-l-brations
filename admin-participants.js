(function(){
  const host=document.getElementById('participantsAdmin');if(!host)return;
  let participants=[];
  let message='';

  const fmt=v=>v?new Date(v).toLocaleString('fr-FR'):'Pas encore inscrit';

  async function load(){
    if(window.celebrationsAdminReady)await window.celebrationsAdminReady;
    const result=await window.celebrationsAccessInvoke('admin_list_participants');
    if(!result.ok){message=result.error||'Impossible de charger les participants.';render();return}
    participants=result.participants||[];render();
  }

  async function add(){
    const input=document.getElementById('participantEmail');
    const email=input?.value.trim().toLowerCase()||'';
    if(!email){message='Indiquez une adresse e-mail.';render();return}
    const result=await window.celebrationsAccessInvoke('admin_add_participant',{email});
    message=result.ok?`${email} est maintenant autorisé à créer son accès.`:(result.error||'Ajout impossible.');
    if(result.ok&&input)input.value='';
    await load();
  }

  async function remove(email){
    if(!confirm(`Retirer ${email} de la liste des participants autorisés ?`))return;
    const result=await window.celebrationsAccessInvoke('admin_remove_participant',{email});
    message=result.ok?`${email} a été retiré.`:(result.error||'Suppression impossible.');
    await load();
  }

  function render(){
    host.innerHTML=`<div class="participants-admin-head"><div><div class="eyebrow">Accès au site</div><h2>Participants</h2><p>Ajoutez ici l’adresse e-mail utilisée lors du paiement. Cette adresse pourra ensuite créer son propre mot de passe à l’entrée du site.</p></div></div><div class="card participants-add-card"><div class="form-grid"><label class="field full"><span>Adresse e-mail du participant</span><input id="participantEmail" type="email" autocomplete="off" placeholder="exemple@adresse.fr"></label></div><div class="actions"><button type="button" class="btn primary" id="addParticipant">Autoriser cette adresse</button></div>${message?`<div class="notice participants-message">${esc(message)}</div>`:''}</div><div class="card"><div class="section-head"><h3>Adresses autorisées</h3><span class="badge">${participants.length}</span></div><div class="list">${participants.length?participants.map(p=>`<div class="admin-row"><div><strong>${esc(p.email)}</strong><div class="meta">${p.registered_at?`Compte créé · ${esc(fmt(p.registered_at))}`:'Autorisé · inscription pas encore créée'}</div></div><button type="button" class="btn small danger" data-remove-participant="${esc(p.email)}">Retirer</button></div>`).join(''):'<div class="notice">Aucun participant autorisé pour le moment.</div>'}</div></div>`;
    document.getElementById('addParticipant').onclick=add;
    document.getElementById('participantEmail').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add()}};
    host.querySelectorAll('[data-remove-participant]').forEach(b=>b.onclick=()=>remove(b.dataset.removeParticipant));
  }

  load();
})();