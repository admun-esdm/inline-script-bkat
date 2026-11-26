// ==UserScript==
// @name         INLINE Lampiran dan Data Lengkap - Sheets Bersama
// @namespace    inline-rekan-lengkap
// @version      3.10.3
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinStaf/*
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinPre/*
// @match        https://formgen-perizinan.esdm.go.id/FormgenInline/*
// @match        https://script.google.com/macros/s/*
// @match        https://script.google.com/macros/u/*
// @match        https://*.googleusercontent.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      formgen-perizinan.esdm.go.id
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @connect      www.googleapis.com
// @updateURL    https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Lengkap_Pengusahaan_Bersama.user.js
// @downloadURL  https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Lengkap_Pengusahaan_Bersama.user.js
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
// R20: URL dan token tidak lagi ditulis di kode, tetapi disimpan di Tampermonkey pada PC masing-masing
// (menu Tampermonkey -> "Pengaturan INLINE"), sehingga pembaruan otomatis dari GitHub tidak menghapusnya.
// Pengelola cukup mengisi URL penerima Sheets bersama di bawah ini sekali (sama untuk semua evaluator).
const WEB_APP_URL_BERSAMA='https://script.google.com/macros/s/AKfycbzrKfHNBo7uUmWWVwjxrqtJIQBqRZ-ZR8rzwfxvxMEH2FLtOaKrGlsWp5G00E-Rs6RL/exec';
// Bila Apps Script Drive memakai satu deployment untuk semua evaluator (dijalankan sebagai pengguna yang mengakses), isi di sini juga.
const DRIVE_WEB_APP_URL_BERSAMA='https://script.google.com/macros/s/AKfycbwQTme5qJgbRWULQw-v9pMXKP-AUPvmhnk2-Feu5A50jUFAGHcLiHVWWUhhKalu0SqAeA/exec';
const EXEC_URL=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const CFG={url:'inline_cfg_web_app_url',token:'inline_cfg_token',drive:'inline_cfg_drive_url'};
let WEB_APP_URL,TOKEN,DRIVE_WEB_APP_URL;
function loadConfig(){
 const shared=EXEC_URL.test(WEB_APP_URL_BERSAMA)?WEB_APP_URL_BERSAMA:'';
 const sharedDrive=EXEC_URL.test(DRIVE_WEB_APP_URL_BERSAMA)?DRIVE_WEB_APP_URL_BERSAMA:'';
 WEB_APP_URL=shared||GM_getValue(CFG.url,'')||'ISI_URL_WEB_APP_DI_SINI';
 TOKEN=GM_getValue(CFG.token,'')||'ISI_TOKEN_DI_SINI';
 DRIVE_WEB_APP_URL=sharedDrive||GM_getValue(CFG.drive,'')||'ISI_URL_WEB_APP_DRIVE_AKUN_EVALUATOR';
 return {shared,sharedDrive};
}
loadConfig();
// R20: tampilan AIRA untuk semua dialog script (warna kuning ESDM + gerak halus).
const AIRA_CSS=`
dialog.aira-dlg{border:0!important;border-top:6px solid #f5e62a!important;border-radius:16px!important;box-shadow:0 24px 64px rgba(16,24,40,.35)!important;font-family:"Segoe UI",Arial,sans-serif!important;color:#1d2939!important;animation:aira-pop .24s cubic-bezier(.2,.9,.3,1.2)}
dialog.aira-dlg::backdrop{background:rgba(15,23,42,.45);animation:aira-fade .2s ease-out}
dialog.aira-dlg h2,dialog.aira-dlg h3{color:#111!important;font-family:"Segoe UI",Arial,sans-serif!important;font-weight:800!important}
dialog.aira-dlg button{position:relative!important;overflow:hidden!important;font:600 14px/1.2 "Segoe UI",Arial,sans-serif!important;text-shadow:none!important;letter-spacing:normal!important;text-transform:none!important;border-radius:10px!important;padding:9px 18px!important;cursor:pointer!important;background:#fff!important;color:#1d2939!important;border:1px solid #d0d5dd!important;box-shadow:none!important;opacity:1!important;transition:transform .16s cubic-bezier(.2,.9,.3,1.3),box-shadow .18s,background .18s!important}
dialog.aira-dlg button[type=submit],dialog.aira-dlg button.aira-primary{background:#f5e62a!important;border-color:#e3d64a!important;color:#111!important;font-weight:800!important}
dialog.aira-dlg button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(17,17,17,.12)!important}
dialog.aira-dlg button[type=submit]:hover:not(:disabled){background:#ffe94d!important}
dialog.aira-dlg button:active:not(:disabled){transform:scale(.97);transition-duration:.08s!important}
dialog.aira-dlg button:disabled{opacity:.55!important;cursor:not-allowed!important}
dialog.aira-dlg button:focus-visible{outline:2px solid #111!important;outline-offset:2px}
dialog.aira-dlg input[type=text],dialog.aira-dlg input[type=password],dialog.aira-dlg input:not([type]),dialog.aira-dlg textarea{border-radius:8px!important;transition:border-color .15s,box-shadow .15s!important}
dialog.aira-dlg input:focus,dialog.aira-dlg textarea:focus{outline:0!important;border-color:#b8a90f!important;box-shadow:0 0 0 3px rgba(245,230,42,.5)!important}
dialog.aira-dlg input[type=radio],dialog.aira-dlg input[type=checkbox]{accent-color:#111}
dialog.aira-dlg [role=alert]:not([hidden]){animation:aira-shake .3s}
.aira-ripple{position:absolute;border-radius:50%;pointer-events:none;background:rgba(17,17,17,.12);transform:scale(0);animation:aira-ripple .55s ease-out forwards}
@keyframes aira-pop{from{transform:translateY(10px) scale(.96);opacity:0}to{transform:none;opacity:1}}
@keyframes aira-fade{from{opacity:0}to{opacity:1}}
@keyframes aira-ripple{to{transform:scale(1);opacity:0}}
@keyframes aira-shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@media (prefers-reduced-motion:reduce){dialog.aira-dlg,dialog.aira-dlg *,dialog.aira-dlg::backdrop{animation:none!important;transition:none!important}}`;
function airaDialog(){
 if(!document.getElementById('aira-ui-style')){const st=document.createElement('style');st.id='aira-ui-style';st.textContent=AIRA_CSS;(document.head||document.documentElement).append(st);
  document.addEventListener('pointerdown',e=>{const b=e.target.closest?.('dialog.aira-dlg button');if(!b||b.disabled)return;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch{}
   const r=b.getBoundingClientRect(),size=Math.max(r.width,r.height)*2.2,sp=document.createElement('span');sp.className='aira-ripple';sp.setAttribute('aria-hidden','true');
   sp.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-r.left-size/2)+'px;top:'+(e.clientY-r.top-size/2)+'px';b.append(sp);setTimeout(()=>sp.remove(),600);},true);}
 const d=document.createElement('dialog');d.classList.add('aira-dlg');return d;
}
// CSS halaman INLINE mengubah warna/huruf tombol dan isian. Semua gaya dialog script dikunci dengan !important.
function lockDialogStyle(root){
 const base={'font-family':'Arial,Helvetica,sans-serif','text-shadow':'none','letter-spacing':'normal','text-transform':'none','box-shadow':'none'};
 for(const el of [root,...root.querySelectorAll('*')]){
  const own=[...el.style].map(p=>[p,el.style.getPropertyValue(p)]);
  if(/^(INPUT|TEXTAREA|SELECT|LABEL|H2|H3|P|DIV|SPAN|B|SMALL|FORM)$/.test(el.tagName))for(const [k,v] of Object.entries(base))if(!el.style.getPropertyValue(k))el.style.setProperty(k,v,'important');
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)){if(!el.style.getPropertyValue('color'))el.style.setProperty('color','#24344a','important');if(!el.style.getPropertyValue('background'))el.style.setProperty('background',el.tagName==='BUTTON'?'#e4e7ec':'#fff','important');el.style.setProperty('opacity','1','important');}
  if(el.tagName==='BUTTON'){for(const p of ['background','color','border','padding','border-radius','font','opacity','box-shadow'])el.style.removeProperty(p);continue;}
  for(const [k,v] of own)if(!(el===root&&/^border/.test(k)))el.style.setProperty(k,v,'important');
 }
 root.style.setProperty('color','#24344a','important');
}
const driveJobKey=id=>'inline-drive-user:'+id;
async function bootDriveAccountBridge(){
 let root=null;
 for(let i=0;i<60&&!root;i++){root=document.querySelector('#inline-evaluator-drive-root[data-app="inline-drive-account-r4"],#inline-evaluator-drive-root[data-app="inline-drive-auth-r5"]');if(!root)await new Promise(r=>setTimeout(r,500));}
 if(!root)return;
 const ancestors=Array.from(location.ancestorOrigins||[]);
 if(ancestors.some(origin=>{try{const host=new URL(origin).hostname;return host!=='ngantor.esdm.go.id'&&host!=='script.google.com'&&!/(?:^|\.)googleusercontent\.com$/.test(host);}catch{return true;}}))return;
 const job=root.dataset.job;if(!/^[a-f0-9-]{36}$/i.test(job||''))return;
 document.addEventListener('INLINE_DRIVE_BRIDGE_REQUEST',async e=>{
  let q;try{q=JSON.parse(e.detail);}catch{return;}if(q.job!==job)return;
  let response;try{
   const meta=await GM_getValue(driveJobKey(job));if(!meta||Date.now()-meta.createdAt>30*60*1000)throw Error('Sesi lampiran berakhir/tidak ditemukan pada profil browser ini. Kembali ke INLINE dan periksa folder sebelum memulai ulang.');
   if(q.kind==='auth'){const a=q.data||{};if(meta.kind!=='auth'||typeof a.token!=='string'||!a.token||typeof a.email!=='string'||!a.email||!a.folders||typeof a.folders!=='object')throw Error('Data akun tidak valid.');
    await GM_setValue(driveJobKey(job),{...meta,auth:{email:a.email.toLowerCase(),token:a.token,exp:Date.now()+50*60*1000,folders:a.folders}});response={ok:true};}
   else if(q.kind==='manifest'&&meta.kind==='auth'){await GM_setValue(driveJobKey(job),{...meta,halamanLama:true});throw Error('Project Apps Script Drive belum diperbarui ke R21. Tutup jendela ini.');}
   else if(q.kind==='manifest'){const seen={...meta,bridgeSeenAt:Date.now()};await GM_setValue(driveJobKey(job),seen);response=seen;}
   else if(q.kind==='file'){if(meta.status!=='uploading'||!Number.isInteger(q.index)||q.index<0||q.index>=meta.names.length)throw Error('Permintaan PDF tidak valid.');response={base64:await GM_getValue(driveJobKey(job)+':'+q.index)};if(!response.base64)throw Error('PDF tidak tersedia.');}
   else if(q.kind==='status'){const allowed=['uploading','success','error'];if(!allowed.includes(q.data?.status))throw Error('Status tidak valid.');const next={...meta,status:q.data.status,account:String(q.data.account||''),written:Number(q.data.written)||0,folderUrl:String(q.data.folderUrl||''),folderName:String(q.data.folderName||''),message:String(q.data.message||'')};await GM_setValue(driveJobKey(job),next);if(next.status==='success')for(let i=0;i<meta.names.length;i++)await GM_deleteValue(driveJobKey(job)+':'+i);response={ok:true};}
   else throw Error('Permintaan jembatan tidak dikenali.');
   document.dispatchEvent(new CustomEvent('INLINE_DRIVE_BRIDGE_RESPONSE',{detail:JSON.stringify({nonce:q.nonce,result:response})}));
  }catch(err){document.dispatchEvent(new CustomEvent('INLINE_DRIVE_BRIDGE_RESPONSE',{detail:JSON.stringify({nonce:q.nonce,error:err.message})}));}
 });
 document.documentElement.dataset.inlineDriveBridge='ready';
}
if(location.hostname==='script.google.com'||/(?:^|\.)googleusercontent\.com$/.test(location.hostname)){bootDriveAccountBridge();return;}

// Jembatan lookup baca saja untuk popup Cek Lokasi Sumur.
if(window===window.top)document.addEventListener('INLINE_SCALE_REQUEST',async e=>{
 let q;try{q=JSON.parse(e.detail);}catch{return;}
 const respond=v=>document.dispatchEvent(new CustomEvent('INLINE_SCALE_RESPONSE',{detail:JSON.stringify({nonce:q.nonce,...v})}));
 try{
  if(!WEB_APP_URL.startsWith('https://script.google.com/macros/s/')||TOKEN==='ISI_TOKEN_DI_SINI')throw Error('URL/token belum diatur. Klik ikon Tampermonkey → Pengaturan INLINE.');
  const v=await new Promise((resolve,reject)=>GM_xmlhttpRequest({method:'POST',url:WEB_APP_URL,headers:{'Content-Type':'application/json'},data:JSON.stringify({token:TOKEN,action:'scale_lookup',data:q.data}),timeout:45000,onload:r=>{try{if(r.status<200||r.status>=300)throw Error('Lookup database: HTTP '+r.status+'. Periksa deployment Sheets dan aksesnya.');if(/^\s*</.test(r.responseText||''))throw Error('Penerima Sheets mengembalikan halaman HTML. Periksa WEB_APP_URL Sheets, deployment Execute as Me, dan akses web app. URL Drive harus terpisah.');const x=JSON.parse(r.responseText);if(!x.ok)throw Error(x.message||'Lookup ditolak.');resolve(x);}catch(err){reject(err);}},onerror:()=>reject(Error('Database tidak dapat dihubungi.')),ontimeout:()=>reject(Error('Lookup database belum merespons dalam 45 detik. Periksa Eksekusi project Sheets untuk action scale_lookup revisi R7.'))}));respond({result:v});
 }catch(err){respond({error:err.message});}
});

const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).replace(/\*\)/g,'').toLowerCase();
function row(root,label){
 for(const tr of root.querySelectorAll('tr')){
  const c=tr.querySelectorAll(':scope > td');
  if(c.length<2||norm(c[0].textContent)!==norm(label))continue;
  const el=c[1].querySelector('input:not([type=hidden]):not([type=button]),textarea,select');
  if(el)return clean(el.tagName==='SELECT'?el.selectedOptions[0]?.textContent:el.value);
  const copy=c[1].cloneNode(true);copy.querySelectorAll('a,button,i,script,style').forEach(x=>x.remove());
  return clean(copy.textContent);
 }return '';
}
function field(form,name){const e=form.querySelector('[name="'+name+'"]');return clean(e?.tagName==='SELECT'?e.selectedOptions[0]?.textContent:e?.value);}
// R18: pembaca form Persetujuan Penggunaan Sumur Pantau/Imbuhan (satu form berisi data pemohon dan input evaluator).
// R19: pembaca form Persetujuan Penggunaan Air Tanah (template "Persetujuan Penggunaan Air Tanah").
const SETUJU_DEBIT='JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH_EVALUATOR';
const isSetujuForm=f=>!!f.querySelector('[name="__'+SETUJU_DEBIT+'"],[name="'+SETUJU_DEBIT+'"]');
function readSetujuForm(doc){
 const form=[...doc.querySelectorAll('form[id^="formColumnar_"]')].find(isSetujuForm);
 if(!form)return {exists:false};
 const pick=n=>{const v=field(form,n);return /^-+\s*pilih/i.test(v)?'':v;};
 const num=n=>{const hidden=field(form,n);if(hidden)return hidden;const shown=field(form,'__'+n);return shown?shown.replace(/\./g,''):'';};
 const coord=form.querySelector('[idElement="KOORDINAT_LOKASI"]')?.getAttribute('coord')||row(form,'Koordinat Sumur').replace(/contoh.*$/i,'');
 const lbl=id=>clean(doc.getElementById(id)?.textContent);
 return {exists:true,template:clean(doc.getElementById('_NAMA_TEMPLATE_')?.value),
  nama:row(form,'Nama Instansi/Kelompok Masyarakat')||row(form,'Nama Pemohon'),pemohon:row(form,'Nama Pemohon'),koordinat:clean(coord),
  rencana:row(form,'Rencana Debit yang Dimohonkan'),prov:row(form,'Provinsi'),kab:row(form,'Kabupaten/Kota'),kec:row(form,'Kecamatan'),desa:row(form,'Desa/Kelurahan'),
  fields:{sumur:pick('NOMOR_URUT_SUMUR_BOR_EVALUATOR'),kedalaman:num('KEDALAMAN_SUMUR_BOR_EVALUATOR'),diameter:num('DIAMETER_SUMUR_BOR_EVALUATOR'),diameterUnit:lbl('lbl_SATUAN_DIAMETER_SUMUR_BOR_EVALUATOR'),
   akuifer:pick('KEDALAMAN_AKUIFER_EVALUATOR'),screen:pick('KEDUDUKAN_SARINGAN_EVALUATOR'),pompa:pick('JENIS_POMPA_EVALUATOR'),kapasitas:num('KAPASITAS_POMPA_EVALUATOR'),kapasitasUnit:lbl('lbl_SATUAN_KAPASITAS_POMPA_EVALUATOR'),
   posisi:pick('KEDUDUKAN_POMPA_EVALUATOR'),debit:num(SETUJU_DEBIT),peruntukan:pick('PERUNTUKAN_AIR_TANAH_EVALUATOR'),masa:pick('MASA_BERLAKU')}};
}
function readImbuhanForm(doc){
 const form=[...doc.querySelectorAll('form[id^="formColumnar_"]')].find(f=>f.querySelector('[name="NOMOR_URUT_SUMUR_BOR_EVALUATOR"]')&&!isSetujuForm(f));
 if(!form)return {exists:false};
 const num=n=>{const hidden=field(form,n);if(hidden)return hidden;const shown=field(form,'__'+n);return shown?shown.replace(/\./g,''):'';};
 const coord=form.querySelector('[idElement="KOORDINAT_LOKASI_PENGGUNAAN_AIR_TANAH"]')?.getAttribute('coord')||row(form,'Koordinat Lokasi');
 return {exists:true,template:clean(doc.getElementById('_NAMA_TEMPLATE_')?.value),
  peruntukan:clean(doc.getElementById('lbl_PERUNTUKAN_PENGGUNAAN_AIR_TANAH')?.textContent)||row(form,'Peruntukan Sumur Bor'),
  nama:row(form,'Nama Perusahaan/ Instansi')||row(form,'Nama Pemohon'),alamat:row(form,'Alamat Pemohon'),koordinat:clean(coord),
  prov:row(form,'Provinsi'),kab:row(form,'Kabupaten/ Kota'),kec:row(form,'Kecamatan'),desa:row(form,'Desa/ Kelurahan'),sumurPemohon:row(form,'Nomor Urut Sumur'),
  fields:{sumur:field(form,'NOMOR_URUT_SUMUR_BOR_EVALUATOR'),kedalaman:num('KEDALAMAN_SUMUR_EVALUATOR'),pipa:field(form,'JENIS_PIPA_KONSTRUKSI_EVALUATOR'),diameter:num('DIAMETER_PIPA_KONSTRUKSI_EVALUATOR'),diameterUnit:clean(doc.getElementById('lbl_SATUAN_DIAMETER_PIPA_EVALUATOR')?.textContent),semen:field(form,'KEDUDUKAN_SEMEN_PENYEKAT_EVALUATOR'),screen:field(form,'KEDUDUKAN_SARINGAN_EVALUATOR'),kerikil:field(form,'KEDUDUKAN_KERIKIL_PEMBALUT_EVALUATOR'),akuifer:field(form,'KEDALAMAN_AKUIFER_YANG_DISADAP_EVALUATOR'),masa:field(form,'MASA_BERLAKU'),keterangan:field(form,'KETERANGAN')}};
}
if(location.hostname==='formgen-perizinan.esdm.go.id'){
 window.addEventListener('message',e=>{
  if(e.origin!=='https://ngantor.esdm.go.id'||e.source!==window.parent||e.data?.kind!=='OSS_SETUJU_READ')return;
  window.parent.postMessage({kind:'OSS_SETUJU_RESULT',nonce:e.data.nonce,data:readSetujuForm(document)},e.origin);
 });
 window.addEventListener('message',e=>{
  if(e.origin!=='https://ngantor.esdm.go.id'||e.source!==window.parent||e.data?.kind!=='OSS_IMBUHAN_READ')return;
  window.parent.postMessage({kind:'OSS_IMBUHAN_RESULT',nonce:e.data.nonce,data:readImbuhanForm(document)},e.origin);
 });
 window.addEventListener('message',e=>{
  if(e.origin!=='https://ngantor.esdm.go.id'||e.source!==window.parent||e.data?.kind!=='OSS_LENGKAP_READ')return;
  // Pasangan formulir evaluator dan permohonan: Baru/Penataan, Perpanjangan, dan Perubahan.
  const pairs=[['formColumnar_2055','formColumnar_2054'],['formColumnar_2053','formColumnar_2052'],['formColumnar_2057','formColumnar_2056']];
  const available=pairs.filter(([id])=>document.getElementById(id));
  const pair=available.length===1?available[0]:null;
  const form=pair?document.getElementById(pair[0]):null;
  const source=pair?document.getElementById(pair[1]):null;
  const names=['ALAMAT_LOKASI_SUMUR','LATITUDE_TITIK_LOKASI','LONGITUDE_TITIK_LOKASI','NOMOR_URUT_SUMUR_BOR','KEDALAMAN_SUMUR_BOR','DIAMETER_PIPA_KONSTRUKSI','RENTANG_KEDALAMAN_SCREEN','JENIS_POMPA','KAPASITAS_POMPA','POSISIS_KEDALAMAN_POMPA','JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH','PERUNTUKAN_PENGGUNAAN_AIR_TANAH','KEDALAMAN_AKUIFER','SKALA_USAHA','MASA_BERLAKU','TGL_MULAI_PENGAMBILAN'];
  const fields={};if(form)names.forEach(n=>fields[n]=field(form,n));
  const data={fields,exists:!!form,nama:source?row(source,'Nama Perusahaan'):'',sumur:source?row(source,'Nomor Urut Sumur Bor / Gali'):'',rencana:source?row(source,'Debit Rencana yang Diajukan'):'',satuan:form?row(form,'Satuan Kapasitas Pompa'):'',diameterUnit:form?row(form,'Satuan Diameter Lubang Bor'):'',prov:form?row(form,'Provinsi'):'',kab:form?row(form,'Kabupaten/Kota'):'',kec:form?row(form,'Kecamatan'):'',desa:form?row(form,'Desa/Kelurahan'):''};
  window.parent.postMessage({kind:'OSS_LENGKAP_RESULT',nonce:e.data.nonce,data},e.origin);
 });return;
}
if(window!==window.top)return;
// Jendela Pengaturan INLINE: muncul sendiri bila token belum diisi, dan dapat dibuka dari menu Tampermonkey.
function openSettings(first){
 if(document.getElementById('inline-settings-dialog'))return;
 const {shared,sharedDrive}=loadConfig();
 const d=airaDialog();d.id='inline-settings-dialog';
 d.style.cssText='width:min(620px,calc(100vw - 40px));border:0;border-radius:12px;padding:24px;background:#fff;color:#24344a;font:14px/1.5 Arial,sans-serif;box-shadow:0 16px 60px #0005';
 const field=(id,label,value,hint,type='text')=>`<label for="${id}" style="display:block;font-weight:bold;margin-top:12px">${label}</label><input id="${id}" type="${type}" autocomplete="off" spellcheck="false" style="display:block;width:100%;box-sizing:border-box;margin:4px 0 2px;padding:9px;border:1px solid #9caabc;border-radius:6px;font:13px monospace" value="${String(value).replace(/"/g,'&quot;')}"><div style="color:#667;font-size:12px">${hint}</div>`;
 const cur=k=>GM_getValue(CFG[k],'');
 d.innerHTML=`<form method="dialog" novalidate><h2 style="margin:0 0 4px;font-size:20px">Pengaturan INLINE</h2>
 <p style="margin:0 0 6px;color:#556">${first?'Token belum diisi. ':''}Isian ini tersimpan di Tampermonkey pada PC ini dan <b>tidak hilang</b> saat script diperbarui otomatis.</p>
 ${shared?'<div style="margin-top:12px;color:#556;font-size:12px">URL penerima Sheets bersama sudah diatur oleh pengelola.</div>':field('inline-cfg-url','URL penerima Sheets bersama (WEB_APP_URL)',cur('url'),'Dari pengelola. Berakhiran /exec.')}
 ${field('inline-cfg-token','TOKEN evaluator',cur('token'),'Token milik Anda dari pengelola.','password')}
 <label style="font-size:12px;color:#556"><input type="checkbox" id="inline-cfg-show"> tampilkan token</label>
 ${sharedDrive?'':field('inline-cfg-drive','URL Apps Script Drive akun Anda (DRIVE_WEB_APP_URL)',cur('drive'),'Untuk tombol Simpan Lampiran ke Drive. Berakhiran /exec. Boleh dikosongkan bila tidak dipakai.')}
 <div role="alert" hidden style="margin-top:12px;color:#b42318"></div>
 <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button type="button" data-act="cancel" style="padding:9px 16px;border:0;border-radius:6px;background:#e4e7ec;cursor:pointer">Nanti</button><button type="submit" style="padding:9px 16px;border:0;border-radius:6px;background:#1f6f43;color:#fff;font-weight:bold;cursor:pointer">Simpan</button></div></form>`;
 const q=s=>d.querySelector(s),err=q('[role=alert]');
 q('#inline-cfg-show').onchange=e=>{q('#inline-cfg-token').type=e.target.checked?'text':'password';};
 const close=()=>{d.close();d.remove();};
 q('[data-act=cancel]').onclick=close;d.addEventListener('cancel',close);
 q('form').onsubmit=e=>{
  e.preventDefault();const url=(q('#inline-cfg-url')?.value||'').trim(),token=q('#inline-cfg-token').value.trim(),drive=(q('#inline-cfg-drive')?.value||'').trim();
  const fail=m=>{err.hidden=false;err.textContent=m;};
  if(!shared&&!EXEC_URL.test(url))return fail('URL penerima Sheets harus berbentuk https://script.google.com/macros/s/.../exec');
  if(!token||/\s/.test(token)||/^ISI_/i.test(token))return fail('Isi TOKEN evaluator.');
  if(drive&&!EXEC_URL.test(drive))return fail('URL Drive harus berbentuk https://script.google.com/macros/s/.../exec (atau kosongkan).');
  if(!shared)GM_setValue(CFG.url,url);GM_setValue(CFG.token,token);if(!sharedDrive)GM_setValue(CFG.drive,drive);
  loadConfig();close();AIRA_MODAL.alert('Token tersimpan di Tampermonkey pada PC ini dan tidak hilang saat script diperbarui.',{title:'Pengaturan INLINE tersimpan',tone:'ok',source:'Pengaturan'});
 };
 lockDialogStyle(d);document.body.append(d);d.showModal();
}
try{GM_registerMenuCommand('Pengaturan INLINE (URL & token)',()=>openSettings(false));}catch{}
try{GM_registerMenuCommand('Ganti akun Google Drive (AIRA)',async()=>{const e=await GM_getValue('aira_drive_email','');await GM_deleteValue('aira_drive_email');await GM_deleteValue('aira_drive_index');await GM_deleteValue('aira_drive_auth');AIRA_MODAL.alert('Akun Drive '+(e||'')+' dilepas. Saat klik Simpan Lampiran ke Drive berikutnya, Anda diminta memilih akun lagi.',{title:'Akun Google Drive direset',tone:'ok',source:'Simpan Lampiran ke Drive'});});}catch{}
if(/^ISI_/.test(TOKEN)||/^ISI_/.test(WEB_APP_URL))setTimeout(()=>openSettings(true),1200);
function frame(kind='OSS_LENGKAP'){
 const iframe=document.querySelector('#fgenFormIframe');
 if(!iframe)throw Error('Buka Dokumen Persyaratan yang memuat Data Teknis.');
 const origin=new URL(iframe.src).origin;
 if(origin!=='https://formgen-perizinan.esdm.go.id')throw Error('Alamat iframe tidak dikenali.');
 return new Promise((resolve,reject)=>{
  const nonce=crypto.randomUUID();
  const handler=e=>{if(e.source===iframe.contentWindow&&e.origin===origin&&e.data?.kind===kind+'_RESULT'&&e.data.nonce===nonce){clearTimeout(timer);window.removeEventListener('message',handler);resolve(e.data.data);}};
  const timer=setTimeout(()=>{window.removeEventListener('message',handler);reject(Error('Formulir belum dapat dibaca. Pastikan script baru aktif pada formgen-perizinan.esdm.go.id lalu refresh INLINE.'));},10000);
  window.addEventListener('message',handler);iframe.contentWindow.postMessage({kind:kind+'_READ',nonce},origin);
 });
}
function labeled(doc,label,root=doc){
 for(const el of root.querySelectorAll('label'))if(norm(el.textContent)===norm(label))return clean(el.closest('.row')?.querySelector('span')?.textContent);
 return '';
}
const detail=l=>labeled(document,l,document.querySelector('#detilPermohonan')||document);
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function number(s,label){
 const t=clean(s).replace(/\s/g,'');
 if(!/^-?\d+(?:[.,]\d+)?$/.test(t))throw Error(label+' harus angka tanpa satuan/pemisah ribuan: '+s);
 const n=Number(t.replace(',','.'));if(!Number.isFinite(n))throw Error(label+' tidak valid.');return n;
}
function dateISO(s){
 const t=clean(s);let y,m,d;
 let match=t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
 if(match)[,y,m,d]=match;
 else {match=t.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(match)[,d,m,y]=match;}
 if(!y)throw Error('Tanggal Mulai Pengambilan Air untuk Penataan belum diisi atau formatnya tidak dikenali.');
 const a=new Date(Date.UTC(Number(y),Number(m)-1,Number(d)));
 if(a.getUTCFullYear()!==Number(y)||a.getUTCMonth()+1!==Number(m)||a.getUTCDate()!==Number(d))throw Error('Tanggal Mulai Pengambilan Air tidak valid.');
 return y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
}
function aquifer(s){
 const t=clean(s).replace(/#lt#/gi,'<').replace(/#gt#/gi,'>').replace(/#le#/gi,'≤').replace(/#ge#/gi,'≥');
 if(!t)throw Error('Kedalaman Akuifer yang Disadap belum diisi.');
 return t;
}
function classification(s){
 const t=clean(s).toLowerCase();
 if(!t)throw Error('Peruntukan belum diisi.');
 return /\bmck\b/.test(t)&&!(/\bdan\b|\bserta\b|\bnon\s*mck\b|\+|&|kegiatan|produksi|proses|industri|penyiraman|cuci|pencucian/.test(t))?'Hanya MCK':'Kegiatan Lainnya';
}
function permit(s){
 if(/penataan|keterlanjuran/i.test(s))return 'Penataan';
 if(/perpanjangan/i.test(s))return /perubahan.*debit/i.test(s)?'Perpanjangan (Perubahan Debit)':'Perpanjangan';
 if(/perubahan/i.test(s))return 'Perubahan Data Teknis';
 if(/baru/i.test(s))return 'Izin Baru';
 throw Error('Jenis permohonan belum dikenali: '+s);
}
// R19: halaman profil Persetujuan memakai label "Email *" dan "Telp. *" (bukan "Nomor Telepon").
// Label dibandingkan tanpa tanda bintang/titik/titik dua; nilai divalidasi (email harus memuat @, telepon berupa angka).
function contactFrom(doc){
 const key=t=>clean(t).replace(/[*:.]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
 const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),isTelp=v=>/^\+?[\d\s()-]{6,20}$/.test(v)&&/\d{6}/.test(v.replace(/\D/g,''));
 const want={email:['email','e-mail','alamat email'],telp:['nomor telepon','no telepon','telepon','telp','no telp','nomor telp','no hp','nomor hp','handphone']};
 const out={telp:'',email:''};
 const valueNear=el=>{
  const own=key(el.textContent),c=[];
  if(el.nextElementSibling)c.push(el.nextElementSibling.textContent);
  if(el.parentElement?.nextElementSibling)c.push(el.parentElement.nextElementSibling.textContent);
  const box=el.closest('.row,tr,li,dl,.form-group');if(box)c.push(clean(box.textContent).replace(new RegExp('^\\s*'+clean(el.textContent).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),''));
  return c.map(t=>clean(t).replace(/^[*:\s]+/,'')).filter(Boolean);
 };
 for(const el of doc.querySelectorAll('label,th,td,dt,span,div,p,strong,b')){
  if(el.children.length>2)continue;const k=key(el.textContent);if(!k||k.length>25)continue;
  for(const f of ['email','telp']){
   if(out[f]||!want[f].includes(k))continue;
   const hit=valueNear(el).map(v=>v.split(/\s{2,}|\n/)[0]).find(f==='email'?isEmail:isTelp);if(hit)out[f]=hit;
  }
 }
 return out;
}
async function profile(){
 const here=contactFrom(document);if(here.telp&&here.email)return here;
 const a=[...document.querySelectorAll('a')].find(a=>/Profile Perusahaan|Profil Perusahaan/i.test(a.textContent));
 if(!a)throw Error('Link Profil Perusahaan tidak ditemukan.');
 const u=new URL(a.href);if(u.origin!==location.origin)throw Error('Alamat profil tidak dikenali.');
 const r=await fetch(u.href,{credentials:'same-origin'});if(!r.ok)throw Error('Profil gagal dibaca: HTTP '+r.status);
 const doc=new DOMParser().parseFromString(await r.text(),'text/html');
 const found=contactFrom(doc);
 return {telp:labeled(doc,'Nomor Telepon')||found.telp||here.telp,email:labeled(doc,'Email')||found.email||here.email};
}
function readSendResponse(r){
 const raw=String(r.responseText||'').replace(/^\uFEFF/,'').trim();
 let v;
 try{v=JSON.parse(raw);}catch(_){
  return 'Pengiriman selesai, tetapi konfirmasi dari Google belum dapat dibaca. Cek baris permohonan di dok_lengkap. Jika sudah masuk, tidak perlu kirim ulang.';
 }
 if(!v||typeof v.ok!=='boolean')return 'Respons penyimpanan belum terkonfirmasi. Cek dok_lengkap sebelum mencoba ulang.';
 if(!v.ok)throw Error(v.message||'Receiver menolak data.');
 if(r.status>=400)throw Error('Respons HTTP '+r.status+'; cek dok_lengkap sebelum mencoba ulang.');
 return v.message||'Data berhasil disimpan di dok_lengkap.';
}
async function send(data,action='dok_lengkap'){
 if(!WEB_APP_URL.startsWith('https://script.google.com/macros/s/')||TOKEN==='ISI_TOKEN_DI_SINI')throw Error('URL/token belum diatur. Klik ikon Tampermonkey → Pengaturan INLINE.');
 const result=await new Promise((resolve,reject)=>GM_xmlhttpRequest({method:'POST',url:WEB_APP_URL,headers:{'Content-Type':'application/json'},data:JSON.stringify({token:TOKEN,action,data,mode:'auto'}),timeout:90000,onload:r=>{try{const v=JSON.parse(r.responseText);if(!v.ok)throw Error(v.message||'Pengiriman ditolak.');resolve(v);}catch(e){reject(e);}},onerror:()=>reject(Error('Koneksi gagal; cek Sheets sebelum mencoba ulang.')),ontimeout:()=>reject(Error('Google belum mengonfirmasi penyimpanan. Periksa baris tujuan sebelum mengirim ulang.'))}));
 if(!Array.isArray(result.changes))throw Error('Respons dari receiver lama. Perbarui receiver dan deploy New version; cek Sheets sebelum mengirim ulang.');
 const labels={'Nomor Sumur':'Nomor urut sumur','Lokasi Sumur':'Alamat sumur'};
 if(result.revision&&result.changes.length)return 'Proses Berhasil\nTerdapat revisi pada baris '+data.targetRow+':\n\n'+result.changes.map(c=>(labels[c.column]||c.column)+': '+(c.old||'(kosong)')+' menjadi '+c.next).join('\n\n');
 return 'Proses Berhasil — baris '+data.targetRow+'.'+(result.revision?'\nTidak ada perubahan data.':'');
}
// ZIP tanpa kompresi: menghindari dependensi luar; PDF tetap dalam kualitas asli.
const encoder=new TextEncoder();
function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function header(size,fields){const b=new Uint8Array(size),v=new DataView(b.buffer);for(const [offset,n,width]of fields)width===2?v.setUint16(offset,n,true):v.setUint32(offset,n,true);return b;}
function zip(files){const parts=[],central=[];let offset=0,total=0;for(const f of files){const name=encoder.encode(f.name),bytes=f.bytes,c=crc(bytes);const local=header(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[14,c,4],[18,bytes.length,4],[22,bytes.length,4],[26,name.length,2]]);parts.push(local,name,bytes);const h=header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[16,c,4],[20,bytes.length,4],[24,bytes.length,4],[28,name.length,2],[42,offset,4]]);central.push(h,name);offset+=30+name.length+bytes.length;total+=46+name.length;}
return new Blob([...parts,...central,header(22,[[0,0x06054b50,4],[8,files.length,2],[10,files.length,2],[12,total,4],[16,offset,4]])],{type:'application/zip'});}
const safe=s=>clean(s).replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').replace(/[. ]+$/,'').slice(0,180);
function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}
async function writeFolder(destination,folder,files,button){
 // Hindari menimpa unduhan sebelumnya: buat nama folder dengan nomor tambahan.
 let name=folder,index=1;
 for(;;){
  try{await destination.getDirectoryHandle(name);name=folder+' ('+(++index)+')';}
  catch(e){if(e.name==='NotFoundError')break;throw e;}
 }
 const target=await destination.getDirectoryHandle(name,{create:true});
 let written=0;
 try{
  for(const file of files){
   button.textContent='Menyimpan '+(written+1)+'/'+files.length;
   const filename=file.name.slice(file.name.indexOf('/')+1);
   const handle=await target.getFileHandle(filename,{create:true});
   const stream=await handle.createWritable();
   try{await stream.write(file.bytes);await stream.close();}
   catch(e){try{await stream.abort();}catch{}throw e;}
   written++;
  }
 }catch(e){throw Error('Penyimpanan belum selesai: '+written+'/'+files.length+' PDF tersimpan di folder '+name+'. '+e.message);}
 await AIRA_MODAL.alert('Folder: '+name+'\nJumlah: '+files.length+' PDF',{title:'Lampiran berhasil disimpan',tone:'ok',source:'Download Lampiran'});
}
// Nama lampiran ringkas; nomor urut tetap ditambahkan oleh pengunduh.
function attachmentTitle(raw,dewatering=false){
 const original=clean(raw).replace(/\s*\.pdf\s*$/i,'')||'Lampiran';
 const title=original.replace(/^(?:\d+\s*[-.]\s*)?PDF\s+/i,'');
 if(dewatering&&/gambar\s+teknis.*dewatering/i.test(title))return 'Gambar teknis kegiatan Dewatering';
 if(dewatering&&/dokumen.*(?:metode|teknis).*dewatering/i.test(title))return 'Dokumen teknis kegiatan Dewatering';
 // R18: dokumen Persetujuan Penggunaan Sumur Pantau/Imbuhan.
 if(/(?:peta|denah)/i.test(title)&&/sebaran\s+sumur/i.test(title))return 'PDF Peta Sebaran dan Konstruksi Sumur Produksi';
 if(/gambar/i.test(title)&&/konstruksi.*sumur/i.test(title)&&/(?:pantau|imbuhan)/i.test(title))return 'PDF Rencana Konstruksi Sumur Pantau atau Imbuhan';
 if(/laporan\s+pendahuluan/i.test(title))return 'PDF Laporan Pendahuluan';
 if(/gambar/i.test(title)&&/konstruksi.*sumur/i.test(title)&&/geotagging/i.test(title))return /rencana/i.test(title)?'PDF Rencana Konstruksi Sumur dan Geotagging':'PDF Konstruksi Sumur dan Geotagging';
 if(/gambar/i.test(title)&&/konstruksi.*sumur/i.test(title))return /rencana/i.test(title)?'PDF Rencana Konstruksi Sumur':'PDF Konstruksi Sumur';
 if(/surat\s+pernyataan/i.test(title)&&/terbangun.*sumur/i.test(title))return 'PDF Pernyataan Terbangun Sumur';
 if(/laporan/i.test(title)&&/(?:pengeboran|penggalian)/i.test(title)&&!/(?:pendahuluan|rencana)/i.test(title))return 'PDF Laporan Pengeboran atau Penggalian Sumur';
 if(/hasil/i.test(title)&&/(?:uji|analisis|analisa)/i.test(title)&&/(?:kualitas|laboratorium)/i.test(title)&&/air/i.test(title))return 'PDF Hasil Uji Kualitas Air';
 if(/hasil|laporan/i.test(title)&&/uji\s+(?:pemompaan|pompa)|pumping\s+test/i.test(title))return 'PDF Hasil Uji Pemompaan';
 if(/bukti/i.test(title)&&/(?:kepemilikan|penguasaan)/i.test(title)&&/tanah/i.test(title))return 'PDF Bukti Kepemilikan atau Penguasaan Tanah';
 // Judul lain: hapus hanya keterangan syarat pemohon, pertahankan identitas dokumen.
 let short=original.replace(/\s*\((?:hanya\s+untuk|khusus\s+untuk|wajib\s+bagi|untuk\s+skala\s+usaha)[\s\S]*?\)/gi,'').replace(/\s+/g,' ').trim();
 if(short.length>110){
  const head=short.slice(0,76).replace(/\s+\S*$/,'').trim();
  const tail=short.slice(-27).replace(/^\S*\s+/,'').trim();
  short=head+' ... '+tail;
 }
 return short||'Lampiran';
}

// Lakukan unduhan hanya melalui rute yang benar-benar dicantumkan halaman aktif.
function attachmentDownloadBase(scripts,pageUrl){
 const page=new URL(pageUrl);
 if(page.origin!=='https://ngantor.esdm.go.id')throw Error('Sumber halaman lampiran tidak sesuai.');
 const role=page.pathname.match(/^\/inline\/internal\/(PermohonanIzinStaf|PermohonanIzinPre)\//)?.[1];
 const pattern=/(?:https:\/\/ngantor\.esdm\.go\.id)?\/inline\/internal\/(?:PermohonanIzinStaf|PermohonanIzinPre)\/view-dokumen-persyaratan\/[^"'\s<>]+/g;
 const routes=new Set();
 for(const source of scripts){
  const text=String(source||'').replace(/\\\//g,'/');
  for(const match of text.matchAll(pattern)){
   const url=new URL(match[0],page.origin);
   if(url.origin!==page.origin||url.search||url.hash)continue;
   routes.add(url.href.replace(/\/$/,''));
  }
 }
 const all=[...routes],same=role?all.filter(url=>new URL(url).pathname.startsWith('/inline/internal/'+role+'/')):[];
 const candidates=same.length?same:all;
 if(candidates.length!==1)throw Error(candidates.length?'Rute unduhan lampiran ganda; buka Dokumen Persyaratan permohonan yang dituju.':'Rute unduhan lampiran tidak ditemukan pada halaman STAF/Prepare. Buka Dokumen Persyaratan; jika tetap gagal, diperlukan HTML halaman PR untuk pemeriksaan.');
 return candidates[0];
}

async function attachments(button,drive=false,job=null){
 let destination;
 if(!drive){
  // Picker dipanggil dari klik sebelum request jaringan.
  const host=typeof unsafeWindow!=='undefined'?unsafeWindow:window;
  if(typeof host.showDirectoryPicker!=='function')throw Error('Gunakan Chrome/Edge yang mendukung pemilih folder.');
  try{destination=await host.showDirectoryPicker({mode:'readwrite',id:'inline-lampiran'});}catch(e){if(e.name==='AbortError')return;throw Error('Folder belum diizinkan: '+e.message);}
 }
 let province='';
 let folder;
 if(/dewatering/i.test(detail('Jenis Izin'))){
  const tracking=detail('Nomor Tracking'),iframe=document.querySelector('iframe.fgenIframe');
  if(!tracking||!iframe)throw Error('Tracking atau form Dewatering tidak tersedia.');
  const source=new URL(iframe.src);if(source.hostname!=='formgen-perizinan.esdm.go.id')throw Error('Sumber form tidak sesuai.');
  const doc=new DOMParser().parseFromString(await dewRequest(source.href),'text/html');
  const nama=dewLabeled(doc,'Nama Pemohon');if(!nama)throw Error('Nama pemohon Dewatering tidak terbaca.');
  folder=safe('DW - '+tracking+' - '+nama);
  if(drive)province=driveProvince(dewLabeled(doc,'Lokasi Dewatering (Provinsi)'));
 }else if(/sumur\s+pantau|imbuhan/i.test(detail('Jenis Izin'))){
  // R18: Persetujuan Penggunaan Sumur Pantau/Imbuhan tidak memiliki ID Izin OSS dan nomor sumur produksi.
  const tracking=detail('Nomor Tracking'),iframe=document.querySelector('iframe.fgenIframe');
  if(!tracking||!iframe)throw Error('Tracking atau form Sumur Pantau/Imbuhan tidak tersedia.');
  const source=new URL(iframe.src);if(source.hostname!=='formgen-perizinan.esdm.go.id')throw Error('Sumber form tidak sesuai.');
  const doc=new DOMParser().parseFromString(await dewRequest(source.href),'text/html');
  const nama=imbuhanName(doc);if(!nama)throw Error('Nama Instansi/Perusahaan/Kelompok Masyarakat pada form Sumur Pantau/Imbuhan tidak terbaca.');
  folder=safe('SI - '+tracking+' - '+nama);
  if(drive)province=driveProvince(imbuhanLabeled(doc,/^provinsi/)||(detail('Jenis Izin').match(/wilayah\s+(.+)$/i)||[])[1]||'');
 }else if(setujuJenis(detail('Jenis Izin'))){
  // R19: Persetujuan Penggunaan Air Tanah tidak memiliki ID Izin OSS.
  const f=await frame('OSS_SETUJU'),tracking=detail('Nomor Tracking');
  const well=clean((f.fields?.sumur||'').replace(/-/g,' '));
  if(!f.exists||!tracking||!f.nama)throw Error('Identitas Persetujuan (tracking/nama) belum terbaca untuk nama folder.');
  folder=safe('PAT - '+tracking+' - '+f.nama+(well?' '+well:''));
  if(drive)province=driveProvince(f.prov||(detail('Jenis Izin').match(/provinsi\s+(.+)$/i)||[])[1]||'');
 }else{
  const f=await frame(),id=detail('ID Izin (OSS)'),tracking=detail('Nomor Tracking');
  const well=clean((f.fields.NOMOR_URUT_SUMUR_BOR||f.sumur).replace(/-/g,' '));
  if(!id||!tracking||!f.nama||!well)throw Error('Identitas permohonan belum lengkap untuk nama folder.');
  folder=safe(id+' - '+tracking+' - '+f.nama+' '+well);
  if(drive)province=driveProvince(f.prov);
 }
 if(drive){
 }
 const card=document.querySelector('#card_dokumenPersyaratan');if(!card)throw Error('Dokumen Persyaratan tidak ditemukan.');
 const select=card.querySelector('select[name$="_length"]');if(select&&[...select.options].some(o=>o.value==='-1')&&select.value!=='-1') {select.value='-1';select.dispatchEvent(new Event('change',{bubbles:true}));}
 // Baca semua baris melalui DOM DataTables, dan periksa jumlahnya sebelum unduh.
 const info=card.querySelector('.dataTables_info')?.textContent||'';
 const total=Number(info.match(/of\s+(\d+)\s+(?:entries|records)/i)?.[1]||0);
 const links=[...card.querySelectorAll('.viewFIle')];
 if(!links.length)throw Error('Tidak ada lampiran tersedia.');
 if(total&&links.length<total)throw Error('Sebagian lampiran tersembunyi oleh pagination. Pilih tampilkan Semua lalu coba lagi.');
 const base=attachmentDownloadBase([...document.scripts].map(s=>s.textContent),location.href);
 const files=[];let count=0;
 for(const link of links){
  button.textContent='Download '+(++count)+'/'+links.length;job?.panel?.reading(count,links.length);
  const docId=link.getAttribute('data-id');if(!/^\d+$/.test(docId||''))throw Error('ID lampiran tidak valid.');
  const r=await fetch(base+'/'+docId,{credentials:'same-origin'});if(!r.ok)throw Error('Lampiran '+count+' gagal: HTTP '+r.status);
  const bytes=new Uint8Array(await r.arrayBuffer());
  if(bytes.length<5||String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw Error('Lampiran '+count+' bukan PDF langsung (mungkin halaman login/preview). Tidak menyimpan lampiran sebelum semua PDF terbaca.');
  if(drive&&bytes.length>8*1024*1024)throw Error('Lampiran '+count+' melebihi batas fitur Drive 8 MiB per PDF. Gunakan Download Lampiran untuk berkas ini; belum ada folder Drive yang dibuat.');
  const td=link.closest('tr')?.querySelectorAll(':scope > td')[1];
  const title=clean(td?.querySelector('div')?.firstChild?.textContent||td?.firstChild?.textContent||'Lampiran');
  const fileTitle=attachmentTitle(title,/dewatering/i.test(detail('Jenis Izin')));
  files.push({name:folder+'/'+String(count).padStart(2,'0')+' - '+safe(fileTitle)+'.pdf',bytes});
 }
 if(drive)return job?.panel?await uploadDriveAkun(province,folder,files,button,job.panel,job.auth):await writeDrive(province,folder,files,button,job);
 else await writeFolder(destination,folder,files,button);
}

function driveProvince(value){
 const name=clean(value).replace(/^(?:provinsi|propinsi|prov\.?)\s+/i,'').toLowerCase();
 const names={'banten':'Banten','dki jakarta':'DKI Jakarta','daerah khusus ibukota jakarta':'DKI Jakarta','jawa barat':'Jawa Barat'};
 if(!names[name])throw Error('Provinsi lokasi belum terbaca atau belum didukung: '+(value||'(kosong)')+'. Isi provinsi lokasi pada form terlebih dahulu. Tujuan tersedia: Banten, DKI Jakarta, Jawa Barat.');
 return names[name];
}
function driveBase64(bytes){let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(text);}
function driveResult(message,url){
 // R20: hasil Simpan Lampiran ke Drive dan Pengembalian memakai pop up AIRA.
 const [first,...rest]=String(message).split('\n'),peng=/pengembalian/i.test(message);
 const tone=/belum selesai|gagal/i.test(first)?'warn':/berhasil|tercatat|tersimpan/i.test(first)?'ok':'info';
 return AIRA_MODAL.alert(rest.join('\n'),{title:first,tone,source:peng?'Pengembalian':'Simpan Lampiran ke Drive',link:url?{url,text:peng?'Buka rekap pengembalian':'Buka folder di Google Drive'}:null,width:520});
}

const driveInlineDialogs=new Map();
function openInlineDrivePopup(job){
 // R20: tampilan AIRA — judul, status dengan indikator berputar, bilah progres, kotak login (bila perlu), lalu halaman upload.
 const dialog=airaDialog();dialog.style.cssText='width:min(840px,94vw);height:min(780px,92vh);padding:0;border:0;border-radius:12px;box-sizing:border-box;color:#24344a;background:#fff;font:14px/1.5 Arial;display:flex;flex-direction:column;overflow:hidden';
 dialog.innerHTML=`<style>
  .aira-dv-spin{width:16px;height:16px;border-radius:50%;border:2.5px solid #eee7a0;border-top-color:#111;animation:aira-dv-rot .8s linear infinite;flex:none}
  .aira-dv-done .aira-dv-spin{border-color:#067647;animation:none;background:#067647}
  .aira-dv-err .aira-dv-spin{border-color:#b42318;animation:none;background:#b42318}
  @keyframes aira-dv-rot{to{transform:rotate(360deg)}}
  .aira-dv-bar{height:6px;border-radius:99px;background:#f3eeb8;overflow:hidden;margin-top:8px}.aira-dv-bar>i{display:block;height:100%;width:0;background:#111;border-radius:99px;transition:width .4s cubic-bezier(.2,.9,.3,1)}
  .aira-dv-ind .aira-dv-bar>i{width:35%;animation:aira-dv-slide 1.2s ease-in-out infinite}@keyframes aira-dv-slide{from{transform:translateX(-100%)}to{transform:translateX(300%)}}
 </style>
 <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;background:#f5e62a;border-bottom:1px solid rgba(17,17,17,.12)">
  <div style="width:38px;height:38px;border-radius:10px;background:#111;display:grid;place-items:center;flex:none"><svg viewBox="0 0 24 24" width="22" height="22"><g fill="#f5e62a"><path d="M8 3h8l7.5 13h-7.7z"/><path d="M8 3l4 6.6-7.7 12.9-3.8-6.5z"/><path d="M8.2 16h15.3l-3.8 6.5H4.3z"/></g></svg></div>
  <div style="flex:1"><div style="font-size:11px;font-weight:bold;letter-spacing:.08em;color:#6b6413">AIRA · SIMPAN LAMPIRAN KE DRIVE</div><h2 style="margin:0;font-size:17px">Menyimpan lampiran ke Google Drive</h2></div>
  <button type="button" data-a="close">Tutup</button>
 </div>
 <div data-a="statusbox" class="aira-dv-ind" style="padding:14px 20px;border-bottom:1px solid #f3eeb8;background:#fffdf0">
  <div style="display:flex;align-items:center;gap:10px"><span class="aira-dv-spin"></span><span data-a="status" style="font-weight:bold"></span></div>
  <div class="aira-dv-bar"><i></i></div>
 </div>
 <div data-a="auth" hidden style="margin:14px 20px 0;padding:12px 14px;border:1px solid #fedf89;background:#fffaeb;border-radius:12px;color:#93370d">
  <div style="font-weight:bold;margin-bottom:4px">Perlu login Google?</div>
  <div style="font-size:13px;margin-bottom:10px">Halaman Google belum merespons. Bila belum login atau belum memberi izin, klik <b>Login Google</b>, selesaikan izin, lalu tutup jendela login. Bila sudah login, klik <b>Muat ulang</b>. Pastikan browser mengizinkan sesi Google di pop up ini.</div>
  <button type="button" data-a="login" class="aira-primary">Login Google</button> <button type="button" data-a="reload">Muat ulang</button>
 </div>`;
 const q=x=>dialog.querySelector(x);
 const status=q('[data-a=status]');status.textContent='Menyiapkan PDF dan memeriksa akun Google…';
 const auth=q('[data-a=auth]'),login=q('[data-a=login]'),reload=q('[data-a=reload]'),close=q('[data-a=close]'),statusBox=q('[data-a=statusbox]'),bar=q('.aira-dv-bar>i');close.disabled=true;
 const frame=document.createElement('iframe');frame.title='Upload lampiran dengan akun evaluator';frame.style.cssText='display:block;flex:1;min-height:260px;margin:14px 20px 20px;border:1px solid #eee7a0;border-radius:12px;background:#fff';
 const load=()=>{frame.src=DRIVE_WEB_APP_URL+'?job='+encodeURIComponent(job)+'&view=inline&reload='+Date.now();};
 dialog.append(frame);dialog.addEventListener('cancel',e=>e.preventDefault());document.body.append(dialog);dialog.showModal();load();
 let timer=null,authTimer=null;const started=Date.now();
 const stop=()=>{clearInterval(timer);clearInterval(authTimer);dialog.close();dialog.remove();driveInlineDialogs.delete(job);};
 close.onclick=async()=>{const meta=await GM_getValue(driveJobKey(job));if(!meta||meta.status==='uploading')return;await GM_setValue(driveJobKey(job),{...meta,closed:true});stop();};
 login.onclick=()=>{const loginWindow=window.open(DRIVE_WEB_APP_URL,'inline-drive-google-login','popup=yes,width=620,height=740');if(!loginWindow){status.textContent='Browser memblokir jendela login. Izinkan popup untuk INLINE, lalu klik Login Google.';return;}login.disabled=true;clearInterval(authTimer);authTimer=setInterval(()=>{if(loginWindow.closed){clearInterval(authTimer);login.disabled=false;load();}},500);};
 reload.onclick=load;
 timer=setInterval(async()=>{const meta=await GM_getValue(driveJobKey(job));if(!meta)return;
  close.disabled=!['error','success'].includes(meta.status);
  const total=meta.names?.length||0,written=meta.written||0;
  statusBox.classList.toggle('aira-dv-ind',meta.status!=='uploading'&&meta.status!=='success');statusBox.classList.toggle('aira-dv-done',meta.status==='success');statusBox.classList.toggle('aira-dv-err',meta.status==='error');
  if(meta.status==='uploading'&&total)bar.style.width=Math.round(written/total*100)+'%';if(meta.status==='success')bar.style.width='100%';
  if(meta.bridgeSeenAt){auth.hidden=true;status.textContent=meta.status==='uploading'?'Mengunggah '+(meta.written||0)+'/'+meta.names.length+' PDF. Akun: '+(meta.account||'memeriksa...'):meta.status==='ready'?'PDF siap. Upload akan dimulai otomatis.':'Menyiapkan lampiran...';}
  else if(Date.now()-started>12000){auth.hidden=false;close.disabled=false;}
  if(meta.status==='error')status.textContent=meta.message||'Upload terhenti. Periksa pesan pada popup sebelum mencoba kembali.';
 },500);
 driveInlineDialogs.set(job,{stop,dialog,status});return stop;
}
function closeInlineDrivePopup(job){driveInlineDialogs.get(job)?.stop();}

async function clearDriveJob(id){const meta=await GM_getValue(driveJobKey(id));for(let i=0;i<(meta?.names?.length||0);i++)await GM_deleteValue(driveJobKey(id)+':'+i);await GM_deleteValue(driveJobKey(id));const ids=await GM_getValue('inline-drive-user-jobs',[]);await GM_setValue('inline-drive-user-jobs',ids.filter(x=>x!==id));}
// R21: Simpan Lampiran ke Drive dengan AKUN GOOGLE EVALUATOR MASING-MASING.
// Halaman Apps Script Drive hanya dibuka sebentar (jendela kecil) untuk mengambil akses akun, lalu ditutup otomatis.
// Akses disimpan ±50 menit, jadi dalam rentang itu tidak ada jendela sama sekali. Upload berjalan dari INLINE langsung ke Google Drive.
const DRIVE_AKUN={email:'aira_drive_email',idx:'aira_drive_index',cache:'aira_drive_auth'};
async function startDriveAccountUpload(button){
 if(!EXEC_URL.test(DRIVE_WEB_APP_URL))throw Error('URL Apps Script Drive belum diatur. Klik ikon Tampermonkey → Pengaturan INLINE.');
 // R21b: jendela kecil Google HARUS dibuka langsung saat tombol diklik (sebelum membaca lampiran),
 // karena browser hanya mengizinkan pop-up yang muncul seketika setelah klik.
 const tunai=v=>v&&typeof v.then!=='function'?v:null;
 const want=String(tunai(GM_getValue(DRIVE_AKUN.email,''))||'').toLowerCase(),cached=tunai(GM_getValue(DRIVE_AKUN.cache,null));
 const perluJendela=!(cached&&cached.exp>Date.now()+5*60*1000&&(!want||cached.email===want));
 let pre=null;
 if(perluJendela){
  pre=window.open('about:blank','aira-drive-akun','popup=yes,width=520,height=640');
  if(!pre)throw Error('Chrome memblokir jendela kecil Google untuk INLINE. Klik ikon pop-up terblokir di ujung kanan kolom alamat → pilih "Selalu izinkan pop-up dari ngantor.esdm.go.id" → Selesai, lalu klik Simpan Lampiran ke Drive lagi.');
  try{pre.document.write('<title>AIRA · Menghubungkan akun Google</title><body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#fffdf0;font:600 14px Segoe UI,Arial,sans-serif;color:#1d2939"><div style="background:#fff;border-top:6px solid #f5e62a;border-radius:16px;padding:22px 26px;box-shadow:0 18px 48px rgba(16,24,40,.18)"><div style="font:800 11px Segoe UI,Arial;letter-spacing:.08em;color:#6b6413">AIRA · SIMPAN LAMPIRAN KE DRIVE</div>Menghubungkan akun Google…</div></body>');}catch{}
 }
 const panel=openDrivePanel();
 try{
  const auth=await driveAkses(panel,false,pre);
  const r=await attachments(button,true,{panel,auth});if(r===undefined)panel.close();return r;
 }
 catch(e){try{pre&&!pre.closed&&pre.close();}catch{}panel.fail(e.message);throw e;}
}
function driveAuthUrl(idx,job){return (idx>0?DRIVE_WEB_APP_URL.replace('/macros/s/','/macros/u/'+idx+'/s/'):DRIVE_WEB_APP_URL)+'?mode=auth&job='+encodeURIComponent(job);}
async function driveAkses(panel,force=false,pre=null){
 const want=String(await GM_getValue(DRIVE_AKUN.email,'')||'').toLowerCase();
 const cached=await GM_getValue(DRIVE_AKUN.cache,null);
 if(!force&&cached&&cached.exp>Date.now()+5*60*1000&&(!want||cached.email===want)){try{pre&&!pre.closed&&pre.close();}catch{}return cached;}
 const saved=Number(await GM_getValue(DRIVE_AKUN.idx,0))||0,order=[saved,...[0,1,2,3,4,5].filter(n=>n!==saved)];
 const job=crypto.randomUUID();await GM_setValue(driveJobKey(job),{createdAt:Date.now(),kind:'auth'});
 let win=pre;
 try{
  for(let k=0;k<order.length;k++){
   const idx=order[k];panel.step('Menghubungkan akun Google'+(want?' '+want:'')+'…');
   panel.ask('Jendela kecil Google terbuka sebentar untuk mengambil akses akun, lalu tertutup sendiri. Bila Google meminta login atau izin, selesaikan di jendela itu.',[{t:'Coba akun berikutnya',v:'next'},{t:'Batal',v:'cancel'}]);
   await GM_setValue(driveJobKey(job),{createdAt:Date.now(),kind:'auth'});
   if(!win||win.closed){win=window.open(driveAuthUrl(idx,job),'aira-drive-akun','popup=yes,width=520,height=640');if(!win)throw Error('Chrome memblokir jendela kecil Google untuk INLINE. Klik ikon pop-up terblokir di ujung kanan kolom alamat → pilih "Selalu izinkan pop-up dari ngantor.esdm.go.id" → Selesai, lalu klik Simpan Lampiran ke Drive lagi.');}
   else win.location.href=driveAuthUrl(idx,job);
   const got=await new Promise(resolve=>{const t=setInterval(async()=>{
     if(win.closed){clearInterval(t);resolve({cancel:'Jendela Google ditutup sebelum akun terhubung.'});return;}
     const m=await GM_getValue(driveJobKey(job));if(m?.auth){clearInterval(t);resolve({auth:m.auth});}else if(m?.halamanLama){clearInterval(t);resolve({cancel:'Project Apps Script Drive (akun evaluator) belum diperbarui: halaman Google yang terbuka masih versi lama. Admin perlu menambahkan file Ambil_Akses.html dan memperbarui kode .gs (R21), lalu Deploy → Manage deployments → New version.'});}
    },400);
    panel.onAnswer(v=>{clearInterval(t);resolve(v==='next'?{next:true}:{cancel:'Dibatalkan.'});});
    setTimeout(()=>{clearInterval(t);resolve({next:true});},4*60*1000);});
   if(got.cancel)throw Error(got.cancel);
   if(got.next)continue;
   const a=got.auth;
   if(want&&a.email!==want){panel.step('Akun '+a.email+' bukan akun Drive Anda, mencoba akun lain…');continue;}
   if(!want){
    const v=await panel.askWait('Akun Google terdeteksi: <b>'+a.email.replace(/[<>&]/g,'')+'</b>. Simpan lampiran memakai akun ini? Pilihan ini diingat.',[{t:'Ya, pakai akun ini',v:'yes',primary:true},{t:'Akun lain',v:'other'}]);
    if(v!=='yes')continue;
    await GM_setValue(DRIVE_AKUN.email,a.email);
   }
   await GM_setValue(DRIVE_AKUN.idx,idx);await GM_setValue(DRIVE_AKUN.cache,a);panel.ask('');return a;
  }
  throw Error(want?'Akun '+want+' tidak ditemukan pada Chrome ini. Login akun tersebut di Chrome (foto profil → Tambahkan akun), lalu ulangi. Untuk memakai akun lain: ikon Tampermonkey → Ganti akun Google Drive (AIRA).':'Belum ada akun Google yang dipilih.');
 }finally{try{win&&!win.closed&&win.close();}catch{}await GM_deleteValue(driveJobKey(job));}
}
function gapi(method,url,token,{json,body,headers={},timeout=180000}={}){
 return new Promise((resolve,reject)=>GM_xmlhttpRequest({method,url,timeout,headers:{Authorization:'Bearer '+token,...(json?{'Content-Type':'application/json; charset=UTF-8'}:{}),...headers},data:json?JSON.stringify(json):body,
  onload:r=>{let v=null;try{v=JSON.parse(r.responseText||'null');}catch{}
   if(r.status>=200&&r.status<300)return resolve({v,headers:r.responseHeaders||''});
   const msg=v?.error?.message||('HTTP '+r.status);reject(Object.assign(Error('Google Drive: '+msg),{status:r.status,retry:r.status>=500||r.status===429}));},
  onerror:()=>reject(Object.assign(Error('Koneksi ke Google Drive terputus.'),{retry:true})),ontimeout:()=>reject(Object.assign(Error('Google Drive belum merespons.'),{retry:true}))}));
}
const DRIVE_API='https://www.googleapis.com/drive/v3/files',DRIVE_Q=v=>"'"+String(v).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'";
async function driveCari(token,parent,name,folderOnly){
 const q='name = '+DRIVE_Q(name)+' and '+DRIVE_Q(parent)+' in parents and trashed = false'+(folderOnly?" and mimeType = 'application/vnd.google-apps.folder'":'');
 return (await gapi('GET',DRIVE_API+'?supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,size)&q='+encodeURIComponent(q),token)).v?.files||[];
}
async function uploadDriveAkun(province,folder,files,button,panel,akses){
 if(files.length>100)throw Error('Maksimal 100 PDF.');
 const names=files.map(f=>f.name.slice(f.name.indexOf('/')+1));
 let auth=akses||await driveAkses(panel);
 const withAuth=async fn=>{try{return await fn(auth.token);}catch(e){if(e.status!==401)throw e;await GM_deleteValue(DRIVE_AKUN.cache);auth=await driveAkses(panel,true);return await fn(auth.token);}};
 const parent=auth.folders?.[province];if(!parent)throw Error('Folder Drive provinsi '+province+' belum diatur pada project Drive.');
 panel.files(names);panel.step('Membuat folder di Drive '+province+'…');panel.account(auth.email);
 let name=folder,n=1;while((await withAuth(t=>driveCari(t,parent,name,true))).length){if(++n>1000)throw Error('Terlalu banyak folder bernama sama.');name=folder+' ('+n+')';}
 const made=(await withAuth(t=>gapi('POST',DRIVE_API+'?supportsAllDrives=true&fields=id',t,{json:{name,mimeType:'application/vnd.google-apps.folder',parents:[parent]}}))).v;
 const folderUrl='https://drive.google.com/drive/folders/'+made.id;panel.folder(name);
 // R21: urutan di Drive = urutan INLINE (01 paling atas). Diunggah dari PDF terakhir ke PDF pertama dan
 // waktunya diatur menurun, sehingga 01 menjadi yang terbaru → tampil paling atas saat folder diurutkan menurut waktu maupun nama.
 let written=0,cur=-1;const t0=Date.now();
 try{
  for(let k=0;k<files.length;k++){
   const i=files.length-1-k;cur=i;const waktu=new Date(t0-i*1000).toISOString();
   panel.mark(i,'run');panel.step('Mengunggah '+(k+1)+'/'+files.length+' PDF…');button.textContent='Upload '+(k+1)+'/'+files.length;
   const bytes=files[i].bytes;
   for(let attempt=1;;attempt++){
    try{
     if(attempt>1){const ada=await withAuth(t=>driveCari(t,made.id,names[i],false));if(ada.some(f=>Number(f.size)===bytes.length))break;}
     await withAuth(async t=>{
      const start=await gapi('POST','https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',t,{json:{name:names[i],parents:[made.id],createdTime:waktu,modifiedTime:waktu},headers:{'X-Upload-Content-Type':'application/pdf','X-Upload-Content-Length':String(bytes.length)},timeout:60000});
      const loc=(start.headers.match(/^location:\s*(\S+)/im)||[])[1];if(!loc)throw Object.assign(Error('Google Drive tidak memberi alamat unggah.'),{retry:true});
      await gapi('PUT',loc,t,{body:new Blob([bytes],{type:'application/pdf'}),headers:{'Content-Type':'application/pdf'}});
     });
     break;
    }catch(e){if(!e.retry||attempt>=3)throw e;panel.step('Koneksi terputus, mengulang '+names[i]+' ('+(attempt+1)+'/3)…');await new Promise(r=>setTimeout(r,2000*attempt));}
   }
   written++;panel.mark(i,'ok');panel.progress(written,files.length);
  }
 }catch(e){
  panel.mark(cur,'err');panel.fail(e.message);await new Promise(r=>setTimeout(r,700));panel.close();
  await driveResult('Penyimpanan belum selesai\n'+written+'/'+files.length+' PDF tersimpan.\n'+e.message+'\nKlik Simpan Lampiran ke Drive lagi untuk mengulang (folder baru akan dibuat), atau lengkapi manual di folder ini.',folderUrl);
  return false;
 }
 panel.done();await new Promise(r=>setTimeout(r,650));panel.close();
 await driveResult('Proses Berhasil\n'+written+'/'+files.length+' PDF tersimpan.\nAkun upload: '+auth.email+'\nProvinsi: '+province+'\nFolder: '+name,folderUrl);
 return true;
}
function openDrivePanel(){
 const dialog=airaDialog();dialog.style.cssText='width:min(560px,94vw);max-height:min(640px,90vh);padding:0;border:0;border-radius:16px;box-sizing:border-box;color:#1d2939;background:#fff;font:14px/1.5 "Segoe UI",Arial,sans-serif;display:flex;flex-direction:column;overflow:hidden';
 dialog.innerHTML=`<style>
  .aira-dv-spin{width:16px;height:16px;border-radius:50%;border:2.5px solid #eee7a0;border-top-color:#111;animation:aira-dv-rot .8s linear infinite;flex:none}
  .aira-dv-done .aira-dv-spin{border-color:#067647;animation:none;background:#067647}.aira-dv-err .aira-dv-spin{border-color:#b42318;animation:none;background:#b42318}
  @keyframes aira-dv-rot{to{transform:rotate(360deg)}}
  .aira-dv-bar{height:6px;border-radius:99px;background:#f3eeb8;overflow:hidden;margin-top:10px}.aira-dv-bar>i{display:block;height:100%;width:0;background:#111;border-radius:99px;transition:width .4s cubic-bezier(.2,.9,.3,1)}
  .aira-dv-done .aira-dv-bar>i{background:#067647}.aira-dv-err .aira-dv-bar>i{background:#b42318}
  .aira-dv-ind .aira-dv-bar>i{width:35%;animation:aira-dv-slide 1.2s ease-in-out infinite}@keyframes aira-dv-slide{from{transform:translateX(-100%)}to{transform:translateX(300%)}}
  .aira-dv-list{list-style:none;margin:0;padding:6px 20px 18px;overflow:auto;flex:1}
  .aira-dv-list li{display:flex;gap:10px;align-items:center;padding:6px 10px;border-radius:9px;font-size:13px;color:#667085;transition:background .25s,color .25s}
  .aira-dv-list li b{flex:none;width:18px;height:18px;border-radius:50%;border:2px solid #e4e7ec;display:grid;place-items:center;font-size:11px;color:#fff;transition:all .25s}
  .aira-dv-list li.run{background:#fffbd1;color:#101828;font-weight:600}.aira-dv-list li.run b{border-color:#eee7a0;border-top-color:#111;animation:aira-dv-rot .8s linear infinite}
  .aira-dv-list li.ok{color:#101828}.aira-dv-list li.ok b{background:#067647;border-color:#067647;animation:aira-dv-pop .3s cubic-bezier(.2,.9,.3,1.5)}
  .aira-dv-list li.err{background:#fef3f2;color:#b42318}.aira-dv-list li.err b{background:#b42318;border-color:#b42318}
  @keyframes aira-dv-pop{from{transform:scale(.4)}to{transform:scale(1)}}
  .aira-dv-list span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 </style>
 <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;background:#f5e62a;border-bottom:1px solid rgba(17,17,17,.12)">
  <div style="width:38px;height:38px;border-radius:10px;background:#111;display:grid;place-items:center;flex:none"><svg viewBox="0 0 24 24" width="22" height="22"><g fill="#f5e62a"><path d="M8 3h8l7.5 13h-7.7z"/><path d="M8 3l4 6.6-7.7 12.9-3.8-6.5z"/><path d="M8.2 16h15.3l-3.8 6.5H4.3z"/></g></svg></div>
  <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:bold;letter-spacing:.08em;color:#6b6413">AIRA · SIMPAN LAMPIRAN KE DRIVE</div><h2 data-a="title" style="margin:0;font-size:17px">Menyimpan lampiran ke Google Drive</h2></div>
 </div>
 <div data-a="box" class="aira-dv-ind" style="padding:14px 20px">
  <div style="display:flex;align-items:center;gap:10px"><span class="aira-dv-spin"></span><span data-a="status" style="font-weight:600">Membaca lampiran dari INLINE…</span></div>
  <div data-a="sub" style="font-size:12.5px;color:#667085;margin:2px 0 0 26px">Disimpan dengan akun Google Anda. Biarkan jendela ini terbuka sampai selesai.</div>
  <div class="aira-dv-bar"><i></i></div>
 </div>
 <div data-a="ask" hidden style="margin:0 20px 12px;padding:12px 14px;border:1px solid #fedf89;background:#fffaeb;border-radius:12px;color:#93370d"></div>
 <ul class="aira-dv-list" data-a="list"></ul>`;
 const q=x=>dialog.querySelector(x),status=q('[data-a=status]'),sub=q('[data-a=sub]'),box=q('[data-a=box]'),bar=q('.aira-dv-bar>i'),list=q('[data-a=list]'),askBox=q('[data-a=ask]');let answerFn=null;
 dialog.addEventListener('cancel',e=>e.preventDefault());document.body.append(dialog);dialog.showModal();
 let open=true;
 return {
  reading(n,total){status.textContent='Membaca lampiran dari INLINE '+n+'/'+total+'…';},
  files(names){box.classList.add('aira-dv-ind');list.innerHTML='';for(const n of names){const li=document.createElement('li');li.innerHTML='<b></b><span></span>';li.lastChild.textContent=n;li.title=n;list.append(li);}},
  folder(name){sub.textContent='Folder: '+name;},
  step(t){status.textContent=t;},
  mark(i,c){const li=list.children[i];if(!li)return;li.className=c;if(c==='ok')li.firstChild.textContent='✓';if(c==='err')li.firstChild.textContent='!';if(c==='run')li.scrollIntoView({block:'nearest',behavior:'smooth'});},
  progress(n,total){box.classList.remove('aira-dv-ind');bar.style.width=Math.round(n/total*100)+'%';},
  done(){box.classList.remove('aira-dv-ind');box.classList.add('aira-dv-done');bar.style.width='100%';status.textContent='Semua PDF tersimpan.';},
  fail(t){box.classList.remove('aira-dv-ind');box.classList.add('aira-dv-err');status.textContent='Upload terhenti';sub.textContent=t;if(!list.children.length)setTimeout(()=>this.close(),900);},
  account(email){sub.textContent='Akun: '+email;},
  ask(html,buttons=[]){answerFn=null;askBox.hidden=!html;askBox.innerHTML='<div style="font-size:13px;margin-bottom:'+(buttons.length?'10px':'0')+'"></div>';askBox.firstChild.innerHTML=html;
   for(const b of buttons){const el=document.createElement('button');el.type='button';el.textContent=b.t;if(b.primary)el.className='aira-primary';el.style.marginRight='6px';el.onclick=()=>{const f=answerFn;answerFn=null;askBox.hidden=true;f&&f(b.v);};askBox.append(el);}},
  onAnswer(f){answerFn=f;},
  askWait(html,buttons){return new Promise(r=>{this.ask(html,buttons);answerFn=r;});},
  close(){if(!open)return;open=false;try{dialog.close();}catch{}dialog.remove();}
 };
}
// --- Cara lama (cadangan bila Apps Script Sheets belum diperbarui ke R21) ---
async function startDriveAccountUploadLama(button){
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(DRIVE_WEB_APP_URL))throw Error('URL Apps Script Drive belum diatur. Klik ikon Tampermonkey → Pengaturan INLINE.');
 const job=crypto.randomUUID();
 const ids=await GM_getValue('inline-drive-user-jobs',[]);for(const id of ids){const old=await GM_getValue(driveJobKey(id));if(!old||Date.now()-old.createdAt>30*60*1000)await clearDriveJob(id);}
 await GM_setValue('inline-drive-user-jobs',[...(await GM_getValue('inline-drive-user-jobs',[])),job]);
 await GM_setValue(driveJobKey(job),{createdAt:Date.now(),status:'preparing',names:[]});
 openInlineDrivePopup(job);
 try{const result=await attachments(button,true,job);if(result===undefined){await GM_setValue(driveJobKey(job),{createdAt:Date.now(),status:'error',names:[],message:'Persiapan dibatalkan pada INLINE.'});closeInlineDrivePopup(job);}}
 catch(e){const old=await GM_getValue(driveJobKey(job));await GM_setValue(driveJobKey(job),{...old,status:'error',message:e.message});closeInlineDrivePopup(job);throw e;}
}
async function writeDrive(province,folder,files,button,job){
 if(!job)throw Error('Sesi akun Google belum dibuka.');
 const first=await GM_getValue(driveJobKey(job));if(first?.status==='error')return false;
 if(files.length>100)throw Error('Maksimal 100 PDF.');
 if(files.reduce((n,f)=>n+f.bytes.length,0)>64*1024*1024)throw Error('Total PDF melebihi 64 MiB untuk transfer antar-tab. Gunakan Download Lampiran untuk permohonan ini.');
 const names=files.map(f=>f.name.slice(f.name.indexOf('/')+1));
 await GM_setValue(driveJobKey(job),{...first,names,province,folder});
 for(let i=0;i<files.length;i++)await GM_setValue(driveJobKey(job)+':'+i,driveBase64(files[i].bytes));
 const meta=await GM_getValue(driveJobKey(job));if(meta.status==='error')return false;await GM_setValue(driveJobKey(job),{...meta,status:'ready',province,folder,names});
 const until=Date.now()+30*60*1000;
 while(Date.now()<until){const status=await GM_getValue(driveJobKey(job));
  if(status?.status==='success'){closeInlineDrivePopup(job);driveResult('Proses Berhasil\n'+status.written+'/'+files.length+' PDF tersimpan.\nAkun upload: '+status.account+'\nFolder: '+status.folderName,status.folderUrl);await clearDriveJob(job);return true;}
  if(status?.status==='error'&&status.closed){closeInlineDrivePopup(job);driveResult('Penyimpanan belum selesai\n'+(status.written||0)+'/'+files.length+' PDF terkonfirmasi.\n'+status.message+'\nPeriksa folder sebelum mengulang; file terakhir mungkin sudah tersimpan.',status.folderUrl);return false;}
  button.textContent=status?.status==='uploading'?'Upload '+(status.written||0)+'/'+files.length:'Menunggu akun Google pada popup INLINE';
  await new Promise(r=>setTimeout(r,1000));
 }
 closeInlineDrivePopup(job);throw Error('Sesi upload berakhir. Periksa folder sebelum mencoba ulang.');
}

function regionLookup(point,choose=false,screen=""){return new Promise((resolve,reject)=>{const nonce=crypto.randomUUID();let timer;const handler=e=>{let v;try{v=JSON.parse(e.detail);}catch{return;}if(v.nonce!==nonce)return;clearTimeout(timer);document.removeEventListener('INLINE_REGION_RESPONSE',handler);v.error?reject(Error(v.error)):resolve(v.result);};document.addEventListener('INLINE_REGION_RESPONSE',handler);timer=setTimeout(()=>{document.removeEventListener('INLINE_REGION_RESPONSE',handler);reject(Error('Pengecekan wilayah belum merespons. Pastikan script INLINE Data Wilayah Sumur aktif dan data wilayah sudah diimpor.'));},300000);document.dispatchEvent(new CustomEvent('INLINE_REGION_REQUEST',{detail:JSON.stringify({nonce,point,choose,screen})}));});}

// R20: tinjau/ubah Catatan Master data (otomatis: [Akuifer Bebas,] CAT, Zona, Debit optimum) sebelum dikirim.
const NOTE_MANAGED=/^(?:Akuifer Bebas,\s*)?CAT\s+[^,\r\n]+,\s*(?:Akuifer Tertekan (?:Atas dan Akuifer Tertekan Tengah|Atas|Tengah),\s*)?Zona\s+[^,\r\n]+,\s*Debit optimum\s+\d+(?:[.,]\d+)?\s+m3\/hari(?:;\s*Rentang screen evaluator:.*)?$/i;
const noteNorm=t=>String(t||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).join('\n');
// Baca catatan yang sudah ada di baris Master data (dipakai saat revisi). Gagal membaca -> null (pop up tetap jalan seperti biasa).
async function readMasterNote(row,tracking){
 try{
  const r=await new Promise((resolve,reject)=>GM_xmlhttpRequest({method:'POST',url:WEB_APP_URL,headers:{'Content-Type':'application/json'},data:JSON.stringify({token:TOKEN,action:'baca_catatan',data:{targetRow:row,tracking}}),timeout:30000,
   onload:x=>{try{const v=JSON.parse(x.responseText);v.ok?resolve(v):reject(Error(v.message||'Gagal membaca catatan.'));}catch(e){reject(e);}},onerror:()=>reject(Error('Koneksi gagal.')),ontimeout:()=>reject(Error('Waktu habis.'))}));
  return r;
 }catch(e){if(/Nomor baris/.test(e.message))throw e;return null;}
}
// Pop up Catatan Master data. Bila baris sudah berisi catatan (revisi), catatan terakhir ditampilkan dan menjadi isi awal;
// evaluator cukup menambah/merevisi. Hasil: {text, utuh:true} bila evaluator melihat seluruh isi sel (ditulis apa adanya).
function chooseMasterNote(auto,last){
 return new Promise(resolve=>{
  const known=typeof last==='string',prev=noteNorm(last),hasPrev=known&&!!prev;
  const d=airaDialog();
  d.style.cssText='width:min(660px,calc(100vw - 40px));border:0;border-radius:12px;padding:24px;background:#fff;color:#24344a;font:14px/1.5 Arial,sans-serif;box-shadow:0 16px 60px #0005';
  d.innerHTML=`<form method="dialog"><h3 style="margin:0 0 4px;font-size:18px">Catatan (Master data)</h3>
  <p style="margin:0 0 10px;color:#556;font-size:13px">${hasPrev?'Baris ini sudah memiliki catatan. Tambahkan atau revisi seperlunya; bila tidak diubah, catatan tetap sama.':'Isi otomatis dari hasil cek wilayah. Ubah atau tambahkan catatan bila perlu (boleh beberapa baris).'}</p>
  ${hasPrev?`<div style="margin:0 0 10px;padding:10px 12px;border:1px solid #eee7a0;border-radius:10px;background:#fffbd1"><div style="font-size:11.5px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#6b6413;margin-bottom:4px">Catatan terakhir</div><div data-a="prev" style="white-space:pre-wrap;font-size:13.5px;color:#1d2939"></div></div>
  <div style="margin:0 0 10px;padding:8px 12px;border:1px dashed #d0d5dd;border-radius:10px;font-size:12.5px;color:#475467"><b>Catatan otomatis terbaru:</b> <span data-a="auto"></span></div>`:''}
  <textarea rows="5" style="width:100%;box-sizing:border-box;padding:9px;border:1px solid #9caabc;border-radius:6px;font:14px/1.5 Arial,sans-serif;resize:vertical"></textarea>
  <div data-a="state" style="margin-top:6px;font-size:12.5px;font-weight:bold"></div>
  <div role="alert" hidden style="color:#b42318;margin-top:6px"></div>
  <div style="display:flex;gap:8px;justify-content:space-between;margin-top:14px;flex-wrap:wrap"><span style="display:flex;gap:8px;flex-wrap:wrap">${hasPrev?'<button type="button" data-a="sync" title="Ganti baris CAT, zona, dan debit optimum lama dengan hasil cek terbaru; catatan lain tetap">Perbarui</button><button type="button" data-a="reset">Kembalikan catatan terakhir</button>':'<button type="button" data-a="reset">Kembalikan otomatis</button>'}</span>
  <span style="display:flex;gap:8px"><button type="button" data-a="cancel">Batal</button><button type="submit">Lanjut</button></span></div></form>`;
  const q=x=>d.querySelector(x),ta=q('textarea'),err=q('[role=alert]'),state=q('[data-a=state]');
  const start=hasPrev?prev:(auto||'');ta.value=start;
  if(hasPrev){q('[data-a=prev]').textContent=prev;q('[data-a=auto]').textContent=auto||'-';}
  const base=hasPrev?prev:'';
  const show=()=>{const now=noteNorm(ta.value);
   if(!hasPrev){state.textContent='';return;}
   if(now===base){state.style.color='#067647';state.textContent='✓ Catatan tetap (tidak ada revisi/penambahan)';}
   else{state.style.color='#93370d';const add=now.startsWith(base);state.textContent=add?'✎ Ada penambahan catatan':'✎ Catatan direvisi';}};
  ta.addEventListener('input',show);show();
  let done=false;const finish=v=>{if(done)return;done=true;d.close();d.remove();resolve(v);};
  q('[data-a=reset]').onclick=()=>{ta.value=start;show();ta.focus();};
  if(hasPrev)q('[data-a=sync]').onclick=()=>{
   // Ganti baris catatan otomatis lama (CAT, zona, debit optimum) dengan hasil cek terbaru; baris lain tetap.
   const lines=ta.value.split(/\r?\n/);let hit=false;const out=lines.map(l=>{if(!hit&&NOTE_MANAGED.test(l.trim())){hit=true;return auto;}return l;});
   ta.value=hit?out.join('\n'):(auto+(ta.value.trim()?'\n'+ta.value:''));show();ta.focus();};
  q('[data-a=cancel]').onclick=()=>finish(null);d.addEventListener('cancel',e=>{e.preventDefault();finish(null);});
  q('form').onsubmit=e=>{e.preventDefault();const v=noteNorm(ta.value);
   if(!v){err.hidden=false;err.textContent='Catatan tidak boleh kosong.';return;}
   if(v.length>5000){err.hidden=false;err.textContent='Catatan maksimal 5.000 karakter.';return;}
   finish({text:v,utuh:known,changed:hasPrev?v!==base:true,hadPrev:hasPrev});};
  lockDialogStyle(d);document.body.append(d);d.showModal();ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);
 });
}
// R20: satu pop up untuk Nomor baris + Catatan.
// mode 'master' (Pengusahaan/Persetujuan): setelah nomor baris diisi, catatan terakhir di baris itu dibaca otomatis.
// mode 'imbuhan' (Sumur Pantau/Imbuhan): pilihan catatan Sesuai / Ada catatan.
function chooseRowAndNote({mode='master',auto='',tracking='',tab='Master data'}={}){
 return new Promise(resolve=>{
  const d=airaDialog();
  d.style.cssText='width:min(680px,calc(100vw - 40px));max-height:90vh;overflow:auto;box-sizing:border-box;border:0;border-radius:12px;padding:24px;background:#fff;color:#24344a;font:14px/1.5 Arial,sans-serif;box-shadow:0 16px 60px #0005';
  const box='margin:0 0 10px;padding:10px 12px;border-radius:10px;';
  d.innerHTML=`<form novalidate><h2 style="margin:0 0 4px;font-size:20px">Nomor baris & catatan</h2>
  <p style="margin:0 0 14px;color:#556;font-size:13px">Tujuan: tab <b>${tab.replace(/[<>&]/g,'')}</b> pada Form Data Evaluator.</p>
  <label for="aira-row" style="display:block;font-weight:bold;margin-bottom:4px">Nomor baris pada Google Sheets</label>
  <div style="display:flex;gap:10px;align-items:center"><input id="aira-row" type="text" inputmode="numeric" autocomplete="off" placeholder="mis. 15190" style="width:180px;box-sizing:border-box;padding:10px;border:1px solid #9caabc;border-radius:6px;font:inherit"><span data-a="rowstate" style="font-size:12.5px;color:#667085"></span></div>
  <details style="margin:8px 0 14px;font-size:12.5px;color:#475467"><summary style="cursor:pointer;font-weight:bold;color:#6b6413">Ketentuan nomor baris</summary><ul style="margin:6px 0 0;padding-left:18px"><li>Tulis dulu nama evaluator Anda pada kolom Evaluator di baris tersebut.</li><li>Gunakan <b>nomor baris Google Sheets</b>, bukan kolom "No".</li><li>Salah nomor baris dapat menimpa data evaluator lain.</li></ul></details>
  <div style="border-top:1px solid #eee7a0;margin:0 0 12px"></div>
  <div style="font-weight:bold;margin-bottom:6px">Catatan</div>
  ${mode==='imbuhan'?`<label style="display:flex;gap:8px;align-items:center;padding:4px 0;cursor:pointer"><input type="radio" name="n" value="ok" checked> <b>Sesuai</b></label><label style="display:flex;gap:8px;align-items:center;padding:4px 0;cursor:pointer"><input type="radio" name="n" value="custom"> Ada catatan</label>`:
  `<div data-a="prevbox" hidden style="${box}border:1px solid #eee7a0;background:#fffbd1"><div style="font-size:11.5px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#6b6413;margin-bottom:4px">Catatan terakhir (baris ini)</div><div data-a="prev" style="white-space:pre-wrap;font-size:13.5px;color:#1d2939"></div></div>
  <div data-a="autobox" hidden style="${box}border:1px dashed #d0d5dd;font-size:12.5px;color:#475467"><b>Catatan otomatis terbaru:</b> <span data-a="auto"></span></div>`}
  <textarea rows="4" ${mode==='imbuhan'?'disabled placeholder="Tulis catatan…"':''} style="width:100%;box-sizing:border-box;padding:9px;border:1px solid #9caabc;border-radius:6px;font:14px/1.5 Arial,sans-serif;resize:vertical"></textarea>
  <div data-a="state" style="margin-top:6px;font-size:12.5px;font-weight:bold;min-height:1em"></div>
  <div role="alert" hidden style="color:#b42318;margin-top:6px"></div>
  <div style="display:flex;gap:8px;justify-content:space-between;margin-top:14px;flex-wrap:wrap"><span style="display:flex;gap:8px;flex-wrap:wrap">${mode==='imbuhan'?'':'<button type="button" data-a="sync" hidden title="Ganti baris CAT, zona, dan debit optimum lama dengan hasil cek terbaru; catatan lain tetap">Perbarui</button><button type="button" data-a="reset">Kembalikan otomatis</button>'}</span>
  <span style="display:flex;gap:8px"><button type="button" data-a="cancel">Batal</button><button type="submit">Lanjutkan</button></span></div></form>`;
  const q=x=>d.querySelector(x),row=q('#aira-row'),ta=q('textarea'),err=q('[role=alert]'),state=q('[data-a=state]'),rowstate=q('[data-a=rowstate]'),submit=q('button[type=submit]');
  let prev=null,known=false,edited=false,checking=null,checkedRow=null,blocked='';
  const fail=m=>{err.hidden=false;err.textContent=m;};
  const valid=v=>/^\d+$/.test(v)&&Number.isSafeInteger(Number(v))&&Number(v)>=2;
  const show=()=>{
   if(mode==='imbuhan'||!known||!prev){state.textContent='';return;}
   const now=noteNorm(ta.value);
   if(now===prev){state.style.color='#067647';state.textContent='✓ Catatan tetap (tidak ada revisi/penambahan)';}
   else{state.style.color='#93370d';state.textContent=now.startsWith(prev)?'✎ Ada penambahan catatan':'✎ Catatan direvisi';}
  };
  if(mode!=='imbuhan'){
   ta.value=auto||'';
   ta.addEventListener('input',()=>{edited=true;show();});
   q('[data-a=reset]').onclick=()=>{ta.value=prev||auto||'';edited=false;show();ta.focus();};
   q('[data-a=sync]').onclick=()=>{const lines=ta.value.split(/\r?\n/);let hit=false;const out=lines.map(l=>{if(!hit&&NOTE_MANAGED.test(l.trim())){hit=true;return auto;}return l;});ta.value=hit?out.join('\n'):(auto+(ta.value.trim()?'\n'+ta.value:''));edited=true;show();ta.focus();};
   // Baca catatan terakhir setiap kali nomor baris berubah (jeda singkat setelah berhenti mengetik).
   let timer=null;
   const check=async()=>{
    const v=row.value.trim();err.hidden=true;blocked='';
    if(!valid(v)){rowstate.textContent=v?'Nomor baris minimal 2':'';return;}
    if(checkedRow===v)return;
    rowstate.style.color='#667085';rowstate.textContent='Memeriksa baris…';const my=v;
    checking=readMasterNote(Number(v),tracking).catch(e=>({error:e.message}));const cur=await checking;checking=null;
    if(row.value.trim()!==my)return;checkedRow=my;
    if(!cur){known=false;prev=null;rowstate.style.color='#93370d';rowstate.textContent='Catatan lama tidak dapat dibaca; catatan otomatis dipakai';q('[data-a=prevbox]').hidden=true;q('[data-a=autobox]').hidden=true;q('[data-a=sync]').hidden=true;if(!edited)ta.value=auto||'';show();return;}
    if(cur.error){rowstate.textContent='';blocked=cur.error;fail(cur.error);return;}
    if(cur.tracking&&tracking&&cur.tracking!==tracking){blocked='Baris '+my+' sudah berisi tracking '+cur.tracking+'. Pilih baris lain.';rowstate.style.color='#b42318';rowstate.textContent='✕ Dipakai permohonan lain';fail(blocked);return;}
    known=true;prev=noteNorm(cur.catatan)||null;
    rowstate.style.color='#067647';rowstate.textContent=cur.tracking?'✓ Baris permohonan ini (revisi)':(cur.evaluator?'✓ Baris kosong · '+cur.evaluator:'✓ Baris kosong');
    q('[data-a=prevbox]').hidden=!prev;q('[data-a=autobox]').hidden=!prev;q('[data-a=sync]').hidden=!prev;
    if(prev){q('[data-a=prev]').textContent=prev;q('[data-a=auto]').textContent=auto||'-';q('[data-a=reset]').textContent='Kembalikan catatan terakhir';if(!edited)ta.value=prev;}
    else{q('[data-a=reset]').textContent='Kembalikan otomatis';if(!edited)ta.value=auto||'';}
    show();
   };
   row.addEventListener('input',()=>{checkedRow=null;known=false;clearTimeout(timer);timer=setTimeout(check,500);});
   row.addEventListener('blur',()=>{clearTimeout(timer);check();});
  }else{
   d.querySelectorAll('input[name=n]').forEach(r=>r.onchange=()=>{ta.disabled=d.querySelector('input[value=custom]').checked===false;if(!ta.disabled)ta.focus();});
  }
  let done=false;const finish=v=>{if(done)return;done=true;d.close();d.remove();resolve(v);};
  q('[data-a=cancel]').onclick=()=>finish(null);d.addEventListener('cancel',e=>{e.preventDefault();finish(null);});
  q('form').onsubmit=async e=>{
   e.preventDefault();err.hidden=true;const v=row.value.trim();
   if(!valid(v)){fail('Nomor baris harus bilangan bulat minimal 2.');row.focus();return;}
   if(mode==='imbuhan'){
    const custom=d.querySelector('input[value=custom]').checked,text=ta.value.trim();
    if(custom&&!text){fail('Tulis catatannya, atau pilih Sesuai.');ta.focus();return;}
    if(text.length>5000){fail('Catatan maksimal 5.000 karakter.');return;}
    return finish({row:Number(v),note:custom?text:'Sesuai'});
   }
   if(checkedRow!==v){submit.disabled=true;submit.textContent='Memeriksa…';await (async()=>{await check();})();submit.disabled=false;submit.textContent='Lanjutkan';}
   if(blocked){fail(blocked);return;}
   const text=noteNorm(ta.value);
   if(!text){fail('Catatan tidak boleh kosong.');ta.focus();return;}
   if(text.length>5000){fail('Catatan maksimal 5.000 karakter.');return;}
   finish({row:Number(v),note:{text,utuh:known,changed:prev?text!==prev:true,hadPrev:!!prev}});
  };
  lockDialogStyle(d);document.body.append(d);d.showModal();row.focus();
 });
}
function chooseTargetRow(){
 return new Promise(resolve=>{
  const dialog=airaDialog();
  dialog.style.cssText='width:min(600px,calc(100vw - 40px));max-height:85vh;overflow:auto;box-sizing:border-box;border:0;border-radius:12px;padding:24px;background:white;color:#24344a;font:14px/1.5 Arial,sans-serif;box-shadow:0 16px 60px #0005';
  dialog.innerHTML=`<form novalidate><h2 style="margin:0 0 16px;font-size:20px">Silakan masukkan nomor baris</h2><label for="inline-target-row">Nomor baris pada Google Sheets</label><input id="inline-target-row" type="text" inputmode="numeric" autocomplete="off" style="display:block;width:100%;box-sizing:border-box;margin:6px 0 14px;padding:10px;border:1px solid #9caabc;border-radius:6px;font:inherit" autofocus><ul style="margin:0;padding-left:20px"><li style="margin-bottom:10px">Sebelum mengirimkan Data Teknis Input Evaluator ke Form Data Evaluator, silakan masukkan nama evaluator secara manual terlebih dahulu pada Master Data sebagai informasi bahwa baris tersebut akan digunakan oleh evaluator untuk pengisian informasi permohonan.</li><li style="margin-bottom:10px">Pastikan nomor baris yang digunakan adalah <strong>nomor baris pada Google Sheets</strong>, bukan nomor baris pada kolom &quot;No&quot;.</li><li>Pastikan nomor baris yang dimasukkan telah sesuai dengan tujuan baris pada Form Data Evaluator, kesalahan pengisian nomor baris dapat menyebabkan tumpang tindih dengan data yang telah terisi oleh evaluator lain.</li></ul><p role="alert" style="color:#b42318;margin:12px 0" hidden></p><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button type="button" style="padding:9px 18px">Batal</button><button type="submit" style="padding:9px 18px;background:#244b8c;color:white;border:0;border-radius:6px">Lanjutkan</button></div></form>`;
  const input=dialog.querySelector('input'),error=dialog.querySelector('[role="alert"]');
  const finish=value=>{dialog.close();dialog.remove();resolve(value);};
  dialog.querySelector('[type="button"]').onclick=()=>finish(null);
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish(null);});
  dialog.querySelector('form').onsubmit=e=>{
   e.preventDefault();const value=input.value.trim();
   if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))||Number(value)<2){error.hidden=false;error.textContent='Nomor baris harus bilangan bulat minimal 2.';input.focus();return;}
   finish(value);
  };
  document.body.append(dialog);dialog.showModal();input.focus();
 });
}

async function complete(clicked){
 const full=detail('Jenis Izin');if(!/Izin Pengusahaan Air Tanah/i.test(full))throw Error('Tombol ini khusus Pengusahaan.');
 // Profil perusahaan dibaca bersamaan dengan formulir dan pengecekan wilayah (R18: mempercepat proses).
 const profileTask=profile();profileTask.catch(()=>{});
 const f=await frame();if(!f.exists)throw Error('Data Teknis Input Evaluator tidak ditemukan.');
 const v=f.fields;
 const required=['ALAMAT_LOKASI_SUMUR','LATITUDE_TITIK_LOKASI','LONGITUDE_TITIK_LOKASI','NOMOR_URUT_SUMUR_BOR','KEDALAMAN_SUMUR_BOR','DIAMETER_PIPA_KONSTRUKSI','RENTANG_KEDALAMAN_SCREEN','JENIS_POMPA','KAPASITAS_POMPA','POSISIS_KEDALAMAN_POMPA','JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH','PERUNTUKAN_PENGGUNAAN_AIR_TANAH','KEDALAMAN_AKUIFER','SKALA_USAHA','MASA_BERLAKU'];
 const missing=required.filter(k=>!v[k]||['null','-- Pilih --'].includes(v[k]));if(missing.length)throw Error('Input evaluator belum lengkap: '+missing.join(', '));
 if(!f.satuan)throw Error('Satuan kapasitas pompa belum terbaca.');
 const lng=number(v.LONGITUDE_TITIK_LOKASI,'Bujur'),lat=number(v.LATITUDE_TITIK_LOKASI,'Lintang');if(lng< -180||lng>180||lat< -90||lat>90)throw Error('Koordinat di luar rentang longitude/latitude.');
 let diameter=number(v.DIAMETER_PIPA_KONSTRUKSI,'Diameter pipa');
 const unit=norm(f.diameterUnit);if(!unit)throw Error('Satuan diameter belum terbaca.');if(unit==='mm')diameter/=25.4;else if(unit==='cm')diameter/=2.54;else if(unit&&!/inch|inci|in$/.test(unit))throw Error('Satuan diameter belum dikenali: '+f.diameterUnit);
 const data={id:detail('ID Izin (OSS)'),tracking:detail('Nomor Tracking'),jenis:permit(full),sumur:clean(v.NOMOR_URUT_SUMUR_BOR.replace(/-/g,' ')),lng,lat,nama:f.nama,lokasi:v.ALAMAT_LOKASI_SUMUR,kedalaman:number(v.KEDALAMAN_SUMUR_BOR,'Kedalaman sumur'),diameter,akuifer:aquifer(v.KEDALAMAN_AKUIFER),screen:v.RENTANG_KEDALAMAN_SCREEN,pompa:v.JENIS_POMPA+' dan '+number(v.KAPASITAS_POMPA,'Kapasitas pompa')+' '+f.satuan,posisi:number(v.POSISIS_KEDALAMAN_POMPA,'Kedudukan pompa'),rencana:number(f.rencana,'Debit rencana'),debit:number(v.JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH,'Debit hasil evaluasi'),peruntukan:v.PERUNTUKAN_PENGGUNAAN_AIR_TANAH,klasifikasi:classification(v.PERUNTUKAN_PENGGUNAAN_AIR_TANAH),skala:v.SKALA_USAHA,telp:'',email:'',evaluasi:clicked,masa:number(v.MASA_BERLAKU,'Masa Berlaku'),terbangun:permit(full)==='Penataan'?dateISO(v.TGL_MULAI_PENGAMBILAN):''};
 const regionTask=regionLookup([lng,lat],true,data.screen);regionTask.catch(()=>{});
 const [contact,region]=await Promise.all([profileTask,regionTask]);
 if(!contact.telp||!contact.email)throw Error('Telepon/email Profil Badan Usaha belum terbaca.');
 data.telp=contact.telp;data.email=contact.email;
 data.wilayah=region.fields;
 {const pick=await chooseRowAndNote({mode:'master',auto:data.wilayah.catatan,tracking:data.tracking,tab:'Master data'});if(pick===null)return;
  data.targetRow=pick.row;const note=pick.note;
  data.wilayah.catatan=note.text;data.wilayah.catatanUtuh=note.utuh;data.catatanInfo=note.hadPrev?(note.changed?'Catatan: diperbarui':'Catatan: tetap (tidak berubah)'):'';}
 if(!await AIRA_MODAL.ask('Kirim ke Sheets bersama, baris '+data.targetRow+'?\n'+data.nama+' | '+data.sumur+'\nID: '+data.id+' | Tracking: '+data.tracking+'\n'+data.jenis+' | Akuifer: '+data.akuifer+' | Debit evaluasi: '+data.debit+' m3/hari\nBujur: '+data.lng+' | Lintang: '+data.lat+'\n'+data.wilayah.desa+', '+data.wilayah.kecamatan+', '+data.wilayah.kabupaten+', '+data.wilayah.provinsi+'\n'+(data.catatanInfo?data.catatanInfo+'\n':'')+data.wilayah.catatan))return;
 await AIRA_MODAL.done(await send(data),{source:'Data Lengkap Pengusahaan'});
}
function button(text,bottom,fn){const b=document.createElement('button');b.textContent=text;b.style.cssText='position:fixed;right:25px;bottom:'+bottom+'px;z-index:99999;background:#244b8c;color:white;padding:12px;border:0;border-radius:8px;cursor:pointer';document.body.append(b);b.onclick=async()=>{const clicked=today();b.disabled=true;b.textContent='Memproses…';try{await fn(b,clicked);}catch(e){await AIRA_MODAL.error(e.message,{source:text});}finally{b.disabled=false;b.textContent=text;}};return b;}
button('Download Lampiran',90,b=>attachments(b));
button('Simpan Lampiran ke Drive',365,b=>startDriveAccountUpload(b));
button('Data Lengkap Pengusahaan',145,(_,date)=>complete(date));
// R18: Data Lengkap Sumur Pantau/Imbuhan -> tab "Sumur Imbuhan" atau "Sumur Pantau" pada FORM DATA TEKNIS EVALUATOR.
function imbuhanKind(f){
 const p=norm(f.peruntukan),w=clean(f.fields.sumur||f.sumurPemohon).toUpperCase();
 if(/imbuhan/.test(p))return 'imbuhan';if(/pantau/.test(p))return 'pantau';
 if(/^SI\b|^SI[-\s]?\d/.test(w))return 'imbuhan';if(/^SP\b|^SP[-\s]?\d/.test(w))return 'pantau';
 return '';
}
function imbuhanCoord(text){
 const m=clean(text).match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);if(!m)throw Error('Koordinat Lokasi pemohon tidak terbaca: '+text);
 let a=Number(m[1]),b=Number(m[2]);const lat=Math.abs(a)<=90&&Math.abs(b)>90?a:Math.abs(b)<=90&&Math.abs(a)>90?b:a,lng=lat===a?b:a;
 if(Math.abs(lng)>180||Math.abs(lat)>90)throw Error('Koordinat Lokasi di luar rentang.');return {lng,lat,lngText:lat===a?m[2]:m[1],latText:lat===a?m[1]:m[2]};
}
// R20: pilihan Catatan untuk tab Sumur Imbuhan/Pantau ("Sesuai" atau catatan sendiri).
function chooseImbuhanNote(){
 return new Promise(resolve=>{
  const d=airaDialog();
  d.style.cssText='width:min(520px,calc(100vw - 40px));border:0;border-radius:12px;padding:24px;background:#fff;color:#24344a;font:14px/1.5 Arial,sans-serif;box-shadow:0 16px 60px #0005';
  d.innerHTML=`<form method="dialog"><h3 style="margin:0 0 10px;font-size:18px">Catatan evaluasi</h3>
  <label style="display:flex;gap:8px;align-items:center;padding:6px 0;cursor:pointer"><input type="radio" name="n" value="ok" checked> <b>Sesuai</b></label>
  <label style="display:flex;gap:8px;align-items:center;padding:6px 0;cursor:pointer"><input type="radio" name="n" value="custom"> Ada catatan</label>
  <textarea rows="4" disabled placeholder="Tulis catatan…" style="width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border:1px solid #9caabc;border-radius:6px;font:14px Arial,sans-serif;resize:vertical"></textarea>
  <div role="alert" hidden style="color:#b42318;margin-top:6px"></div>
  <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button type="button" data-a="cancel" style="padding:9px 16px;border:0;border-radius:6px;background:#e4e7ec;cursor:pointer">Batal</button><button type="submit" style="padding:9px 16px;border:0;border-radius:6px;background:#1f6f43;color:#fff;font-weight:bold;cursor:pointer">Lanjut</button></div></form>`;
  const ta=d.querySelector('textarea'),err=d.querySelector('[role=alert]');let done=false;
  const finish=v=>{if(done)return;done=true;d.close();d.remove();resolve(v);};
  d.querySelectorAll('input[name=n]').forEach(r=>r.onchange=()=>{ta.disabled=r.value!=='custom'||!r.checked;if(!ta.disabled)ta.focus();});
  d.querySelector('[data-a=cancel]').onclick=()=>finish(null);d.addEventListener('cancel',e=>{e.preventDefault();finish(null);});
  d.querySelector('form').onsubmit=e=>{e.preventDefault();const custom=d.querySelector('input[value=custom]').checked;const text=ta.value.trim();
   if(custom&&!text){err.hidden=false;err.textContent='Tulis catatannya, atau pilih Sesuai.';return;}
   if(text.length>5000){err.hidden=false;err.textContent='Catatan maksimal 5.000 karakter.';return;}
   finish(custom?text:'Sesuai');};
  lockDialogStyle(d);document.body.append(d);d.showModal();
 });
}
async function completeImbuhan(clicked){
 const full=detail('Jenis Izin');if(!/sumur\s+pantau|imbuhan/i.test(full))throw Error('Tombol ini khusus Persetujuan Penggunaan Sumur Pantau/Imbuhan.');
 const f=await frame('OSS_IMBUHAN');if(!f.exists)throw Error('Form Rencana Teknis Sumur Input Evaluator tidak ditemukan. Buka bagian Data Permohonan lalu coba lagi.');
 const v=f.fields,kind=imbuhanKind(f);
 if(!kind)throw Error('Jenis sumur (pantau/imbuhan) tidak dapat dipastikan dari Peruntukan Sumur Bor maupun nomor sumur.');
 const labels={sumur:'Nomor Urut Sumur Input Evaluator',kedalaman:'Kedalaman Sumur Bor Input Evaluator',diameter:'Diameter Pipa Konstruksi Input Evaluator',screen:'Kedudukan Saringan Input Evaluator'};
 const missing=Object.keys(labels).filter(k=>!v[k]);if(missing.length)throw Error('Input evaluator belum lengkap: '+missing.map(k=>labels[k]).join(', ')+'.\nIsi lalu klik Simpan pada form sebelum mengirim.');
 const c=imbuhanCoord(f.koordinat);
 let diameter=number(v.diameter,'Diameter pipa');const unit=norm(v.diameterUnit||'inchi');if(unit==='mm')diameter/=25.4;else if(unit==='cm')diameter/=2.54;else if(!/inch|inci|in$/.test(unit))throw Error('Satuan diameter belum dikenali: '+v.diameterUnit);
 const tops=[...v.screen.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:-|–|s\.?d\.?)/gi)].map(m=>Number(m[1].replace(',','.'))).filter(Number.isFinite);
 const akuifer=v.akuifer?v.akuifer.replace(/#gt#/gi,'>').replace(/#lt#/gi,'<'):tops.length?'>'+Math.floor(Math.min(...tops)/10)*10:'';
 const data={kind,tracking:detail('Nomor Tracking'),idProyek:(detail('ID Proyek (OSS)')||'').replace(/^-+$/,''),sumur:clean(v.sumur),nama:f.nama,lng:c.lng,lat:c.lat,
  kedalaman:number(v.kedalaman,'Kedalaman sumur'),diameter:Number(diameter.toFixed(3)),screen:v.screen,akuifer,evaluasi:clicked};
 if(!data.tracking||!data.nama)throw Error('Tracking atau nama Instansi/Perusahaan belum terbaca.');
 const region=await regionLookup([c.lng,c.lat],true,data.screen);
 data.wilayah=region.fields;
 const tab=kind==='imbuhan'?'Sumur Imbuhan':'Sumur Pantau';
 const pick=await chooseRowAndNote({mode:'imbuhan',tab});if(pick===null)return;
 data.targetRow=pick.row;data.catatan=pick.note;
 if(!await AIRA_MODAL.ask('Kirim ke tab "'+tab+'", baris '+data.targetRow+'?\nCatatan: '+data.catatan+' | Tanggal evaluasi: '+data.evaluasi+'\n'+data.nama+' | '+data.sumur+' | Tracking: '+data.tracking+'\nPeruntukan: '+(f.peruntukan||'-')+'\nBujur: '+data.lng+' | Lintang: '+data.lat+'\nKedalaman: '+data.kedalaman+' m | Diameter: '+data.diameter+' inch | Screen: '+data.screen+(kind==='imbuhan'?' | Akuifer diimbuh: '+(data.akuifer||'-')+(v.akuifer?'':' (puluhan dari saringan teratas)'):'')+'\n'+data.wilayah.desa+', '+data.wilayah.kecamatan+', '+data.wilayah.kabupaten+', '+data.wilayah.provinsi+'\nCAT '+data.wilayah.cat+(kind==='imbuhan'?' | Zona '+data.wilayah.zona:'')))return;
 await AIRA_MODAL.done(await send(data,'sumur_pantau_imbuhan'),{source:'Data Lengkap Sumur Pantau/Imbuhan'});
}
button('Data Lengkap Sumur Pantau/Imbuhan',475,(_,date)=>completeImbuhan(date));

// R19: Data Lengkap Persetujuan Penggunaan Air Tanah -> Master data (tanpa ID OSS dan Skala Usaha).
const setujuJenis=t=>/persetujuan\s+penggunaan\s+air\s+tanah/i.test(t)&&!/sumur\s+pantau|imbuhan|dewatering/i.test(t);
async function completeSetuju(clicked){
 const full=detail('Jenis Izin');if(!setujuJenis(full))throw Error('Tombol ini khusus Persetujuan Penggunaan Air Tanah.');
 const profileTask=profile();profileTask.catch(()=>{});
 const f=await frame('OSS_SETUJU');if(!f.exists)throw Error('Form Data Teknis Persetujuan (Input Evaluator) tidak ditemukan. Buka Dokumen Persyaratan lalu coba lagi.');
 const v=f.fields;
 const labels={sumur:'Nomor Urut Sumur Bor/Gali',kedalaman:'Kedalaman Sumur Bor',diameter:'Diameter Sumur Bor',akuifer:'Kedalaman Akuifer yang Disadap',screen:'Kedudukan Saringan',pompa:'Jenis Pompa',kapasitas:'Kapasitas Pompa',posisi:'Kedudukan Pompa',debit:'Jumlah Maksimum Debit Air Tanah',peruntukan:'Peruntukan Air Tanah',masa:'Masa Berlaku'};
 const missing=Object.keys(labels).filter(k=>!v[k]);if(missing.length)throw Error('Input evaluator belum lengkap: '+missing.map(k=>labels[k]+' Input Evaluator').join(', ')+'.\nIsi lalu klik Simpan pada form sebelum mengirim.');
 const c=imbuhanCoord(f.koordinat);
 let diameter=number(v.diameter,'Diameter sumur');const unit=norm(v.diameterUnit||'inchi');if(unit==='mm')diameter/=25.4;else if(unit==='cm')diameter/=2.54;else if(!/inch|inci|in$/.test(unit))throw Error('Satuan diameter belum dikenali: '+v.diameterUnit);
 const masaText=clean(v.masa),masaYear=masaText.match(/^(\d+)\s*(?:\(\s*\w+\s*\)\s*)?(?:tahun)?$/i);
 const masa=masaYear?Number(masaYear[1]):masaText;
 if(typeof masa==='number'&&(masa<1||masa>7))throw Error('Masa Berlaku Persetujuan selain kebutuhan pokok paling lama 7 tahun.');
 const data={id:'',tracking:detail('Nomor Tracking'),jenis:'Persetujuan',sumur:clean(v.sumur.replace(/-/g,' ')),lng:c.lng,lat:c.lat,nama:f.nama,lokasi:'',
  kedalaman:number(v.kedalaman,'Kedalaman sumur'),diameter:Number(diameter.toFixed(3)),akuifer:aquifer(v.akuifer),screen:v.screen,
  pompa:v.pompa+' dan '+number(v.kapasitas,'Kapasitas pompa')+' '+(v.kapasitasUnit||'HP'),posisi:number(v.posisi,'Kedudukan pompa'),rencana:number(f.rencana,'Rencana debit pemohon'),
  debit:number(v.debit,'Jumlah maksimum debit'),peruntukan:v.peruntukan,klasifikasi:classification(v.peruntukan),skala:'',telp:'',email:'',evaluasi:clicked,masa,terbangun:''};
 if(!data.tracking||!data.nama)throw Error('Tracking atau nama Instansi/Kelompok Masyarakat belum terbaca.');
 const regionTask=regionLookup([c.lng,c.lat],true,data.screen);regionTask.catch(()=>{});
 const [contact,region]=await Promise.all([profileTask.catch(()=>({})),regionTask]);
 data.telp=contact.telp||'';data.email=contact.email||'';
 data.wilayah=region.fields;
 // Tidak ada kolom alamat lokasi sumur pada form persetujuan: lokasi = administrasi hasil cek wilayah.
 const w=data.wilayah,kab=/^(Kabupaten|Kota)\b/i.test(w.kabupaten)?w.kabupaten:(/kota/i.test(f.kab)?'Kota ':'Kabupaten ')+w.kabupaten;
 data.lokasi=(/^kota\b/i.test(kab)?'Kelurahan ':'Desa ')+w.desa+', Kecamatan '+w.kecamatan+', '+kab+', Provinsi '+w.provinsi;
 {const pick=await chooseRowAndNote({mode:'master',auto:data.wilayah.catatan,tracking:data.tracking,tab:'Master data'});if(pick===null)return;
  data.targetRow=pick.row;const note=pick.note;
  data.wilayah.catatan=note.text;data.wilayah.catatanUtuh=note.utuh;data.catatanInfo=note.hadPrev?(note.changed?'Catatan: diperbarui':'Catatan: tetap (tidak berubah)'):'';}
 if(!await AIRA_MODAL.ask('Kirim Persetujuan ke Master data, baris '+data.targetRow+'?\n'+data.nama+' | Sumur '+data.sumur+' | Tracking: '+data.tracking+'\nPeruntukan: '+data.peruntukan+' ('+data.klasifikasi+')\nAkuifer: '+data.akuifer+' | Debit evaluasi: '+data.debit+' m3/hari\nMasa berlaku: '+(typeof masa==='number'?masa+' tahun':masa)+'\nBujur: '+data.lng+' | Lintang: '+data.lat+'\n'+data.lokasi+'\n'+w.catatan+(data.telp&&data.email?'':'\n\nCatatan: telepon/email profil tidak terbaca; kolom tersebut dikosongkan.')))return;
 await AIRA_MODAL.done(await send(data),{source:'Data Lengkap Persetujuan'});
}
button('Data Lengkap Persetujuan',475,(_,date)=>completeSetuju(date));

const dewClean=s=>String(s??'').replace(/\s+/g,' ').trim();
function dewTextHTML(s){const doc=new DOMParser().parseFromString(String(s),'text/html');doc.querySelectorAll('a,button,script,style').forEach(e=>e.remove());return dewClean(doc.body.textContent);}
// R18: pembaca label form Sumur Pantau/Imbuhan (label dicocokkan longgar, baris pertama yang cocok).
function imbuhanLabeled(doc,pattern){for(const tr of doc.querySelectorAll('tr')){const cells=[...tr.children].filter(e=>e.tagName==='TD');if(cells.length<2)continue;const label=dewClean(cells[0].textContent).replace(/\*\)/g,'').trim().toLowerCase();if(!pattern.test(label))continue;const el=cells[1].querySelector('input:not([type=hidden]),textarea,select');const v=el?dewClean(el.tagName==='SELECT'?el.selectedOptions[0]?.textContent:el.value):dewTextHTML(cells[1].innerHTML);if(v&&v!=='-')return v;}return '';}
function imbuhanName(doc){return imbuhanLabeled(doc,/^nama\s+(?:instansi|perusahaan|pemohon|badan\s+usaha|kelompok)/)||imbuhanLabeled(doc,/^nama\b/);}
function dewLabeled(doc,label){for(const tr of doc.querySelectorAll('tr')){const cells=[...tr.children].filter(e=>e.tagName==='TD');if(cells.length===2&&dewClean(cells[0].textContent).replace(/\*\)/g,'').trim()===label)return dewTextHTML(cells[1].innerHTML);}return '';}
function dewDetail(label){for(const row of document.querySelectorAll('.row')){const e=row.querySelector('label');if(dewClean(e?.textContent)===label)return dewClean(row.querySelector('span')?.textContent);}return dewLabeled(document,label);}
function dewRequest(url,method='GET',data){return new Promise((resolve,reject)=>GM_xmlhttpRequest({url,method,headers:data?{'Content-Type':'application/json'}:{},data:data?JSON.stringify(data):undefined,timeout:45000,onload:r=>{if(r.status<200||r.status>=300)return reject(Error('HTTP '+r.status+'. Cek Sheets sebelum mengulang pengiriman.'));resolve(r.responseText);},onerror:()=>reject(Error('Koneksi gagal. Cek Sheets sebelum mengulang.')),ontimeout:()=>reject(Error('Respons belum terkonfirmasi. Cek Sheets sebelum mengulang.'))}));}
function dewNum(v,label){const s=dewTextHTML(v).replace(/\s/g,'').replace(',','.');if(!/^-?\d+(\.\d+)?$/.test(s))throw Error('Angka tidak terbaca: '+label+' ('+dewTextHTML(v)+')');return Number(s);}
function dewLocation(parts){
 const title=text=>text.replace(/\S+/g,w=>/^(?:DKI|DI|D\.?I\.?|RT|RW)$/i.test(w)?w.toUpperCase():w.charAt(0).toUpperCase()+w.slice(1).toLowerCase());
 const prefix=(value,label,pattern)=>pattern.test(value)?title(value).replace(/Desa\s*\/\s*kelurahan/gi,'Desa/Kelurahan').replace(/Kota\s*\/\s*kabupaten/gi,'Kota/Kabupaten'):label+' '+title(value);
 return [parts[0],prefix(parts[1],'Desa/Kelurahan',/^(?:desa|kelurahan|desa\s*\/\s*kelurahan)\b/i),prefix(parts[2],'Kecamatan',/^(?:kecamatan|kec\.?)\b/i),prefix(parts[3],'Kota/Kabupaten',/^(?:kota|kabupaten|kab\.?|kota\s*\/\s*kabupaten)\b/i),prefix(parts[4],'Provinsi',/^(?:provinsi|propinsi|prov\.?)\b/i)].join(', ');
}
function dewCoordinate(v,label){const text=dewTextHTML(v);dewNum(text,label);return text;}
async function dewRun(){
 const jenis=dewDetail('Jenis Izin');if(!/dewatering/i.test(jenis))throw Error('Tombol khusus permohonan Dewatering.');
 const tracking=dewDetail('Nomor Tracking');if(!tracking)throw Error('Nomor Tracking tidak terbaca.');
 const iframe=document.querySelector('iframe.fgenIframe');if(!iframe)throw Error('Buka bagian Data Permohonan terlebih dahulu.');
 const source=new URL(iframe.src);if(source.hostname!=='formgen-perizinan.esdm.go.id')throw Error('Sumber form tidak dikenali.');
 const raw=await dewRequest(source.href),doc=new DOMParser().parseFromString(raw,'text/html');
 if(!doc.querySelector('#formColumnar_1526'))throw Error('Form Dewatering 1526 tidak ditemukan.');
 const data={tracking,jenis:/perpanjangan/i.test(jenis)?'Dewatering Perpanjangan':/baru/i.test(jenis)?'Dewatering Baru':jenis,nama:dewLabeled(doc,'Nama Pemohon'),alamat:dewLabeled(doc,'Alamat Pemohon'),pelaksana:dewLabeled(doc,'Nama Perusahaan'),lokasi:dewLabeled(doc,'Alamat Lokasi Dewatering'),rencana:dewLabeled(doc,'Jangka Waktu Rencana Dewatering'),masa:Number(doc.querySelector('[name="MASA_BERLAKU_EVALUATOR"]')?.value),metode:dewLabeled(doc,'Metode Dewatering'),pompa:dewLabeled(doc,'Jenis dan Kapasitas Pompa'),keterangan:dewLabeled(doc,'Keterangan'),evaluasi:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())};
 const locationParts=['Alamat Lokasi Dewatering','Lokasi Dewatering (Desa/Kelurahan)','Lokasi Dewatering (Kecamatan)','Lokasi Dewatering (Kabkot)','Lokasi Dewatering (Provinsi)'].map(label=>dewLabeled(doc,label));
 if(locationParts.some(value=>!value||/^(?:--|-|null)$/i.test(value)))throw Error('Alamat atau wilayah administrasi Dewatering belum lengkap pada form.');
 data.lokasi=dewLocation(locationParts);
 const script=[...doc.scripts].map(s=>s.textContent).find(s=>s.includes('JsonAjaxLoadTabularDewatering.jsp'));const path=script?.match(/url\s*:\s*['"]([^'"]*JsonAjaxLoadTabularDewatering\.jsp[^'"]*)['"]/i)?.[1];if(!path)throw Error('Alamat daftar sumur tidak terbaca.');
 const tableUrl=new URL(path,source.href);if(tableUrl.origin!==source.origin)throw Error('Sumber tabel tidak sesuai.');
 const rows=await dewLoadWells(tableUrl);
 data.wells=rows.map(w=>({sumur:dewTextHTML(w['Sumur Bor/Gali Dewatering']),lng:dewCoordinate(w['Longitude (X)'],'Longitude'),lat:dewCoordinate(w['Latitude (Y)'],'Latitude'),kedalaman:dewNum(w['Kedalaman Sumur Bor/Gali Dewatering (m)'],'Kedalaman sumur'),pompaDepth:dewNum(w['Kedalaman Pompa (m)'],'Kedalaman pompa'),debit:dewNum(w['Debit Pengambilan Air Tanah (m3/hari)'],'Debit')}));
 const selected=await dewChooseTargetRow();if(selected===null)return;data.targetRow=selected.row;data.metode=selected.metode;data.pompa=selected.pompa;data.keterangan=selected.keterangan;
 if(!await AIRA_MODAL.ask('Kirim Dewatering ke baris '+data.targetRow+'–'+(data.targetRow+rows.length-1)+'?\n'+data.nama+' | Tracking: '+tracking+'\n'+rows.length+' sumur | Masa berlaku evaluator: '+data.masa+' bulan\nMetode: '+data.metode+'\nPompa: '+data.pompa+'\nData teknis dan masa berlaku diambil dari form yang sudah tersimpan.\n'+(!data.metode||!data.pompa?'Metode/pompa yang tidak tersedia di form tetap diisi manual.':'')))return;
 if(!WEB_APP_URL.startsWith('https://script.google.com/macros/s/')||TOKEN==='ISI_TOKEN_DI_SINI')throw Error('URL/token belum diatur. Klik ikon Tampermonkey → Pengaturan INLINE.');
 const result=await dewRequest(WEB_APP_URL,'POST',{token:TOKEN,action:'dewatering',data});let saved;try{saved=JSON.parse(result);}catch{throw Error('Respons Google belum terkonfirmasi. Cek Sheets Dewatering sebelum mengirim ulang.');}if(!saved.ok)throw Error(saved.message||'Pengiriman ditolak.');await AIRA_MODAL.done(saved.message,{source:'Data Lengkap Dewatering'});
}
const dewButton=document.createElement('button');dewButton.textContent='Data Lengkap Dewatering';dewButton.style.cssText='position:fixed;right:25px;bottom:200px;z-index:99999;background:#244b8c;color:white;padding:12px;border:0;border-radius:8px;cursor:pointer';document.body.append(dewButton);dewButton.onclick=async()=>{dewButton.disabled=true;try{await dewRun();}catch(e){await AIRA_MODAL.error(e.message,{source:'Data Lengkap Dewatering'});}finally{dewButton.disabled=false;}};
// Tabel sumur Dewatering memakai DataTables server-side: satu permintaan hanya memberi satu halaman (mis. 10 sumur).
// Bila recordsTotal lebih besar, minta ulang dengan panjang halaman = total, lalu (bila server membatasi) ambil per halaman.
async function dewLoadWells(tableUrl){
 const get=async(params)=>{const u=new URL(tableUrl.href);for(const [k,v] of Object.entries(params||{}))u.searchParams.set(k,String(v));
  const reply=await dewRequest(u.href);let payload;try{payload=JSON.parse(reply);}catch{throw Error('Daftar sumur bukan JSON. Refresh INLINE lalu coba kembali.');}
  const rows=Array.isArray(payload)?payload:(payload.data||payload.aaData);if(!Array.isArray(rows))throw Error('Daftar sumur tidak terbaca.');
  const total=Array.isArray(payload)?rows.length:Number(payload.recordsTotal??payload.iTotalRecords??payload.recordsFiltered??payload.iTotalDisplayRecords??rows.length);
  return {rows,total:Number.isFinite(total)?total:rows.length};};
 const page=(start,length)=>({draw:1,start,length,iDisplayStart:start,iDisplayLength:length});
 let first=await get();if(!first.rows.length)throw Error('Daftar sumur kosong/tidak terbaca.');
 if(first.total<=first.rows.length)return first.rows;
 const total=first.total;
 const all=await get(page(0,total));if(all.rows.length>=total)return all.rows.slice(0,total);
 // Server membatasi panjang halaman: ambil berurutan memakai ukuran halaman yang diberikan server.
 const size=Math.max(all.rows.length,first.rows.length);let rows=all.rows.length>=first.rows.length?all.rows.slice():first.rows.slice();
 for(let start=rows.length;start<total&&start<5000;start+=size){const part=await get(page(start,size));if(!part.rows.length)break;rows=rows.concat(part.rows);}
 const key=w=>JSON.stringify(w);const unique=[...new Map(rows.map(w=>[key(w),w])).values()];
 if(unique.length!==total)throw Error('Daftar sumur belum lengkap ('+unique.length+' dari '+total+' sumur terbaca); pengiriman dihentikan. Kirim screenshot pesan ini ke pengelola.');
 return unique;
}
function dewChooseTargetRow(){
 return new Promise(resolve=>{
  const dialog=airaDialog();
  dialog.style.cssText='width:min(600px,calc(100vw - 40px));max-height:85vh;overflow:auto;box-sizing:border-box;border:0;border-radius:12px;padding:24px;background:white;color:#24344a;font:14px/1.5 Arial,sans-serif;box-shadow:0 16px 60px #0005';
  dialog.innerHTML=`<form novalidate><h2 style="margin:0 0 16px;font-size:20px">Silakan masukkan nomor baris awal</h2><label for="inline-target-row">Nomor baris pada Google Sheets</label><input id="inline-target-row" type="text" inputmode="numeric" autocomplete="off" style="display:block;width:100%;box-sizing:border-box;margin:6px 0 14px;padding:10px;border:1px solid #9caabc;border-radius:6px;font:inherit" autofocus><label for="inline-dew-method">Metode Dewatering</label><textarea id="inline-dew-method" required rows="3" style="display:block;width:100%;box-sizing:border-box;margin:6px 0 14px;padding:10px;font:inherit"></textarea><label for="inline-dew-pump">Jenis dan Kapasitas Pompa (sertakan satuan)</label><textarea id="inline-dew-pump" required rows="2" style="display:block;width:100%;box-sizing:border-box;margin:6px 0 14px;padding:10px;font:inherit"></textarea><label for="inline-dew-purpose">Keterangan/Peruntukan</label><textarea id="inline-dew-purpose" required rows="3" style="display:block;width:100%;box-sizing:border-box;margin:6px 0 14px;padding:10px;font:inherit"></textarea><ul style="margin:0;padding-left:20px"><li style="margin-bottom:10px">Sebelum mengirimkan Data Permohonan Dewatering ke Form Data Dewatering, silakan masukkan nama evaluator secara manual terlebih dahulu pada Sheets Dewatering sebagai informasi bahwa baris tersebut akan digunakan oleh evaluator untuk pengisian informasi permohonan.</li><li style="margin-bottom:10px">Pastikan nomor baris yang digunakan adalah <strong>nomor baris pada Google Sheets</strong>, bukan nomor baris pada kolom &quot;No&quot;.</li><li>Pastikan nomor baris yang dimasukkan telah sesuai dengan tujuan baris pada Form Data Dewatering, kesalahan pengisian nomor baris dapat menyebabkan tumpang tindih dengan data yang telah terisi oleh evaluator lain.</li></ul><p role="alert" style="color:#b42318;margin:12px 0" hidden></p><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button type="button" style="padding:9px 18px">Batal</button><button type="submit" style="padding:9px 18px;background:#244b8c;color:white;border:0;border-radius:6px">Lanjutkan</button></div></form>`;
  const input=dialog.querySelector('input'),error=dialog.querySelector('[role="alert"]');
  const finish=value=>{dialog.close();dialog.remove();resolve(value);};
  dialog.querySelector('[type="button"]').onclick=()=>finish(null);
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish(null);});
  dialog.querySelector('form').onsubmit=e=>{
   e.preventDefault();const value=input.value.trim();
   if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))||Number(value)<2){error.hidden=false;error.textContent='Nomor baris harus bilangan bulat minimal 2.';input.focus();return;}
   const metode=dialog.querySelector('#inline-dew-method').value.trim(),pompa=dialog.querySelector('#inline-dew-pump').value.trim();
   if(!metode||!pompa||metode.length>10000||pompa.length>10000){error.hidden=false;error.textContent='Isi Metode Dewatering serta Jenis dan Kapasitas Pompa, termasuk satuannya.';return;}
   const keterangan=dialog.querySelector('#inline-dew-purpose').value.trim();
   if(!keterangan||keterangan.length>10000){error.hidden=false;error.textContent='Isi Keterangan/Peruntukan terlebih dahulu.';return;}
   finish({row:Number(value),metode,pompa,keterangan});
  };
  document.body.append(dialog);dialog.showModal();input.focus();
 });
}



// Pengembalian hanya mencatat rekap; tidak menekan tombol pengembalian/simpan milik INLINE.
async function returnRpc(action,data){
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(WEB_APP_URL)||TOKEN==='ISI_TOKEN_DI_SINI')throw Error('URL/token belum diatur. Klik ikon Tampermonkey → Pengaturan INLINE.');
 return new Promise((resolve,reject)=>GM_xmlhttpRequest({method:'POST',url:WEB_APP_URL,headers:{'Content-Type':'application/json'},data:JSON.stringify({token:TOKEN,action,data}),timeout:45000,onload:r=>{try{if(r.status<200||r.status>=300)throw Error('HTTP '+r.status);if(/^\s*</.test(r.responseText||''))throw Error('Penerima Sheets mengembalikan HTML. Periksa URL dan deployment Sheets.');const v=JSON.parse(r.responseText);if(!v.ok)throw Error(v.message||'Pengembalian ditolak.');resolve(v);}catch(e){reject(e);}},onerror:()=>reject(Error('Koneksi rekap gagal. Periksa sheet sebelum mencoba lagi.')),ontimeout:()=>reject(Error('Respons rekap belum terkonfirmasi. Periksa sheet sebelum mencoba lagi.'))}));
}
function returnNoteText(raw){
 if(!/<\/?(?:p|div|br|li|ul|ol|span|strong|b|em|i|table|tr|td)\b/i.test(raw))return String(raw).trim();
 const doc=new DOMParser().parseFromString(raw,'text/html');doc.querySelectorAll('br').forEach(n=>n.replaceWith('\n'));doc.querySelectorAll('p,div,li,tr').forEach(n=>n.append('\n'));return doc.body.textContent.trim();
}
function returnSavedNotes(doc){
 const roots=[...doc.querySelectorAll('[id="riwayat-catatan-container"]')];if(!roots.length)return [];
 if(roots.length!==1)throw Error('Wadah riwayat kesimpulan ganda; salinan terbaru perlu dibaca dari server.');
 const root=roots[0],notes=[],seenCards=new Set();
 for(const copy of root.querySelectorAll('button.copy_catatan[data-id]')){
  const id=copy.getAttribute('data-id');if(!/^cat\d+$/.test(id||''))throw Error('ID catatan tersimpan tidak dikenali.');
  const card=copy.closest('.border-dashed');if(!card||!root.contains(card))throw Error('Kartu riwayat '+id+' belum dikenali.');
  if(seenCards.has(card))throw Error('Tautan salin ganda pada satu kartu kesimpulan.');seenCards.add(card);
  const stamps=[...card.querySelectorAll('label')].map(label=>clean(label.textContent).match(/^(.*?)\s*@\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/)).filter(Boolean);
  if(stamps.length!==1)throw Error('Nama/tanggal/jam catatan '+id+' belum terbaca dengan pasti.');
  const author=clean(stamps[0][1].replace(/^[^\p{L}\p{N}]+/u,'')),timestamp=stamps[0][2],time=Date.parse(timestamp.replace(' ','T')+'+07:00');
  // ID catN dapat berulang setelah AJAX INLINE. Pasangkan input dengan kartu,
  // bukan dengan seluruh wadah riwayat atau urutan nomor catN.
  const previous=card.previousElementSibling;
  let input=previous?.tagName==='INPUT'&&previous.getAttribute('type')==='hidden'&&previous.getAttribute('id')===id?previous:null;
  const nested=[...card.querySelectorAll('input[type="hidden"][id="'+id+'"]')];
  if(nested.length>1||(input&&nested.length))throw Error('Isi catatan '+id+' ganda pada kartu yang sama.');
  if(!input&&nested.length===1)input=nested[0];
  const descriptions=[];
  for(const row of card.querySelectorAll('.row')){
   const labels=[...row.children].filter(n=>n.tagName==='LABEL');
   if(labels.some(n=>clean(n.textContent).toLowerCase()==='uraian')){
    const values=[...row.children].filter(n=>n.classList.contains('col'));
    if(values.length!==1)throw Error('Uraian catatan '+id+' belum terbaca dengan pasti.');
    descriptions.push(returnNoteText('<div>'+values[0].innerHTML+'</div>'));
   }
  }
  if(descriptions.length!==1)throw Error('Uraian catatan '+id+' tidak ditemukan atau ganda pada kartu riwayat.');
  const visible=descriptions[0],text=input?returnNoteText(input.value):visible;
  if(input&&clean(text)!==clean(visible))throw Error('Isi tersembunyi dan uraian catatan '+id+' berbeda; perlu konfirmasi dari riwayat server.');
  if(!author||!Number.isFinite(time)||!text)throw Error('Catatan tersimpan '+id+' kosong atau tidak valid.');
  notes.push({author,timestamp,time,text});
 }
 return notes;
}

function returnNameKey(raw){
 const prefixes=new Set(['prof','dr','drs','dra','ir','h','hj']);
 const suffixes=new Set(['st','mt','ssi','msi','si','se','me','skom','mkom','sp','mp','spi','mpi','ssos','msos','sh','mh','spd','mpd','spsi','mpsi','sgz','mgz','ssn','msn','skm','mkm','sked','mked','skg','mkg','ak','ca','cpa','mm','mba','msc','bsc','phd','sag','mag','sstat','mstat','meng','beng','amd','amdt','amdkep','ns','skep','mkep','sars','mars','sds','mds','spt','mph','mhum','shum','ss','ms','ma','ba','pgeo','pg','ipm','ipu','ipp','ceng']);
 const compact=t=>t.replace(/[.]/g,'').toLowerCase();
 const parts=String(raw??'').normalize('NFKC').replace(/,/g,' , ').trim().split(/\s+/).filter(Boolean);
 while(parts.length&&prefixes.has(compact(parts[0])))parts.shift();
 while(parts.length&&(parts.at(-1)===','||suffixes.has(compact(parts.at(-1)))))parts.pop();
 // Tidak menghapus kata nama tengah, menebak singkatan nama, atau menerima substring.
 return parts.join(' ').replace(/[.,]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
}

function returnLatestNote(notes,authors){
 const key=returnNameKey;const own=notes.filter(n=>authors.some(a=>key(a)===key(n.author))).sort((a,b)=>b.time-a.time);
 if(!own.length)throw Error('Catatan kesimpulan tersimpan dari evaluator ini belum ditemukan. Simpan catatan, buka riwayat Catatan Kesimpulan, dan pastikan nama lengkap terdaftar pada RETURN_NOTE_AUTHORS.');
 const newest=own[0];if(own.some(n=>n.time===newest.time&&n.text!==newest.text))throw Error('Dua catatan berbeda memiliki tanggal/jam yang sama. Periksa riwayat sebelum merekap.');return newest;
}
async function returnReadHistory(){
 let readError=null;
 try{const loaded=returnSavedNotes(document);if(loaded.length)return loaded;}catch(e){readError=e;}
 // Bila DOM baru selesai disimpan bermasalah, baca riwayat tersimpan dari server.
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{const r=await fetch(location.href,{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(r.ok){const doc=new DOMParser().parseFromString(await r.text(),'text/html');const notes=returnSavedNotes(doc);if(notes.length)return notes;}}catch(e){if(!readError)readError=e;}finally{clearTimeout(timer);}
 if(readError)throw Error('Riwayat kesimpulan belum dapat dipastikan. Refresh INLINE lalu coba Pengembalian lagi. '+readError.message);
 const trigger=[...document.querySelectorAll('button,a')].find(n=>/^(?:Tambah\s+)?Catatan Kesimpulan$/i.test(clean(n.textContent)));
 if(trigger)trigger.click();
 const until=Date.now()+4000;while(Date.now()<until){const notes=returnSavedNotes(document);if(notes.length)return notes;await new Promise(r=>setTimeout(r,250));}
 throw Error('Riwayat tersimpan belum terbaca. Buka Catatan Kesimpulan atau refresh INLINE; tidak perlu menyimpan ulang catatan yang sudah muncul pada riwayat.');
}

async function returnRun(){
 const clickedAt=Date.now(),identity=await returnRpc('pengembalian_profile',{});
 const permit=detail('Jenis Izin'),tracking=detail('Nomor Tracking'),id=detail('ID Izin (OSS)');
 let company=detail('Nama Pelaku Usaha')||detail('Nama Perusahaan')||row(document,'Nama Perusahaan')||labeled(document,'Nama Perusahaan');
 // R20: Persetujuan Penggunaan Air Tanah dan Sumur Pantau/Imbuhan memakai form dan label sendiri.
 const kind=setujuJenis(permit)?'OSS_SETUJU':/sumur\s+pantau|imbuhan/i.test(permit)?'OSS_IMBUHAN':'';
 let form=null;
 if(!company||kind){try{form=kind?await frame(kind):await frame();if(!company)company=form?.nama||'';}catch{}}
 const province=clean(detail('Lokasi').split(/\s+-\s+/)[0])||clean((permit.match(/(?:provinsi|wilayah)\s+(.+)$/i)||[])[1])||clean(form?.prov||'');
 if(!permit||!tracking||!company||!province)throw Error('Identitas Pengembalian belum lengkap. Pastikan Detil Permohonan dan nama perusahaan pada Data Permohonan sudah termuat.');
 const note=returnLatestNote(await returnReadHistory(),identity.authors);
 // Tanpa ID Izin OSS (Persetujuan): kolom id diisi nomor tracking, sama seperti Master data.
 const idKirim=(id&&!/^-+$/.test(id))?id:(kind?tracking:id);
 // 27/11/2026: konfirmasi sebelum dicatat, seperti Kirim ke OSS Adit.
 const baris=[['Jenis izin',permit],['Tracking',tracking],['ID Izin OSS',idKirim&&idKirim!==tracking?idKirim:''],['Nama',company],['Provinsi',province],['Evaluator',note.author],['Waktu catatan',note.timestamp],['Catatan',note.text]];
 if(!await AIRA_MODAL.confirm(baris.filter(([,v])=>v&&String(v).trim()).map(([k,v])=>k+': '+String(v).replace(/\s*\n+\s*/g,' ').trim()).join('\n'),{title:'Catat pengembalian berkas?',ok:'Kirim',source:'Pengembalian',width:540}))return;
 const result=await returnRpc('pengembalian',{id:idKirim,tracking,company,province,permit,note:note.text,noteAuthor:note.author,noteTime:note.timestamp,clickedAt});
 driveResult((result.already?'Sudah tercatat':'Proses Berhasil')+'\nPengembalian tercatat pada baris '+result.row+'.\nEvaluator: '+(result.nama||note.author||result.evaluator)+'\nTanggal pengembalian: '+result.date+'\nWaktu catatan: '+note.timestamp,'https://docs.google.com/spreadsheets/d/1ZW9nmnYmrNIPVGifHxo0CBPweDHgj9WRIwWpo-59owE/edit');
}
button('Pengembalian',420,()=>returnRun());
// R19: tombol Data Lengkap hanya tampil pada jenis izinnya masing-masing.
// Jenis Izin bisa dimuat setelah script berjalan, jadi tampilan diperbarui berkala.
const DATA_LENGKAP_JENIS={
 'Data Lengkap Pengusahaan':t=>/izin\s+pengusahaan\s+air\s+tanah/i.test(t),
 'Data Lengkap Dewatering':t=>/dewatering/i.test(t),
 'Data Lengkap Sumur Pantau/Imbuhan':t=>/sumur\s+pantau|imbuhan/i.test(t),
 'Data Lengkap Persetujuan':t=>setujuJenis(t)
};
function syncDataLengkap(){
 const jenis=[detail('Jenis Izin'),detail('Jenis Permohonan')].filter(Boolean).join(' | ');
 for(const b of document.querySelectorAll('button')){
  const show=DATA_LENGKAP_JENIS[b.textContent.trim()];
  if(!show||b.disabled)continue; // tombol yang sedang memproses tidak disembunyikan
  const want=show(jenis)?'':'none';if(b.style.display!==want)b.style.display=want;
 }
}
syncDataLengkap();setInterval(syncDataLengkap,1500);
const returnButton=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Pengembalian');if(returnButton)returnButton.style.background='#b42318';

})();
