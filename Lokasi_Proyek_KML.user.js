// ==UserScript==
// @name         INLINE Unduh KML Lokasi Proyek
// @namespace    inline-rekan
// @version      1.35
// @description  Unduh KML dan cek koordinat sumur dalam poligon data_lokasi_proyek
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinStaf/*
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinPre/*
// @match        https://formgen-perizinan.esdm.go.id/*
// @grant        GM_xmlhttpRequest
// @connect      formgen-perizinan.esdm.go.id
// @updateURL    https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Lokasi_Proyek_KML.user.js
// @downloadURL  https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Lokasi_Proyek_KML.user.js
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
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function readLocations(doc){
 const found=[];
 for(const table of doc.querySelectorAll('table')){
  const rows=[...table.querySelectorAll('tr')].filter(r=>r.closest('table')===table);
  let columns=null;
  for(const row of rows){
   const cells=[...row.children].filter(c=>c.tagName==='TH'||c.tagName==='TD');
   const headers=cells.map(c=>norm(c.textContent));
   const index=headers.indexOf('datalokasiproyek');
   if(index>=0){columns={data:index,id:headers.indexOf('idproyeklokasi'),address:headers.indexOf('alamatusaha')};continue;}
   if(!columns || !cells[columns.data])continue;
   const cell=cells[columns.data];
   const input=cell.querySelector('textarea,input:not([type=hidden])');
   const raw=clean(input?input.value:cell.textContent);
   // Pertahankan baris kosong agar dapat dibedakan dari tabel yang belum ditemukan.
   found.push({raw,id:columns.id>=0?clean(cells[columns.id]?.textContent):'',address:columns.address>=0?clean(cells[columns.address]?.textContent):''});
  }
 }
 return found;
}
function noProjectData(raw){
 if(!clean(raw)||clean(raw)==='-')return true;
 let records;try{records=JSON.parse(raw);}catch{return false;}
 return Array.isArray(records)&&records.every(r=>r&&(!clean(r.lat_lng)||clean(r.lat_lng)==='-'));
}
function polygonPoints(raw){
 let records;try{records=JSON.parse(raw);}catch{throw Error('data_lokasi_proyek bukan JSON yang valid. Pastikan seluruh teks koordinat tampil.');}
 if(!Array.isArray(records))throw Error('data_lokasi_proyek harus berupa daftar titik.');
 const points=[];
 for(const [index,record] of records.entries()){
  if(record?.lat_lng == null || clean(record.lat_lng)==='' || clean(record.lat_lng)==='-')throw Error('Batas lokasi proyek belum lengkap: titik ke-'+(index+1)+' pada data_lokasi_proyek kosong atau berisi tanda -. Koordinat sumur tidak bermasalah karena pesan ini. Periksa data_lokasi_proyek; pengecekan memerlukan poligon lengkap dengan minimal tiga titik valid.');
  if(typeof record?.lat_lng!=='string')throw Error('Titik proyek tidak memiliki lat_lng.');
  const match=record.lat_lng.match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*,\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*$/);
  if(!match)throw Error('Format koordinat harus bujur,lintang: '+record.lat_lng);
  const pair=[Number(match[1]),Number(match[2])];
  if(!pair.every(Number.isFinite)||Math.abs(pair[0])>180||Math.abs(pair[1])>90)throw Error('Koordinat di luar rentang bujur/lintang.');
  if(!points.length || pair[0]!==points.at(-1)[0] || pair[1]!==points.at(-1)[1])points.push(pair);
 }
 if(new Set(points.map(p=>p.join(','))).size<3)throw Error('Batas proyek memerlukan minimal tiga titik berbeda.');
 const first=points[0],last=points.at(-1);
 if(first[0]!==last[0]||first[1]!==last[1])points.push([...first]);
 return points;
}
function polygon(raw){return polygonPoints(raw).map(p=>p.join(',')+',0').join(' ');}
function pointInPolygon(point,ring){
 // Toleransi komputasi 1e-9 derajat, bukan toleransi akurasi survei.
 const eps=1e-9,[x,y]=point;let inside=false;
 for(let i=0;i<ring.length-1;i++){
  const [ax,ay]=ring[i],[bx,by]=ring[i+1],dx=bx-ax,dy=by-ay;
  const length=Math.hypot(dx,dy);
  if(length>0 && Math.abs(dx*(y-ay)-dy*(x-ax))/length<=eps && x>=Math.min(ax,bx)-eps && x<=Math.max(ax,bx)+eps && y>=Math.min(ay,by)-eps && y<=Math.max(ay,by)+eps)return 'boundary';
  if((ay>y)!==(by>y) && x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
 }
 return inside?'inside':'outside';
}
// R18: form Persetujuan Penggunaan Sumur Pantau/Imbuhan (satu form; koordinat hanya dari data pemohon).
const SETUJU_DEBIT='JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH_EVALUATOR';
// R19: form Persetujuan Penggunaan Air Tanah (satu form; data pemohon + input evaluator).
function readWellSetuju(doc){
 const form=[...doc.querySelectorAll('form[id^="formColumnar_"]')].find(f=>f.querySelector('[name="__'+SETUJU_DEBIT+'"],[name="'+SETUJU_DEBIT+'"]'));
 if(!form)return null;
 const rowValue=label=>{for(const row of form.querySelectorAll('tr')){const cells=[...row.children].filter(c=>c.tagName==='TD');if(cells.length<2||norm(cells[0].textContent.replace(/\*\)/g,''))!==norm(label))continue;const cell=cells[1].cloneNode(true);cell.querySelectorAll('script,style,a,button,i,input[type=button]').forEach(e=>e.remove());const input=cell.querySelector('input:not([type=hidden]),textarea,select');return clean(input?(input.tagName==='SELECT'?input.selectedOptions[0]?.textContent:input.value):cell.textContent);}return '';};
 const value=n=>{const e=form.querySelector('[name="'+n+'"]');return clean(e?.tagName==='SELECT'?(/pilih/i.test(e.selectedOptions[0]?.textContent||'')?'':e.selectedOptions[0]?.textContent):e?.value);};
 const coord=clean(form.querySelector('[idElement="KOORDINAT_LOKASI"]')?.getAttribute('coord')||rowValue('Koordinat Sumur').replace(/contoh.*$/i,''));
 const m=coord.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
 let lat=m?m[1]:'',lng=m?m[2]:'';if(m&&Math.abs(Number(lat))>90){[lat,lng]=[lng,lat];}
 return {setuju:true,peruntukan:value('PERUNTUKAN_AIR_TANAH_EVALUATOR')||rowValue('Peruntukan Air Tanah'),screen:value('KEDUDUKAN_SARINGAN_EVALUATOR')||rowValue('Kedudukan Saringan'),lng,lat,
  name:clean((value('NOMOR_URUT_SUMUR_BOR_EVALUATOR')||rowValue('Nomor Urut Sumur Bor/Gali')).replace(/-/g,' ')),company:rowValue('Nama Instansi/Kelompok Masyarakat')||rowValue('Nama Pemohon'),rencana:rowValue('Rencana Debit yang Dimohonkan')};
}
function readWellImbuhan(doc){
 const form=[...doc.querySelectorAll('form[id^="formColumnar_"]')].find(f=>f.querySelector('[name="NOMOR_URUT_SUMUR_BOR_EVALUATOR"]')&&!f.querySelector('[name="__'+SETUJU_DEBIT+'"],[name="'+SETUJU_DEBIT+'"]'));
 if(!form)return null;
 const rowValue=label=>{for(const row of form.querySelectorAll('tr')){const cells=[...row.children].filter(c=>c.tagName==='TD');if(cells.length<2||norm(cells[0].textContent.replace(/\*\)/g,''))!==norm(label))continue;const cell=cells[1].cloneNode(true);cell.querySelectorAll('script,style,a,button,i,input[type=button]').forEach(e=>e.remove());const input=cell.querySelector('input:not([type=hidden]),textarea,select');return clean(input?input.value:cell.textContent);}return '';};
 const value=n=>clean(form.querySelector('[name="'+n+'"]')?.value);
 const coord=clean(form.querySelector('[idElement="KOORDINAT_LOKASI_PENGGUNAAN_AIR_TANAH"]')?.getAttribute('coord')||rowValue('Koordinat Lokasi'));
 const m=coord.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
 let lat=m?m[1]:'',lng=m?m[2]:'';if(m&&Math.abs(Number(lat))>90){[lat,lng]=[lng,lat];}
 return {imbuhan:true,peruntukan:clean(doc.getElementById('lbl_PERUNTUKAN_PENGGUNAAN_AIR_TANAH')?.textContent),screen:value('KEDUDUKAN_SARINGAN_EVALUATOR')||rowValue('Kedudukan Saringan'),lng,lat,name:clean((value('NOMOR_URUT_SUMUR_BOR_EVALUATOR')||rowValue('Nomor Urut Sumur')).replace(/-/g,' ')),company:rowValue('Nama Perusahaan/ Instansi')||rowValue('Nama Pemohon'),rencana:''};
}
function readWell(doc){
 const pairs=[['formColumnar_2055','formColumnar_2054'],['formColumnar_2053','formColumnar_2052'],['formColumnar_2057','formColumnar_2056']];
 const available=pairs.filter(([a,b])=>doc.getElementById(a)||doc.getElementById(b));
 if(!available.length)return readWellSetuju(doc)||readWellImbuhan(doc);
 if(available.length!==1)return null;
 const form=doc.getElementById(available[0][0]),source=doc.getElementById(available[0][1]);
 const value=n=>clean(form?.querySelector('[name="'+n+'"]')?.value);
 const rowValue=label=>{
  if(!source)return '';
  for(const row of source.querySelectorAll('tr')){
   const cells=[...row.children].filter(c=>c.tagName==='TD'||c.tagName==='TH');
   if(cells.length<2||norm(cells[0].textContent.replace(/\*\)/g,''))!==norm(label))continue;
   const cell=cells[1].cloneNode(true);cell.querySelectorAll('script,style,a,button,i').forEach(e=>e.remove());
   const input=cell.querySelector('input:not([type=hidden]),textarea,select');
   return clean(input?input.value:cell.textContent);
  }return '';
 };
 return {screen:value('RENTANG_KEDALAMAN_SCREEN'),lng:value('LONGITUDE_TITIK_LOKASI'),lat:value('LATITUDE_TITIK_LOKASI'),name:clean((value('NOMOR_URUT_SUMUR_BOR')||rowValue('Nomor Urut Sumur Bor / Gali')).replace(/-/g,' ')),company:value('NAMA_PERUSAHAAN')||rowValue('Nama Perusahaan'),rencana:rowValue('Debit Rencana yang Diajukan')};
}
function wellPoint(well){
 if(!well)throw Error('Buka Data Teknis Input Evaluator dahulu. Pastikan script aktif pada formgen lalu refresh INLINE.');
 const number=(v,label)=>{if(typeof v!=='string'||!/^[-+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(v.trim()))throw Error(label+' evaluator kosong atau tidak valid.');return Number(v.replace(',','.'));};
 const lng=number(well.lng,'Bujur'),lat=number(well.lat,'Lintang');
 if(Math.abs(lng)>180||Math.abs(lat)>90)throw Error('Koordinat evaluator di luar rentang bujur/lintang.');
 return [lng,lat];
}
function makeKML(locations,title){
 const placemarks=locations.map((r,i)=>`<Placemark><name>${xml(r.id&&r.id!=='-'?r.id:'Batas Lokasi Proyek '+(i+1))}</name><description>${xml(r.address)}</description><styleUrl>#batas</styleUrl><Polygon><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><outerBoundaryIs><LinearRing><coordinates>${polygon(r.raw)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`).join('\n');
 return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${xml(title)}</name><Style id="batas"><LineStyle><color>ffff6600</color><width>2</width></LineStyle><PolyStyle><color>400066ff</color></PolyStyle></Style>${placemarks}</Document></kml>`;
}
// ---------- Isi Otomatis isian evaluator (R18) ----------
const FILL_PAIRS=[['formColumnar_2055','formColumnar_2054'],['formColumnar_2053','formColumnar_2052'],['formColumnar_2057','formColumnar_2056']];
const fillNorm=s=>clean(s).replace(/\*\)/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function fillForms(doc){
 const imb=[...doc.querySelectorAll('form[id^="formColumnar_"]')].find(f=>f.querySelector('[name="NOMOR_URUT_SUMUR_BOR_EVALUATOR"]'));
 if(imb&&!FILL_PAIRS.some(([e])=>doc.getElementById(e)))return {form:imb,source:imb};
 const found=FILL_PAIRS.filter(([e])=>doc.getElementById(e));
 if(found.length!==1)throw Error(found.length?'Lebih dari satu formulir evaluator terbuka.':'Formulir Data Teknis evaluator tidak ditemukan.');
 return {form:doc.getElementById(found[0][0]),source:doc.getElementById(found[0][1])};
}
function fillRowControl(root,test){
 if(!root)return null;
 for(const tr of root.querySelectorAll('tr')){
  const c=tr.querySelectorAll(':scope > td');if(c.length<2||!test(fillNorm(c[0].textContent)))continue;
  return {cell:c[1],el:c[1].querySelector('input:not([type=hidden]):not([type=button]):not([type=file]),textarea,select')};
 }
 return null;
}
const fillValueOf=el=>!el?'':el.tagName==='SELECT'?clean(el.selectedOptions[0]?.textContent):clean(el.value);
function fillApplicantAddress(form,source){
 const byName=source?.querySelector('[name="ALAMAT_LOKASI_SUMUR"]');if(byName&&clean(byName.value))return clean(byName.value);
 const r=fillRowControl(source,l=>/alamat.*lokasi.*sumur|alamatsumur/.test(l));
 if(r){if(r.el)return fillValueOf(r.el);const c=r.cell.cloneNode(true);c.querySelectorAll('a,button,i,script,style,small').forEach(x=>x.remove());const t=clean(c.textContent);if(t&&t!=='-')return t;}
 return '';
}
// Kolom angka formgen = kotak tampilan "__NAMA" (autoNumeric) + input tersembunyi "NAMA" yang disimpan.
// Yang diisi kotak tampilan; input tersembunyi ikut diperbarui di fillSet. Cadangan: cocokkan label baris.
const FILL_LABELS={JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH:/debithasilevaluasi|jumlahmaksimumpengambilan/,VOLUME_HARIAN:/^volumeharian/,MASA_BERLAKU:/^masaberlaku/,SKALA_USAHA:/^skalausaha/};
function fillField(form,name){
 const shown=form.querySelector('[name="__'+name+'"]');if(shown)return shown;
 const el=form.querySelector('[name="'+name+'"]:not([type=hidden])');if(el)return el;
 const re=FILL_LABELS[name];return re?fillRowControl(form,l=>re.test(l))?.el||null:null;
}
function fillHidden(el){
 if(el.name&&el.name.startsWith('__'))return el.form?.querySelector('input[type=hidden][name="'+el.name.slice(2)+'"]')||el.ownerDocument.querySelector('input[type=hidden][name="'+el.name.slice(2)+'"]');
 return null;
}
function fillTargets(doc,plan){
 const {form,source}=fillForms(doc);
 const targets=[];
 for(const [name,label,value] of plan.fields){
  const el=fillField(form,name);
  targets.push({name,label,el,value:String(value),editable:name==='JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH'||(plan.editable||[]).includes(name)});
 }
 if(plan.noAddress){const ov=plan.overrides||{};for(const t of targets)if(t.editable&&typeof ov[t.label]==='string'){t.value=ov[t.label];t.edited=true;}return targets;}
 const pemohon=fillApplicantAddress(form,source);
 const adminText=plan.admin.map(a=>a[2]).join(', ');
 const alamat=[pemohon,adminText].filter(Boolean).join(', ');
 targets.push({label:'Alamat Lokasi Sumur Bor / Gali',el:form.querySelector('[name="ALAMAT_LOKASI_SUMUR"]')||fillRowControl(form,l=>/alamat.*lokasi.*sumur/.test(l))?.el,value:alamat,editable:true,note:pemohon?'':'alamat pemohon tidak terbaca; hanya administrasi'});
 // Nilai yang diedit evaluator di jendela konfirmasi menggantikan nilai otomatis.
 const ov=plan.overrides||{};for(const t of targets)if(t.editable&&typeof ov[t.label]==='string'){t.value=ov[t.label];t.note='';t.edited=true;}
 // Volume Harian selalu sama dengan Debit Hasil Evaluasi (termasuk bila debit diedit di jendela konfirmasi).
 const deb=targets.find(t=>t.name==='JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH'),vol=targets.find(t=>t.name==='VOLUME_HARIAN');if(deb&&vol){vol.value=deb.value;vol.note='mengikuti Debit Hasil Evaluasi';}
 return targets;
}
function fillOption(el,value){
 // Cocokkan "Kabupaten Karawang" dengan "KAB. KARAWANG"/"Kabupaten Karawang"; Kota tidak pernah dicocokkan dengan Kabupaten.
 // Awalan "Usaha" diabaikan: "Besar" cocok dengan "Usaha Besar".
 const canon=t=>fillNorm(t).replace(/^usaha(?=mikro|kecil|menengah|besar)/,'').replace(/^kabupaten/,'kab').replace(/^(provinsi|propinsi|prov)/,'').replace(/^(desa|kelurahan|kel|kecamatan|kec)/,'');
 const bare=t=>canon(t).replace(/^(kab|kota)/,'');
 const opts=[...el.options].filter(o=>!/pilih/i.test(o.textContent));
 const exact=opts.find(o=>fillNorm(o.textContent)===fillNorm(value))||opts.find(o=>canon(o.textContent)===canon(value));
 if(exact)return exact;
 const loose=opts.filter(o=>!/^(kab|kota)/.test(canon(o.textContent))&&bare(o.textContent)===bare(value));
 return loose.length===1?loose[0]:null;
}
function fillSet(el,value){
 if(el.tagName==='SELECT'){const o=fillOption(el,value);if(!o)return false;el.value=o.value;}
 else{const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);}
 for(const t of ['input','change','blur'])el.dispatchEvent(new Event(t,{bubbles:true}));
 try{const jq=el.ownerDocument.defaultView.jQuery;if(jq){jq(el).trigger('change');jq(el).trigger('blur');}}catch{}
 const hidden=el.tagName!=='SELECT'&&fillHidden(el);
 if(hidden){const raw=String(value).replace(/\s/g,'');hidden.value=/,\d+$/.test(raw)?raw.replace(/\./g,'').replace(',','.'):raw.replace(/,/g,'');}
 el.style.background='#fff6c7';el.style.outline='2px solid #e0b100';
 return true;
}
async function fillRun(doc,plan,apply){
 const targets=fillTargets(doc,plan);
 const rows=[];
 for(const t of targets){
  const row={label:t.label,current:fillValueOf(t.el),value:t.value,note:t.note||'',editable:!!t.editable,edited:!!t.edited};
  if(!t.el){row.status='skip';row.note='kolom tidak ditemukan di formulir evaluator';rows.push(row);continue;}
  if(t.el.disabled||t.el.readOnly){row.status='skip';row.note='kolom terkunci';rows.push(row);continue;}
  if(!apply){row.status=t.el.tagName==='SELECT'&&!t.admin&&!fillOption(t.el,t.value)?'skip':'plan';if(row.status==='skip')row.note='pilihan "'+t.value+'" tidak ada di daftar';rows.push(row);continue;}
  let ok=fillSet(t.el,t.value);
  // Dropdown wilayah bertingkat: tunggu daftar berikutnya dimuat.
  if(!ok&&t.admin&&t.el.tagName==='SELECT'){for(let i=0;i<20&&!ok;i++){await new Promise(r=>setTimeout(r,250));ok=fillSet(t.el,t.value);}}
  row.status=ok?'done':'fail';if(!ok)row.note='pilihan "'+t.value+'" tidak ditemukan, isi manual';
  rows.push(row);
 }
 return rows;
}

const parentOrigin='https://ngantor.esdm.go.id';
if(location.hostname==='formgen-perizinan.esdm.go.id'){
 window.addEventListener('message',e=>{
  if(e.origin!==parentOrigin || e.source!==window.parent || e.data?.kind!=='OSS_KML_READ')return;
  window.parent.postMessage({kind:'OSS_KML_RESULT',nonce:e.data.nonce,locations:readLocations(document),well:readWell(document)},e.origin);
 });
 window.addEventListener('message',async e=>{
  if(e.origin!==parentOrigin || e.source!==window.parent || e.data?.kind!=='OSS_KML_FILL')return;
  let reply;try{reply={rows:await fillRun(document,e.data.plan,e.data.apply===true)};}catch(err){reply={error:err.message};}
  window.parent.postMessage({kind:'OSS_KML_FILL_RESULT',nonce:e.data.nonce,...reply},e.origin);
 });return;
}
if(window!==window.top)return;
function readFrame(frame,wantWell=false){
 const origin=new URL(frame.src,location.href).origin;
 if(origin!==parentOrigin && origin!=='https://formgen-perizinan.esdm.go.id')return Promise.resolve(wantWell?null:[]);
 try{if(frame.contentDocument)return Promise.resolve(wantWell?readWell(frame.contentDocument):readLocations(frame.contentDocument));}catch{}
 return new Promise(resolve=>{
  const nonce=crypto.randomUUID();
  const finish=rows=>{clearTimeout(timer);window.removeEventListener('message',handler);resolve(rows);};
  const handler=e=>{if(e.origin===origin && e.source===frame.contentWindow && e.data?.kind==='OSS_KML_RESULT' && e.data.nonce===nonce)finish(wantWell?e.data.well:(Array.isArray(e.data.locations)?e.data.locations:[]));};
  const timer=setTimeout(()=>finish(wantWell?null:[]),2000);
  window.addEventListener('message',handler);frame.contentWindow.postMessage({kind:'OSS_KML_READ',nonce},origin);
 });
}
function fillFrame(plan,apply){
 try{if(FILL_PAIRS.some(([e])=>document.getElementById(e))||document.querySelector('[name="NOMOR_URUT_SUMUR_BOR_EVALUATOR"]'))return fillRun(document,plan,apply);}catch(e){return Promise.reject(e);}
 const frames=[...document.querySelectorAll('iframe[src]')].filter(f=>new URL(f.src,location.href).origin==='https://formgen-perizinan.esdm.go.id');
 if(!frames.length)return Promise.reject(Error('Formulir Data Teknis evaluator belum terbuka.'));
 const frame=frames[0],origin='https://formgen-perizinan.esdm.go.id';
 return new Promise((resolve,reject)=>{
  const nonce=crypto.randomUUID();
  const handler=e=>{if(e.origin===origin&&e.source===frame.contentWindow&&e.data?.kind==='OSS_KML_FILL_RESULT'&&e.data.nonce===nonce){clearTimeout(timer);window.removeEventListener('message',handler);e.data.error?reject(Error(e.data.error)):resolve(e.data.rows);}};
  const timer=setTimeout(()=>{window.removeEventListener('message',handler);reject(Error('Formulir evaluator belum merespons. Refresh INLINE lalu coba lagi.'));},15000);
  window.addEventListener('message',handler);frame.contentWindow.postMessage({kind:'OSS_KML_FILL',nonce,plan,apply},origin);
 });
}
function fetchFrame(url){
 return new Promise((resolve,reject)=>GM_xmlhttpRequest({method:'GET',url,timeout:30000,
  onload:r=>r.status>=200&&r.status<300?resolve(readLocations(new DOMParser().parseFromString(r.responseText,'text/html'))):reject(Error('Formulir gagal dibaca: HTTP '+r.status)),
  onerror:()=>reject(Error('Koneksi formulir gagal.')),ontimeout:()=>reject(Error('Waktu pembacaan formulir habis.'))}));
}
function detail(label){
 for(const e of document.querySelectorAll('#detilPermohonan label'))if(norm(e.textContent)===norm(label))return clean(e.closest('.row')?.querySelector('span')?.textContent);
 return '';
}
async function locations(){
  let rows=readLocations(document);
  const frames=[...document.querySelectorAll('iframe[src]')];
  if(!rows.length)rows=(await Promise.all(frames.map(f=>readFrame(f)))).flat();
  if(!rows.length){
   const f=frames.find(f=>new URL(f.src,location.href).origin==='https://formgen-perizinan.esdm.go.id');
   if(f)rows=await fetchFrame(f.src);
  }
  if(!rows.length)throw Error('Kolom data_lokasi_proyek belum ditemukan atau kosong. Buka tab/bagian INLINE yang menampilkan tabel lokasi proyek, lalu klik kembali.');
  rows=rows.filter((r,i,a)=>a.findIndex(x=>x.id===r.id&&x.raw===r.raw)===i);
  return rows;
}

function regionLookup(point,choose=false,screen=""){return new Promise((resolve,reject)=>{const nonce=crypto.randomUUID();let timer;const handler=e=>{let v;try{v=JSON.parse(e.detail);}catch{return;}if(v.nonce!==nonce)return;clearTimeout(timer);document.removeEventListener('INLINE_REGION_RESPONSE',handler);v.error?reject(Error(v.error)):resolve(v.result);};document.addEventListener('INLINE_REGION_RESPONSE',handler);timer=setTimeout(()=>{document.removeEventListener('INLINE_REGION_RESPONSE',handler);reject(Error('Pengecekan wilayah belum merespons. Pastikan script INLINE Data Wilayah Sumur aktif dan data wilayah sudah diimpor.'));},300000);document.dispatchEvent(new CustomEvent('INLINE_REGION_REQUEST',{detail:JSON.stringify({nonce,point,choose,screen})}));});}


function scaleMoney(raw){
 const s=clean(raw).replace(/^Rp\.?\s*/i,'').replace(/\s/g,'');
 if(!s||s==='-')return null;
 if(/^\d+$/.test(s))return Number(s);
 if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s))return Number(s.replace(/\./g,'').replace(',','.'));
 if(/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(s))return Number(s.replace(/,/g,''));
 if(/^\d+[.,]\d{1,2}$/.test(s))return Number(s.replace(',','.'));
 return null;
}
function scaleClass(v){return v<=1e9?'Mikro':v<=5e9?'Kecil':v<=1e10?'Menengah':'Besar';}
function scaleSpecial(code){const p=Number(String(code).slice(0,3));return p>=681&&p<=682||p>=551&&p<=559||p>=11&&p<=16||p===32;}
function readScaleData(doc=document){
 const fields={};for(const label of doc.querySelectorAll('label')){
  const r=label.closest('.row');if(!r)continue;const span=r.querySelector('span');if(span)fields[norm(label.textContent)]=clean(span.textContent);
 }
 const get=(...keys)=>keys.map(k=>fields[norm(k)]).find(Boolean)||'';
 const codes=[];for(const table of doc.querySelectorAll('table')){
  let ci=-1;for(const row of table.querySelectorAll('tr')){
   const cells=[...row.children].filter(c=>/^(TH|TD)$/.test(c.tagName));const hi=cells.findIndex(c=>norm(c.textContent)==='kbli');
   if(hi>=0){ci=hi;continue;}if(ci>=0&&/^\d{5}$/.test(clean(cells[ci]?.textContent)))codes.push(clean(cells[ci].textContent));
  }
 }
 const direct=get('kbli');if(/^\d{5}$/.test(direct))codes.push(direct);
 return {idIzin:get('ID Izin (OSS)'),idProyek:get('ID Proyek (OSS)'),company:get('Nama Pemohon / Perusahaan','Nama Perusahaan','nama perusahaan'),date:get('Tanggal Pengajuan Permohonan'),type:get('Jenis Izin','Jenis Permohonan'),codes:[...new Set(codes)],total:scaleMoney(get('jumlah investasi','total investasi')),land:scaleMoney(get('investasi tanah','pembelian pematang tanah','pembelian pematangan tanah')),building:scaleMoney(get('investasi bangunan','bangunan gedung'))};
}
function scaleCalculate(d){
 if(!/^\d{4}-\d{2}-\d{2}/.test(d.date)||d.date.slice(0,10)<='2026-04-01')return 'Tidak dihitung: hanya permohonan setelah 1 April 2026.';
 if(!d.codes.length)return 'Tidak dihitung: KBLI belum terbaca.';
 const groups=[...new Set(d.codes.map(scaleSpecial))];if(groups.length!==1)return 'Tidak dihitung: terdapat beberapa KBLI dengan dasar perhitungan berbeda. Pilih proyek/KBLI yang sesuai secara manual.';
 // Permen Investasi/BKPM 5/2025 Ps. 25 ayat (6): 6 kegiatan (properti, akomodasi, pertanian, perkebunan, peternakan, perikanan budidaya)
 // memakai total investasi (tanah & bangunan ikut dihitung); KBLI lain memakai total investasi − tanah − bangunan.
 const special=groups[0];if(d.total===null||!special&&(d.land===null||d.building===null))return 'Tidak dihitung: rincian investasi belum lengkap. Isian kosong tidak dianggap nol.';
 const v=special?d.total:d.total-d.land-d.building;if(!Number.isFinite(v)||v<0)return 'Tidak dihitung: nilai investasi tidak valid/negatif.';
 const rp=n=>'Rp'+n.toLocaleString('id-ID',{maximumFractionDigits:2});
 return 'Skala usaha berdasarkan Kalkulator Skala Usaha: '+scaleClass(v)+'\nKBLI: '+d.codes.join(', ')+'\nDasar: '+(special?'Total investasi (KBLI properti/akomodasi/pertanian/perkebunan/peternakan/budidaya perikanan: tanah & bangunan ikut dihitung)':'Total investasi − investasi tanah − investasi bangunan')+'\nNilai: '+(special?'':rp(d.total)+' − '+rp(d.land)+' − '+rp(d.building)+' = ')+rp(v);
}
function scaleLookup(data){return new Promise((resolve,reject)=>{
 let settled=false;const nonce=crypto.randomUUID();const done=(v,err)=>{if(settled)return;settled=true;clearTimeout(timer);document.removeEventListener('INLINE_SCALE_RESPONSE',handler);err?reject(Error(err)):resolve(v);};
 const handler=e=>{let v;try{v=JSON.parse(e.detail);}catch{return;}if(v.nonce===nonce)done(v.result,v.error);};
 const timer=setTimeout(()=>done(null,'Database belum merespons. Pastikan script Data Lengkap dan Apps Script versi revisi aktif.'),50000);
 document.addEventListener('INLINE_SCALE_RESPONSE',handler);document.dispatchEvent(new CustomEvent('INLINE_SCALE_REQUEST',{detail:JSON.stringify({nonce,data})}));
});}
async function scaleSummary(company){
 const d=readScaleData();if(!d.company)d.company=company||'';
 try{const r=await scaleLookup(d);
  if(r.status==='found')return 'Skala usaha tercatat di Database Izin Air Tanah: '+r.scale+'\nPencocokan: '+r.match+' | KBLI: '+r.codes.join(', ')+' | Baris: '+r.rows.join(', ');
  if(r.status==='none')return 'Skala usaha tercatat di Database Izin Air Tanah: tidak ditemukan untuk identitas + KBLI yang cocok.\n'+(r.message?r.message+'\n':'')+scaleCalculate(d);
  return 'Skala usaha tercatat di Database Izin Air Tanah: perlu pemeriksaan manual.\n'+r.message;
 }catch(e){return 'Skala usaha belum dapat dicek: '+e.message+'\nPerhitungan cadangan tidak dijalankan karena pencarian database belum terkonfirmasi.';}
}

