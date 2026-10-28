"use strict";
const $ = s => document.querySelector(s);
const KEY = "yltaPSNProfilesCaptured.v1";
const normalize = s => String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function extractPageFromCurrentTab(){
  const meta = document.querySelector('meta[property="og:title"]');
  const canonical = document.querySelector('link[rel="canonical"]');
  const source = canonical?.href || document.querySelector('meta[property="og:url"]')?.content || location.href;
  if(!/^https:\/\/(?:www\.)?psnprofiles\.com\/trophies\/\d+[-/]/i.test(source)) return {error:"Not a PSNProfiles game trophy list"};
  const title=(meta?.content||document.title||"").replace(/\s+Trophies(?:\s*.*)?$/i,"").trim();
  if(!title) return {error:"Game title missing"};
  const rows=[],seen=new Set();
  for(const tr of document.querySelectorAll("table.zebra tr")){
    const a=tr.querySelector('a.title[href*="/trophy/"]');
    const rarityNode=tr.querySelector('td.hover-hide .typo-top');
    if(!a||!rarityNode) continue;
    const found=rarityNode.textContent.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
    if(!found)continue;
    const rarity=Number(found[1]); if(!Number.isFinite(rarity)||rarity<0||rarity>100)continue;
    const name=a.textContent.trim();
    const grade=tr.querySelector('img[title="Bronze"],img[title="Silver"],img[title="Gold"],img[title="Platinum"]')?.title.toLowerCase()||"";
    const key=name.toLowerCase()+"|"+grade;
    if(!name||seen.has(key))continue;
    seen.add(key);rows.push({name,type:grade,psnpRarity:rarity});
  }
  if(!rows.length)return {error:"No PSNProfiles rarity values found on this page"};
  return {game:title,source,rows,capturedAt:new Date().toISOString()};
}
async function readPages(){const o=await chrome.storage.local.get(KEY);return o[KEY]||{};}
async function render(){const pages=await readPages();const vals=Object.values(pages);$("#pageCount").textContent=vals.length;$("#trophyCount").textContent=vals.reduce((n,p)=>n+p.rows.length,0)+" trophies";$("#export").disabled=!vals.length;}
function status(s){$("#status").textContent=s;}
async function capture(tabs){let pages=await readPages(),captured=0,failed=[];
  for(const tab of tabs){
    try{
      const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:extractPageFromCurrentTab});
      const result=results?.[0]?.result;
      if(!result||result.error){failed.push(result?.error||"No data");continue;}
      pages[result.source]=result;captured++;
    }catch(e){failed.push(e.message||String(e));}
  }
  await chrome.storage.local.set({[KEY]:pages});await render();
  status(captured+" page(s) captured."+(failed.length?" "+failed.length+" skipped: "+failed[0]:""));
}
$("#captureCurrent").addEventListener("click",async()=>{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab||!/^https:\/\/(?:www\.)?psnprofiles\.com\/trophies\//i.test(tab.url||"")){status("Open a game's PSNProfiles trophy list first.");return;}
  await capture([tab]);
});
$("#captureTabs").addEventListener("click",async()=>{
  const tabs=(await chrome.tabs.query({})).filter(t=>/^https:\/\/(?:www\.)?psnprofiles\.com\/trophies\/\d+[-/]/i.test(t.url||""));
  if(!tabs.length){status("Open one or more PSNProfiles game trophy pages in tabs.");return;}
  if(tabs.length>60){status("Open no more than 60 game tabs at a time.");return;}
  await capture(tabs);
});
$("#export").addEventListener("click",async()=>{
  const pages=Object.values(await readPages());
  if(!pages.length){status("No pages captured yet.");return;}
  const payload={app:"ylta-psnp-capture",version:1,createdAt:new Date().toISOString(),pages};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ylta-psnprofiles-bulk.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status("Exported "+pages.length+" game page(s). Import the JSON into YLTA.");
});
$("#clear").addEventListener("click",async()=>{
  if(!confirm("Remove all locally captured pages from this browser helper?"))return;
  await chrome.storage.local.remove(KEY);await render();status("Captured pages cleared.");
});
render();
