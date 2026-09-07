(function(){
  const host=document.getElementById('participantsAdmin');if(!host)return;
  const sb=window.celebrationsSupabase||null;
  let participants=[];
  let message='';

  const fmt=v=>v?new Date(v).toLocaleString('fr-FR'):'Pas encore inscrit';
  const audienceLabel=v=>v==='angel'?'Porteur d’Ange':v==='nonangel'?'Non-porteur d’Ange':'Espace à attribuer';
  async function audienceInvoke(action,payload={}){
    if(!sb)return {ok:false,error:'Connexion au serveur indisponible.'};
    const {data,error}=await sb.functions.invoke('celebrations-audience',{body:{action,admin_token:window.getCelebrationsAdminToken?.()||'',...payload}});
    if(error)return {ok:false,error:data?.error||error.message||'Erreur serveur.'};
    return data||{ok:false,error:'Réponse serveur invalide.'};
  }

  async function load(){
    if(window.celebrationsAdminReady)await window.celebrationsAdminReady;
    const [access,audiences]=await Promise.all([window.celebrationsAccessInvoke('admin_list_participants'),audienceInvoke('admin_list')]);
    if(!access.ok){message=access.error||'Impossible de charger les participants.';render();return}
    const byEmail=new Map((audiences.ok?audiences.participants:[]).map(p=>[String(p.email||'').toLowerCase(),p.audience||'']));
    participants=(access.participants||[]).map(p=>({...p,audience:byEmail.get(String(p.email||'').toLowerCase())||''}));
    if(!audiences.ok)message=audiences.error||'Impossible de charger les espaces participants.';
    render();
  }

  async function add(){
    const input=document.getElementById('participantEmail');
    const select=document.getElementById('participantAudience');
    const email=input?.value.trim().toLowerCase()||'';
    const audience=select?.value||'';
    if(!email){message='Indiquez une adresse e-mail.';render();return}
    if(!(audience==='angel'||audience==='nonangel')){message='Choisissez Porteur d’Ange ou Non-porteur d’Ange.';render();return}
    const result=await window.celebrationsAccessInvoke('admin_add_participant',{email});
    if(!result.ok){message=result.error||'Ajout impossible.';render();return}
    const assigned=await audienceInvoke('admin_set',{email,audience});
    message=assigned.ok?`${email} est autorisé dans l’espace « ${audienceLabel(audience)} ».`:(assigned.error||'Adresse autorisée, mais l’espace n’a pas pu être attribué.');
    if(assigned.ok&&input)input.value='';
    await load();
  }

  async function setAudience(email,audience){
    if(!(audience==='angel'||audience==='nonangel'))return;
    const result=await audienceInvoke('admin_set',{email,audience});
    message=result.ok?`${email} est maintenant dans l’espace « ${audienceLabel(audience)} ».`:(result.error||'Modification impossible.');
    await load();
  }

  async function remove(email){
    if(!confirm(`Retirer ${email} ?\n\nCela supprimera aussi son compte participant, son mot de passe, ses questions de récupération et ses sessions. En réautorisant ensuite cette adresse, vous pourrez refaire une vraie première inscription.`))return;
    const result=await window.celebrationsAccessInvoke('admin_remove_participant',{email});
    message=result.ok?`${email} a été retiré et son accès participant a été réinitialisé.`:(result.error||'Suppression impossible.');
    await load();
  }

  function render(){
    host.innerHTML=`<div class="participants-admin-head"><div><div class="eyebrow">Accès au site</div><h2>Participants</h2><p>Chaque participant est rattaché à un seul espace : Porteur d’Ange ou Non-porteur d’Ange.</p></div></div><div class="card participants-add-card"><div class="section-head"><div><h3 style="margin:0">Tester l’entrée participant</h3><div class="meta">Ouvre le parcours de connexion d’un participant.</div></div><a class="btn" href="index.html?participant-test=1">Tester l’entrée participant</a></div></div><div class="card participants-add-card"><div class="form-grid"><label class="field"><span>Adresse e-mail du participant</span><input id="participantEmail" type="email" autocomplete="off" placeholder="exemple@adresse.fr"></label><label class="field"><span>Espace</span><select id="participantAudience"><option value="">Choisir</option><option value="angel">Porteur d’Ange</option><option value="nonangel">Non-porteur d’Ange</option></select></label></div><div class="actions"><button type="button" class="btn primary" id="addParticipant">Autoriser cette adresse</button></div>${message?`<div class="notice participants-message">${esc(message)}</div>`:''}</div><div class="card"><div class="section-head"><h3>Adresses autorisées</h3><span class="badge">${participants.length}</span></div><div class="list">${participants.length?participants.map(p=>`<div class="admin-row"><div><strong>${esc(p.email)}</strong><div class="meta">${p.registered_at?`Compte créé · ${esc(fmt(p.registered_at))}`:'Autorisé · inscription pas encore créée'}</div></div><div class="row-actions"><select class="field" data-participant-audience="${esc(p.email)}" aria-label="Espace de ${esc(p.email)}"><option value="" ${!p.audience?'selected':''} disabled>Attribuer un espace</option><option value="angel" ${p.audience==='angel'?'selected':''}>Porteur d’Ange</option><option value="nonangel" ${p.audience==='nonangel'?'selected':''}>Non-porteur d’Ange</option></select><button type="button" class="btn small danger" data-remove-participant="${esc(p.email)}">Retirer et réinitialiser</button></div></div>`).join(''):'<div class="notice">Aucun participant autorisé pour le moment.</div>'}</div></div>`;
    document.getElementById('addParticipant').onclick=add;
    document.getElementById('participantEmail').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add()}};
    host.querySelectorAll('[data-participant-audience]').forEach(s=>s.onchange=()=>setAudience(s.dataset.participantAudience,s.value));
    host.querySelectorAll('[data-remove-participant]').forEach(b=>b.onclick=()=>remove(b.dataset.removeParticipant));
  }

  load();
})();