// ---------- Saran debit dan masa berlaku (R18) ----------
// Mengikuti slide "Evaluasi Permohonan Debit" dan "Masa Berlaku". Hasil hanya saran; evaluator tetap memutuskan.
// Penataan: ubah ke true saat aturan baru (PP 28/2025, paling lama 2 tahun) mulai diberlakukan.
const PENATAAN_ATURAN_BARU=false;
function adviceNumber(raw){
 const m=clean(raw).match(/\d[\d.,]*/);if(!m)return null;let t=m[0].replace(/[.,]$/,'');
 if(/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t))t=t.replace(/\./g,'').replace(',','.');
 else if(/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t))t=t.replace(/,/g,'');
 else t=t.replace(',','.');
 const n=Number(t);return Number.isFinite(n)?n:null;
}
// Masa berlaku Persetujuan Penggunaan Air Tanah (Permen ESDM 14/2024 dan 4/2026).
// Kebutuhan pokok ditebak dari kata pada Peruntukan; evaluator tetap memeriksa.
const SETUJU_TEKS={orang:'Selama pemegang Persetujuan Penggunaan Air Tanah masih hidup',kelompok:'Selama kelompok masyarakat masih ada dan masih menggunakan Air Tanah untuk memenuhi kebutuhan pokok sehari-hari'};
function setujuMasa(well){
 const p=clean(well?.peruntukan),tipe=detail('TIPE USER')||detail('Tipe User');
 const lain=/industri|usaha|komersi|pabrik|hotel|restoran|rumah\s*makan|kafe|cafe|perkantoran|kantor|niaga|toko|ruko|produksi|pertanian|perkebunan|peternakan|perikanan|tambak|cuci|laundry|spbu|rumah\s*sakit|klinik|puskesmas|sekolah|kampus|pendidikan|wisata|kolam\s*renang|olahraga|konstruksi|proyek|bengkel|gudang|apartemen|mall|pasar/i;
 const pokok=/kebutuhan\s+pokok|sehari|rumah\s*tangga|domestik|warga|perumahan|pemukiman|permukiman|penduduk|masyarakat|ibadah|masjid|mushol+a|musala|langgar|surau|gereja|pura|vihara|klenteng|pesantren|\bmck\b|air\s+(?:minum|bersih)/i;
 const kind=!p?'':lain.test(p)?'lain':pokok.test(p)?'pokok':'';
 const who=/kelompok/i.test(tipe)?'kelompok':/perorangan|perseorangan|individu|pribadi/i.test(tipe)?'orang':'';
 const dasar='Peruntukan "'+(p||'belum terbaca')+'"'+(tipe?', TIPE USER '+tipe:'');
 if(kind==='lain')return {masa:'paling lama 7 tahun',fill:'7 tahun',why:'selain pemenuhan kebutuhan pokok sehari-hari — '+dasar};
 if(kind==='pokok'&&who)return {masa:SETUJU_TEKS[who],fill:SETUJU_TEKS[who],why:'pemenuhan kebutuhan pokok sehari-hari ('+(who==='kelompok'?'kelompok masyarakat':'perseorangan')+') — '+dasar};
 return {masa:'belum dapat ditetapkan otomatis — pilih: (1) "'+SETUJU_TEKS.orang+'" (perseorangan, kebutuhan pokok); (2) "'+SETUJU_TEKS.kelompok+'" (kelompok masyarakat, kebutuhan pokok); (3) paling lama 7 tahun (selain kebutuhan pokok)',fill:null,why:dasar+(kind==='pokok'?' — kebutuhan pokok, tetapi TIPE USER bukan perseorangan/kelompok masyarakat':' — kebutuhan pokok atau bukan belum dapat dikenali')};
}
function adviceType(){
 const t=[detail('Jenis Izin'),detail('Jenis Permohonan')].filter(Boolean).join(' | ');
 const kind=/dewatering/i.test(t)?'dewatering':/persetujuan\s+penggunaan/i.test(t)?'persetujuan':'pengusahaan';
 const type=/penataan|keterlanjuran/i.test(t)?'Penataan':/perpanjangan/i.test(t)?'Perpanjangan':/perubahan/i.test(t)?'Perubahan':/\bbaru\b/i.test(t)?'Baru':'';
 return {text:t,kind,type};
}
function adviceZone(z){
 const u=clean(z).toUpperCase();
 if(/NON[\s-]*CAT/.test(u))return 'noncat';if(/IMBUHAN|PERLINDUNGAN/.test(u))return 'perlindungan';
 if(/RUSAK/.test(u))return 'rusak';if(/KRITIS/.test(u))return 'kritis';if(/RAWAN/.test(u))return 'rawan';if(/AMAN/.test(u))return 'aman';return '';
}
const fmt=n=>Number(n.toFixed(2)).toLocaleString('id-ID')+' m3/hari';
// R18: Sumur Pantau/Imbuhan tidak memakai saran debit; masa berlaku selama sumur masih berfungsi.
// Teks masa berlaku mengikuti jenis sumur (maks. 50 karakter pada form).
function imbuhanJenis(well){const p=String(well.peruntukan||'').toLowerCase(),n=String(well.name||'').toUpperCase();return /imbuhan/.test(p)?'imbuhan':/pantau/.test(p)?'pantau':/^SI\b/.test(n)?'imbuhan':/^SP\b/.test(n)?'pantau':'';}
const imbuhanMasa=well=>{const j=imbuhanJenis(well);return 'Selama sumur '+(j?j+' ':'')+'masih berfungsi dengan baik';};
function imbuhanAdvice(well){
 return ['SARAN EVALUASI (otomatis — periksa kembali sebelum diputuskan)','Jenis sumur: '+(well.peruntukan||'Sumur Pantau/Imbuhan'),
  'Saran masa berlaku: '+imbuhanMasa(well),'  Dasar: sumur pantau atau sumur imbuhan diberikan selama sumur masih berfungsi dengan baik (Permen ESDM 14/2024 dan 4/2026).',
  '  Catatan: Saran debit tidak berlaku untuk sumur pantau/imbuhan.'].join('\n');
}
let ADVICE=null;
function adviceSummary(region,well){
 ADVICE=null;
 const head='SARAN EVALUASI (otomatis — periksa kembali sebelum diputuskan)';
 const jenis=adviceType();
 const lines=[head,'Jenis permohonan: '+(jenis.kind==='persetujuan'?'Persetujuan Penggunaan Air Tanah':jenis.type||'belum dikenali')+(jenis.text?' ('+jenis.text+')':'')];
 if(jenis.kind==='dewatering'){lines.push('Saran masa berlaku: paling lama 1 tahun (kegiatan Dewatering).');return lines.join('\n');}
 let depth=region?.depth,area=region?.area,multi=null;
 // Titik masuk >1 poligon administrasi: saran tetap dihitung bila CAT, zona, dan debit optimumnya sama.
 if(region&&(!depth||!area)&&Array.isArray(region.options)&&region.options.length>1){
  const o=region.options,same=o.every(x=>x.area.cat===o[0].area.cat&&x.depth?.zone===o[0].depth?.zone&&x.depth?.debit===o[0].depth?.debit&&x.depth?.complete===o[0].depth?.complete);
  const list=o.map(x=>'Desa/Kelurahan '+x.area.desa+', Kec. '+x.area.kecamatan+', '+x.area.kabupaten+' (CAT '+x.area.cat+', Zona '+(x.depth?.zone||'?')+', Qopt '+(x.depth?.debit??'?')+')');
  if(!same){lines.push('Saran debit & masa berlaku belum dapat dihitung: titik sumur berada di '+o.length+' wilayah dengan CAT/zona/debit optimum berbeda:\n'+list.map(x=>'  • '+x).join('\n')+'\nPeriksa koordinat sumur di peta, lalu tetapkan wilayah secara manual.');return lines.join('\n');}
  depth=o[0].depth;area=o[0].area;multi=list;
 }
 if(region&&!('area' in region)){lines.push('Saran debit & masa berlaku memerlukan INLINE Data Wilayah Sumur versi 1.3.7. Perbarui script tersebut lalu refresh INLINE.');return lines.join('\n');}
 if(!depth||!area){lines.push('Saran debit & masa berlaku belum dapat dihitung: '+(region?.onBoundary?'titik sumur tepat berada di garis batas wilayah administrasi/CAT, sehingga wilayahnya belum dapat ditetapkan. Periksa koordinat sumur di peta.':region?'koordinat sumur tidak tercakup data wilayah/CAT (di luar data referensi atau koordinat tidak valid). Periksa koordinat sumur.':'data wilayah belum terbaca.'));return lines.join('\n');}
 if(multi)lines.push('Catatan wilayah: titik berada di '+multi.length+' wilayah administrasi dengan CAT, zona, dan debit optimum yang sama; saran memakai wilayah pertama, alamat perlu diperiksa.\n'+multi.map(x=>'  • '+x).join('\n'));
 if(!depth.zone||!Number.isFinite(depth.debit)){lines.push('Saran debit & masa berlaku belum dapat dihitung: zona/debit optimum belum ditetapkan (lihat PERLU DIPERIKSA).');return lines.join('\n');}
 const pending=depth.complete?'':' (sementara; ada catatan PERLU DIPERIKSA)';
 const zone=adviceZone(depth.zone),ranges=depth.ranges||[];
 const free=ranges.some(r=>r.lo<40),shallow=ranges.length&&ranges.every(r=>r.hi<=40);
 const rencana=adviceNumber(well?.rencana);
 // Debit
 const caps=[{v:depth.debit,why:'debit optimum peta zona konservasi ('+depth.zone+')'}];
 const notes=[];
 if(zone==='perlindungan')caps.push({v:25,why:'Zona Perlindungan maksimum 25 m3/hari'});
 if(zone==='aman'&&jenis.type==='Baru')caps.push({v:100,why:'permohonan Baru di Zona Aman maksimum 100 m3/hari'});
 if(zone==='kritis')caps.push({v:10,why:'Zona Kritis maksimum 10 m3/hari'});
 if(zone==='rusak')caps.push({v:10,why:'Zona Rusak: perpanjangan maksimum 10 m3/hari'});
 if(zone==='noncat'){caps.push({v:50,why:'Non-CAT 50 m3/hari'});notes.push('Non-CAT: debit dapat diubah setelah dilakukan uji pemompaan.');}
 if(/bangka\s*belitung|kepulauan\s+riau/i.test(area.provinsi)){caps.push({v:50,why:'Daerah khusus ('+area.provinsi+') maksimum 50 m3/hari'});notes.push('Daerah khusus: debit dapat diubah setelah uji pemompaan.');}
 if(/cilacap/i.test(area.kabupaten))notes.push('Kabupaten Cilacap: jika termasuk Cilacap Pesisir, debit maksimum 50 m3/hari (periksa manual).');
 if(free){caps.push({v:10,why:'screen menyadap akuifer tidak tertekan (<40 m) maksimum 10 m3/hari'});notes.push('Pengecualian batas 10 m3/hari akuifer tidak tertekan: potensi air tanah >40 m sangat kecil/langka, kualitas >40 m payau/asin/tercemar, atau pemanfaatan langsung panas bumi.');}
 if(['aman','rawan','perlindungan'].includes(zone))notes.push('Jika hasil uji pemompaan menunjukkan Qopt lebih besar, Qopt dapat digunakan sebagai dasar pemberian debit.');
 notes.push('Akumulasi dalam luasan 1 x 1 km maksimum 20 m3/hari per entitas belum dihitung otomatis.');
 const limit=Math.min(...caps.map(c=>c.v));
 const basis=caps.filter(c=>c.v===limit).map(c=>c.why);
 let saran;
 if(zone==='rusak'&&jenis.type==='Baru'){lines.push('Saran debit: TIDAK DIBERIKAN — izin baru di Zona Rusak ditolak.');}
 else{
  saran=rencana===null?limit:Math.min(rencana,limit);
  lines.push('Saran debit'+pending+': '+fmt(saran));
  lines.push('  Batas maksimum: '+fmt(limit)+' — '+basis.join('; '));
  if(zone==='aman'&&depth.debit>0)lines.push('  Q SIPA : Qopt = '+Math.round(saran/depth.debit*100)+'% ('+fmt(saran)+' : '+fmt(depth.debit)+', Zona '+depth.zone+(area.cat?', CAT '+area.cat:'')+')');
  lines.push('  Debit rencana pemohon: '+(rencana===null?'belum terbaca'+(well?.rencana?' ("'+well.rencana+'")':''):fmt(rencana)+(rencana>limit?' → dibatasi ke batas maksimum':' → tidak melebihi batas, mengikuti rencana')));
 }
 notes.forEach(n=>lines.push('  Catatan: '+n));
 // Masa berlaku
 let masa,masaWhy='';
 let setujuFill=null;
 if(jenis.kind==='persetujuan'){const sm=setujuMasa(well);masa=sm.masa;masaWhy=sm.why+' (Permen ESDM 14/2024 dan 4/2026; periksa kembali)';setujuFill=sm.fill;}
 else if(jenis.type==='Perubahan'){masa='melanjutkan masa berlaku SIPA yang sudah terbit';}
 else if(jenis.type==='Penataan'){
  if(PENATAAN_ATURAN_BARU){masa='paling lama 2 tahun'+(zone==='rusak'?', tanpa perpanjangan (Zona Rusak)':', dapat diperpanjang');masaWhy='keterlanjuran (PP 28/2025)';}
  else{masa='paling lama 5 tahun';masaWhy='keterlanjuran, masih mengikuti Permen ESDM 14/2024 (aturan baru 2 tahun belum diberlakukan)';}
 }
 else if(zone==='rusak'&&jenis.type==='Baru'){masa='tidak diberikan — izin baru di Zona Rusak ditolak';}
 else if(shallow){masa='paling lama 3 tahun';masaWhy='sumur bor dangkal/gali yang menyadap akuifer bebas (<40 m)';}
 else{
  const d=saran??limit,ratio=Number.isFinite(depth.debit)&&depth.debit>0?d/depth.debit:null,pct=ratio===null?'':' (Q SIPA/Qopt = '+Math.round(ratio*100)+'%)';
  if(zone==='perlindungan'){masa='paling lama 3 tahun';masaWhy='Zona Perlindungan/Imbuhan';}
  else if(zone==='aman'){
   // Jenis izin -> kelas debit (Q SIPA) -> rasio Q SIPA/Qopt -> masa berlaku. Syarat rasio tidak terpenuhi: paling lama 4 tahun.
   const q=fmt(d),r=ratio===null?'?':Math.round(ratio*100)+'%',chain=(cls,cond)=>(jenis.type||'Baru/Perpanjangan')+' → Q SIPA '+q+' ('+cls+') → Q SIPA/Qopt '+r+(cond?' ('+cond+')':'');
   if(d<100){masa='paling lama 7 tahun';masaWhy=chain('<100 m3/hari');}
   else if(d<=500){const ok=ratio!==null&&ratio<0.5;masa=ok?'paling lama 5 tahun':'paling lama 4 tahun';masaWhy=chain('100–500 m3/hari',ok?'<50%, syarat terpenuhi':'≥50%, syarat <50% tidak terpenuhi');}
   else{masa='paling lama 3 tahun';masaWhy=chain('>500 m3/hari');}
  }
  else if(zone==='rawan'){masa=d<=100?'paling lama 5 tahun':'paling lama 3 tahun';masaWhy='Zona Rawan, debit '+(d<=100?'≤100':'>100')+' m3/hari';}
  else if(zone==='kritis')masa='paling lama 4 tahun';
  else if(zone==='rusak')masa='paling lama 3 tahun (khusus perpanjangan)';
  else if(zone==='noncat')masa='paling lama 3 tahun';
  else masa='belum dapat ditetapkan: jenis zona "'+depth.zone+'" tidak dikenali';
  if(!masaWhy&&zone)masaWhy='Zona '+depth.zone+' (PP 28/2025, Permen ESDM 7/2026)';
  if(!jenis.type)masaWhy+=(masaWhy?'; ':'')+'jenis permohonan belum dikenali, dihitung sebagai Baru/Perpanjangan';
  if(free&&!shallow)masaWhy+=(masaWhy?'; ':'')+'sebagian screen di akuifer bebas — sumur bor dangkal/gali paling lama 3 tahun';
 }
 lines.push('Saran masa berlaku'+pending+': '+masa+(masaWhy?'\n  Dasar: '+masaWhy:''));
 const years=String(masa).match(/^paling lama (\d+) tahun/);
 ADVICE={debit:saran??null,years:years?Number(years[1]):null,complete:!!depth.complete,area,multi:!!multi,setujuFill};
 return lines.join('\n');
}

