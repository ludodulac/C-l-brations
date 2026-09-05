(function(){
  const CHOICE_KEY='celebrations-public-profile-chosen';
  const TOKEN_KEY='celebrations-participant-token';
  const sb=window.celebrationsSupabase||null;
  if(typeof state==='undefined')return;

  const QUESTIONS={
    first_school:'Quel était le nom de votre premier établissement scolaire dont vous vous souvenez ?',
    memorable_teacher:'Quel était le prénom d’un enseignant dont vous vous souvenez particulièrement ?',
    childhood_book:'Quel livre aimiez-vous particulièrement quand vous étiez plus jeune ?',
    childhood_game:'Quel jeu aimiez-vous particulièrement quand vous étiez plus jeune ?',
    memorable_trip_city:'Dans quelle ville avez-vous fait un voyage dont vous vous souvenez particulièrement ?',
    dream_destination:'Quel lieu rêviez-vous de visiter quand vous étiez plus jeune ?',
    fictional_character:'Quel personnage fictif aimiez-vous particulièrement quand vous étiez plus jeune ?',
    favorite_childhood_dish:'Quel plat aimiez-vous particulièrement quand vous étiez plus jeune ?'
  };
  let selectedProfile=localStorage.getItem(CHOICE_KEY)||'';
  let currentEmail='';

  async function invoke(action,payload={}){
    if(!sb)return {ok:false,error:'Connexion au serveur indisponible.'};
    const {data,error}=await sb.functions.invoke('celebrations-access',{body:{action,...payload}});
    if(error)return {ok:false,error:data?.error||error.message||'Erreur serveur.'};
    return data||{ok:false,error:'Réponse serveur invalide.'};
  }

  function closeGate(){
    document.getElementById('publicProfileGate')?.remove();
    document.body.classList.remove('profile-gate-open');
  }

  function applyProfile(profile){
    selectedProfile=profile;
    state.profile=profile;
    saveState(state);
    localStorage.setItem(CHOICE_KEY,profile);
    try{renderProgram()}catch(e){}
    try{renderLibrary()}catch(e){}
    if(typeof publicCelebrationOpen!=='undefined'&&publicCelebrationOpen){
      try{openPublicCelebration(state.currentCelebrationId,false)}catch(e){}
    }
  }

  function gate(){
    let el=document.getElementById('publicProfileGate');
    if(!el){el=document.createElement('div');el.id='publicProfileGate';el.className='public-profile-gate';document.body.appendChild(el)}
    document.body.classList.add('profile-gate-open');
    return el;
  }

  function shell(inner){
    gate().innerHTML=`<div class="public-profile-dialog" role="dialog" aria-modal="true">${inner}<div class="public-admin-entry"><a href="admin.html">Administration</a></div></div>`;
  }

  function showMessage(text,type='error'){
    const box=document.getElementById('profileGateMessage');if(!box)return;
    box.className=`profile-gate-message ${type}`;box.textContent=text||'';
  }

  function showLoading(){
    shell(`<div class="eyebrow">Bienvenue</div><h2>Vérification de l’accès…</h2><p>Un instant, nous vérifions si cet appareil possède déjà un accès participant.</p>`);
  }

  function showProfileChoice(){
    shell(`<div class="eyebrow">Bienvenue</div><h2>Vous êtes…</h2><p>Choisissez votre profil avant de vous connecter.</p><div class="public-profile-actions"><button type="button" class="btn primary" data-profile-choice="angel">Porteur d’Ange</button><button type="button" class="btn" data-profile-choice="nonangel">Non-porteur d’Ange</button></div>`);
    gate().querySelectorAll('[data-profile-choice]').forEach(b=>b.onclick=()=>{applyProfile(b.dataset.profileChoice);showEmailStep()});
  }

  function showEmailStep(){
    shell(`<div class="eyebrow">Accès participant</div><h2>Votre adresse e-mail</h2><p>Utilisez l’adresse e-mail donnée lors du paiement de la célébration.</p><form id="participantEmailForm" class="profile-gate-form"><label class="field"><span>Adresse e-mail</span><input id="participantEmail" type="email" autocomplete="username" required value="${esc(currentEmail)}"></label><div id="profileGateMessage" class="profile-gate-message"></div><button type="submit" class="btn primary">Continuer</button></form><button type="button" class="profile-gate-link" id="forgotPassword">Mot de passe oublié ?</button>${selectedProfile?'<button type="button" class="profile-gate-link" id="changeProfile">Changer de profil</button>':''}`);
    document.getElementById('participantEmailForm').onsubmit=async e=>{
      e.preventDefault();currentEmail=document.getElementById('participantEmail').value.trim().toLowerCase();
      const btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Vérification…';
      const result=await invoke('participant_status',{email:currentEmail});
      if(!result.ok){showMessage(result.error||'Vérification impossible.');btn.disabled=false;btn.textContent='Continuer';return}
      if(!result.authorized){showMessage('Cette adresse n’est pas encore autorisée. Vérifiez l’adresse utilisée lors du paiement ou contactez l’administrateur.');btn.disabled=false;btn.textContent='Continuer';return}
      result.registered?showLogin():showRegistration();
    };
    document.getElementById('forgotPassword').onclick=()=>showRecoveryEmail();
    document.getElementById('changeProfile')?.addEventListener('click',showProfileChoice);
  }

  function showLogin(message=''){
    shell(`<div class="eyebrow">Accès participant</div><h2>Connexion</h2><p>${esc(currentEmail)}</p><form id="participantLoginForm" class="profile-gate-form"><label class="field"><span>Mot de passe</span><input id="participantPassword" type="password" autocomplete="current-password" required></label><div id="profileGateMessage" class="profile-gate-message ${message?'success':''}">${esc(message)}</div><button type="submit" class="btn primary">Entrer</button></form><button type="button" class="profile-gate-link" id="forgotPassword">Mot de passe oublié ?</button><button type="button" class="profile-gate-link" id="backToEmail">Changer d’adresse e-mail</button>`);
    document.getElementById('participantLoginForm').onsubmit=async e=>{
      e.preventDefault();const password=document.getElementById('participantPassword').value;
      const btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Connexion…';
      const result=await invoke('participant_login',{email:currentEmail,password});
      if(!result.ok||!result.token){showMessage(result.error||'Connexion impossible.');btn.disabled=false;btn.textContent='Entrer';return}
      localStorage.setItem(TOKEN_KEY,result.token);closeGate();
    };
    document.getElementById('forgotPassword').onclick=()=>showRecoveryQuestions(currentEmail);
    document.getElementById('backToEmail').onclick=showEmailStep;
  }

  function questionOptions(selected=''){
    return `<option value="">Choisissez une question</option>`+Object.entries(QUESTIONS).map(([id,label])=>`<option value="${id}" ${id===selected?'selected':''}>${esc(label)}</option>`).join('');
  }

  function showRegistration(){
    shell(`<div class="eyebrow">Première connexion</div><h2>Créez votre accès</h2><p>${esc(currentEmail)}</p><form id="participantRegisterForm" class="profile-gate-form"><label class="field"><span>Choisissez un mot de passe</span><input id="newParticipantPassword" type="password" autocomplete="new-password" minlength="8" required></label><label class="field"><span>Confirmez le mot de passe</span><input id="confirmParticipantPassword" type="password" autocomplete="new-password" minlength="8" required></label><div class="profile-security-intro">Choisissez deux questions différentes. Aucune question liée à votre famille ou à un proche n’est imposée.</div><label class="field"><span>Question de récupération 1</span><select id="securityQuestion1" required>${questionOptions()}</select></label><label class="field"><span>Votre réponse</span><input id="securityAnswer1" autocomplete="off" required></label><label class="field"><span>Question de récupération 2</span><select id="securityQuestion2" required>${questionOptions()}</select></label><label class="field"><span>Votre réponse</span><input id="securityAnswer2" autocomplete="off" required></label><div id="profileGateMessage" class="profile-gate-message"></div><button type="submit" class="btn primary">Créer mon accès</button></form><button type="button" class="profile-gate-link" id="backToEmail">Retour</button>`);
    document.getElementById('participantRegisterForm').onsubmit=async e=>{
      e.preventDefault();const password=document.getElementById('newParticipantPassword').value,confirmPassword=document.getElementById('confirmParticipantPassword').value;
      const q1=document.getElementById('securityQuestion1').value,q2=document.getElementById('securityQuestion2').value;
      if(password!==confirmPassword){showMessage('Les deux mots de passe ne correspondent pas.');return}
      if(q1===q2){showMessage('Choisissez deux questions différentes.');return}
      const btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Création…';
      const result=await invoke('participant_register',{email:currentEmail,password,question_1:q1,answer_1:document.getElementById('securityAnswer1').value,question_2:q2,answer_2:document.getElementById('securityAnswer2').value});
      if(!result.ok){showMessage(result.error||'Création impossible.');btn.disabled=false;btn.textContent='Créer mon accès';return}
      const login=await invoke('participant_login',{email:currentEmail,password});
      if(login.ok&&login.token){localStorage.setItem(TOKEN_KEY,login.token);closeGate();return}
      showLogin('Votre accès a été créé. Connectez-vous avec votre nouveau mot de passe.');
    };
    document.getElementById('backToEmail').onclick=showEmailStep;
  }

  function showRecoveryEmail(){
    shell(`<div class="eyebrow">Récupération</div><h2>Retrouver l’accès</h2><p>Indiquez l’adresse e-mail utilisée pour votre participation.</p><form id="recoveryEmailForm" class="profile-gate-form"><label class="field"><span>Adresse e-mail</span><input id="recoveryEmail" type="email" autocomplete="username" required value="${esc(currentEmail)}"></label><div id="profileGateMessage" class="profile-gate-message"></div><button type="submit" class="btn primary">Continuer</button></form><button type="button" class="profile-gate-link" id="backToEmail">Retour</button>`);
    document.getElementById('recoveryEmailForm').onsubmit=e=>{e.preventDefault();currentEmail=document.getElementById('recoveryEmail').value.trim().toLowerCase();showRecoveryQuestions(currentEmail)};
    document.getElementById('backToEmail').onclick=showEmailStep;
  }

  async function showRecoveryQuestions(email){
    currentEmail=email;
    shell(`<div class="eyebrow">Récupération</div><h2>Chargement des questions…</h2><p>${esc(email)}</p>`);
    const result=await invoke('recovery_questions',{email});
    if(!result.ok){showRecoveryEmail();setTimeout(()=>showMessage(result.error||'Récupération impossible.'),0);return}
    const q1=QUESTIONS[result.question_1]||'Question 1',q2=QUESTIONS[result.question_2]||'Question 2';
    shell(`<div class="eyebrow">Récupération</div><h2>Répondez à vos deux questions</h2><p>${esc(currentEmail)}</p><form id="recoverPasswordForm" class="profile-gate-form"><label class="field"><span>${esc(q1)}</span><input id="recoveryAnswer1" autocomplete="off" required></label><label class="field"><span>${esc(q2)}</span><input id="recoveryAnswer2" autocomplete="off" required></label><label class="field"><span>Nouveau mot de passe</span><input id="recoveryNewPassword" type="password" autocomplete="new-password" minlength="8" required></label><label class="field"><span>Confirmez le nouveau mot de passe</span><input id="recoveryConfirmPassword" type="password" autocomplete="new-password" minlength="8" required></label><div id="profileGateMessage" class="profile-gate-message"></div><button type="submit" class="btn primary">Changer mon mot de passe</button></form><button type="button" class="profile-gate-link" id="backToEmail">Retour</button>`);
    document.getElementById('recoverPasswordForm').onsubmit=async e=>{
      e.preventDefault();const np=document.getElementById('recoveryNewPassword').value,cp=document.getElementById('recoveryConfirmPassword').value;
      if(np!==cp){showMessage('Les deux mots de passe ne correspondent pas.');return}
      const btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Vérification…';
      const recovery=await invoke('recover_password',{email:currentEmail,answer_1:document.getElementById('recoveryAnswer1').value,answer_2:document.getElementById('recoveryAnswer2').value,new_password:np});
      if(!recovery.ok){showMessage(recovery.error||'Récupération impossible.');btn.disabled=false;btn.textContent='Changer mon mot de passe';return}
      showLogin('Votre mot de passe a été remplacé.');
    };
    document.getElementById('backToEmail').onclick=showEmailStep;
  }

  (async()=>{
    showLoading();
    const token=localStorage.getItem(TOKEN_KEY)||'';
    if(token){
      const session=await invoke('participant_session',{participant_token:token});
      if(session.ok){
        if(selectedProfile==='angel'||selectedProfile==='nonangel')applyProfile(selectedProfile);else{showProfileChoice();return}
        closeGate();return;
      }
      localStorage.removeItem(TOKEN_KEY);
    }
    if(selectedProfile==='angel'||selectedProfile==='nonangel')showEmailStep();else showProfileChoice();
  })();
})();