// ==UserScript==
// @name         INLINE Salin Data Teknis Pemohon
// @namespace    inline-rekan
// @version      1.4
// @description  Salin isian Data Teknis Permohonan dari pemohon ke formulir Data Teknis evaluator
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinStaf/*
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinPre/*
// @match        https://formgen-perizinan.esdm.go.id/FormgenInline/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Salin_Data_Teknis_Pemohon.user.js
// @downloadURL  https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Salin_Data_Teknis_Pemohon.user.js
// @homepageURL  https://github.com/admun-esdm/inline-script-bkat
// ==/UserScript==
// ===== AIRA: pop up pengganti alert/confirm/prompt bawaan browser (tampilan kuning ESDM + gerak halus) =====
const AIRA_MODAL=(()=>{
 const CSS=`:host{all:initial}*{box-sizing:border-box}
 .back{position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:16px;font:14px/1.5 "Segoe UI",Arial,sans-serif;color:#1d2939;animation:fade .2s ease-out}
 .back.out{animation:fadeout .18s ease-in forwards}.back.out .card{animation:popout .18s ease-in forwards}
 .card{width:min(var(--w,480px),100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#fff;border-radius:18px;border-top:6px solid #f5e62a;box-shadow:0 24px 64px rgba(16,24,40,.35);overflow:hidden;animation:pop .26s cubic-bezier(.2,.9,.3,1.2)}
 .head{display:flex;gap:14px;align-items:flex-start;padding:20px 22px 6px}
 .ic{flex:none;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font:800 22px "Segoe UI",Arial,sans-serif;animation:bounce .5s cubic-bezier(.2,.9,.3,1.5) .05s both}
 .t-ok .ic{background:#ecfdf3;color:#067647}.t-err .ic{background:#fef3f2;color:#b42318}.t-warn .ic{background:#fffaeb;color:#b54708}.t-ask .ic{background:#f5e62a;color:#111}.t-info .ic{background:#fffbd1;color:#6b6413}
 .brand{font:800 11px "Segoe UI",Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#98a2b3}
 h2{margin:1px 0 0;font:800 17px/1.3 "Segoe UI",Arial,sans-serif;color:#101828}
 .lead{margin:3px 0 0;color:#475467;font-size:13.5px}
 .body{padding:8px 22px 4px 80px;overflow:auto;animation:rise .3s cubic-bezier(.2,.9,.3,1) .06s both}
 .p{margin:0 0 6px;white-space:pre-wrap;word-break:break-word}
 .kv{display:grid;grid-template-columns:minmax(110px,max-content) 1fr;gap:0;border:1px solid #eee7a0;border-radius:12px;overflow:hidden;margin:4px 0 10px;background:#fff}
 .kv div{padding:7px 11px;border-bottom:1px solid #f3eeb8;word-break:break-word}.kv div:nth-last-child(-n+2){border-bottom:0}
 .kv .k{background:#fffbd1;color:#6b6413;font-weight:700;font-size:12.5px}
 .kv .v{white-space:pre-wrap}
 ul{margin:2px 0 10px;padding-left:18px}li{margin:2px 0}
 .note{margin:6px 0 10px;padding:9px 12px;border-radius:10px;background:#fffaeb;border:1px solid #fedf89;color:#93370d;font-size:13px;white-space:pre-wrap}
 .chg{border:1px solid #eee7a0;border-radius:12px;overflow:hidden;margin:4px 0 10px}
 .chg div{padding:8px 11px;border-bottom:1px solid #f3eeb8}.chg div:last-child{border-bottom:0}
 .chg b{display:block;font-size:12px;color:#6b6413;text-transform:uppercase;letter-spacing:.04em}
 .chg s{color:#98a2b3}.chg .to{color:#067647;font-weight:700}
 input.in{width:100%;margin:4px 0 8px;padding:9px 11px;border:1px solid #d0d5dd;border-radius:10px;font:600 14px "Segoe UI",Arial,sans-serif;color:#1d2939;transition:border-color .15s,box-shadow .15s}
 input.in:focus{outline:0;border-color:#b8a90f;box-shadow:0 0 0 3px rgba(245,230,42,.5)}
 .opts{display:flex;flex-direction:column;gap:6px;margin:4px 0 8px}
 .opt{text-align:left;font-weight:600;display:flex;align-items:center;gap:10px}
 .opt::before{content:'';width:16px;height:16px;border-radius:50%;border:2px solid #d0d5dd;flex:none;transition:all .15s}
 .opt.on{border-color:#e3d64a;background:#fffbd1}.opt.on::before{border:5px solid #111}
 button.pri:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
 a.link{display:inline-flex;align-items:center;gap:6px;margin:2px 0 8px;color:#175cd3;font-weight:700;text-decoration:none}a.link:hover{text-decoration:underline}
 .foot{display:flex;gap:8px;justify-content:flex-end;padding:14px 22px 18px}
 button{position:relative;overflow:hidden;border:1px solid #d0d5dd;border-radius:10px;padding:9px 18px;font:600 14px "Segoe UI",Arial,sans-serif;cursor:pointer;background:#fff;color:#1d2939;transition:transform .16s cubic-bezier(.2,.9,.3,1.3),box-shadow .18s,background .18s}
 button.pri{background:#f5e62a;border-color:#e3d64a;color:#111;font-weight:800}
 button:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(17,17,17,.12)}button.pri:hover{background:#ffe94d}
 button:active{transform:scale(.97);transition-duration:.08s}
 button:focus{outline:0}button:focus-visible{outline:0;box-shadow:0 0 0 3px rgba(245,230,42,.65)}button.pri:focus-visible{box-shadow:0 0 0 3px rgba(17,17,17,.18)}
 .rp{position:absolute;border-radius:50%;pointer-events:none;background:rgba(17,17,17,.12);transform:scale(0);animation:rp .55s ease-out forwards}
 @keyframes rp{to{transform:scale(1);opacity:0}}
 @keyframes fade{from{opacity:0}}@keyframes fadeout{to{opacity:0}}
 @keyframes pop{from{transform:translateY(10px) scale(.96);opacity:0}}@keyframes popout{to{transform:translateY(6px) scale(.97);opacity:0}}
 @keyframes rise{from{transform:translateY(8px);opacity:0}}
 @keyframes bounce{from{transform:scale(.4) rotate(-12deg);opacity:0}}
 @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
 const ICON={ok:'✓',err:'!',warn:'!',ask:'?',info:'i'};
 let chain=Promise.resolve();
 const esc=s=>String(s??'');
 // Ubah teks biasa menjadi tampilan rapi: "Label: nilai" -> tabel, "a menjadi b" (revisi) -> daftar perubahan, "•/-" -> daftar.
 function render(body,text){
  const blocks=esc(text).replace(/\r/g,'').split(/\n{2,}/);
  for(const block of blocks){
   const lines=block.split('\n').map(l=>l.trim()).filter(Boolean);if(!lines.length)continue;
   if(lines.every(l=>/^.{1,60}?: .+ menjadi .+$/.test(l))){const c=document.createElement('div');c.className='chg';
    for(const l of lines){const m=l.match(/^(.{1,60}?): (.+) menjadi (.+)$/);const d=document.createElement('div');const b=document.createElement('b');b.textContent=m[1];const s=document.createElement('s');s.textContent=m[2];const t=document.createElement('span');t.className='to';t.textContent=' → '+m[3];d.append(b,s,t);c.append(d);}
    body.append(c);continue;}
   let kv=null,ul=null;
   for(const l of lines){
    const m=l.match(/^([A-Za-zÀ-ÿ0-9 ./()'-]{2,34}): (.+)$/);
    if(/^[•\-–]\s/.test(l)){kv=null;if(!ul){ul=document.createElement('ul');body.append(ul);}const li=document.createElement('li');li.textContent=l.replace(/^[•\-–]\s*/,'');ul.append(li);continue;}
    ul=null;
    if(m&&!/^https?$/i.test(m[1])){if(!kv){kv=document.createElement('div');kv.className='kv';body.append(kv);}
     for(const part of l.split(' | ')){const mm=part.match(/^([^:]{2,34}): (.*)$/);const k=document.createElement('div');k.className='k';const v=document.createElement('div');v.className='v';if(mm){k.textContent=mm[1];v.textContent=mm[2];}else{k.textContent='';v.textContent=part;}kv.append(k,v);}
     continue;}
    kv=null;const p=document.createElement('p');p.className=/^(catatan|perhatian|data teknis dan|metode\/pompa)/i.test(l)?'note':'p';p.textContent=l.replace(/ \| /g,' · ');body.append(p);
   }
  }
 }
 function open(o){
  const run=()=>new Promise(resolve=>{
   const host=document.createElement('div');host.setAttribute('data-aira-modal','');const root=host.attachShadow({mode:'open'});
   const tone=o.tone||'info';
   root.innerHTML=`<style>${CSS}</style><div class="back"><div class="card t-${tone}" role="${o.kind==='alert'?'alertdialog':'dialog'}" aria-modal="true"><div class="head"><div class="ic" aria-hidden="true">${ICON[tone]||'i'}</div><div><div class="brand">AIRA${o.source?' · '+o.source.replace(/[<>&]/g,''):''}</div><h2></h2><div class="lead"></div></div></div><div class="body"></div><div class="foot"></div></div></div>`;
   const q=s=>root.querySelector(s);if(o.width)q('.card').style.setProperty('--w',o.width+'px');
   q('h2').textContent=o.title||'';if(o.lead)q('.lead').textContent=o.lead;else q('.lead').remove();
   const body=q('.body');render(body,o.message||'');
   if(o.link){const a=document.createElement('a');a.className='link';a.href=o.link.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=o.link.text+' ↗';body.append(a);}
   let picked=null,okRef=null;
   if(o.kind==='choose'){const box=document.createElement('div');box.className='opts';box.setAttribute('role','radiogroup');for(const opt of o.options){const v=typeof opt==='object'?opt.value:opt,label=typeof opt==='object'?opt.label:opt;const b=document.createElement('button');b.type='button';b.className='opt';b.textContent=label;b.setAttribute('role','radio');b.onclick=()=>{picked=v;box.querySelectorAll('.opt').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',String(x===b));});if(okRef)okRef.disabled=false;};box.append(b);}body.append(box);}
   let input=null;if(o.kind==='prompt'){input=document.createElement('input');input.className='in';input.value=o.value||'';input.spellcheck=false;body.append(input);}
   if(!body.childNodes.length)body.remove();
   const foot=q('.foot');let done=false;
   const finish=v=>{if(done)return;done=true;document.removeEventListener('keydown',key,true);q('.back').classList.add('out');setTimeout(()=>{host.remove();resolve(v);},180);};
   const mk=(text,pri,val)=>{const b=document.createElement('button');b.type='button';b.textContent=text;if(pri)b.className='pri';b.onclick=()=>finish(typeof val==='function'?val():val);foot.append(b);return b;};
   let okBtn;
   if(o.kind==='alert')okBtn=mk(o.ok||'OK',true,true);
   else if(o.kind==='choose'){mk(o.cancel||'Batal',false,null);okBtn=mk(o.ok||'Pilih',true,()=>picked);okBtn.disabled=true;okRef=okBtn;}
   else{mk(o.cancel||'Batal',false,o.kind==='prompt'?null:false);okBtn=mk(o.ok||'Lanjut',true,o.kind==='prompt'?()=>input.value:true);}
   const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(o.kind==='alert'?true:(o.kind==='prompt'||o.kind==='choose'?null:false));}
    else if(e.key==='Enter'&&!(e.target&&e.target.tagName==='TEXTAREA')&&!okBtn.disabled){e.preventDefault();e.stopPropagation();okBtn.click();}};
   document.addEventListener('keydown',key,true);
   root.addEventListener('pointerdown',e=>{const b=e.composedPath().find(n=>n.tagName==='BUTTON');if(!b)return;const r=b.getBoundingClientRect(),size=Math.max(r.width,r.height)*2.2,s=document.createElement('span');s.className='rp';s.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-r.left-size/2)+'px;top:'+(e.clientY-r.top-size/2)+'px';b.append(s);setTimeout(()=>s.remove(),600);});
   (document.body||document.documentElement).append(host);
   setTimeout(()=>{(input||(o.kind==='choose'?root.querySelector('.opt'):okBtn)).focus();if(input)input.select();},30);
  });
  const p=chain.then(run,run);chain=p.catch(()=>{});return p;
 }
 const toneOf=m=>/^(proses berhasil|berhasil|sudah tercatat|data teknis disalin|pengaturan inline tersimpan)|berhasil disimpan|tersimpan\.?$/i.test(String(m).trim())?'ok':'info';
 return {
  alert:(message,o={})=>open({kind:'alert',message,title:o.title||(toneOf(message)==='ok'?'Berhasil':'Informasi'),tone:o.tone||toneOf(message),...o,message}),
  error:(message,o={})=>open({kind:'alert',title:'Belum berhasil',tone:'err',...o,message}),
  confirm:(message,o={})=>open({kind:'confirm',title:'Konfirmasi',tone:'ask',...o,message}),
  prompt:(message,value,o={})=>open({kind:'prompt',title:'Masukkan pilihan',tone:'ask',...o,message,value}),
  choose:(message,options,o={})=>open({kind:'choose',title:'Pilih salah satu',tone:'ask',...o,message,options}),
  // Pesan lama berformat "Judul\nisi…": baris pertama menjadi judul.
  ask:(text,o={})=>{const [first,...rest]=String(text).split('\n');return open({kind:'confirm',tone:'ask',ok:'Kirim',...o,title:first,message:rest.join('\n')});},
  done:(text,o={})=>{const [first,...rest]=String(text).split('\n');return open({kind:'alert',tone:toneOf(first),...o,title:first.replace(/\s+—\s+/,' — '),message:rest.join('\n')});}
 };
})();