// Pecah ringkasan wilayah menjadi bagian per judul "Pengecekan ...:".
function regionSections(summary){
 const out=[];let cur=null;
 for(const line of String(summary||'').split('\n')){
  const m=line.match(/^Pengecekan (.+):$/);
  if(m){const t=m[1].replace(/^cat dan zona konservasi$/i,'CAT dan zona konservasi');cur={title:t.charAt(0).toUpperCase()+t.slice(1),lines:[]};out.push(cur);continue;}
  if(!cur){cur={title:'Wilayah',lines:[]};out.push(cur);}
  cur.lines.push(line);
 }
 return out;
}

// ---------- Jendela hasil Cek Lokasi Sumur (R18; tampilan AIRA R20) ----------
const AIRA_LOGO='data:image/png;base64,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';
function showReport(sections,plain,fill){
 document.getElementById('inline-cek-sumur-host')?.remove();
 const host=document.createElement('div');host.id='inline-cek-sumur-host';
 const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>
 :host{all:initial}
 *{box-sizing:border-box}
 .back{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;font:14px/1.5 "Segoe UI",Arial,sans-serif;color:#1d2939;animation:fade .2s ease-out}
 .win{background:#fff;border-radius:18px;box-shadow:0 24px 64px rgba(16,24,40,.35);width:min(780px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden;animation:pop .26s cubic-bezier(.2,.9,.3,1.2);border:1px solid rgba(17,17,17,.12)}
 .closing .back,.back.closing{animation:fadeout .18s ease-in forwards}.back.closing .win{animation:popout .18s ease-in forwards}
 @keyframes fade{from{opacity:0}to{opacity:1}}@keyframes fadeout{to{opacity:0}}
 @keyframes pop{from{transform:translateY(10px) scale(.96);opacity:0}to{transform:none;opacity:1}}
 @keyframes popout{to{transform:translateY(6px) scale(.97);opacity:0}}
 @keyframes rise{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
 header{background:#f5e62a;color:#111;padding:16px 20px;display:flex;align-items:center;gap:14px;border-bottom:1px solid rgba(17,17,17,.12)}
 header .logo{height:84px;width:auto;flex:none;object-fit:contain}
 header h2{margin:0;font:800 17px "Segoe UI",Arial,sans-serif;color:#111;letter-spacing:.01em}
 header .brand{font:700 11px "Segoe UI",Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#6b6413}
 header .sub{font-size:12px;color:#3d3a12;margin-top:2px}
 header .who{font:700 14px "Segoe UI",Arial,sans-serif;margin-top:4px;color:#111}
 header .meta{font-size:12.5px;margin-top:1px;color:#3d3a12}
 .x{all:unset;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-size:22px;line-height:1;color:#111;cursor:pointer;transition:background .15s,transform .15s}
 .x:hover{background:rgba(17,17,17,.1);transform:rotate(90deg)}
 main{overflow:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;background:#fffdf0}
 section{border:1px solid #eee7a0;border-radius:14px;overflow:hidden;flex-shrink:0;background:#fff;animation:rise .3s cubic-bezier(.2,.9,.3,1) both}
 section:nth-child(2){animation-delay:.04s}section:nth-child(3){animation-delay:.08s}section:nth-child(4){animation-delay:.12s}section:nth-child(5){animation-delay:.16s}section:nth-child(n+6){animation-delay:.2s}
 section h3{margin:0;padding:9px 14px;background:#fffbd1;font:800 11.5px "Segoe UI",Arial,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#6b6413;border-bottom:1px solid #f3eeb8}
 .body{padding:11px 14px}
 .line{white-space:pre-wrap;word-break:break-word}
 .warn{color:#b42318;font-weight:700}
 .muted{color:#667085;font-size:12.5px}
 .badge{display:inline-block;padding:5px 12px;border-radius:999px;font-weight:700}
 .ok{background:#ecfdf3;color:#067647}.mid{background:#fffaeb;color:#93370d}.bad{background:#fef3f2;color:#b42318}
 .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:8px}
 .card{border:1px solid #e3d64a;border-radius:14px;padding:12px 14px;background:linear-gradient(180deg,#fffbd1,#fff);transition:transform .18s cubic-bezier(.2,.9,.3,1.3),box-shadow .18s}
 .card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(17,17,17,.08)}
 .card .k{font-size:11.5px;color:#6b6413;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
 .card .v{font-size:21px;font-weight:800;margin-top:2px;color:#111}
 .card.no{border-color:#fecdca;background:linear-gradient(180deg,#fef3f2,#fff)}.card.no .k{color:#b42318}
 .detail{padding-left:12px;border-left:3px solid #eee7a0;margin:3px 0}
 .advhead{font-size:12px;color:#93370d;margin-bottom:8px}
 footer{border-top:1px solid #eee7a0;padding:12px 20px;display:flex;gap:8px;justify-content:flex-end;align-items:center;background:#fff}
 footer span{flex:1;font-size:12px;color:#067647}
 button.b{position:relative;overflow:hidden;border:1px solid #d0d5dd;border-radius:10px;padding:9px 18px;font:600 13.5px "Segoe UI",Arial,sans-serif;cursor:pointer;background:#fff;color:#1d2939;transition:transform .16s cubic-bezier(.2,.9,.3,1.3),box-shadow .18s,background .18s,border-color .18s}
 button.b:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(17,17,17,.12)}
 button.b:active:not(:disabled){transform:scale(.97);box-shadow:0 1px 3px rgba(17,17,17,.12);transition-duration:.08s}
 button.b:focus-visible{outline:2px solid #111;outline-offset:2px}
 .copy{background:#fff;color:#1d2939}.close{background:#fff;color:#1d2939}
 button.b.fill{background:#f5e62a;border-color:#e3d64a;color:#111;font-weight:800}button.b.fill:hover:not(:disabled){background:#ffe94d}
 button.b.fill:disabled{background:#f2f4f7;border-color:#eaecf0;color:#98a2b3;cursor:not-allowed}
 .ripple{position:absolute;border-radius:50%;pointer-events:none;background:rgba(17,17,17,.12);transform:scale(0);animation:ripple .55s ease-out forwards}
 .fill .ripple{background:rgba(255,255,255,.55)}
 @keyframes ripple{to{transform:scale(1);opacity:0}}
 .confirm{display:none;overflow:auto;padding:16px 20px;background:#fffdf0;animation:rise .25s cubic-bezier(.2,.9,.3,1)}
 .ask{background:#fffbd1;border:1px solid #e3d64a;border-radius:14px;padding:12px 14px;margin-bottom:12px;color:#3d3a12}
 .ask strong{display:block;font-size:16px;margin-bottom:4px;color:#111}
 table{border-collapse:separate;border-spacing:0;width:100%;font-size:13px;table-layout:fixed;background:#fff;border:1px solid #eee7a0;border-radius:12px;overflow:hidden}
 td{word-break:break-word}
 th,td{border-bottom:1px solid #f3eeb8;padding:8px 10px;text-align:left;vertical-align:top}
 tr:last-child td{border-bottom:0}
 th{background:#fffbd1;font-size:11.5px;color:#6b6413;text-transform:uppercase;letter-spacing:.05em}
 td.new{background:#fffdf0;font-weight:700}
 .st-done{color:#067647;font-weight:700;animation:rise .25s ease-out}.st-fail,.st-skip{color:#b42318;font-weight:700}
 .warnbox{color:#b42318;margin:0 0 10px;padding-left:18px}
 .edit{width:100%;border:1px solid #d0d5dd;border-radius:8px;padding:7px 9px;font:600 13px/1.4 "Segoe UI",Arial,sans-serif;color:#1d2939;background:#fff;transition:border-color .15s,box-shadow .15s}
 .edit:focus{outline:0;border-color:#b8a90f;box-shadow:0 0 0 3px rgba(245,230,42,.5)}
 .edit.bad{border-color:#b42318;box-shadow:0 0 0 3px rgba(180,35,24,.15);animation:shake .3s}
 @keyframes shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
 textarea.edit{min-height:110px;resize:vertical;overflow:hidden}
 .hint{font-size:11.5px;color:#667085;margin-top:3px;font-weight:normal}
 @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
 </style>
 <div class="back"><div class="win" role="dialog" aria-modal="true" aria-label="Hasil Cek Lokasi Sumur">
 <header><img class="logo" alt="Kementerian ESDM" src="${AIRA_LOGO}"><div style="flex:1"><div class="brand">AIRA</div><h2>Hasil Cek Lokasi Sumur</h2><div class="who"></div><div class="meta"></div><div class="sub"></div></div><button class="x" title="Tutup">×</button></header>
 <main></main>
 <div class="confirm"></div>
 <footer><span></span><button class="b fill">Isi Otomatis</button><button class="b copy">Salin semua</button><button class="b close">Tutup</button></footer>
 </div></div>`;
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
 const main=root.querySelector('main');
 root.querySelector('.sub').textContent=sections.subtitle||'';
 root.querySelector('.who').textContent=sections.who||'';
 root.querySelector('.meta').textContent=sections.meta||'';
 for(const k of ['who','meta'])if(!sections[k])root.querySelector('.'+k).remove();
 for(const sec of sections.items){
  const box=el('section');box.append(el('h3',null,sec.title));const body=el('div','body');box.append(body);
  if(sec.badge){body.append(el('span','badge '+sec.badge.tone,sec.badge.text));}
  else if(sec.advice){
   const cards=el('div','cards');body.append(el('div','advhead',sec.advice.head));
   let cur=null;
   for(const line of sec.advice.lines){
    const m=line.match(/^(Saran debit|Saran masa berlaku)([^:]*):\s*(.*)$/);
    if(m){if(!cards.isConnected)body.append(cards);const no=/TIDAK DIBERIKAN|tidak diberikan|belum dapat/i.test(m[3]);const c=el('div','card'+(no?' no':''));c.append(el('div','k',m[1]+m[2]),el('div','v',m[3].replace(/^paling lama /,'maks. ')));cards.append(c);cur=c;continue;}
    if(/^\s+/.test(line)&&cur){cur.append(el('div','detail '+(/Catatan:/.test(line)?'muted':'line'),line.trim()));continue;}
    body.append(el('div','line',line));
   }
  }
  else for(const line of sec.lines){if(!clean(line))continue;body.append(el('div','line'+(/PERLU DIPERIKSA|belum dapat|tidak tersedia|gagal/i.test(line)?' warn':''),line));}
  main.append(box);
 }
 let closing=false;
 const close=()=>{if(closing)return;closing=true;document.removeEventListener('keydown',esc,true);
  let reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{}
  if(reduce)return host.remove();root.querySelector('.back').classList.add('closing');setTimeout(()=>host.remove(),190);};
 root.addEventListener('pointerdown',e=>{const b=e.target.closest('button.b');if(!b||b.disabled)return;
  const r=b.getBoundingClientRect(),size=Math.max(r.width,r.height)*2.2,s=document.createElement('span');s.className='ripple';
  s.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-r.left-size/2)+'px;top:'+(e.clientY-r.top-size/2)+'px';b.append(s);setTimeout(()=>s.remove(),600);});
 const esc=e=>{if(e.key==='Escape'){e.stopPropagation();close();}};
 document.addEventListener('keydown',esc,true);
 root.querySelector('.x').onclick=close;root.querySelector('.close').onclick=close;
 root.querySelector('.back').addEventListener('click',e=>{if(e.target.classList.contains('back'))close();});
 root.querySelector('.copy').onclick=async()=>{
  const msg=root.querySelector('footer span');
  try{await navigator.clipboard.writeText(plain);msg.textContent='Tersalin ke clipboard.';}
  catch{const t=document.createElement('textarea');t.value=plain;document.body.append(t);t.select();document.execCommand('copy');t.remove();msg.textContent='Tersalin ke clipboard.';}
 };

 // Isi Otomatis: pratinjau -> konfirmasi "Cek kembali" / "Lanjut" -> isi formulir evaluator.
 const fillBtn=root.querySelector('.fill'),confirmBox=root.querySelector('.confirm'),foot=root.querySelector('footer span');
 const showMain=()=>{confirmBox.style.display='none';main.style.display='flex';root.querySelector('.copy').style.display='';fillBtn.style.display='';};
 if(!fill||fill.blocked){fillBtn.disabled=true;fillBtn.title=fill?.blocked||'Isi otomatis tidak tersedia.';}
 const table=(rows,done)=>{
  const t=el('table');const cg=el('colgroup');for(const w of ['24%','26%','50%']){const c=el('col');c.style.width=w;cg.append(c);}t.append(cg);const h=el('tr');['Isian evaluator','Isian sekarang',done?'Hasil':'Akan diisi'].forEach(x=>h.append(el('th',null,x)));t.append(h);
  for(const r of rows){const tr=el('tr');tr.append(el('td',null,r.label),el('td',null,r.current||'—'));
   const c=el('td',r.status==='plan'||r.status==='done'?'new':null);
   if(r.status==='skip'||r.status==='fail')c.append(el('span','st-'+r.status,(r.status==='fail'?'Gagal: ':'Dilewati: ')+r.note));
   else if(!done&&r.editable){const multi=/alamat/i.test(r.label);const inp=el(multi?'textarea':'input','edit');if(!multi)inp.type='text';inp.value=r.value;inp.dataset.label=r.label;inp.spellcheck=false;const grow=()=>{if(multi){inp.style.height='auto';inp.style.height=Math.max(110,inp.scrollHeight+2)+'px';}};inp.addEventListener('input',()=>{inp.classList.remove('bad');grow();});requestAnimationFrame(grow);c.append(inp,el('div','hint',/jumlah|debit/i.test(r.label)?'Dapat diedit; angka m3/hari (koma untuk desimal).':'Dapat diedit sebelum diisi.'));if(r.note)c.append(el('div','muted',r.note));}
   else{c.append(el('div',null,r.value));if(r.status==='done')c.append(el('div','st-done','✓ terisi'+(r.edited?' (diedit)':'')));if(r.note)c.append(el('div','muted',r.note));}
   tr.append(c);t.append(tr);}
  return t;
 };
 fillBtn.onclick=async()=>{
  fillBtn.disabled=true;foot.textContent='Membaca isian evaluator…';
  try{
   const rows=await fill.preview();
   main.style.display='none';confirmBox.style.display='block';confirmBox.textContent='';
   root.querySelector('.copy').style.display='none';fillBtn.style.display='none';foot.textContent='';
   const ask=el('div','ask');ask.append(el('strong',null,'Apakah Anda yakin?'),el('div',null,'Pastikan hasil cek sudah diperiksa kembali. Isian di bawah akan ditimpa dan ditandai kuning; formulir belum disimpan.'));
   confirmBox.append(ask);
   if(fill.warnings?.length){const w=el('ul','warnbox');fill.warnings.forEach(x=>w.append(el('li',null,x)));confirmBox.append(w);}
   confirmBox.append(table(rows,false));
   const bar=el('div');bar.style.cssText='display:flex;gap:8px;justify-content:flex-end;margin-top:12px';
   const back=el('button','b close','Cek kembali'),go=el('button','b fill','Lanjut');bar.append(back,go);confirmBox.append(bar);
   back.onclick=()=>{showMain();fillBtn.disabled=false;};
   go.onclick=async()=>{
    // Ambil nilai yang diedit; debit wajib angka positif.
    const overrides={};let bad=null;
    for(const inp of confirmBox.querySelectorAll('.edit')){
     const v=clean(inp.value);inp.classList.remove('bad');
     if(/alamat|masa berlaku/i.test(inp.dataset.label)){if(!v){bad=inp;break;}overrides[inp.dataset.label]=v;continue;}
     if(!/^\d+(?:[.,]\d+)?$/.test(v)||Number(v.replace(',','.'))<=0){bad=inp;break;}
     overrides[inp.dataset.label]=v.replace('.',',');
    }
    if(bad){bad.classList.add('bad');bad.focus();foot.textContent='';AIRA_MODAL.alert(/alamat|masa berlaku/i.test(bad.dataset.label)?bad.dataset.label+' tidak boleh kosong.':'Debit harus angka lebih dari 0, tanpa satuan (contoh: 75 atau 12,5).',{title:'Periksa isian',tone:'warn',source:'Isi Otomatis'});return;}
    go.disabled=true;back.disabled=true;go.textContent='Mengisi…';
    try{
     const res=await fill.apply(overrides);confirmBox.textContent='';
     const ok=res.filter(r=>r.status==='done').length,bad=res.filter(r=>r.status!=='done').length;
     const done=el('div','ask');done.style.background=bad?'#fff4d6':'#e3f6e8';done.style.borderColor=bad?'#eadca7':'#b7e2c3';if(!bad)done.style.color='#14692e';
     done.append(el('strong',null,ok+' isian terisi'+(bad?', '+bad+' perlu diisi manual':'')),el('div',null,'Rapikan Alamat Lokasi Sumur, periksa kembali isian yang ditandai kuning, lalu simpan formulir seperti biasa.'));
     confirmBox.append(done,table(res,true));
     const bar2=el('div');bar2.style.cssText='display:flex;gap:8px;justify-content:flex-end;margin-top:12px';
     const back2=el('button','b close','Kembali ke hasil cek');bar2.append(back2);confirmBox.append(bar2);back2.onclick=()=>{showMain();fillBtn.disabled=false;};
    }catch(err){go.disabled=false;back.disabled=false;go.textContent='Lanjut';foot.textContent='';AIRA_MODAL.error(err.message,{title:'Isi otomatis gagal',source:'Isi Otomatis'});}
   };
  }catch(err){foot.textContent='';fillBtn.disabled=false;AIRA_MODAL.error(err.message,{title:'Isi otomatis gagal',source:'Isi Otomatis'});}
 };
 document.body.append(host);root.querySelector('.copy').focus();
}

const check=document.createElement('button');check.type='button';check.textContent='Cek Lokasi Sumur';
check.style.cssText='position:fixed;right:25px;bottom:270px;z-index:99999;background:#a65e0a;color:white;padding:14px;border:0;border-radius:8px;cursor:pointer';
document.body.append(check);
check.onclick=async()=>{
 check.disabled=true;check.textContent='Mengecek lokasi…';
 try{
  let rows=[],projectError="";try{rows=await locations();}catch(e){projectError=e.message;}
  let well=readWell(document);
  if(!well){
   const results=(await Promise.all([...document.querySelectorAll('iframe[src]')].map(f=>readFrame(f,true)))).filter(Boolean);
   if(results.length>1)throw Error('Beberapa formulir evaluator terbaca. Buka satu permohonan saja.');
   well=results[0];
  }
  const point=wellPoint(well);
  const [region,scale]=await Promise.all([regionLookup(point,false,well.screen),well.imbuhan?Promise.resolve('Skala usaha: tidak diperlukan untuk Persetujuan Penggunaan Sumur Pantau/Imbuhan.'):well.setuju?Promise.resolve('Skala usaha: tidak diperlukan untuk Persetujuan Penggunaan Air Tanah.'):scaleSummary(well.company)]);
  const missingProject=rows.length>0&&rows.every(r=>noProjectData(r.raw));
  let results=[];try{results=rows.filter(r=>!noProjectData(r.raw)).map((r,i)=>({name:r.id&&r.id!=='-'?r.id:'Lokasi '+(i+1),status:pointInPolygon(point,polygonPoints(r.raw))}));}catch(e){projectError=e.message;}
  const overall=projectError?'Lokasi proyek belum dapat dicek: '+projectError:missingProject?'Tidak ada data lokasi usaha pada OSS':results.some(r=>r.status==='inside')?'Lokasi sumur berada di dalam data lokasi proyek usaha':results.some(r=>r.status==='boundary')?'Lokasi sumur berada di batas data lokasi proyek usaha':'Lokasi sumur berada di luar data lokasi proyek usaha';
  const overallShown=well.imbuhan?'Lokasi proyek OSS tidak berlaku untuk Persetujuan Sumur Pantau/Imbuhan':well.setuju?'Lokasi proyek OSS tidak berlaku untuk Persetujuan Penggunaan Air Tanah':overall;
  const advice=well.imbuhan?imbuhanAdvice(well):adviceSummary(region,well);
  // Identitas permohonan untuk judul jendela. Persetujuan Penggunaan tidak menampilkan ID Izin OSS.
  const jenisText=detail('Jenis Izin')||detail('Jenis Permohonan');
  const persetujuan=/persetujuan/i.test(jenisText);
  let pemohon='';try{pemohon=readScaleData().company;}catch{}
  pemohon=pemohon||well.company||'';
  const meta=[jenisText,detail('Nomor Tracking'),!persetujuan&&detail('ID Izin (OSS)')].filter(Boolean).join(' · ');
  const identity=[pemohon,meta].filter(Boolean).join('\n');
  const plain=(identity?identity+'\n':'')+'Sumur: '+(well.name||'—')+' | Bujur: '+point[0]+' | Lintang: '+point[1]+'\n'+overallShown+'\n'+region.summary+'\n\n'+scale+'\n\n'+advice;
  const tone=well.imbuhan||well.setuju?'mid':/di dalam/.test(overall)?'ok':/di batas|Tidak ada data/.test(overall)?'mid':'bad';
  const [advHead,...advLines]=advice.split('\n');
  let fill={blocked:'Saran debit belum dapat dihitung; isi otomatis tidak tersedia.'};
  if(well.imbuhan){const plan={fields:[['MASA_BERLAKU','Masa Berlaku',imbuhanMasa(well)]],admin:[],editable:['MASA_BERLAKU'],noAddress:true};fill={plan,warnings:[],preview:()=>fillFrame(plan,false),apply:overrides=>fillFrame({...plan,overrides:overrides||{}},true)};}
  else if(well.setuju&&ADVICE&&ADVICE.debit!=null&&ADVICE.complete&&ADVICE.area){
   const fields=[[SETUJU_DEBIT,'Jumlah Maksimum Debit Air Tanah yang Diperbolehkan (m3/hari)',String(Number(ADVICE.debit.toFixed(2))).replace('.',',')]];
   const warnings=[];
   if(ADVICE.setujuFill)fields.push(['MASA_BERLAKU','Masa Berlaku',ADVICE.setujuFill]);else warnings.push('Masa berlaku tidak diisi otomatis: kebutuhan pokok/tipe pemohon belum dapat dikenali. Isi manual.');
   warnings.push('Masa berlaku persetujuan ditebak dari kolom Peruntukan dan TIPE USER; pastikan sesuai.');
   if(ADVICE.multi)warnings.push('Titik berada di lebih dari satu wilayah administrasi; periksa kembali.');
   const plan={fields,admin:[],editable:[SETUJU_DEBIT,'MASA_BERLAKU'],noAddress:true};
   fill={plan,warnings,preview:()=>fillFrame(plan,false),apply:overrides=>fillFrame({...plan,overrides:overrides||{}},true)};
  }
  else if(ADVICE&&ADVICE.debit!=null&&ADVICE.complete&&ADVICE.area){
   const ar=ADVICE.area,kab=/^(Kabupaten|Kota)\b/i.test(ar.kabupaten)?ar.kabupaten:'Kabupaten/Kota '+ar.kabupaten;
   const skala=(scale.match(/Database Izin Air Tanah:\s*(Mikro|Kecil|Menengah|Besar)\b/i)||scale.match(/Kalkulator Skala Usaha:\s*(Mikro|Kecil|Menengah|Besar)\b/i)||[])[1];
   const fields=[['JUMLAH_MAKSIMUM_PENGAMBILAN_AIR_TANAH','Debit Hasil Evaluasi (m3/hari)',String(Number(ADVICE.debit.toFixed(2))).replace('.',',')]];
   fields.push(['VOLUME_HARIAN','Volume Harian (m3/hari)',fields[0][2]]);
   if(ADVICE.years)fields.push(['MASA_BERLAKU','Masa Berlaku (tahun)',ADVICE.years]);
   if(skala)fields.push(['SKALA_USAHA','Skala Usaha',skala]);
   const plan={fields,admin:[['Desa/Kelurahan',ar.desa,'Desa/Kelurahan '+ar.desa],['Kecamatan',ar.kecamatan,'Kecamatan '+ar.kecamatan],['Kabupaten/Kota',ar.kabupaten,kab],['Provinsi',ar.provinsi,'Provinsi '+ar.provinsi]]};
   const warnings=[];
   if(!/di dalam/.test(overall))warnings.push(overall.replace(/\.*$/,'.'));
   if(ADVICE.multi)warnings.push('Titik berada di lebih dari satu wilayah administrasi; alamat memakai wilayah pertama, periksa kembali.');
   if(!ADVICE.years)warnings.push('Masa berlaku tidak diisi otomatis (saran bukan angka tahun).');
   if(!skala)warnings.push('Skala usaha tidak diisi otomatis (belum terbaca dari hasil cek).');
   fill={plan,warnings,preview:()=>fillFrame(plan,false),apply:overrides=>fillFrame({...plan,overrides:overrides||{}},true)};
  }
  showReport({who:pemohon,meta,subtitle:'Sumur '+(well.name||'—')+' · Bujur '+point[0]+' · Lintang '+point[1],items:[
   {title:'Lokasi proyek (OSS)',badge:{tone,text:overallShown}},
   ...regionSections(region.summary),
   {title:'Skala usaha',lines:scale.split('\n')},
   {title:'Saran evaluasi',advice:{head:advHead.replace(/^SARAN EVALUASI\s*/,'').replace(/^\(|\)$/g,''),lines:advLines}}
  ]},plain,fill);
 }catch(e){await AIRA_MODAL.error(e.message,{source:'Cek Lokasi Sumur'});}finally{check.disabled=false;check.textContent='Cek Lokasi Sumur';}
};
const button=document.createElement('button');button.type='button';button.textContent='Unduh KML Lokasi Proyek';
button.style.cssText='position:fixed;right:25px;bottom:210px;z-index:99999;background:#7c3e98;color:white;padding:14px;border:0;border-radius:8px;cursor:pointer';
document.body.append(button);
button.onclick=async()=>{
 button.disabled=true;button.textContent='Membuat KML…';
 try{
  const rows=(await locations()).filter(r=>!noProjectData(r.raw));
  if(!rows.length){await AIRA_MODAL.alert('Permohonan ini tidak memiliki data lokasi usaha di OSS, sehingga file KML tidak dapat dibuat.',{title:'Data lokasi OSS tidak tersedia',tone:'warn',source:'Unduh KML Lokasi Proyek'});return;}
  const id=detail('ID Izin (OSS)'),tracking=detail('Nomor Tracking');
  let identity=readWell(document);
  if(!identity){
   const identities=(await Promise.all([...document.querySelectorAll('iframe[src]')].map(f=>readFrame(f,true)))).filter(Boolean);
   if(identities.length>1)throw Error('Beberapa formulir terbaca. Buka satu permohonan saja.');
   identity=identities[0];
  }
  if(!id||!tracking||!identity?.company||!identity?.name)throw Error('Nama file belum lengkap. Buka formulir data teknis agar ID Izin OSS, tracking, nama perusahaan, dan nomor sumur dapat dibaca.');
  const title=['Batas Lokasi Proyek',id,tracking,identity.company+' '+identity.name].join(' - ');
  const text=makeKML(rows,title);
  const filename=title.replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').replace(/\s+/g,' ').trim().slice(0,180)+'.kml';
  const url=URL.createObjectURL(new Blob([text],{type:'application/vnd.google-earth.kml+xml;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch(e){await AIRA_MODAL.error(e.message,{source:'Unduh KML Lokasi Proyek'});}finally{button.disabled=false;button.textContent='Unduh KML Lokasi Proyek';}
};
})();
