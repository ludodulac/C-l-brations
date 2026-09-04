const AUDIO_KINDS=['Chants audio','Audios parlés'];
AUDIO_KINDS.forEach(ensureCategory);
saveState(state);

function audioKindField(value='Audios parlés',marker='audioKind'){
  return `<label class="field audio-kind-field"><span>Type d’audio</span><select data-audio-kind="${marker}" required><option value="">Choisir</option>${AUDIO_KINDS.map(x=>`<option value="${x}" ${x===value?'selected':''}>${x}</option>`).join('')}</select></label>`;
}

function installAudioKindFields(root=document){
  root.querySelectorAll('#mediaForm').forEach(form=>{
    const active=document.querySelector('.type-card.active')?.dataset.type;
    if(active==='Audio'&&!form.querySelector('[data-audio-kind=global]'))form.querySelector('.form-grid')?.insertAdjacentHTML('afterbegin',audioKindField('', 'global'));
  });
  root.querySelectorAll('[data-f=type]').forEach(type=>{
    if(type.dataset.audioKindBound)return;type.dataset.audioKindBound='1';
    const sync=()=>{const card=type.closest('.card');if(!card)return;card.querySelector('.audio-kind-field')?.remove();if(type.value==='Audio')type.closest('.form-grid')?.insertAdjacentHTML('beforeend',audioKindField('', 'inline'))};
    type.addEventListener('change',()=>setTimeout(sync,0));sync();
  });
}

const audioObserver=new MutationObserver(()=>installAudioKindFields());
audioObserver.observe(document.getElementById('panel'),{childList:true,subtree:true});
installAudioKindFields();

document.addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  let select=null;
  if(btn.closest('#mediaForm')&&btn.classList.contains('primary')&&document.querySelector('.type-card.active')?.dataset.type==='Audio')select=document.querySelector('#mediaForm [data-audio-kind=global]');
  if(btn.matches('[data-a=save]')&&btn.closest('.card')?.querySelector('[data-f=type]')?.value==='Audio')select=btn.closest('.card').querySelector('[data-audio-kind=inline]');
  if(!select)return;
  if(!select.value){e.preventDefault();e.stopImmediatePropagation();toast('Choisissez Chant audio ou Audio parlé');return;}
  const before=new Set(state.contents.map(c=>c.id)),kind=select.value;
  setTimeout(()=>{const created=state.contents.filter(c=>!before.has(c.id)&&c.type==='Audio');created.forEach(c=>c.category=kind);if(created.length){ensureCategory(kind);saveState(state)}},0);
},true);

const editContentBeforeAudioKind=editContent;
editContent=function(id){
  editContentBeforeAudioKind(id);
  const c=state.contents.find(x=>x.id===id);if(!c||c.type!=='Audio')return;
  const value=AUDIO_KINDS.includes(c.category)?c.category:'Audios parlés';
  const grid=document.querySelector('#panel .form-grid');if(grid&&!document.querySelector('[data-audio-kind=edit]'))grid.insertAdjacentHTML('beforeend',audioKindField(value,'edit'));
  const save=document.getElementById('saveContentEdit');if(save){const old=save.onclick;save.onclick=async ev=>{const kind=document.querySelector('[data-audio-kind=edit]')?.value;if(!kind)return toast('Choisissez Chant audio ou Audio parlé');c.category=kind;ensureCategory(kind);await old?.call(save,ev);saveState(state)}}
};