(() => {
'use strict';
const KIND_REQ='INLINE_SALIN_TEKNIS',KIND_RES='INLINE_SALIN_TEKNIS_RESULT';
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).replace(/\*\)/g,'').replace(/[:*]+$/,'').trim().toLowerCase();

// ---------- Bagian di dalam iframe formgen ----------
if(location.hostname==='formgen-perizinan.esdm.go.id'){
 // Pasangan [formulir evaluator, formulir permohonan]: Baru/Penataan, Perpanjangan, Perubahan (sama dengan Data Lengkap).
 const PAIRS=[['formColumnar_2055','formColumnar_2054'],['formColumnar_2053','formColumnar_2052'],['formColumnar_2057','formColumnar_2056']];
 const isEditable=el=>el&&!el.disabled&&!el.readOnly&&!['hidden','button','submit','file','image','reset'].includes((el.type||'').toLowerCase());
 const valueOf=el=>el.tagName==='SELECT'?clean(el.selectedOptions[0]?.textContent):clean(el.value);
 const empty=v=>!v||v==='-'||/^--?\s*pilih/i.test(v);
 function rows(root){
  const out=[];
  for(const tr of root.querySelectorAll('tr')){
   const c=tr.querySelectorAll(':scope > td');if(c.length<2)continue;
   const label=norm(c[0].textContent);if(!label)continue;
   out.push({label,text:clean(c[0].textContent).replace(/\s*\*\)\s*$/,''),cell:c[1]});
  }
  return out;
 }
 function sourceValue(source,label,name){
  // 1) nama field yang sama di formulir pemohon; 2) label baris yang sama.
  if(name){const el=source.querySelector('[name="'+CSS.escape(name)+'"]');if(el&&el.type!=='hidden'){const v=valueOf(el);if(!empty(v))return {value:v,raw:el.tagName==='SELECT'?el.value:null};}}
  for(const r of rows(source)){
   if(r.label!==label)continue;
   const el=r.cell.querySelector('input:not([type=hidden]):not([type=button]),textarea,select');
   if(el){const v=valueOf(el);return empty(v)?null:{value:v,raw:el.tagName==='SELECT'?el.value:null};}
   const copy=r.cell.cloneNode(true);copy.querySelectorAll('a,button,i,script,style,small,.help-block').forEach(x=>x.remove());
   const v=clean(copy.textContent);return empty(v)?null:{value:v,raw:null};
  }
  return null;
 }
 function setValue(el,src){
  if(el.tagName==='SELECT'){
   const opts=[...el.options];
   const opt=(src.raw!=null&&opts.find(o=>o.value===src.raw))||opts.find(o=>norm(o.textContent)===norm(src.value))||opts.find(o=>norm(o.value)===norm(src.value));
   if(!opt)return false;
   el.value=opt.value;
  }else{
   const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
   Object.getOwnPropertyDescriptor(proto,'value').set.call(el,src.value);
  }
  for(const t of ['input','change','blur'])el.dispatchEvent(new Event(t,{bubbles:true}));
  try{if(window.jQuery)window.jQuery(el).trigger('change');}catch{}
  // Kolom angka formgen: kotak tampilan "__NAMA" + kolom tersembunyi "NAMA" yang benar-benar disimpan.
  const hidden=el.name&&el.name.startsWith('__')?el.form?.querySelector('input[type=hidden][name="'+el.name.slice(2)+'"]'):null;
  if(hidden){const raw=clean(src.value).replace(/\s/g,'');hidden.value=/,\d+$/.test(raw)?raw.replace(/\./g,'').replace(',','.'):raw.replace(/,/g,'');}
  el.style.background='#fff6c7';el.style.outline='2px solid #e0b100';
  return true;
 }
 // R18: form Persetujuan Penggunaan Sumur Pantau/Imbuhan = satu form; data pemohon (Rencana Teknis Sumur)
 // disalin ke "Rencana Teknis Sumur Input Evaluator" berdasarkan pasangan label berikut.
 const IMBUHAN_MAP=[['Nomor Urut Sumur','NOMOR_URUT_SUMUR_BOR_EVALUATOR'],['Kedalaman Sumur','__KEDALAMAN_SUMUR_EVALUATOR'],['Jenis Pipa Konstruksi','JENIS_PIPA_KONSTRUKSI_EVALUATOR'],['Diameter Pipa Konstruksi','__DIAMETER_PIPA_KONSTRUKSI_EVALUATOR'],['Kedudukan Semen Penyekat','KEDUDUKAN_SEMEN_PENYEKAT_EVALUATOR'],['Kedudukan Saringan','KEDUDUKAN_SARINGAN_EVALUATOR'],['Kedudukan Kerikil Pembalut','KEDUDUKAN_KERIKIL_PEMBALUT_EVALUATOR']];
 // R19: form Persetujuan Penggunaan Air Tanah (debit evaluator tidak disalin; diputuskan evaluator).
 const SETUJU_DEBIT='JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH_EVALUATOR';
 const SETUJU_MAP=[['Peruntukan Air Tanah','PERUNTUKAN_AIR_TANAH_EVALUATOR'],['Nomor Urut Sumur Bor/Gali','NOMOR_URUT_SUMUR_BOR_EVALUATOR'],['Kedalaman Sumur Bor','__KEDALAMAN_SUMUR_BOR_EVALUATOR'],['Diameter Sumur Bor','__DIAMETER_SUMUR_BOR_EVALUATOR'],['Kedalaman Akuifer yang Disadap','KEDALAMAN_AKUIFER_EVALUATOR'],['Kedudukan Saringan','KEDUDUKAN_SARINGAN_EVALUATOR'],['Jenis Pompa','JENIS_POMPA_EVALUATOR'],['Kapasitas Pompa','__KAPASITAS_POMPA_EVALUATOR'],['Kedudukan Pompa','KEDUDUKAN_POMPA_EVALUATOR']];
 function planImbuhan(form,map=IMBUHAN_MAP){
  const items=[],unmatched=[];
  for(const [label,name] of map){
   const el=form.querySelector('[name="'+name+'"]');if(!isEditable(el))continue;
   const src=sourceValue(form,norm(label),null);
   const evalLabel=clean(el.closest('tr')?.querySelector('td')?.textContent||label).replace(/\s*\*\)\s*$/,'');
   if(!src){unmatched.push(evalLabel);continue;}
   const current=valueOf(el);
   const num=v=>Number(clean(v).replace(/\./g,'').replace(',','.'));
   const same=name.startsWith('__')&&Number.isFinite(num(current))&&clean(current)!==''?num(current)===num(src.value):norm(current)===norm(src.value);
   // Dropdown selalu menampilkan pilihan bawaan, jadi tidak dianggap isian evaluator.
   items.push({el,label:evalLabel,src,current:empty(current)||el.tagName==='SELECT'?'':current,same});
  }
  return {items,unmatched};
 }
 function plan(){
  const imb=[...document.querySelectorAll('form[id^="formColumnar_"]')].find(f=>f.querySelector('[name="NOMOR_URUT_SUMUR_BOR_EVALUATOR"]'));
  if(imb&&!PAIRS.some(([e])=>document.getElementById(e)))return planImbuhan(imb,imb.querySelector('[name="__'+SETUJU_DEBIT+'"],[name="'+SETUJU_DEBIT+'"]')?SETUJU_MAP:IMBUHAN_MAP);
  const found=PAIRS.filter(([e])=>document.getElementById(e));
  if(!found.length)throw Error('Formulir Data Teknis evaluator tidak ditemukan pada halaman ini.');
  if(found.length>1)throw Error('Lebih dari satu formulir evaluator terbuka; buka satu Data Teknis saja.');
  const form=document.getElementById(found[0][0]),source=document.getElementById(found[0][1]);
  if(!source)throw Error('Data Teknis pemohon tidak ditemukan berdampingan dengan formulir evaluator.');
  const items=[],unmatched=[];
  for(const r of rows(form)){
   const el=r.cell.querySelector('input,textarea,select');
   if(!isEditable(el))continue;
   const src=sourceValue(source,r.label,el.name);
   if(!src){unmatched.push(r.label);continue;}
   const current=valueOf(el);
   // Dropdown selalu menampilkan pilihan bawaan (mis. Sentrifugal), jadi tidak dianggap isian evaluator.
   const isSelect=el.tagName==='SELECT';
   items.push({el,label:r.text,src,current:empty(current)||isSelect?'':current,same:norm(current)===norm(src.value)});
  }
  return {items,unmatched};
 }
 window.addEventListener('message',e=>{
  if(e.origin!=='https://ngantor.esdm.go.id'||e.source!==window.parent||e.data?.kind!==KIND_REQ)return;
  const reply=data=>window.parent.postMessage({kind:KIND_RES,nonce:e.data.nonce,...data},e.origin);
  try{
   const {items,unmatched}=plan();
   const conflicts=items.filter(x=>x.current&&!x.same);
   if(e.data.mode==='preview'){
    reply({result:{fill:items.filter(x=>!x.current).length,same:items.filter(x=>x.same).length,conflicts:conflicts.map(x=>({label:x.label,current:x.current,value:x.src.value})),unmatched:unmatched.length}});
    return;
   }
   const filled=[],failed=[];
   for(const x of items){
    if(x.same)continue;
    if(x.current&&!e.data.overwrite)continue;
    (setValue(x.el,x.src)?filled:failed).push(x.label);
   }
   reply({result:{filled,failed,skipped:e.data.overwrite?0:conflicts.length}});
  }catch(err){reply({error:err.message});}
 });
 return;
}

