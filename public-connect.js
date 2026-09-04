const oldDayIntro=dayIntro;
dayIntro=function(d){
  const base=oldDayIntro(d);
  const contents=(d.contentIds||[]).map(id=>state.contents.find(c=>c.id===id)).filter(Boolean).filter(c=>audienceOk(c.audience));
  if(!contents.length)return base;
  return base.replace('</div>',`<div class="resources" style="margin-top:12px">${contents.map(contentButtons).join('')}</div></div>`);
};
renderProgram();