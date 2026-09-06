(function(){
  const ADMIN_TOKEN_KEY='celebrations-admin-token';
  const PARTICIPANT_TOKEN_KEY='celebrations-participant-token';
  const PROFILE_KEY='celebrations-public-profile-chosen';
  const TEST_BACKUP_TOKEN='celebrations-test-backup-participant-token';
  const TEST_BACKUP_PROFILE='celebrations-test-backup-profile';
  const testMode=new URLSearchParams(location.search).get('participant-test')==='1';
  const sb=window.celebrationsSupabase||null;

  if(testMode){
    if(!sessionStorage.getItem(TEST_BACKUP_TOKEN))sessionStorage.setItem(TEST_BACKUP_TOKEN,localStorage.getItem(PARTICIPANT_TOKEN_KEY)||'');
    if(!sessionStorage.getItem(TEST_BACKUP_PROFILE))sessionStorage.setItem(TEST_BACKUP_PROFILE,localStorage.getItem(PROFILE_KEY)||'');
    localStorage.removeItem(PARTICIPANT_TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    window.CELEBRATIONS_PARTICIPANT_TEST=true;
    const showBanner=()=>{
      if(document.getElementById('participantTestBanner'))return;
      const b=document.createElement('div');
      b.id='participantTestBanner';
      b.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:10001;background:#172033;color:#fff;padding:8px 12px;border-radius:999px;font:600 13px system-ui;box-shadow:0 8px 28px rgba(0,0,0,.18);white-space:nowrap';
      b.innerHTML='Mode test participant · <button type="button" id="quitParticipantTest" style="border:0;background:transparent;color:#fff;text-decoration:underline;cursor:pointer;font:inherit;padding:0">Quitter le test</button>';
      document.body.appendChild(b);
      document.getElementById('quitParticipantTest').onclick=()=>{
        const token=sessionStorage.getItem(TEST_BACKUP_TOKEN)||'';
        const profile=sessionStorage.getItem(TEST_BACKUP_PROFILE)||'';
        if(token)localStorage.setItem(PARTICIPANT_TOKEN_KEY,token);else localStorage.removeItem(PARTICIPANT_TOKEN_KEY);
        if(profile)localStorage.setItem(PROFILE_KEY,profile);else localStorage.removeItem(PROFILE_KEY);
        sessionStorage.removeItem(TEST_BACKUP_TOKEN);sessionStorage.removeItem(TEST_BACKUP_PROFILE);
        location.href='admin.html';
      };
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showBanner);else showBanner();
    return;
  }

  const adminToken=sessionStorage.getItem(ADMIN_TOKEN_KEY)||'';
  if(!adminToken||!sb)return;
  document.body.classList.add('admin-public-bypass-pending');
  const style=document.createElement('style');
  style.id='adminPublicBypassStyle';
  style.textContent='body.admin-public-bypass-pending .public-profile-gate{display:none!important}';
  document.head.appendChild(style);

  (async()=>{
    const {data,error}=await sb.functions.invoke('celebrations-access',{body:{action:'admin_session',admin_token:adminToken}});
    if(!error&&data?.ok){
      document.getElementById('publicProfileGate')?.remove();
      document.body.classList.remove('profile-gate-open');
    }
    document.body.classList.remove('admin-public-bypass-pending');
    document.getElementById('adminPublicBypassStyle')?.remove();
  })();
})();