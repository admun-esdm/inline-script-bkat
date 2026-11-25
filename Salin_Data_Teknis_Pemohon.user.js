// ==UserScript==
// @name         INLINE Salin Data Teknis Pemohon
// @namespace    inline-rekan
// @version      1.3
// @description  Salin isian Data Teknis Permohonan dari pemohon ke formulir Data Teknis evaluator
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinStaf/*
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinPre/*
// @match        https://formgen-perizinan.esdm.go.id/FormgenInline/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Salin_Data_Teknis_Pemohon.user.js
// @downloadURL  https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Salin_Data_Teknis_Pemohon.user.js
// @homepageURL  https://github.com/admun-esdm/inline-script-bkat
// ==/UserScript==
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
  if(!p.fill&&!p.conflicts.length){alert(p.same?'Data teknis evaluator sudah sama dengan data pemohon. Tidak ada yang perlu disalin.':'Tidak ada isian pemohon yang cocok untuk disalin.');return;}
  let overwrite=false;
  if(p.conflicts.length){
   const list=p.conflicts.slice(0,12).map(c=>'• '+c.label+': "'+c.current+'" → "'+c.value+'"').join('\n')+(p.conflicts.length>12?'\n…dan '+(p.conflicts.length-12)+' lainnya':'');
   overwrite=confirm(p.conflicts.length+' isian evaluator sudah terisi dan berbeda dari data pemohon:\n\n'+list+'\n\nOK = timpa dengan data pemohon\nBatal = biarkan isian evaluator, salin yang masih kosong saja');
  }
  const r=await ask('apply',overwrite);
  alert('Data teknis disalin: '+r.filled.length+' isian (ditandai kuning).'+(r.skipped?'\nDibiarkan (sudah terisi): '+r.skipped+'.':'')+(r.failed.length?'\nGagal (pilihan tidak cocok, isi manual): '+r.failed.join('; ')+'.':'')+'\n\nPeriksa kembali isian sebelum menyimpan; simpan seperti biasa di formulir evaluator.');
 }catch(e){alert('Salin data teknis gagal: '+e.message);}
 finally{button.disabled=false;button.textContent='Salin Data Teknis Pemohon';}
};
})();
