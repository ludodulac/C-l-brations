// Mode public actuel : accès universel, sans profil ni inscription.
// Les anciennes capacités de profils/participants restent dans le dépôt et peuvent être réactivées ultérieurement.
window.CELEBRATIONS_PUBLIC_MODE='universal';
try{state.profile='all';saveState(state)}catch(e){}
if(typeof audienceOk==='function')audienceOk=function(){return true};
