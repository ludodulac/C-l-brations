(function(){
  const CHOICE_KEY='celebrations-public-profile-chosen';
  if(typeof state==='undefined')return;

  function closeGate(){
    document.getElementById('publicProfileGate')?.remove();
    document.body.classList.remove('profile-gate-open');
  }

  function choose(profile){
    state.profile=profile;
    saveState(state);
    localStorage.setItem(CHOICE_KEY,profile);
    closeGate();
    try{renderProgram()}catch(e){}
    try{renderLibrary()}catch(e){}
    if(typeof publicCelebrationOpen!=='undefined'&&publicCelebrationOpen){
      try{openPublicCelebration(state.currentCelebrationId,false)}catch(e){}
    }
  }

  function showGate(){
    if(document.getElementById('publicProfileGate'))return;
    const gate=document.createElement('div');
    gate.id='publicProfileGate';
    gate.className='public-profile-gate';
    gate.innerHTML=`<div class="public-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profileGateTitle"><div class="eyebrow">Bienvenue</div><h2 id="profileGateTitle">Vous êtes…</h2><p>Choisissez votre profil pour afficher les rendez-vous et contenus qui vous concernent.</p><div class="public-profile-actions"><button type="button" class="btn primary" data-profile-choice="angel">Porteur d’Ange</button><button type="button" class="btn" data-profile-choice="nonangel">Non-porteur d’Ange</button></div></div>`;
    document.body.appendChild(gate);
    document.body.classList.add('profile-gate-open');
    gate.querySelectorAll('[data-profile-choice]').forEach(b=>b.onclick=()=>choose(b.dataset.profileChoice));
  }

  const saved=localStorage.getItem(CHOICE_KEY);
  if(saved==='angel'||saved==='nonangel'){
    if(state.profile!==saved){state.profile=saved;saveState(state)}
  }else{
    state.profile='all';saveState(state);showGate();
  }
})();