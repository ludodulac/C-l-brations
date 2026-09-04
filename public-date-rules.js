const FIXED_STEPS_PUBLIC=['Préparation','Mercredi','Jeudi','Vendredi','Samedi','Dimanche','Célébration'];
function publicStepKey(label){return String(label||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
function ensurePublicSteps(c){
  if(!c)return;
  const old=c.days||[],used=new Set();
  c.days=FIXED_STEPS_PUBLIC.map(label=>{
    const wanted=publicStepKey(label);
    let d=old.find(x=>!used.has(x)&&publicStepKey(x.label)===wanted);
    if(!d&&label==='Célébration')d=old.find(x=>!used.has(x)&&publicStepKey(x.label)==='celebration-principale');
    if(d){used.add(d);d.label=label;d.contentIds=Array.isArray(d.contentIds)?d.contentIds:[];return d}
    return {key:`${wanted}-${c.id}`,label,startDate:'',endDate:'',text:'',links:[],contentIds:[]};
  });
}
ensurePublicSteps(current());

function publicDayDate(d){
  if(d.label==='Célébration')return '';
  if(d.label==='Préparation'){
    if(d.startDate&&d.endDate&&d.startDate!==d.endDate)return `${formatDate(d.startDate,{day:'numeric',month:'short'})} – ${formatDate(d.endDate,{day:'numeric',month:'short'})}`;
    return d.startDate?formatDate(d.startDate,{day:'numeric',month:'short'}):'';
  }
  return d.startDate?formatDate(d.startDate,{day:'numeric',month:'short'}):'';
}

dayList=function(){return (current()?.days||[]).map(d=>({key:d.key,label:d.label,short:publicDayDate(d)}))};

dayIntro=function(d){
  const links=(d.links||[]).filter(l=>l.url);
  const contents=(d.contentIds||[]).map(id=>state.contents.find(c=>c.id===id)).filter(Boolean).filter(c=>audienceOk(c.audience));
  const date=publicDayDate(d);
  return `<div class="card" style="margin:8px 0 14px;border-left:5px solid var(--accent)"><h3 style="margin-top:0">${esc(d.label)}</h3>${date?`<div class="meta">${esc(date)}</div>`:''}${d.text?`<p>${esc(d.text).replace(/\n/g,'<br>')}</p>`:''}${links.length?`<div class="resources">${links.map(l=>`<a class="resource-link" href="${esc(l.url)}" target="_blank" rel="noopener">↗ ${esc(l.label||l.url)}</a>`).join('')}</div>`:''}${contents.length?`<div class="resources" style="margin-top:12px">${contents.map(contentButtons).join('')}</div>`:''}</div>`;
};
renderHero();renderProgram();