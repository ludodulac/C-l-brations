(function(){
  const PROFILE_KEY='celebrations-public-profile-chosen';
  try{localStorage.removeItem('celebrations-state')}catch(e){}
  try{indexedDB.deleteDatabase('celebrations-media-v1')}catch(e){}
  window.saveState=function(s){
    const profile=s?.profile;
    if(profile==='angel'||profile==='nonangel')localStorage.setItem(PROFILE_KEY,profile);
  };
})();