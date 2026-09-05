// Ergonomie de navigation : une nouvelle vue repart en haut ;
// un formulaire intégré se place lui-même dans la zone visible.
function adminTop(smooth=true){
  requestAnimationFrame(()=>window.scrollTo({top:0,behavior:smooth?'smooth':'auto'}));
}
function adminFocus(id){
  requestAnimationFrame(()=>{
    const el=document.getElementById(id);
    if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  });
}

const uxSetTab=setTab;
setTab=function(t){uxSetTab(t);adminTop()};

const uxEditDay=editDay;
editDay=function(key){uxEditDay(key);adminTop()};

const uxEditContent=editContent;
editContent=function(id){uxEditContent(id);adminTop()};

const uxShowDayEventForm=showDayEventForm;
showDayEventForm=function(dayKey,eventId=null){uxShowDayEventForm(dayKey,eventId);adminFocus('dayEventForm')};

const uxRenderInlineContentCreator=renderInlineContentCreator;
renderInlineContentCreator=function(targetId,onCreated){uxRenderInlineContentCreator(targetId,onCreated);adminFocus(targetId)};
