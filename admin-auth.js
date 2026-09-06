(function(){
  const TOKEN_KEY='celebrations-admin-token';
  const EMAIL_KEY='celebrations-admin-email';
  const sb=window.celebrationsSupabase||null;
  let resolveReady;
  window.celebrationsAdminReady=new Promise(r=>resolveReady=r);

  window.getCelebrationsAdminToken=()=>localStorage.getItem(TOKEN_KEY)||'';
  window.celebrationsAccessInvoke=async function(action,payload={}){
    if(!sb)return {ok:false,error:'Connexion au serveur indisponible.'};
    const adminToken=window.getCelebrationsAdminToken();
    const {data,error}=await sb.functions.invoke('celebrations-access',{body:{action,...payload,...(action.startsWith('admin_')&&action!=='admin_login'?{admin_token:adminToken}:{})}});
    if(error)return {ok:false,error:data?.error||error.message||'Erreur serveur.'};
    return data||{ok:false,error:'Réponse serveur invalide.'};
  };

  function unlock(email=''){
    if(email)localStorage.setItem(EMAIL_KEY,email);
    document.body.classList.remove('admin-auth-locked');
    document.getElementById('adminPasswordGate')?.remove();
    window.dispatchEvent(new CustomEvent('celebrations-admin-auth-changed',{detail:{authenticated:true,email:email||localStorage.getItem(EMAIL_KEY)||''}}));
    resolveReady?.(true);resolveReady=null;
  }

  function showGate(message=''){
    document.body.classList.add('admin-auth-locked');
    let gate=document.getElementById('adminPasswordGate');
    if(!gate){gate=document.createElement('div');gate.id='adminPasswordGate';gate.className='admin-password-gate';document.body.appendChild(gate)}
    const rememberedEmail=localStorage.getItem(EMAIL_KEY)||'';
    gate.innerHTML=`<form class="admin-password-dialog" id="adminPasswordForm"><div class="eyebrow">Administration</div><h1>Accès administrateur</h1><p>Identifiez cet appareil une seule fois avec votre e-mail et le mot de passe administrateur.</p><label class="field"><span>Adresse e-mail</span><input id="adminGateEmail" type="email" autocomplete="username" required value="${esc(rememberedEmail)}"></label><label class="field"><span>Mot de passe</span><input id="adminGatePassword" type="password" autocomplete="current-password" required></label><button class="btn primary" type="submit">Entrer</button>${message?`<div class="admin-auth-error">${esc(message)}</div>`:''}<a class="admin-gate-back" href="index.html">Retour au site</a></form>`;
    const first=rememberedEmail?document.getElementById('adminGatePassword'):document.getElementById('adminGateEmail');first?.focus();
    document.getElementById('adminPasswordForm').onsubmit=async e=>{
      e.preventDefault();const email=document.getElementById('adminGateEmail').value.trim().toLowerCase(),password=document.getElementById('adminGatePassword').value;
      const btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Vérification…';
      const result=await window.celebrationsAccessInvoke('admin_login',{email,password});
      if(!result.ok||!result.token){showGate(result.error||'Connexion impossible.');return}
      localStorage.setItem(TOKEN_KEY,result.token);localStorage.setItem(EMAIL_KEY,result.email||email);unlock(result.email||email);
    };
  }

  (async()=>{
    const token=window.getCelebrationsAdminToken();
    if(token){
      const result=await window.celebrationsAccessInvoke('admin_session');
      if(result.ok){unlock(result.email||'');return}
      localStorage.removeItem(TOKEN_KEY);
    }
    showGate();
  })();
})();