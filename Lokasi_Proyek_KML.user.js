// ==UserScript==
// @name         INLINE Unduh KML Lokasi Proyek
// @namespace    inline-rekan
// @version      1.32
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
 header .logo{width:46px;height:46px;flex:none;object-fit:contain}
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
 <header><img class="logo" alt="" src="${AIRA_LOGO}"><div style="flex:1"><div class="brand">AIRA</div><h2>Hasil Cek Lokasi Sumur</h2><div class="who"></div><div class="meta"></div><div class="sub"></div></div><button class="x" title="Tutup">×</button></header>
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