// ---------- Bagian di halaman INLINE (atas) ----------
if(window!==window.top)return;
function ask(mode,overwrite){
 const iframe=document.querySelector('#fgenFormIframe');
 if(!iframe)return Promise.reject(Error('Buka Dokumen Persyaratan yang memuat Data Teknis terlebih dahulu.'));
 const origin=new URL(iframe.src,location.href).origin;
 if(origin!=='https://formgen-perizinan.esdm.go.id')return Promise.reject(Error('Alamat iframe tidak dikenali.'));
 return new Promise((resolve,reject)=>{
  const nonce=crypto.randomUUID();
  const handler=e=>{if(e.source===iframe.contentWindow&&e.origin===origin&&e.data?.kind===KIND_RES&&e.data.nonce===nonce){clearTimeout(timer);window.removeEventListener('message',handler);e.data.error?reject(Error(e.data.error)):resolve(e.data.result);}};
  const timer=setTimeout(()=>{window.removeEventListener('message',handler);reject(Error('Formulir belum dapat dibaca. Pastikan script "INLINE Salin Data Teknis Pemohon" aktif lalu refresh INLINE.'));},10000);
  window.addEventListener('message',handler);
  iframe.contentWindow.postMessage({kind:KIND_REQ,nonce,mode,overwrite:!!overwrite},origin);
 });
}
const button=document.createElement('button');button.type='button';button.textContent='Salin Data Teknis Pemohon';
button.style.cssText='position:fixed;right:25px;bottom:380px;z-index:99999;background:#0f6e8c;color:white;padding:14px;border:0;border-radius:8px;cursor:pointer';
document.body.append(button);
button.onclick=async()=>{
 button.disabled=true;button.textContent='Menyalin…';
 try{
  const p=await ask('preview');
  if(!p.fill&&!p.conflicts.length){await AIRA_MODAL.alert(p.same?'Data teknis evaluator sudah sama dengan data pemohon. Tidak ada yang perlu disalin.':'Tidak ada isian pemohon yang cocok untuk disalin.',{title:p.same?'Sudah sama':'Tidak ada yang disalin',tone:'info',source:'Salin Data Teknis Pemohon'});return;}
  let overwrite=false;
  if(p.conflicts.length){
   const list=p.conflicts.slice(0,12).map(c=>c.label+': '+c.current+' menjadi '+c.value).join('\n')+(p.conflicts.length>12?'\n\n…dan '+(p.conflicts.length-12)+' lainnya':'');
   overwrite=await AIRA_MODAL.confirm(list,{title:p.conflicts.length+' isian evaluator sudah terisi dan berbeda',lead:'Isian evaluator (dicoret) dibandingkan data pemohon (hijau).',tone:'warn',ok:'Timpa dengan data pemohon',cancel:'Salin yang kosong saja',source:'Salin Data Teknis Pemohon',width:560});
  }
  const r=await ask('apply',overwrite);
  await AIRA_MODAL.alert('Disalin: '+r.filled.length+' isian (ditandai kuning)'+(r.skipped?'\nDibiarkan: '+r.skipped+' isian (sudah terisi)':'')+(r.failed.length?'\nPerlu diisi manual: '+r.failed.join('; '):'')+'\n\nPeriksa kembali isian sebelum menyimpan; simpan seperti biasa di formulir evaluator.',{title:'Data teknis berhasil disalin',tone:'ok',source:'Salin Data Teknis Pemohon'});
 }catch(e){await AIRA_MODAL.error(e.message,{title:'Salin data teknis gagal',source:'Salin Data Teknis Pemohon'});}
 finally{button.disabled=false;button.textContent='Salin Data Teknis Pemohon';}
};
})();
