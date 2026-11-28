// ==UserScript==
// @name         AIRA Cek Gambar Konstruksi
// @namespace    inline-rekan
// @version      1.0
// @description  Pop up gambar konstruksi + isian data teknis, lalu isi otomatis ke Data Teknis Input Evaluator INLINE
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinStaf/*
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinPre/*
// @match        https://formgen-perizinan.esdm.go.id/FormgenInline/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Cek_Gambar_Konstruksi.user.js
// @downloadURL  https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Cek_Gambar_Konstruksi.user.js
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
// =====================================================================================
// AIRA · Cek Gambar Konstruksi
// Satu pop up: gambar konstruksi (lampiran permohonan) di kiri, isian data teknis di kanan.
// Hasil isian diisikan ke Data Teknis Input Evaluator INLINE (tidak dikirim ke Sheets).
// Jenis: Izin Pengusahaan (Baru/Penataan/Perpanjangan/Perubahan), Persetujuan Penggunaan
// Air Tanah, Persetujuan Sumur Pantau/Imbuhan. Dewatering tidak didukung (tombol disembunyikan).
// =====================================================================================
const KIND_REQ='AIRA_KONSTRUKSI',KIND_RES='AIRA_KONSTRUKSI_RESULT';
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).replace(/\*\)/g,'').replace(/[:*]+$/,'').trim().toLowerCase();

// ---------------------------------------------------------------------------------
// Bagian di dalam iframe formgen: membaca dan mengisi formulir Data Teknis
// ---------------------------------------------------------------------------------
if(location.hostname==='formgen-perizinan.esdm.go.id'){
 // Pasangan [formulir evaluator, formulir pemohon]: Baru/Penataan, Perpanjangan, Perubahan.
 const PAIRS=[['formColumnar_2055','formColumnar_2054'],['formColumnar_2053','formColumnar_2052'],['formColumnar_2057','formColumnar_2056']];
 // Izin Pengusahaan: cari kolom evaluator dari nama field, lalu dari label baris (tanpa baris "Satuan …").
 const IZIN=[
  ['nomor',['NOMOR_URUT_SUMUR_BOR'],/nomor urut sumur/],
  ['kedalaman',['KEDALAMAN_SUMUR_BOR','KEDALAMAN_KONSTRUKSI_SUMUR_BOR'],/^kedalaman (konstruksi )?sumur/],
  ['screen',['RENTANG_KEDALAMAN_SCREEN'],/screen|saringan/],
  ['grouting',['RENTANG_KEDALAMAN_CEMENT_GROUTING','RENTANG_GROUTING','RENTANG_KEDALAMAN_GROUTING'],/grouting|semen/],
  ['dlubang',['DIAMETER_LUBANG_BOR','DIAMETER_LUBANG'],/diameter lubang/],
  ['dpipa',['DIAMETER_PIPA_KONSTRUKSI'],/diameter pipa/],
  ['jpompa',['JENIS_POMPA'],/jenis pompa/],
  ['kpompa',['KAPASITAS_POMPA'],/kapasitas pompa/],
  ['ppompa',['POSISIS_KEDALAMAN_POMPA','POSISI_KEDALAMAN_POMPA'],/posisi kedalaman pompa|kedudukan pompa/],
  ['akuifer',['KEDALAMAN_AKUIFER'],/akuifer/]
 ];
 // Persetujuan Penggunaan Air Tanah (satu form; label pemohon = label evaluator tanpa "Input Evaluator").
 const SETUJU=[['nomor','Nomor Urut Sumur Bor/Gali','NOMOR_URUT_SUMUR_BOR_EVALUATOR'],['kedalaman','Kedalaman Sumur Bor','KEDALAMAN_SUMUR_BOR_EVALUATOR'],['dpipa','Diameter Sumur Bor','DIAMETER_SUMUR_BOR_EVALUATOR'],['screen','Kedudukan Saringan','KEDUDUKAN_SARINGAN_EVALUATOR'],['jpompa','Jenis Pompa','JENIS_POMPA_EVALUATOR'],['kpompa','Kapasitas Pompa','KAPASITAS_POMPA_EVALUATOR'],['ppompa','Kedudukan Pompa','KEDUDUKAN_POMPA_EVALUATOR'],['akuifer','Kedalaman Akuifer yang Disadap','KEDALAMAN_AKUIFER_EVALUATOR']];
 // Persetujuan Sumur Pantau/Imbuhan.
 const IMBUHAN=[['nomor','Nomor Urut Sumur','NOMOR_URUT_SUMUR_BOR_EVALUATOR'],['kedalaman','Kedalaman Sumur','KEDALAMAN_SUMUR_EVALUATOR'],['jpipa','Jenis Pipa Konstruksi','JENIS_PIPA_KONSTRUKSI_EVALUATOR'],['dpipa','Diameter Pipa Konstruksi','DIAMETER_PIPA_KONSTRUKSI_EVALUATOR'],['semen','Kedudukan Semen Penyekat','KEDUDUKAN_SEMEN_PENYEKAT_EVALUATOR'],['screen','Kedudukan Saringan','KEDUDUKAN_SARINGAN_EVALUATOR'],['kerikil','Kedudukan Kerikil Pembalut','KEDUDUKAN_KERIKIL_PEMBALUT_EVALUATOR']];
 const editable=el=>el&&!el.disabled&&!el.readOnly&&!['hidden','button','submit','file','image','reset'].includes((el.type||'').toLowerCase());
 const valueOf=el=>el.tagName==='SELECT'?clean(el.selectedOptions[0]?.textContent):clean(el.value);
 const empty=v=>!v||v==='-'||/^--?\s*pilih/i.test(v);
 function rows(root){
  const out=[];
  for(const tr of root.querySelectorAll('tr')){
   const c=tr.querySelectorAll(':scope > td');if(c.length<2)continue;
   const label=norm(c[0].textContent);if(!label)continue;
   out.push({label,text:clean(c[0].textContent).replace(/\s*\*\)\s*$/,''),cell:c[1],tr});
  }
  return out;
 }
 // Kolom angka formgen: kotak tampilan "__NAMA" + kolom tersembunyi "NAMA" yang benar-benar disimpan.
 const byName=(form,n)=>{for(const k of ['__'+n,n]){const el=form.querySelector('[name="'+k+'"]');if(editable(el))return el;}return null;};
 const labelOf=(el,fallback)=>clean(el?.closest('tr')?.querySelector('td')?.textContent||fallback).replace(/\s*\*\)\s*$/,'');
 function rowValue(root,label,skipEl){
  for(const r of rows(root)){
   if(r.label!==norm(label))continue;
   const el=r.cell.querySelector('input:not([type=hidden]):not([type=button]),textarea,select');
   if(el&&el===skipEl)continue;
   if(el){const v=valueOf(el);return empty(v)?'':v;}
   const copy=r.cell.cloneNode(true);copy.querySelectorAll('a,button,i,script,style,small,.help-block').forEach(x=>x.remove());
   const v=clean(copy.textContent);return empty(v)?'':v;
  }
  return '';
 }
 function setValue(el,value){
  if(el.tagName==='SELECT'){
   const want=norm(value).replace('centrifugal','sentrifugal');
   const opt=[...el.options].find(o=>norm(o.textContent).replace('centrifugal','sentrifugal')===want)||[...el.options].find(o=>norm(o.value)===norm(value));
   if(!opt)return false;
   el.value=opt.value;
  }else{
   const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
   Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);
  }
  for(const t of ['input','change','blur'])el.dispatchEvent(new Event(t,{bubbles:true}));
  try{if(window.jQuery)window.jQuery(el).trigger('change');}catch{}
  const hidden=el.name&&el.name.startsWith('__')?el.form?.querySelector('input[type=hidden][name="'+el.name.slice(2)+'"]'):null;
  if(hidden){const raw=clean(value).replace(/\s/g,'');hidden.value=/,\d+$/.test(raw)?raw.replace(/\./g,'').replace(',','.'):raw.replace(/,/g,'');}
  el.style.background='#fff6c7';el.style.outline='2px solid #e0b100';
  return true;
 }
 function nameOfPerson(root){
  // Utamakan nama perusahaan/instansi; nama pemohon (orang) hanya cadangan.
  for(const re of [/^nama (perusahaan|instansi|pelaku usaha)/,/^nama pemohon/])for(const r of rows(root))if(re.test(r.label)){const v=rowValue(root,r.label);if(v)return v;}
  return '';
 }
 // Kembalikan {kind, nama, fields:[{key,label,el,current,pemohon,options}]}
 function plan(){
  const single=[...document.querySelectorAll('form[id^="formColumnar_"]')].find(f=>f.querySelector('[name="NOMOR_URUT_SUMUR_BOR_EVALUATOR"]'));
  const found=PAIRS.filter(([e])=>document.getElementById(e));
  if(single&&!found.length){
   const setuju=!!single.querySelector('[name="__JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH_EVALUATOR"],[name="JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH_EVALUATOR"]');
   const map=setuju?SETUJU:IMBUHAN,fields=[];
   for(const [key,label,name] of map){
    const el=byName(single,name);
    if(!el){fields.push({key,missing:true});continue;}
    fields.push({key,el,label:labelOf(el,label),current:el.tagName==='SELECT'?'':(empty(valueOf(el))?'':valueOf(el)),select:el.tagName==='SELECT',pemohon:rowValue(single,label,el),options:el.tagName==='SELECT'?[...el.options].map(o=>clean(o.textContent)).filter(t=>!empty(t)):null});
   }
   return {kind:setuju?'setuju':'imbuhan',nama:nameOfPerson(single),fields};
  }
  if(!found.length)throw Error('Formulir Data Teknis evaluator tidak ditemukan pada halaman ini.');
  if(found.length>1)throw Error('Lebih dari satu formulir evaluator terbuka; buka satu Data Teknis saja.');
  const form=document.getElementById(found[0][0]),source=document.getElementById(found[0][1]);
  const all=rows(form).filter(r=>!/^satuan/.test(r.label));
  const used=new Set(),fields=[];
  for(const [key,names,re] of IZIN){
   let el=null;
   for(const n of names){el=byName(form,n);if(el&&!used.has(el))break;el=null;}
   if(!el)for(const r of all){if(!re.test(r.label))continue;const x=r.cell.querySelector('input:not([type=hidden]):not([type=button]),textarea,select');if(editable(x)&&!used.has(x)){el=x;break;}}
   if(!el){fields.push({key,missing:true});continue;}
   used.add(el);
   const label=labelOf(el,key);
   let pem='';
   if(source){
    const nm=el.name.replace(/^__/,'');
    for(const k of ['__'+nm,nm]){const s=source.querySelector('[name="'+k+'"]');if(s&&s.type!=='hidden'){const v=valueOf(s);if(!empty(v)){pem=v;break;}}}
    if(!pem)pem=rowValue(source,label);
   }
   fields.push({key,el,label,current:el.tagName==='SELECT'?'':(empty(valueOf(el))?'':valueOf(el)),select:el.tagName==='SELECT',pemohon:pem,options:el.tagName==='SELECT'?[...el.options].map(o=>clean(o.textContent)).filter(t=>!empty(t)):null});
  }
  return {kind:'izin',nama:source?nameOfPerson(source):'',fields};
 }
 const same=(a,b)=>cmpKey(a)===cmpKey(b);
 function cmpKey(v){
  let t=clean(v).toLowerCase().replace(/#lt#/g,'<').replace(/#gt#/g,'>').replace(/#le#/g,'≤').replace(/#ge#/g,'≥').replace(/centrifugal/g,'sentrifugal');
  t=t.replace(/[–—]/g,'-').replace(/\s+/g,'').replace(/(m\.?bmt|meter|inchi|inch|hp|m)$/,'').replace(/;/g,',');
  if(/^\d+([.,]\d+)?$/.test(t))return String(Number(t.replace(',','.')));
  return t;
 }
 window.addEventListener('message',e=>{
  if(e.origin!=='https://ngantor.esdm.go.id'||e.source!==window.parent||e.data?.kind!==KIND_REQ)return;
  const reply=data=>window.parent.postMessage({kind:KIND_RES,nonce:e.data.nonce,...data},e.origin);
  try{
   const p=plan();
   if(e.data.mode==='read'){
    reply({result:{kind:p.kind,nama:p.nama,fields:p.fields.map(f=>f.missing?{key:f.key,missing:true}:{key:f.key,label:f.label,current:f.current,pemohon:f.pemohon,options:f.options})}});
    return;
   }
   const values=e.data.values||{},list=[];
   for(const f of p.fields){
    if(f.missing||!(f.key in values))continue;
    const next=clean(values[f.key]);if(!next)continue;
    const cur=f.select?valueOf(f.el):f.current;
    const status=f.select?(same(cur,next)?'same':'fill'):(!f.current?'fill':same(f.current,next)?'same':'change');
    list.push({f,label:f.label,current:f.select?'':f.current,next,status});
   }
   if(e.data.mode==='preview'){reply({result:list.map(x=>({label:x.label,current:x.current,next:x.next,status:x.status}))});return;}
   const filled=[],failed=[];
   for(const x of list){if(x.status==='same')continue;(setValue(x.f.el,x.next)?filled:failed).push(x.label);}
   reply({result:{filled,failed}});
  }catch(err){reply({error:err.message});}
 });
 return;
}

// ---------------------------------------------------------------------------------
// Bagian di halaman INLINE (atas)
// ---------------------------------------------------------------------------------
if(window!==window.top)return;
const SOURCE='Cek Gambar Konstruksi';
function labeled(label){
 const root=document.querySelector('#detilPermohonan')||document;
 for(const el of root.querySelectorAll('label'))if(norm(el.textContent)===norm(label))return clean(el.closest('.row')?.querySelector('span')?.textContent);
 return '';
}
const jenisIzin=()=>labeled('Jenis Izin');
const isDewatering=()=>/dewatering/i.test(jenisIzin());
const isPerpanjangan=()=>/perpanjangan/i.test(jenisIzin());
function ask(mode,extra={}){
 const iframe=document.querySelector('#fgenFormIframe');
 if(!iframe)return Promise.reject(Error('Data Teknis belum terbuka. Buka bagian Data Permohonan yang memuat Data Teknis evaluator, lalu coba lagi.'));
 const origin=new URL(iframe.src,location.href).origin;
 if(origin!=='https://formgen-perizinan.esdm.go.id')return Promise.reject(Error('Alamat iframe tidak dikenali.'));
 return new Promise((resolve,reject)=>{
  const nonce=crypto.randomUUID();
  const handler=e=>{if(e.source===iframe.contentWindow&&e.origin===origin&&e.data?.kind===KIND_RES&&e.data.nonce===nonce){clearTimeout(timer);window.removeEventListener('message',handler);e.data.error?reject(Error(e.data.error)):resolve(e.data.result);}};
  const timer=setTimeout(()=>{window.removeEventListener('message',handler);reject(Error('Formulir Data Teknis belum dapat dibaca. Pastikan script "AIRA Cek Gambar Konstruksi" aktif lalu refresh INLINE.'));},10000);
  window.addEventListener('message',handler);
  iframe.contentWindow.postMessage({kind:KIND_REQ,nonce,mode,...extra},origin);
 });
}
// Daftar lampiran dari tabel Dokumen Persyaratan (sama dengan Download Lampiran).
function attachmentBase(){
 const page=new URL(location.href),role=page.pathname.match(/^\/inline\/internal\/(PermohonanIzinStaf|PermohonanIzinPre)\//)?.[1];
 const pattern=/(?:https:\/\/ngantor\.esdm\.go\.id)?\/inline\/internal\/(?:PermohonanIzinStaf|PermohonanIzinPre)\/view-dokumen-persyaratan\/[^"'\s<>]+/g;
 const routes=new Set();
 for(const s of document.scripts)for(const m of String(s.textContent||'').replace(/\\\//g,'/').matchAll(pattern)){const u=new URL(m[0],page.origin);if(u.origin===page.origin&&!u.search&&!u.hash)routes.add(u.href.replace(/\/$/,''));}
 const all=[...routes],same=role?all.filter(u=>new URL(u).pathname.startsWith('/inline/internal/'+role+'/')):[];
 const c=same.length?same:all;
 if(c.length!==1)throw Error('Alamat lampiran tidak ditemukan. Buka Dokumen Persyaratan permohonan ini lalu coba lagi.');
 return c[0];
}
function listAttachments(){
 const card=document.querySelector('#card_dokumenPersyaratan');if(!card)return [];
 const sel=card.querySelector('select[name$="_length"]');
 if(sel&&[...sel.options].some(o=>o.value==='-1')&&sel.value!=='-1'){sel.value='-1';sel.dispatchEvent(new Event('change',{bubbles:true}));}
 return [...card.querySelectorAll('.viewFIle')].map((a,i)=>{
  // Kolom nama dokumen = sel yang berisi <div> nama persyaratan (kolom Group bisa disembunyikan DataTables).
  const td=[...(a.closest('tr')?.querySelectorAll(':scope > td')||[])].find(c=>c.querySelector('div')&&clean(c.querySelector('div').textContent).replace(/\*required/i,'').length>3);
  const title=clean(td?.querySelector('div')?.firstChild?.textContent||td?.querySelector('div')?.textContent||'Lampiran '+(i+1)).replace(/\*required/i,'').trim();
  return {id:a.getAttribute('data-id'),no:i+1,title};
 }).filter(x=>/^\d+$/.test(x.id||''));
}
function suggest(list){
 if(isPerpanjangan()){const lt=list.find(x=>/laporan\s+teknis/i.test(x.title));if(lt)return lt;}
 return list.find(x=>/gambar/i.test(x.title)&&/konstruksi/i.test(x.title))||list.find(x=>/konstruksi/i.test(x.title))||null;
}
const cache=new Map();
async function loadFile(item){
 if(cache.has(item.id))return cache.get(item.id);
 const r=await fetch(attachmentBase()+'/'+item.id,{credentials:'same-origin'});
 if(!r.ok)throw Error('Lampiran gagal dibuka: HTTP '+r.status);
 const bytes=new Uint8Array(await r.arrayBuffer());
 const head=String.fromCharCode(...bytes.slice(0,8));
 const type=head.startsWith('%PDF-')?'application/pdf':bytes[0]===0xFF&&bytes[1]===0xD8?'image/jpeg':head.slice(1,4)==='PNG'?'image/png':'';
 if(!type)throw Error('Lampiran ini bukan PDF/gambar langsung (mungkin sesi INLINE habis). Refresh INLINE lalu coba lagi.');
 const out={url:URL.createObjectURL(new Blob([bytes],{type})),type,size:bytes.length};
 cache.set(item.id,out);return out;
}

// Susunan isian per jenis form. [key, label, satuan, opsi]
const LAYOUT={
 izin:[[['nomor','Nomor Urut Sumur Bor / Gali',''],['kedalaman','Kedalaman Konstruksi Sumur Bor / Gali','m']],[['screen','Rentang Kedalaman Screen','m',{ta:1}]],[['grouting','Rentang Kedalaman Cement Grouting','m']],[['dlubang','Diameter Lubang Bor','inchi'],['dpipa','Diameter Pipa Konstruksi Sumur Bor / Gali','inchi']],[['jpompa','Jenis Pompa','',{sel:1}],['kpompa','Kapasitas Pompa','HP'],['ppompa','Posisi Kedalaman Pompa','m']],[['akuifer','Kedalaman Akuifer Yang Disadap','m',{tip:1}]]],
 setuju:[[['nomor','Nomor Urut Sumur Bor/Gali',''],['kedalaman','Kedalaman Sumur Bor','m']],[['dpipa','Diameter Sumur Bor','inchi'],['screen','Kedudukan Saringan','m.bmt']],[['jpompa','Jenis Pompa','',{sel:1}],['kpompa','Kapasitas Pompa','HP'],['ppompa','Kedudukan Pompa','m.bmt']],[['akuifer','Kedalaman Akuifer yang Disadap','m.bmt',{tip:1}]]],
 imbuhan:[[['nomor','Nomor Urut Sumur',''],['kedalaman','Kedalaman Sumur','m']],[['jpipa','Jenis Pipa Konstruksi',''],['dpipa','Diameter Pipa Konstruksi','inchi']],[['semen','Kedudukan Semen Penyekat','m.bmt']],[['screen','Kedudukan Saringan','m.bmt',{ta:1}]],[['kerikil','Kedudukan Kerikil Pembalut','m.bmt']]]
};
const NOTE={setuju:'Form Persetujuan tidak memiliki kolom <b>Cement Grouting</b> dan <b>Diameter Lubang Bor</b>, jadi tidak ditampilkan.',imbuhan:'Form Sumur Pantau/Imbuhan tidak memiliki kolom pompa dan akuifer, jadi tidak ditampilkan.'};
const JENIS={izin:'Izin Pengusahaan Air Tanah',setuju:'Persetujuan Penggunaan Air Tanah',imbuhan:'Persetujuan Penggunaan Sumur Pantau/Imbuhan'};
const cmpKey=v=>{let t=clean(v).toLowerCase().replace(/#lt#/g,'<').replace(/#gt#/g,'>').replace(/#le#/g,'≤').replace(/#ge#/g,'≥').replace(/centrifugal/g,'sentrifugal');t=t.replace(/[–—]/g,'-').replace(/\s+/g,'').replace(/(m\.?bmt|meter|inchi|inch|hp|m)$/,'').replace(/;/g,',');return /^\d+([.,]\d+)?$/.test(t)?String(Number(t.replace(',','.'))):t;};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LOGO='data:image/png;base64,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';

const CSS=`:host{all:initial}*{box-sizing:border-box}
.back{position:fixed;inset:0;z-index:2147483600;background:rgba(16,24,40,.5);display:flex;align-items:center;justify-content:center;padding:14px;font:14px/1.45 "Segoe UI",Arial,sans-serif;color:#101828}
.m{width:min(1340px,100%);height:min(900px,100%);background:#fff;border-radius:18px;border-top:7px solid #FFF500;box-shadow:0 30px 90px rgba(0,0,0,.4);display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;position:relative}
.hd{display:flex;align-items:center;gap:16px;padding:14px 22px;border-bottom:1px solid #eaecf0}.hd img{height:38px}.hd h2{margin:0;font:800 21px/1.2 "Segoe UI",Arial}.hd .sub{font-size:13px;color:#475467;margin-top:2px}
.x{all:unset;margin-left:auto;cursor:pointer;font-size:24px;color:#667085;padding:4px 10px;border-radius:8px}.x:hover{background:#f2f4f7}
.bd{display:grid;grid-template-columns:1fr minmax(420px,500px);min-height:0}
.vw{background:#2f3337;display:grid;grid-template-rows:auto 1fr;min-height:0;position:relative}
.tb{display:flex;align-items:center;gap:8px;padding:9px 12px;background:#24272a;color:#e4e7ec;font-size:13px}
.tb button{all:unset;cursor:pointer;background:#3a3f44;border-radius:8px;padding:7px 11px;font-weight:700;color:#e4e7ec}.tb button:hover{background:#4a5056}
.tb .sel{flex:1;max-width:560px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb .sp{flex:1}
.cv{min-height:0;position:relative}.cv iframe{width:100%;height:100%;border:0;background:#525659}.cv .img{height:100%;overflow:auto;text-align:center;padding:14px}.cv .img img{max-width:100%;background:#fff;cursor:zoom-in}.cv .img img.z{max-width:none;cursor:zoom-out}
.msg{position:absolute;inset:0;display:grid;place-items:center;color:#d0d5dd;font-size:14px;text-align:center;padding:30px}
.dd{position:absolute;left:12px;top:48px;width:min(520px,calc(100% - 24px));max-height:70%;overflow:auto;background:#fff;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.45);z-index:5;font-size:13.5px;color:#101828}
.dd[hidden]{display:none}.ddh{padding:11px 16px;font-weight:800;border-bottom:1px solid #eaecf0}.dg{padding:8px 16px 4px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b6413;background:#fcfcfd}
.di{display:flex;align-items:center;gap:12px;padding:9px 16px;border-bottom:1px solid #f2f4f7;cursor:pointer}.di:hover{background:#f9fafb}.di.on{background:#FFFBD6}.di b{display:block;font-size:13.5px;font-weight:700}.di small{color:#667085;font-size:12px}.di .ck{margin-left:auto;color:#067647;font-weight:800}
.ic{width:34px;height:34px;border-radius:8px;background:#FEE4E2;color:#B42318;font-size:10.5px;font-weight:800;display:grid;place-items:center;flex:none}
.ddf{padding:9px 16px;font-size:11.5px;color:#667085;background:#fcfcfd}
.fm{padding:14px 22px;overflow:auto;display:flex;flex-direction:column;gap:9px}
.row{display:grid;gap:12px}.row>*{min-width:0}.c2{grid-template-columns:1fr 1fr}.c3{grid-template-columns:1.2fr 1fr 1fr}
.c2 .l,.c3 .l{min-height:34px;display:flex;align-items:flex-end}
.f{display:block}.l{display:block;font-size:13px;font-weight:700;color:#344054;margin-bottom:5px}
.in{display:flex;align-items:center;border:1px solid #d0d5dd;border-radius:9px;overflow:hidden;background:#fff}
.in input,.in select,.in textarea{border:0;outline:0;font:14.5px "Segoe UI",Arial;padding:8px 11px;flex:1;min-width:0;background:transparent;color:#101828;resize:none}
.in i{font-style:normal;font-size:13px;color:#475467;background:#f2f4f7;padding:9px 11px;border-left:1px solid #eaecf0;align-self:stretch;display:flex;align-items:center}
.in:focus-within{border-color:#c4b500;box-shadow:0 0 0 3px rgba(255,245,0,.35)}
.use{color:#175CD3;font-weight:700;cursor:pointer;margin-left:4px;text-decoration:underline}.pm{display:block;font-style:normal;font-size:11.5px;margin-top:3px;color:#667085}.pm.ok{color:#067647}.pm.diff{color:#B54708;font-weight:700}
.f.diff .in{border-color:#F79009;background:#FFFAEB;box-shadow:0 0 0 3px rgba(247,144,9,.15)}
.f.miss .in{background:#f2f4f7;opacity:.6}
.tip{background:#fffbe6;border:1px solid #f2e27a;border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.5;color:#5c4d00}.tip b{color:#000}
.chips{display:flex;gap:6px;margin-top:6px;align-items:center}.chips button{all:unset;cursor:pointer;border:1px solid #d0d5dd;background:#fff;border-radius:7px;padding:3px 9px;font-weight:700;font-size:12.5px;color:#101828}.chips button:hover{background:#FFF500}.chips em{font-style:normal;color:#667085;font-size:12px}
.na{font-size:12.5px;color:#475467;background:#f2f4f7;border-radius:10px;padding:9px 12px}
.ft{display:flex;align-items:center;gap:10px;padding:12px 22px;border-top:1px solid #eaecf0;background:#fcfcfd}.ft .nt{font-size:13px;color:#667085;margin-right:auto}.ft .nt b{color:#B54708}
.btn{all:unset;cursor:pointer;padding:10px 18px;border-radius:10px;border:1px solid #d0d5dd;font-weight:700;font-size:14.5px;background:#fff;color:#101828}.btn:hover{background:#f9fafb}.btn.p{background:#FFF500;border-color:#e3cf00}.btn.p:hover{background:#f5e900}.btn[disabled]{opacity:.5;cursor:default}
.ov{position:absolute;inset:0;background:rgba(16,24,40,.45);display:grid;place-items:center;z-index:9;padding:16px}
.cf{width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;background:#fff;border-radius:16px;border-top:6px solid #FFF500;box-shadow:0 30px 80px rgba(0,0,0,.45);padding:20px 24px}
.cf .src{font-size:11px;font-weight:800;letter-spacing:.08em;color:#6b6413;text-transform:uppercase}.cf h3{margin:6px 0 4px;font:800 19px "Segoe UI",Arial}.cf p{margin:0 0 10px;color:#475467;font-size:14px}
.cf .tw{overflow:auto;min-height:0}.cf table{width:100%;border-collapse:collapse;font-size:14px}.cf th{text-align:left;font-size:12px;color:#667085;font-weight:700;padding:8px 6px;border-bottom:1px solid #eaecf0;position:sticky;top:0;background:#fff}
.cf td{padding:9px 6px;border-bottom:1px solid #f2f4f7;vertical-align:top;word-break:break-word;line-height:1.45}.cf td:first-child{width:30%}.cf s{color:#98a2b3}.cf .n{color:#067647;font-weight:700}.cf .e{color:#98a2b3;font-style:italic}.cf .same td{color:#667085;font-size:13px}
.cfb{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}
.spin{width:28px;height:28px;border-radius:50%;border:3px solid #555;border-top-color:#FFF500;animation:r .8s linear infinite;margin:0 auto 10px}@keyframes r{to{transform:rotate(360deg)}}`;

let open=false;
async function openPopup(btn){
 if(open)return;
 if(isDewatering()){await AIRA_MODAL.alert('Cek Gambar Konstruksi tidak tersedia untuk izin Dewatering.',{title:'Tidak tersedia',tone:'info',source:SOURCE});return;}
 btn.disabled=true;const old=btn.textContent;btn.textContent='Membuka…';
 let data;
 try{data=await ask('read');}catch(e){btn.disabled=false;btn.textContent=old;await AIRA_MODAL.error(e.message,{title:'Data Teknis belum terbaca',source:SOURCE});return;}
 finally{btn.disabled=false;btn.textContent=old;}
 open=true;
 const tracking=labeled('Nomor Tracking'),draftKey='aira-kgk-'+(tracking||location.pathname);
 let draft={};try{draft=JSON.parse(localStorage.getItem(draftKey)||'{}');}catch{}
 const F=Object.fromEntries(data.fields.map(f=>[f.key,f]));
 const host=document.createElement('div');document.body.append(host);
 const root=host.attachShadow({mode:'open'});
 const jenis=clean(jenisIzin())||JENIS[data.kind];
 const sub=[data.nama,tracking?'Tracking '+tracking:'',jenis].filter(Boolean).map(esc).join(' · ');
 const fieldHtml=([key,label,unit,o={}],cols)=>{
  const f=F[key]||{missing:true},miss=f.missing;
  // Isian awal: draf atau isian evaluator yang sudah ada. Data pemohon hanya ditampilkan sebagai pembanding (bisa diklik untuk dipakai).
  const init=draft[key]??(f.current||'');
  let inp;
  if(o.sel){const opts=['Submersible','Sentrifugal'];const v=/centri|sentri/i.test(init)?'Sentrifugal':/submer/i.test(init)?'Submersible':'';inp=`<select data-k="${key}" ${miss?'disabled':''}><option value="">— pilih —</option>${opts.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`;}
  else if(o.ta)inp=`<textarea data-k="${key}" rows="2" ${miss?'disabled':''}>${esc(init)}</textarea>`;
  else inp=`<input data-k="${key}" value="${esc(init)}" ${miss?'disabled':''}>`;
  return `<label class="f${miss?' miss':''}" data-f="${key}"><span class="l">${esc(label)}</span><span class="in">${inp}${unit?`<i>${unit}</i>`:''}</span><em class="pm" data-pm="${key}">${miss?'Kolom ini tidak ditemukan di form INLINE':''}</em></label>`;
 };
 let form='';
 for(const r of LAYOUT[data.kind]){
  form+=r.length>1?`<div class="row ${r.length===2?'c2':'c3'}">${r.map(x=>fieldHtml(x)).join('')}</div>`:fieldHtml(r[0]);
  if(r.some(x=>x[3]?.tip))form+=`<div class="tip"><b>Catatan penulisan akuifer di INLINE:</b> <b>#lt#</b> = &lt; · <b>#gt#</b> = &gt; · <b>#le#</b> = ≤ · <b>#ge#</b> = ≥<br>Contoh: <b>#gt# 60</b> tampil “&gt; 60” · <b>#ge# 40</b> tampil “≥ 40”.<div class="chips">${['#lt#','#gt#','#le#','#ge#'].map(c=>`<button type="button" data-ins="${c}">${c}</button>`).join('')}<em>klik untuk menyisipkan ke isian akuifer</em></div></div>`;
 }
 if(NOTE[data.kind])form+=`<div class="na">${NOTE[data.kind]}</div>`;
 root.innerHTML=`<style>${CSS}</style><div class="back"><div class="m" role="dialog" aria-label="Cek Gambar Konstruksi">
  <div class="hd"><img src="${LOGO}" alt="Kementerian ESDM"><div><h2>Cek Gambar Konstruksi</h2><div class="sub">${sub}</div></div><button class="x" title="Tutup" data-a="close">✕</button></div>
  <div class="bd"><div class="vw"><div class="tb"><button class="sel" data-a="pick">📄 Pilih dokumen…</button><span class="sp"></span><button data-a="tab" title="Buka dokumen di tab baru">↗ Tab baru</button></div>
   <div class="cv"><div class="msg">Memuat daftar lampiran…</div></div>
   <div class="dd" hidden></div></div>
   <div class="fm">${form}</div></div>
  <div class="ft"><span class="nt"></span><button class="btn" data-a="close">Batal</button><button class="btn" data-a="draft">Simpan draf</button><button class="btn p" data-a="fill">Isi ke Data Teknis INLINE</button></div>
 </div></div>`;
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const close=()=>{open=false;host.remove();document.removeEventListener('keydown',onKey,true);};
 const onKey=e=>{if(e.key==='Escape'&&!$('.ov')){e.stopPropagation();close();}};
 document.addEventListener('keydown',onKey,true);
 const values=()=>Object.fromEntries($$('[data-k]').filter(el=>!el.disabled).map(el=>[el.dataset.k,clean(el.value)]));
 // Penanda beda dengan data pemohon (A)
 function refresh(){
  const diff=[];
  for(const el of $$('[data-k]')){
   const k=el.dataset.k,f=F[k];if(!f||f.missing)continue;
   const lab=el.closest('.f'),pm=$(`[data-pm="${k}"]`),v=clean(el.value),p=f.pemohon;
   if(!p){pm.className='pm';pm.textContent='Pemohon: (kosong)';lab.classList.remove('diff');continue;}
   const ok=!v||cmpKey(v)===cmpKey(p);
   pm.className='pm '+(v?(ok?'ok':'diff'):'');pm.innerHTML='Pemohon: '+esc(p)+(v?(ok?' ✓':' ⚠ beda'):'')+(v&&ok?'':' <a class="use" data-use="'+k+'">pakai</a>');
   lab.classList.toggle('diff',!!v&&!ok);if(v&&!ok)diff.push(lab.querySelector('.l').textContent);
  }
  const all=$$('[data-k]').filter(el=>!el.disabled),done=all.filter(el=>clean(el.value)).length;
  $('.nt').innerHTML=`Terisi ${done} dari ${all.length} isian`+(diff.length?` · <b>⚠ ${diff.length} berbeda dengan data pemohon</b>: ${esc(diff.join(', '))}`:done?' · sama dengan data pemohon':'');
 }
 root.addEventListener('input',refresh);root.addEventListener('change',refresh);refresh();
 // Klik "pakai" = salin nilai pemohon ke isian
 root.addEventListener('click',e=>{const u=e.target.closest('[data-use]');if(!u)return;e.preventDefault();const k=u.dataset.use,el=$(`[data-k="${k}"]`),p=F[k]?.pemohon||'';if(!el)return;if(el.tagName==='SELECT')el.value=/centri|sentri/i.test(p)?'Sentrifugal':/submer/i.test(p)?'Submersible':'';else el.value=p;refresh();});
 // Sisipkan kode akuifer
 let lastAk=null;$('[data-k="akuifer"]')?.addEventListener('focus',e=>lastAk=e.target);
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-ins]');if(!b)return;
  const el=$('[data-k="akuifer"]');if(!el||el.disabled)return;
  const s=el.selectionStart??el.value.length,t=el.selectionEnd??s,code=b.dataset.ins+' ';
  el.value=el.value.slice(0,s)+code+el.value.slice(t).replace(/^\s+/,'');el.focus();el.setSelectionRange(s+code.length,s+code.length);refresh();
 });
 // Penampil dokumen
 const list=listAttachments(),rec=suggest(list);let current=null;
 const cv=$('.cv'),dd=$('.dd');
 function renderList(){
  const rest=list.filter(x=>x!==rec);
  const item=x=>`<div class="di${current===x?' on':''}" data-id="${x.id}"><span class="ic">${String(x.no).padStart(2,'0')}</span><div><b>${esc(x.title)}</b></div>${current===x?'<span class="ck">✓</span>':''}</div>`;
  dd.innerHTML=`<div class="ddh">Pilih dokumen gambar konstruksi</div>${rec?`<div class="dg">Disarankan · ${isPerpanjangan()?'Laporan Teknis':'persyaratan gambar konstruksi'}</div>${item(rec)}`:''}<div class="dg">${rec?'Lampiran lain':'Semua lampiran'}</div>${rest.map(item).join('')||'<div class="ddf">Tidak ada lampiran lain.</div>'}<div class="ddf">Hanya untuk melihat; pilihan tidak mengubah lampiran di INLINE.</div>`;
 }
 async function show(x){
  current=x;dd.hidden=true;$('[data-a="pick"]').textContent='📄 '+String(x.no).padStart(2,'0')+' · '+x.title+' ▾';
  cv.innerHTML='<div class="msg"><div><div class="spin"></div>Membuka lampiran…</div></div>';
  try{
   const f=await loadFile(x);if(current!==x)return;
   if(f.type==='application/pdf')cv.innerHTML=`<iframe src="${f.url}#view=FitH" title="${esc(x.title)}"></iframe>`;
   else{cv.innerHTML=`<div class="img"><img src="${f.url}" alt="${esc(x.title)}"></div>`;const im=cv.querySelector('img');im.onclick=()=>im.classList.toggle('z');}
  }catch(e){if(current===x)cv.innerHTML=`<div class="msg">${esc(e.message)}</div>`;}
 }
 if(!list.length)cv.innerHTML='<div class="msg">Daftar lampiran tidak ditemukan di halaman ini.<br>Buka bagian Dokumen Persyaratan, lalu buka lagi Cek Gambar Konstruksi.</div>';
 else{renderList();show(rec||list[0]);if(!rec)setTimeout(()=>{renderList();dd.hidden=false;},300);}
 dd.addEventListener('click',e=>{const d=e.target.closest('.di');if(!d)return;const x=list.find(y=>y.id===d.dataset.id);if(x){show(x);renderList();}});
 root.addEventListener('click',async e=>{
  const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;
  if(a==='close')close();
  if(a==='pick'){if(list.length){renderList();dd.hidden=!dd.hidden;}}
  if(a==='tab'){if(current){try{const f=await loadFile(current);window.open(f.url,'_blank');}catch(err){AIRA_MODAL.error(err.message,{source:SOURCE});}}}
  if(a==='draft'){try{localStorage.setItem(draftKey,JSON.stringify(values()));}catch{}const b=e.target.closest('button');b.textContent='Draf tersimpan ✓';setTimeout(()=>b.textContent='Simpan draf',1600);}
  if(a==='fill')fill(e.target.closest('button'));
 });
 root.addEventListener('click',e=>{if(!dd.hidden&&!e.target.closest('.dd')&&!e.target.closest('[data-a="pick"]'))dd.hidden=true;},true);
 // Isi ke Data Teknis INLINE, dengan konfirmasi bila isian evaluator sudah terisi dan berbeda (B)
 async function fill(b){
  const v=values();
  if(!Object.values(v).some(Boolean)){await AIRA_MODAL.alert('Isi minimal satu isian terlebih dahulu.',{title:'Belum ada isian',tone:'info',source:SOURCE});return;}
  b.disabled=true;
  try{
   const rows=await ask('preview',{values:v});
   const change=rows.filter(r=>r.status==='change'),fillr=rows.filter(r=>r.status==='fill'),same=rows.filter(r=>r.status==='same');
   if(!change.length&&!fillr.length){await AIRA_MODAL.alert('Data Teknis INLINE sudah sama dengan isian ini. Tidak ada yang perlu diisi.',{title:'Sudah sama',tone:'info',source:SOURCE});return;}
   if(change.length&&!(await confirmTable(change,fillr,same)))return;
   const r=await ask('apply',{values:v});
   try{localStorage.removeItem(draftKey);}catch{}
   close();
   await AIRA_MODAL.alert('Diisi: '+r.filled.length+' isian (ditandai kuning)'+(r.failed.length?'\nPerlu diisi manual: '+r.failed.join('; '):'')+'\n\nPeriksa kembali, lalu simpan seperti biasa di formulir Data Teknis evaluator.',{title:'Data Teknis INLINE terisi',tone:'ok',source:SOURCE});
  }catch(err){await AIRA_MODAL.error(err.message,{title:'Belum berhasil mengisi',source:SOURCE});}
  finally{b.disabled=false;}
 }
 function confirmTable(change,fillr,same){
  return new Promise(res=>{
   const ov=document.createElement('div');ov.className='ov';
   const tr=r=>`<tr><td>${esc(r.label)}</td><td>${r.current?`<s>${esc(r.current)}</s>`:'<span class="e">kosong</span>'}</td><td class="n">${esc(r.next)}</td></tr>`;
   ov.innerHTML=`<div class="cf" role="alertdialog"><span class="src">AIRA · Cek Gambar Konstruksi</span><h3>Isi ke Data Teknis INLINE?</h3><p>Data Teknis Isian Evaluator sudah berisi. Periksa perubahan berikut:</p>
    <div class="tw"><table><tr><th>Kolom INLINE</th><th>Isian sekarang</th><th>Akan diisi</th></tr>${change.map(tr).join('')}${fillr.map(tr).join('')}${same.length?`<tr class="same"><td colspan="3">${same.length} isian lain sama, tidak diubah</td></tr>`:''}</table></div>
    <div class="cfb"><button class="btn" data-c="0">Batal</button><button class="btn p" data-c="1">Simpan</button></div></div>`;
   $('.m').append(ov);ov.querySelector('[data-c="1"]').focus();
   ov.addEventListener('click',e=>{const c=e.target.closest('[data-c]');if(!c)return;ov.remove();res(c.dataset.c==='1');});
  });
 }
}

// Tombol (diatur ke grup Evaluasi oleh Panel AIRA)
const button=document.createElement('button');button.type='button';button.textContent='Cek Gambar Konstruksi';
button.style.cssText='position:fixed;right:25px;bottom:440px;z-index:99999;background:#0f6e8c;color:white;padding:14px;border:0;border-radius:8px;cursor:pointer';
document.body.append(button);
button.onclick=()=>openPopup(button);
// Sembunyikan untuk Dewatering (Jenis Izin dibaca setelah halaman selesai dimuat).
const vis=()=>{button.style.display=isDewatering()?'none':'';};vis();setTimeout(vis,1500);setTimeout(vis,4000);
})();
