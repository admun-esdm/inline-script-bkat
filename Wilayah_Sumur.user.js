// ==UserScript==
// @name         INLINE Data Wilayah Sumur
// @namespace    inline-wilayah
// @version      1.3.12
// @description  Impor data wilayah dan cocokkan koordinat untuk alat INLINE
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinStaf/*
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinPre/*
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Wilayah_Sumur.user.js
// @downloadURL  https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Wilayah_Sumur.user.js
// @homepageURL  https://github.com/admun-esdm/inline-script-bkat
// ==/UserScript==
(() => {
'use strict';
let cache,index;
const clean=s=>String(s??'').trim();
const isNonCAT=s=>/^NON[\s-]*CAT$/i.test(clean(s).replace(/^ZONA\s+/i,''));
const zoneTitle=s=>isNonCAT(s)?'Non-CAT':clean(s).split(/\s+/).map(w=>/^[IVXLCDM]+$/i.test(w)?w.toUpperCase():w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
function ringStatus([x,y],ring){let inside=false;const eps=1e-9;for(let i=0;i<ring.length-1;i++){const [ax,ay]=ring[i],[bx,by]=ring[i+1],dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy);if(l&&Math.abs(dx*(y-ay)-dy*(x-ax))/l<=eps&&x>=Math.min(ax,bx)-eps&&x<=Math.max(ax,bx)+eps&&y>=Math.min(ay,by)-eps&&y<=Math.max(ay,by)+eps)return 'boundary';if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;}return inside?'inside':'outside';}
function polygonStatus(point,poly){const [x,y]=point,[a,b,c,d]=poly.b;if(x<a-1e-9||x>c+1e-9||y<b-1e-9||y>d+1e-9)return 'outside';const outer=ringStatus(point,poly.r[0]);if(outer==='outside')return outer;for(const hole of poly.r.slice(1)){const s=ringStatus(point,hole);if(s==='boundary')return s;if(s==='inside')return 'outside';}return outer;}
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open('inline-region-data',1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Penyimpanan browser gagal dibuka.'));});}
// Satu pembacaan IndexedDB per halaman: permintaan bersamaan menunggu pembacaan yang sama.
let loading=null;
function getData(){if(cache)return Promise.resolve(cache);if(!loading)loading=getDataFromDB().finally(()=>{loading=null;});return loading;}
async function getDataFromDB(){if(cache)return cache;const d=await db();try{return await new Promise((resolve,reject)=>{const r=d.transaction('data').objectStore('data').get('current');r.onsuccess=()=>{cache=r.result;resolve(cache);};r.onerror=()=>reject(r.error);});}finally{d.close();}}
async function saveData(data){const d=await db();try{await new Promise((resolve,reject)=>{const t=d.transaction('data','readwrite');t.objectStore('data').put(data,'current');t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});cache=data;index=null;}finally{d.close();}}
function buildIndex(data){const out={};for(const [layer,features] of Object.entries(data.layers)){const grid=new Map();for(let i=0;i<features.length;i++)for(const p of features[i].p){const [a,b,c,d]=p.b;for(let x=Math.floor(a*10);x<=Math.floor(c*10);x++)for(let y=Math.floor(b*10);y<=Math.floor(d*10);y++){const k=x+','+y;if(!grid.has(k))grid.set(k,new Set());grid.get(k).add(i);}}out[layer]=grid;}return out;}
function matches(data,point,layer){if(!data.layers[layer]?.length)return null;const ids=index[layer].get(Math.floor(point[0]*10)+','+Math.floor(point[1]*10))||[];const out=[];for(const i of ids){const f=data.layers[layer][i];const statuses=f.p.map(p=>polygonStatus(point,p));const status=statuses.includes('inside')?'inside':statuses.includes('boundary')?'boundary':'outside';if(status!=='outside')out.push({...f,status});}return out;}
function summarize(label,list,yes,no){if(list===null)return label+': Data belum tersedia';const inside=list.filter(f=>f.status==='inside'),boundary=list.filter(f=>f.status==='boundary');let text=inside.length?yes(inside):boundary.length?'Titik berada di batas '+label:no;if(inside.length&&boundary.length)text+='; juga berada di batas '+label;return text;}

function parseScreen(raw){
 const s=clean(raw).replace(/[–—−]/g,'-');if(!s)throw Error('Rentang Kedalaman Screen pada form evaluator belum diisi.');
 // R18: "69-73,73-77" (koma sebagai pemisah) diterima bila SETIAP potongan berupa rentang utuh;
 // bila tidak, koma tetap dibaca sebagai desimal (mis. "53,90-69,30").
 const one=/^\d+(?:[.,]\d+)?\s*-\s*\d+(?:[.,]\d+)?\s*(?:m\s*\.?\s*bmt\.?|m)?$/i;
 const parts=s.split(/[;\n]+/).map(clean).filter(Boolean).flatMap(part=>{const pieces=part.split(',').map(clean).filter(Boolean);return pieces.length>1&&pieces.every(x=>one.test(x))?pieces:[part];});
 return parts.map(part=>{const m=part.match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s*(?:m\s*\.?\s*bmt\.?|m)?$/i);if(!m)throw Error('Rentang screen tidak dikenali: '+part+'. Gunakan contoh 100-120; 140-160 (m.bmt).');const lo=Number(m[1].replace(',','.')),hi=Number(m[2].replace(',','.'));if(hi<=lo)throw Error('Ujung rentang screen harus lebih dalam dari awal: '+part);return {lo,hi};});
}
function adminKey(f){return JSON.stringify(['WADMKD','WADMKC','WADMKK','WADMPR','CAT'].map(k=>clean(f.a[k])));}
function depthEvaluation(raw,cat,upper,middle){
 const warnings=[],details=[];let ranges;try{ranges=parseScreen(raw);if(!ranges.length)throw Error('Rentang screen kosong.');}catch(e){return {complete:false,summary:e.message,zone:null,debit:null};}
 const free=ranges.some(r=>r.lo<40),jakarta=/^(?:CAT\s+)?Jakarta$/i.test(clean(cat));
 const systems=[];if(free)systems.push('Akuifer Bebas (<40 m.bmt)');
 const selected=[];
 const add=(label,list)=>{details.push(label);if(!list?.length){warnings.push('Data zona '+label+' tidak tersedia pada titik ini.');return;}if(list.some(f=>f.status==='boundary'))warnings.push('Titik berada di batas zona '+label+'.');const inside=list.filter(f=>f.status==='inside');if(!inside.length){warnings.push('Zona '+label+' belum dapat ditetapkan.');return;}for(const f of inside){if(f.a.SOURCE_CONFLICT)warnings.push('Atribut sumber bertentangan pada '+label+' (baris '+f.a.SOURCE_ROW+'): '+f.a.SOURCE_CONFLICT);const zone=clean(f.a.Zona_Konat),d=clean(f.a.Debit_Opt),debit=/^\d+(?:[.,]\d+)?$/.test(d)?Number(d.replace(',','.')):NaN;details.push('  '+zoneTitle(zone)+'; debit optimum '+(Number.isFinite(debit)?debit+' m3/hari':'tidak tersedia'));if(!zone||!Number.isFinite(debit))warnings.push('Zona/debit kosong atau tidak valid pada '+label+'.');else selected.push({zone,debit,label});}};
 if(jakarta){
  if(ranges.some(r=>r.lo<140&&r.hi>40)){systems.push('Akuifer Tertekan Atas (40-140 m.bmt)');add('Akuifer tertekan atas',upper);}
  if(ranges.some(r=>r.lo<250&&r.hi>140)){systems.push('Akuifer Tertekan Tengah (140-250 m.bmt)');add('Akuifer tertekan tengah',middle);}
  if(ranges.some(r=>r.hi>250))warnings.push('Screen melebihi 250 m.bmt; data akuifer yang tersedia belum mencakup seluruh rentangnya.');
  if(!selected.length&&free&&!warnings.length){details.push('Screen hanya menyadap akuifer bebas; zona berikut merupakan referensi lokasi, bukan penetapan akuifer tertekan yang disadap.');add('Zona referensi lokasi untuk akuifer bebas',upper);}
 }else{if(ranges.some(r=>r.hi>40))systems.push('Akuifer Tertekan');add('Zona referensi lokasi',upper);}
 const rank=z=>{z=clean(z).toUpperCase().replace(/^ZONA\s+/,'').replace(/\s+/g,' ');return z==='RUSAK'?5:z==='KRITIS'?4:z==='RAWAN'?3:/^AMAN(?: [IV]+)?$/.test(z)?1:null;};
 const nonCATZones=selected.filter(x=>isNonCAT(x.zone));
 const protection=selected.filter(x=>/IMBUHAN/i.test(x.zone)),ordinary=selected.filter(x=>!/IMBUHAN/i.test(x.zone)&&!isNonCAT(x.zone));
 // Non-CAT merupakan label zona sumber yang sah, tanpa peringkat risiko buatan.
 if(nonCATZones.length&&!isNonCAT(cat))warnings.push('Zona Non-CAT muncul pada CAT bernama '+clean(cat)+'; periksa kecocokan atribut sumber.');
 if(nonCATZones.length&&(protection.length||ordinary.length))warnings.push('Zona Non-CAT bertemu kategori zona berbeda; urutan risiko belum ditetapkan, periksa manual.');
 if(protection.length&&ordinary.length)warnings.push('Zona Imbuhan bertemu zona konservasi lain; penetapan zona perlindungan perlu diperiksa manual.');
 const unknown=[...new Set(ordinary.filter(x=>rank(x.zone)===null).map(x=>x.zone))];
 if(unknown.length)warnings.push('Jenis zona tidak dikenali dalam urutan risiko: '+unknown.join('; ')+'.');
 let zone=null;if(selected.length)zone=zoneTitle((nonCATZones[0]||protection[0]||ordinary.reduce((a,b)=>(rank(b.zone)??-1)>(rank(a.zone)??-1)?b:a)).zone);
 let debit=selected.length?Math.min(...selected.map(x=>x.debit)):null;
 // Debit zona tidak dibatasi oleh notifikasi akuifer bebas.
 const freeDebitLimit=free?10:null;
 const complete=!warnings.filter(Boolean).length&&(selected.length>0||(free&&jakarta&&ranges.every(r=>r.hi<=40)));
 const summary=['Rentang screen evaluator: '+ranges.map(r=>r.lo+'-'+r.hi).join('; ')+' m.bmt','Sistem yang disadap: '+systems.join('; '),...(free?['Notifikasi akuifer bebas: pipa saringan menyadap akuifer bebas; debit optimum maksimal 10 m3/hari.']:[]),...warnings.filter(Boolean).map(w=>'PERLU DIPERIKSA: '+w)].join('\n');
 return {complete,summary,zone,debit,freeDebitLimit,ranges,systems,warnings:warnings.filter(Boolean)};
}

function formatAquiferNote(cat,depth){
 if(!depth.complete||!depth.zone||!Number.isFinite(depth.debit))throw Error('Catatan belum dapat dibuat: zona/debit belum lengkap.');
 const free=depth.ranges.some(r=>r.lo<40),jakarta=/^(?:CAT\s+)?Jakarta$/i.test(clean(cat));
 let prefix='CAT '+clean(cat);
 if(free)prefix='Akuifer Bebas, '+prefix;
 else if(jakarta){const upper=depth.ranges.some(r=>r.lo<140&&r.hi>40),middle=depth.ranges.some(r=>r.lo<250&&r.hi>140);if(upper&&middle)prefix+=', Akuifer Tertekan Atas dan Akuifer Tertekan Tengah';else if(middle)prefix+=', Akuifer Tertekan Tengah';else if(upper)prefix+=', Akuifer Tertekan Atas';}
 return prefix+', Zona '+depth.zone+', Debit optimum '+depth.debit+' m3/hari';
}
function formatAdministrativeDepth(depth){
 const pending=depth.complete?'':' (sementara; perlu diperiksa)';
 return 'Zona konservasi'+pending+': '+(depth.zone||'Belum dapat ditetapkan')+'\nDebit optimum'+pending+': '+(Number.isFinite(depth.debit)?depth.debit+' m3/hari':'Belum dapat ditetapkan');
}
async function evaluate(point,choose,screen){
 if(!Array.isArray(point)||point.length!==2||!point.every(Number.isFinite)||Math.abs(point[0])>180||Math.abs(point[1])>90)throw Error('Koordinat sumur tidak valid.');
 const data=await getData();if(!data)throw Error('Impor Data_Wilayah_Akuifer_R2_09102026.json.gz terlebih dahulu.');if(!index)index=buildIndex(data);
 const admin=matches(data,point,'admin'),industry=matches(data,point,'industry'),free=matches(data,point,'free'),middle=matches(data,point,'jakarta_middle');
 let middleScreen=false;try{middleScreen=parseScreen(screen).some(r=>r.lo<250&&r.hi>140);}catch{}
 const confirmedJakarta=middleScreen&&(middle||[]).some(f=>f.status==='inside'&&f.a.CAT_CONFIRMED==='Jakarta');
 const effectiveAdmin=(admin||[]).map(f=>confirmedJakarta&&clean(f.a.CAT)!=='Jakarta'?{...f,a:{...f.a,CAT:'Jakarta',CAT_ADMIN_REFERENSI:f.a.CAT}}:f);
 const candidates=[...new Map(effectiveAdmin.filter(f=>f.status==='inside').map(f=>[adminKey(f),f])).values()];let selected=candidates.length===1?candidates[0]:null;
 if(choose&&!selected){if(!candidates.length)throw Error(admin?.length?'Sumur tepat di batas administrasi/zona. Periksa wilayah sebelum mengirim.':'Koordinat tidak tercakup data administrasi/CAT.');const answer=prompt('Pilih wilayah hasil pengecekan (nomor):\n'+candidates.map((f,i)=>(i+1)+'. '+[f.a.WADMKD,f.a.WADMKC,f.a.WADMKK,f.a.CAT].join(' | ')).join('\n'));if(answer===null)throw Error('Pengiriman dibatalkan.');selected=candidates[Number(answer)-1];if(!selected)throw Error('Pilihan wilayah tidak valid.');}
 const reports=candidates.map(f=>{const upper=(admin||[]).filter(x=>adminKey(x)===adminKey(f));return {f,depth:depthEvaluation(screen,f.a.CAT,upper,middle)};});
 const chosen=reports.find(r=>selected&&adminKey(r.f)===adminKey(selected));
 const industryText=summarize('Kawasan Industri',industry,a=>'Ya, masuk Kawasan Industri '+[...new Set(a.map(f=>f.a.NAMOBJ||f.name))].join('; '),'Tidak masuk Kawasan Industri');
 const freeText=summarize('Zona Bebas Air Tanah',free,()=> 'Ya, masuk zona bebas air tanah','Tidak masuk Kawasan Zona Bebas Air Tanah');
 const adminLine=a=>{const kk=clean(a.WADMKK);return ['Desa/Kelurahan '+clean(a.WADMKD),'Kecamatan '+clean(a.WADMKC),/^(Kabupaten|Kota)\b/i.test(kk)?kk:'Kabupaten/Kota '+kk,'Provinsi '+clean(a.WADMPR)].join(' | ');};
 const lines=reports.map(({f,depth})=>'Pengecekan administrasi:\n'+adminLine(f.a)+'\n\nPengecekan CAT dan zona konservasi:\nCAT '+f.a.CAT+(f.a.CAT_ADMIN_REFERENSI?'\nCAT pada layer administrasi: '+f.a.CAT_ADMIN_REFERENSI+'; CAT akuifer tengah: Jakarta (koreksi terkonfirmasi).':'')+'\n'+formatAdministrativeDepth(depth)+'\n'+depth.summary);
 let fields=null;if(choose&&selected){const a=selected.a;for(const k of ['WADMKD','WADMKC','WADMKK','WADMPR','CAT'])if(!clean(a[k])||['<Null>','-'].includes(clean(a[k])))throw Error('Atribut '+k+' kosong pada sumber wilayah.');if(!chosen.depth.complete)throw Error('Data lengkap belum dikirim.\n'+chosen.depth.summary);if(!chosen.depth.zone)throw Error('Screen hanya menyadap akuifer bebas. Batas debit 10 m3/hari telah ditampilkan; kolom zona perlu diperiksa dan Master data diisi secara manual untuk kondisi ini.');fields={desa:a.WADMKD,kecamatan:a.WADMKC,kabupaten:a.WADMKK,provinsi:a.WADMPR,cat:a.CAT,zona:chosen.depth.zone,catatan:formatAquiferNote(a.CAT,chosen.depth)};}
 const area=chosen?{cat:clean(chosen.f.a.CAT),desa:clean(chosen.f.a.WADMKD),kecamatan:clean(chosen.f.a.WADMKC),kabupaten:clean(chosen.f.a.WADMKK),provinsi:clean(chosen.f.a.WADMPR)}:null;
 const options=reports.map(({f,depth})=>({area:{cat:clean(f.a.CAT),desa:clean(f.a.WADMKD),kecamatan:clean(f.a.WADMKC),kabupaten:clean(f.a.WADMKK),provinsi:clean(f.a.WADMPR)},depth}));
 const onBoundary=(admin||[]).some(f=>f.status==='boundary');
 return {point,fields,area,depth:chosen?.depth||null,options,onBoundary,summary:(lines.join('\n\n')||'Pengecekan administrasi:\n'+((admin||[]).length?'Titik di batas wilayah; periksa manual.':'Tidak tercakup data referensi'))+'\n\nPengecekan kawasan:\n'+industryText+'\n'+freeText,version:data.version};
}
document.addEventListener('INLINE_REGION_REQUEST',async e=>{let q;try{q=JSON.parse(e.detail);const result=await evaluate(q.point,q.choose===true,q.screen);document.dispatchEvent(new CustomEvent('INLINE_REGION_RESPONSE',{detail:JSON.stringify({nonce:q.nonce,result})}));}catch(err){if(q)document.dispatchEvent(new CustomEvent('INLINE_REGION_RESPONSE',{detail:JSON.stringify({nonce:q.nonce,error:err.message})}));}});
// Pramuat data wilayah saat halaman senggang, agar Cek Lokasi Sumur dan Data Lengkap tidak menunggu pembacaan IndexedDB.
setTimeout(()=>{const run=()=>getData().catch(()=>{});window.requestIdleCallback?requestIdleCallback(run,{timeout:5000}):run();},1500);
const button=document.createElement('button');button.type='button';button.textContent='Impor Data Wilayah';button.style.cssText='position:fixed;right:25px;bottom:325px;z-index:99999;background:#276f63;color:white;padding:14px;border:0;border-radius:8px;cursor:pointer';document.body.append(button);
button.onclick=()=>{const input=document.createElement('input');input.type='file';input.accept='.gz,.json';input.onchange=async()=>{const file=input.files[0];if(!file)return;button.disabled=true;button.textContent='Mengimpor wilayah…';try{const stream=file.name.endsWith('.gz')?file.stream().pipeThrough(new DecompressionStream('gzip')):file.stream();const data=JSON.parse(await new Response(stream).text());if(data.format!=='inline-wilayah-v1'||['admin','industry','free'].some(k=>!Array.isArray(data.layers?.[k])||!data.layers[k].length))throw Error('File data wilayah tidak sesuai.');for(const features of Object.values(data.layers))for(const f of features){if(!f.a||!Array.isArray(f.p)||!f.p.length)throw Error('Objek wilayah rusak.');for(const p of f.p){if(!p.b?.every(Number.isFinite)||p.b.length!==4||!p.r?.length)throw Error('Batas wilayah rusak.');for(const r of p.r)if(r.length<4||r.some(v=>v.length!==2||!v.every(Number.isFinite))||r[0][0]!==r.at(-1)[0]||r[0][1]!==r.at(-1)[1])throw Error('Ring wilayah rusak.');}}await saveData(data);alert('Data wilayah tersimpan di browser ini.\n'+Object.entries(data.layers).map(([k,v])=>k+': '+v.length+' objek').join('\n'));}catch(e){alert('Impor gagal: '+e.message);}finally{button.disabled=false;button.textContent='Impor Data Wilayah';}};input.click();};
})();
