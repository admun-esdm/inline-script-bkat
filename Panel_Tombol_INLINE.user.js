// ==UserScript==
// @name         INLINE Panel Tombol
// @namespace    inline-rekan
// @version      1.10
// @description  Satukan tombol integrasi Adit dalam panel yang dapat diminimalkan
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinStaf/*
// @match        https://ngantor.esdm.go.id/inline/internal/PermohonanIzinPre/*
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Panel_Tombol_INLINE.user.js
// @downloadURL  https://raw.githubusercontent.com/admun-esdm/inline-script-bkat/main/Panel_Tombol_INLINE.user.js
// @homepageURL  https://github.com/admun-esdm/inline-script-bkat
// ==/UserScript==
(() => {
'use strict';
if(document.getElementById('inline-rekan-tools-panel'))return;
const labels=['Download Lampiran','Simpan Lampiran ke Drive','Salin Data Teknis Pemohon','Data Lengkap Pengusahaan','Data Lengkap Sumur Pantau/Imbuhan','Data Lengkap Persetujuan','Data Lengkap Dewatering','Pengembalian','Unduh KML Lokasi Proyek','Cek Lokasi Sumur','Impor Data Wilayah'];
const key='inline-rekan-panel-collapsed';
let collapsed=false;try{collapsed=localStorage.getItem(key)==='1';}catch{}
const panel=document.createElement('section');panel.id='inline-rekan-tools-panel';panel.setAttribute('aria-label','Alat INLINE');
panel.style.cssText='position:fixed;right:20px;bottom:20px;z-index:99999;max-width:calc(100vw - 40px);width:300px;background:white;border:1px solid #d6dce3;border-radius:12px;box-shadow:0 4px 20px #0003;overflow:hidden;font:14px Arial,sans-serif;color:#222';
const toggle=document.createElement('button');toggle.type='button';toggle.setAttribute('aria-controls','inline-rekan-tools-content');
toggle.style.cssText='display:block;width:100%;background:#25364a;color:white;border:0;padding:12px 16px;text-align:left;font:bold 14px Arial,sans-serif;cursor:pointer';
const content=document.createElement('div');content.id='inline-rekan-tools-content';content.style.cssText='display:flex;flex-direction:column;gap:8px;padding:12px;max-height:calc(100vh - 120px);overflow:auto';
function render(){content.style.display=collapsed?'none':'flex';panel.style.width=collapsed?'180px':'300px';toggle.textContent=collapsed?'▸ Alat INLINE':'▾ Alat INLINE — Minimalkan';toggle.setAttribute('aria-expanded',String(!collapsed));}
toggle.onclick=()=>{collapsed=!collapsed;render();try{localStorage.setItem(key,collapsed?'1':'0');}catch{}};
const note=document.createElement('aside');
note.style.cssText='order:100;background:#fff9e5;border:1px solid #eadca7;border-radius:6px;padding:10px;font:12px/1.5 Arial,sans-serif;color:#775f26';
note.innerHTML='<strong>Penulisan akuifer yang disadap</strong><br>Di INLINE gunakan <strong>#lt#</strong> untuk &lt;, <strong>#gt#</strong> untuk &gt;, <strong>#le#</strong> untuk ≤, dan <strong>#ge#</strong> untuk ≥.<br>Contoh: <strong>#lt# 40</strong> atau <strong>#gt# 60</strong>.<br>Pastikan <strong>preview PDF produk izin berhasil</strong> sebelum mengirim permohonan.';
content.append(note);
panel.append(toggle,content);document.body.append(panel);render();
function adopt(){
 for(const button of document.querySelectorAll('button')){
  if(panel.contains(button))continue;
  const index=labels.indexOf(button.textContent.trim());
  if(index<0 || button.style.position!=='fixed')continue;
  // Pindahkan tombol asli: event handler, status sibuk, dan fungsi tetap melekat.
  button.style.position='static';button.style.removeProperty('right');button.style.removeProperty('bottom');button.style.removeProperty('z-index');
  button.style.width='100%';button.style.boxSizing='border-box';button.style.margin='0';button.style.order=String(index);button.type='button';
  content.append(button);
 }
}
adopt();
const observer=new MutationObserver(adopt);observer.observe(document.body,{childList:true,subtree:true});
})();
