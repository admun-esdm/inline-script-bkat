// ==UserScript==
// @name         INLINE Unduh KML Lokasi Proyek
// @namespace    inline-rekan
// @version      1.31
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
 const special=groups[0];if(d.total===null||special&&(d.land===null||d.building===null))return 'Tidak dihitung: rincian investasi belum lengkap. Isian kosong tidak dianggap nol.';
 const v=special?d.total-d.land-d.building:d.total;if(!Number.isFinite(v)||v<0)return 'Tidak dihitung: nilai investasi tidak valid/negatif.';
 const rp=n=>'Rp'+n.toLocaleString('id-ID',{maximumFractionDigits:2});
 return 'Skala usaha berdasarkan Kalkulator Skala Usaha: '+scaleClass(v)+'\nKBLI: '+d.codes.join(', ')+'\nDasar: '+(special?'Total investasi − investasi tanah − investasi bangunan':'Total investasi')+'\nNilai: '+(special?rp(d.total)+' − '+rp(d.land)+' − '+rp(d.building)+' = ':'')+rp(v);
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

// ---------- Jendela hasil Cek Lokasi Sumur (R18) ----------
function showReport(sections,plain,fill){
 document.getElementById('inline-cek-sumur-host')?.remove();
 const host=document.createElement('div');host.id='inline-cek-sumur-host';
 const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>
 :host{all:initial}
 .back{position:fixed;inset:0;background:#0f172a80;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;font:14px/1.5 Arial,sans-serif;color:#1f2933}
 .win{background:#fff;border-radius:12px;box-shadow:0 12px 40px #0006;width:min(760px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden}
 header{background:#a65e0a;color:#fff;padding:14px 18px;display:flex;align-items:center;gap:12px}
 header h2{margin:0;font:bold 16px Arial,sans-serif;flex:1}
 header .sub{font-size:12px;opacity:.9}
 header .who{font:bold 14px Arial,sans-serif;margin-top:4px}
 header .meta{font-size:12.5px;margin-top:2px}
 .x{background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}
 main{overflow:auto;padding:14px 18px;display:flex;flex-direction:column;gap:12px}
 section{border:1px solid #e3e7ec;border-radius:8px;overflow:hidden;flex-shrink:0}
 section h3{margin:0;padding:8px 12px;background:#f4f6f8;font:bold 12px Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#52606d}
 .body{padding:10px 12px}
 .line{white-space:pre-wrap;word-break:break-word}
 .warn{color:#b42318;font-weight:bold}
 .muted{color:#66727f;font-size:12.5px}
 .badge{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:bold}
 .ok{background:#e3f6e8;color:#14692e}.mid{background:#fff4d6;color:#8a5a00}.bad{background:#fde7e5;color:#a3211a}
 .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:8px}
 .card{border:2px solid #0f6e8c;border-radius:8px;padding:10px 12px;background:#f0f8fb}
 .card .k{font-size:12px;color:#0f6e8c;font-weight:bold;text-transform:uppercase}
 .card .v{font-size:20px;font-weight:bold;margin-top:2px}
 .card.no{border-color:#a3211a;background:#fdf0ef}.card.no .k{color:#a3211a}
 .detail{padding-left:12px;border-left:3px solid #e3e7ec;margin:2px 0}
 .advhead{font-size:12px;color:#8a5a00;margin-bottom:8px}
 footer{border-top:1px solid #e3e7ec;padding:10px 18px;display:flex;gap:8px;justify-content:flex-end;align-items:center}
 footer span{flex:1;font-size:12px;color:#14692e}
 button.b{border:0;border-radius:6px;padding:9px 16px;font:bold 13px Arial,sans-serif;cursor:pointer}
 .copy{background:#0f6e8c;color:#fff}.close{background:#e3e7ec;color:#1f2933}
 .fill{background:#14692e;color:#fff}.fill:disabled{background:#9aa5b1;cursor:not-allowed}
 .confirm{display:none;overflow:auto;padding:16px 18px}
 .ask{background:#fff4d6;border:1px solid #eadca7;border-radius:8px;padding:12px 14px;margin-bottom:12px;color:#5c4400}
 .ask strong{display:block;font-size:16px;margin-bottom:4px}
 table{border-collapse:collapse;width:100%;font-size:13px;table-layout:fixed}
 td{word-break:break-word}
 th,td{border:1px solid #e3e7ec;padding:7px 9px;text-align:left;vertical-align:top}
 th{background:#f4f6f8;font-size:12px;color:#52606d}
 td.new{background:#f0f8fb;font-weight:bold}
 .st-done{color:#14692e;font-weight:bold}.st-fail,.st-skip{color:#a3211a;font-weight:bold}
 .warnbox{color:#a3211a;margin:0 0 10px;padding-left:18px}
 .edit{width:100%;box-sizing:border-box;border:1px solid #9fb3c8;border-radius:5px;padding:6px 8px;font:bold 13px/1.4 Arial,sans-serif;color:#1f2933;background:#fff}
 .edit:focus{outline:2px solid #0f6e8c;border-color:#0f6e8c}
 .edit.bad{border-color:#a3211a;outline-color:#a3211a}
 textarea.edit{min-height:110px;resize:vertical;overflow:hidden}
 .hint{font-size:11.5px;color:#66727f;margin-top:3px;font-weight:normal}
 </style>
 <div class="back"><div class="win" role="dialog" aria-modal="true" aria-label="Hasil Cek Lokasi Sumur">
 <header><div style="flex:1"><h2>Hasil Cek Lokasi Sumur</h2><div class="who"></div><div class="meta"></div><div class="sub"></div></div><button class="x" title="Tutup">×</button></header>
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
 const close=()=>{host.remove();document.removeEventListener('keydown',esc,true);};
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
    if(bad){bad.classList.add('bad');bad.focus();foot.textContent='';alert(/alamat|masa berlaku/i.test(bad.dataset.label)?bad.dataset.label+' tidak boleh kosong.':'Debit harus angka lebih dari 0, tanpa satuan (contoh: 75 atau 12,5).');return;}
    go.disabled=true;back.disabled=true;go.textContent='Mengisi…';
    try{
     const res=await fill.apply(overrides);confirmBox.textContent='';
     const ok=res.filter(r=>r.status==='done').length,bad=res.filter(r=>r.status!=='done').length;
     const done=el('div','ask');done.style.background=bad?'#fff4d6':'#e3f6e8';done.style.borderColor=bad?'#eadca7':'#b7e2c3';if(!bad)done.style.color='#14692e';
     done.append(el('strong',null,ok+' isian terisi'+(bad?', '+bad+' perlu diisi manual':'')),el('div',null,'Rapikan Alamat Lokasi Sumur, periksa kembali isian yang ditandai kuning, lalu simpan formulir seperti biasa.'));
     confirmBox.append(done,table(res,true));
     const bar2=el('div');bar2.style.cssText='display:flex;gap:8px;justify-content:flex-end;margin-top:12px';
     const back2=el('button','b close','Kembali ke hasil cek');bar2.append(back2);confirmBox.append(bar2);back2.onclick=()=>{showMain();fillBtn.disabled=false;};
    }catch(err){go.disabled=false;back.disabled=false;go.textContent='Lanjut';foot.textContent='';alert('Isi otomatis gagal: '+err.message);}
   };
  }catch(err){foot.textContent='';fillBtn.disabled=false;alert('Isi otomatis gagal: '+err.message);}
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
 }catch(e){alert(e.message);}finally{check.disabled=false;check.textContent='Cek Lokasi Sumur';}
};
const button=document.createElement('button');button.type='button';button.textContent='Unduh KML Lokasi Proyek';
button.style.cssText='position:fixed;right:25px;bottom:210px;z-index:99999;background:#7c3e98;color:white;padding:14px;border:0;border-radius:8px;cursor:pointer';
document.body.append(button);
button.onclick=async()=>{
 button.disabled=true;button.textContent='Membuat KML…';
 try{
  const rows=(await locations()).filter(r=>!noProjectData(r.raw));
  if(!rows.length){alert('Tidak ada data lokasi usaha pada OSS');return;}
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
 }catch(e){alert(e.message);}finally{button.disabled=false;button.textContent='Unduh KML Lokasi Proyek';}
};
})();
