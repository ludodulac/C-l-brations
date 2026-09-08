// Mode actuel : tout le contenu est destiné à tout le monde.
// Les données historiques Porteur / Non-porteur ne sont pas supprimées ; l'interface les masque simplement.
(function(){
  window.CELEBRATIONS_PUBLIC_MODE='universal';
  const forceAll=()=>{
    document.querySelectorAll('#evtGroup,#ecGroup,[data-f="group"],#mGroup').forEach(el=>{el.value='all';const field=el.closest('.field');if(field)field.style.display='none'});
    document.querySelectorAll('.participants-admin').forEach(el=>el.style.display='none');
  };
  new MutationObserver(forceAll).observe(document.body,{childList:true,subtree:true});
  forceAll();
})();
