(function(){
  const sb=window.celebrationsSupabase||null;
  const PREF_KEY='celebrations-admin-preferences';
  let coreReady=false,syncing=false,pending=null;

  function preferences(){try{return JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}catch(e){return {}}}
  function savePreferences(s){localStorage.setItem(PREF_KEY,JSON.stringify({adminCelebrationId:s.adminCelebrationId||null}))}
  function snapshot(s){return {celebrations:JSON.parse(JSON.stringify(s.celebrations||[])),events:JSON.parse(JSON.stringify(s.events||[]))}}

  async function invoke(payload){
    if(!sb)return {ok:false,error:'Connexion Supabase indisponible.'};
    const adminToken=window.getCelebrationsAdminToken?.()||'';
    const {data,error}=await sb.functions.invoke('celebrations-admin-data',{body:{...payload,admin_token:adminToken}});
    if(error)return {ok:false,error:data?.error||error.message||'Enregistrement Supabase impossible.'};
    return data||{ok:false,error:'Réponse Supabase invalide.'};
  }

  async function flush(){
    if(syncing)return;
    syncing=true;
    while(pending){
      const data=pending;pending=null;
      window.celebrationsCoreSyncStatus='saving';
      const result=await invoke({action:'replace_core',...data});
      if(!result.ok){
        window.celebrationsCoreSyncStatus='error';
        console.error('Synchronisation Supabase',result.error);
        try{toast(result.error||'Enregistrement Supabase impossible')}catch(e){}
        pending=data;
        break;
      }
      window.celebrationsCoreSyncStatus='saved';
      window.dispatchEvent(new CustomEvent('celebrations-core-saved'));
    }
    syncing=false;
  }

  window.saveState=function(s){
    savePreferences(s);
    if(!coreReady)return;
    pending=snapshot(s);
    flush();
  };
  window.celebrationsFlushCore=async()=>{pending=snapshot(state);await flush()};

  async function boot(){
    if(window.celebrationsAdminReady)await window.celebrationsAdminReady;
    if(typeof loadStateFromSupabase!=='function')return;
    try{
      const fresh=await loadStateFromSupabase();
      const pref=preferences();
      if(pref.adminCelebrationId&&fresh.celebrations.some(c=>c.id===Number(pref.adminCelebrationId)))fresh.adminCelebrationId=Number(pref.adminCelebrationId);
      Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,fresh);
      if(typeof ensureFixedSteps==='function')state.celebrations.forEach(ensureFixedSteps);
      coreReady=true;
      localStorage.removeItem('celebrations-state');
      window.celebrationsCoreSyncStatus='saved';
      render();
      window.dispatchEvent(new CustomEvent('celebrations-core-ready'));
    }catch(e){
      console.error('Chargement Supabase administration',e);
      window.celebrationsCoreSyncStatus='error';
      const p=document.getElementById('panel');if(p)p.innerHTML='<div class="notice">Impossible de charger les données Supabase. Aucune modification locale ne sera utilisée comme source.</div>';
    }
  }
  boot();
})();