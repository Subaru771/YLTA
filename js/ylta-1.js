
(function(){
"use strict";
var $=function(s){return document.querySelector(s)};
var TYPES={platinum:{label:"Platinum",pts:300,rank:4},gold:{label:"Gold",pts:90,rank:3},silver:{label:"Silver",pts:30,rank:2},bronze:{label:"Bronze",pts:15,rank:1}};
var TYPE_ORDER=["platinum","gold","silver","bronze"];
var TIERS=[{key:"ultra",label:"Ultra rare",short:"under 5%",max:5},{key:"very",label:"Very rare",short:"5 to 15%",max:15},{key:"rare",label:"Rare",short:"15 to 50%",max:50},{key:"common",label:"Common",short:"50%+",max:Infinity}];
var PAGE=100,GPAGE=48;
function tierOf(p){for(var i=0;i<TIERS.length;i++){if(p<TIERS[i].max)return TIERS[i]}return TIERS[3]}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return n<10?"0"+n:""+n}
function nowLocal(){var d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes())}
function fmtDate(s,withTime){
  if(!s)return"";var d=new Date(s);if(isNaN(d))return s;
  var out=d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
  if(withTime!==false&&!/T00:00$/.test(s))out+=", "+d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});
  return out;
}
function monthLabel(s){var d=new Date(s);return d.toLocaleDateString(undefined,{month:"long",year:"numeric"})}
function fmtPct(p){return (Math.round(p*10)/10).toFixed(1)+"%"}
function fmtNum(n){return n.toLocaleString()}
function cmp(a,b){return a<b?-1:a>b?1:0}
function platLabel(p){return p==="PSVITA"?"PS Vita":p}
function platsOf(x){return x.platform?String(x.platform).split(/[,\/]/).map(function(s){return s.trim().toUpperCase()}).filter(Boolean):[]}

/* ---------- sample data ---------- */
var SAMPLE_ROWS=[
["Hollow Meridian","Meridian Unbound","platinum",1.8,null,"Earn all other trophies."],
["Hollow Meridian","Crown of Ash","gold",3.2,"2026-09-14T21:40","Defeat the final boss."],
["Hollow Meridian","First Light","bronze",91.4,"2026-03-02T18:05","Complete the prologue."],
["Hollow Meridian","Cartographer","silver",22.7,"2026-05-19T20:12","Reveal every region on the map."],
["Hollow Meridian","Pacifist's Road","gold",2.4,null,"Finish the game without defeating a single enemy."],
["Hollow Meridian","Blacksmith's Pride","bronze",47.9,"2026-04-11T16:30","Forge ten weapons."],
["Hollow Meridian","Echo Hunter","silver",9.6,"2026-07-08T22:18","Find every echo shrine."],
["Hollow Meridian","Lucky Strike","bronze",63.1,"2026-03-20T19:45","Land a critical hit."],
["Hollow Meridian","Ember Gate","bronze",33.1,"2026-08-02T20:10","Enter the Ember Gate."],
["Hollow Meridian","Ashen Crown Reforged","silver",7.4,null,"Forge the Ashen Crown."],
["Hollow Meridian","Beyond the Gate","gold",4.6,null,"Finish the Ember Gate expansion."],
["Neon Circuit Racing","Circuit Legend","platinum",4.1,"2026-02-27T23:10","Earn all other trophies."],
["Neon Circuit Racing","Podium Habit","bronze",78.5,"2025-12-06T14:22","Finish on the podium."],
["Neon Circuit Racing","Clean Sweep","silver",31.2,"2025-12-21T17:03","Win every race in a cup."],
["Neon Circuit Racing","Hairpin Master","silver",12.8,"2026-01-09T20:36","Drift through every hairpin on the coast track."],
["Neon Circuit Racing","World Tour Champion","gold",8.9,"2026-02-14T19:51","Win the World Tour."],
["Neon Circuit Racing","Ghost Buster","bronze",55.3,"2026-01-25T15:15","Beat a ghost lap."],
["Neon Circuit Racing","Perfect Lap","gold",16.4,"2026-02-02T21:27","Finish a lap with no contact."],
["Neon Circuit Racing","Night Owl","bronze",38.0,"2025-12-30T01:12","Race after midnight."],
["Neon Circuit Racing","Photo Finish","silver",6.7,"2026-02-21T22:44","Win a race by under 0.05 seconds."],
["Saltmarsh","Saltmarsh","platinum",6.4,null,"Earn all other trophies."],
["Saltmarsh","Tide Turner","bronze",84.2,"2026-06-03T13:20","Reach the first harbour."],
["Saltmarsh","Lighthouse Keeper","silver",41.5,"2026-06-10T18:55","Relight all lighthouses."],
["Saltmarsh","Every Last Pearl","gold",5.3,null,"Collect every pearl."],
["Saltmarsh","Net Result","bronze",70.6,"2026-06-04T12:08","Catch your first fish."],
["Saltmarsh","The Long Way Home","gold",27.9,"2026-06-28T21:02","Complete the story."],
["Saltmarsh","Driftwood Collector","bronze",52.2,"2026-06-06T11:41","Gather 50 pieces of driftwood."],
["Saltmarsh","Storm Chaser","silver",13.5,"2026-06-19T20:30","Survive a storm at sea."],
["Last Lantern","Last Lantern","platinum",0.9,null,"Earn all other trophies."],
["Last Lantern","Lights Out","bronze",88.9,"2026-10-02T22:15","Leave the cellar."],
["Last Lantern","Don't Look Back","silver",34.0,"2026-10-05T23:40","Escape the east wing."],
["Last Lantern","Dawn Breaks","gold",11.7,null,"Reach the true ending."],
["Last Lantern","Quiet Footsteps","silver",3.8,null,"Finish a chapter without being seen."],
["Last Lantern","Matchbox Memories","bronze",59.4,"2026-10-03T21:05","Find the first memory."],
["Last Lantern","Closed Doors","bronze",44.6,"2026-10-09T22:50","Lock yourself in a room."]
];
var SAMPLE_PLAT={"Hollow Meridian":"PS5","Neon Circuit Racing":"PS4","Saltmarsh":"PS5","Last Lantern":"PS5"};
var SAMPLE_HIDDEN={"Dawn Breaks":1,"Pacifist's Road":1};
var SAMPLE_DLC={"Ember Gate":1,"Ashen Crown Reforged":1,"Beyond the Gate":1};
var SAMPLE_STAR={"Pacifist's Road":1,"Quiet Footsteps":1};
function sampleItems(){return SAMPLE_ROWS.map(function(r,i){
  var x={id:"s"+i,game:r[0],name:r[1],type:r[2],rarity:r[3],earned:r[4],desc:r[5],platform:SAMPLE_PLAT[r[0]],sample:true};
  if(SAMPLE_HIDDEN[r[1]])x.hidden=true;if(SAMPLE_DLC[r[1]])x.dlc=true;if(SAMPLE_STAR[r[1]])x.star=true;return x})}

/* ---------- storage: IndexedDB with localStorage fallback ---------- */
var LS_KEY="trophyLedger.v1";
var store=(function(){
  var dbp=null;
  function open(){
    if(dbp)return dbp;
    dbp=new Promise(function(res,rej){
      try{
        var r=indexedDB.open("trophyLedger",1);
        r.onupgradeneeded=function(){r.result.createObjectStore("kv")};
        r.onsuccess=function(){res(r.result)};
        r.onerror=function(){rej(r.error)};
        r.onblocked=function(){rej(new Error("blocked"))};
      }catch(e){rej(e)}
    });
    return dbp;
  }
  function idbGet(){return open().then(function(db){return new Promise(function(res,rej){var q=db.transaction("kv").objectStore("kv").get("state");q.onsuccess=function(){res(q.result)};q.onerror=function(){rej(q.error)}})})}
  function idbPut(v){return open().then(function(db){return new Promise(function(res,rej){var tx=db.transaction("kv","readwrite");tx.objectStore("kv").put(v,"state");tx.oncomplete=function(){res()};tx.onerror=function(){rej(tx.error)};tx.onabort=function(){rej(tx.error)}})})}
  function lsGet(){try{var r=localStorage.getItem(LS_KEY);if(r)return JSON.parse(r)}catch(e){}return null}
  function lsPut(v){return new Promise(function(res,rej){try{localStorage.setItem(LS_KEY,JSON.stringify(v));res()}catch(e){rej(e)}})}
  return{
    load:function(){return idbGet().catch(function(){return null}).then(function(v){return v&&Array.isArray(v.items)?v:lsGet()})},
    save:function(v){return idbPut(v).catch(function(){return lsPut(v)})}
  };
})();

/* ---------- state ---------- */
var S={items:[],goals:[],goalFilter:"active",goalEditingId:null,profile:null,tab:"dashboard",q:"",sort:"rarity",dir:"asc",status:"earned",star:false,types:new Set(),tiers:new Set(),plats:new Set(),game:"",year:"",content:"",maxr:null,group:"none",reveal:false,compact:false,gsort:"recent",limit:PAGE,glimit:GPAGE,editing:null,ready:false};
function prefs(){return{sort:S.sort,dir:S.dir,group:S.group,reveal:S.reveal,compact:S.compact,gsort:S.gsort}}
var seq=Date.now();
function newId(){seq++;return"u"+seq.toString(36)}
var saveT=null;
function flush(){
  if(!S.ready)return;
  store.save({items:S.items,goals:S.goals,profile:S.profile,prefs:prefs()}).catch(function(){flash("This browser could not save your data. Copy a JSON backup from Import / export.")});
}
function save(){clearTimeout(saveT);saveT=setTimeout(flush,250)}
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){clearTimeout(saveT);flush()}});
window.addEventListener("pagehide",function(){clearTimeout(saveT);flush()});

/* ---------- sort / filter ---------- */
var SORT_DEFAULT={psn:"asc",psnp:"asc",rarity:"asc",date:"desc",type:"desc",points:"desc",game:"asc",name:"asc"};
var DIR_LABEL={psn:{asc:"Rarest PSN first",desc:"Common PSN first"},psnp:{asc:"Rarest PSNProfiles first",desc:"Common PSNProfiles first"},rarity:{asc:"Rarest first",desc:"Most common first"},date:{desc:"Newest first",asc:"Oldest first"},type:{desc:"Platinum first",asc:"Bronze first"},points:{desc:"Highest first",asc:"Lowest first"},game:{asc:"A to Z",desc:"Z to A"},name:{asc:"A to Z",desc:"Z to A"}};
function masked(x){return !!x.hidden&&!x.earned&&!S.reveal}
function dispName(x){return masked(x)?"Hidden trophy":x.name}
function rarityValue(x,source){return source==="psnp"?(Number.isFinite(Number(x.psnpRarity))&&x.psnpRarity!=null&&x.psnpRarity!==""?Number(x.psnpRarity):null):x.rarity}
function selectedRarity(x){return rarityValue(x,appPrefs.rarity)}
function sortItems(arr){
  var k=S.sort,m=S.dir==="asc"?1:-1;
  var val={psn:function(x){return x.rarity},psnp:function(x){return rarityValue(x,"psnp")},rarity:function(x){return selectedRarity(x)},type:function(x){return TYPES[x.type].rank},points:function(x){return TYPES[x.type].pts},game:function(x){return x.game.toLowerCase()},name:function(x){return dispName(x).toLowerCase()}}[k];
  return arr.slice().sort(function(x,y){
    var c;
    if(k==="date"){
      if(!x.earned&&!y.earned)c=0;else if(!x.earned)return 1;else if(!y.earned)return-1;else c=cmp(x.earned,y.earned)*m;
    }else if(k==="rarity"||k==="psnp"||k==="psn"){
      var a=val(x),b=val(y);c=a==null?(b==null?0:1):b==null?-1:cmp(a,b)*m;
    }else c=cmp(val(x),val(y))*m;
    return c||(x.rarity-y.rarity)||x.name.localeCompare(y.name);
  });
}
function searchText(x){return masked(x)?(x.game+" hidden trophy"):(x.name+" "+x.game+" "+x.desc+" "+(x.note||""))}
function filtered(){
  var q=S.q.trim().toLowerCase();
  return S.items.filter(function(x){
    if(S.status==="earned"&&!x.earned)return false;
    if(S.status==="unearned"&&x.earned)return false;
    if(S.star&&!x.star)return false;
    if(S.types.size&&!S.types.has(x.type))return false;
    if(S.tiers.size&&!S.tiers.has(tierOf(x.rarity).key))return false;
    if(S.plats.size&&!platsOf(x).some(function(p){return S.plats.has(p)}))return false;
    if(S.game&&x.game!==S.game)return false;
    if(S.game&&S.gamePlatform&&yltaEdition(x)!==S.gamePlatform)return false;
    if(S.year&&!(x.earned&&x.earned.slice(0,4)===S.year))return false;
    if(S.content==="dlc"&&!x.dlc)return false;
    if(S.content==="base"&&x.dlc)return false;
    if(S.maxr!=null&&!(rarityValue(x,$("#raritySource").value)<S.maxr&&rarityValue(x,$("#raritySource").value)!=null))return false;
    if(q&&searchText(x).toLowerCase().indexOf(q)<0)return false;
    return true;
  });
}
function pointsOf(arr){return arr.reduce(function(s,x){return s+(x.earned?TYPES[x.type].pts:0)},0)}

/* ---------- small renderers ---------- */
function cup(type,on){return'<svg class="cup '+type+(on===false?" off":"")+'" aria-hidden="true"><use href="#cup"/></svg>'}
function tierBadge(p){var t=tierOf(p);return'<span class="tier t-'+t.key+'"><i></i>'+t.label+" "+fmtPct(p)+"</span>"}

function renderTally(){
  var html="";
  TYPE_ORDER.forEach(function(t){
    var n=S.items.filter(function(x){return x.type===t&&x.earned}).length;
    html+='<div class="tl">'+cup(t)+"<div><b>"+n+"</b><br><span>"+TYPES[t].label+"</span></div></div>";
  });
  var earned=S.items.filter(function(x){return x.earned}).length;
  var pct=S.items.length?Math.round(earned/S.items.length*100):0;
  if(S.profile&&S.profile.level)html+='<div class="tl sep"><div><b>Lv '+S.profile.level+'</b><br><span>PSN level</span></div></div>';
  html+='<div class="tl'+(S.profile&&S.profile.level?"":" sep")+'"><div><b>'+fmtNum(pointsOf(S.items))+"</b><br><span>Points</span></div></div>";
  html+='<div class="tl"><div><b>'+pct+"%</b><br><span>"+fmtNum(earned)+" of "+fmtNum(S.items.length)+"</span></div></div>";
  $("#tally").innerHTML=html;
  $("#banner").hidden=!S.items.some(function(x){return x.sample});
  var p=S.profile,tag="Every PlayStation trophy you have earned or still need, sorted any way you like.";
  if(p&&p.syncedAt){tag=(p.name?"Trophies of "+p.name+". ":"")+"Last import "+fmtDate(p.syncedAt)+"."}
  $("#tagline").textContent=tag;
}

var QUICK=[
 {id:"easy",label:"Easy wins",patch:{status:"unearned",sort:"rarity",dir:"desc"}},
 {id:"platt",label:"Platinum targets",patch:{status:"unearned",types:["platinum"],sort:"rarity",dir:"desc"}},
 {id:"rarest",label:"Rarest earned",patch:{status:"earned",sort:"rarity",dir:"asc"}},
 {id:"recent",label:"Recently earned",patch:{status:"earned",sort:"date",dir:"desc"}},
 {id:"plats",label:"My platinums",patch:{status:"earned",types:["platinum"],sort:"date",dir:"desc"}},
 {id:"ultra",label:"Ultra rares",patch:{tiers:["ultra"],sort:"date",dir:"desc"}},
 {id:"starred",label:"Starred",patch:{star:true,sort:"rarity",dir:"desc"}}
];
function buildChips(){
  $("#quick").insertAdjacentHTML("beforeend",QUICK.map(function(q){return'<button type="button" class="chip quick" data-quick="'+q.id+'">'+q.label+"</button>"}).join(""));
  var st=[["all","All"],["earned","Earned"],["unearned","Not earned"]];
  $("#chipStatus").insertAdjacentHTML("beforeend",st.map(function(s){return'<button type="button" class="chip" data-chip="status" data-v="'+s[0]+'" aria-pressed="false">'+s[1]+"</button>"}).join("")+'<button type="button" class="chip" data-chip="star" aria-pressed="false">★ Starred</button>');
  $("#chipType").insertAdjacentHTML("beforeend",TYPE_ORDER.map(function(t){return'<button type="button" class="chip" data-chip="type" data-v="'+t+'" aria-pressed="false">'+cup(t)+TYPES[t].label+"</button>"}).join(""));
  $("#chipTier").insertAdjacentHTML("beforeend",TIERS.map(function(t){return'<button type="button" class="chip" data-chip="tier" data-v="'+t.key+'" aria-pressed="false"><span class="t-'+t.key+'" style="font-size:10px">&#9679;</span>'+t.label+' <small class="mono" style="color:var(--muted)">'+t.short+"</small></button>"}).join(""));
}
function syncControls(){
  document.querySelectorAll("[data-chip]").forEach(function(b){
    var k=b.dataset.chip,v=b.dataset.v,on=false;
    if(k==="status")on=S.status===v;else if(k==="star")on=S.star;else if(k==="type")on=S.types.has(v);else if(k==="tier")on=S.tiers.has(v);else on=S.plats.has(v);
    b.setAttribute("aria-pressed",on?"true":"false");
  });
  $("#sort").value=S.sort;
  $("#dir").textContent=DIR_LABEL[S.sort][S.dir]+"  ↕";
  $("#group").value=S.group;$("#game").value=S.game;$("#year").value=S.year;$("#content").value=S.content;
  $("#maxr").value=S.maxr==null?"":S.maxr;
  $("#reveal").checked=S.reveal;$("#compact").checked=S.compact;$("#gsort").value=S.gsort;
  $("#list").classList.toggle("compact",S.compact);
}
function refreshOptions(){
  var gset={},yset={},pset={};
  S.items.forEach(function(x){gset[x.game]=1;if(x.earned)yset[x.earned.slice(0,4)]=1;platsOf(x).forEach(function(p){pset[p]=1})});
  var games=Object.keys(gset).sort(function(a,b){return a.localeCompare(b)});
  var years=Object.keys(yset).sort().reverse();
  var plats=["PS5","PS4","PS3","PSVITA"].filter(function(p){return pset[p]}).concat(Object.keys(pset).filter(function(p){return["PS5","PS4","PS3","PSVITA"].indexOf(p)<0}));
  if(S.game&&!gset[S.game])S.game="";
  if(S.year&&!yset[S.year])S.year="";
  S.plats.forEach(function(p){if(!pset[p])S.plats.delete(p)});
  $("#game").innerHTML='<option value="">All games</option>'+games.map(function(g){return'<option value="'+esc(g)+'">'+esc(g)+"</option>"}).join("");
  $("#year").innerHTML='<option value="">Any year</option>'+years.map(function(y){return'<option value="'+y+'">'+y+"</option>"}).join("");
  $("#gameList").innerHTML=games.length>800?"":games.map(function(g){return'<option value="'+esc(g)+'">'}).join("");
  var cp=$("#chipPlat");
  cp.querySelectorAll("[data-chip]").forEach(function(b){b.remove()});
  cp.insertAdjacentHTML("beforeend",plats.map(function(p){return'<button type="button" class="chip" data-chip="plat" data-v="'+esc(p)+'" aria-pressed="false">'+esc(platLabel(p))+"</button>"}).join(""));
  cp.hidden=!plats.length;
  syncControls();
}

function groupInfo(x){
  switch(S.group){
    case"game":return x.game;
    case"type":return TYPES[x.type].label;
    case"tier":return tierOf(x.rarity).label;
    case"month":return x.earned?monthLabel(x.earned):"Not earned yet";
    case"year":return x.earned?x.earned.slice(0,4):"Not earned yet";
    case"status":return x.earned?"Earned":"Not earned yet";
  }return"";
}
function rowHtml(x){
  var on=!!x.earned,m=masked(x);
  var badges=(x.dlc?'<span class="badge">DLC</span>':"")+(x.hidden&&!m?'<span class="badge">Secret</span>':"");
  var desc=m?"Details stay hidden until you earn it or reveal secret trophies.":x.desc;
  return'<article class="row'+(on?"":" off")+'">'+cup(x.type,on)+
    '<div><h3 class="name">'+esc(dispName(x))+badges+'</h3><p class="sub"><b>'+esc(x.game)+"</b>"+platsOf(x).map(function(p){return'<span class="badge">'+esc(platLabel(p))+"</span>"}).join("")+(desc?'<span class="desc"> · '+esc(desc)+"</span>":"")+"</p>"+(x.note?'<p class="note">'+esc(x.note)+"</p>":"")+"</div>"+
    '<div class="meta">'+rarityHtml(x)+'<span class="when">'+(on?"Earned "+esc(fmtDate(x.earned)):"Not earned")+"</span></div>"+
    '<div class="pts">'+TYPES[x.type].pts+"<small>pts</small></div>"+
    '<div class="acts"><button class="star" type="button" data-act="star" data-id="'+esc(x.id)+'" aria-pressed="'+(x.star?"true":"false")+'" aria-label="Star this trophy as a target" title="Star as a target">'+(x.star?"★":"☆")+'</button></div>'+
    "</article>";
}
function rarityHtml(x){
 var primary=appPrefs.rarity,other=primary==="psn"?"psnp":"psn",v=rarityValue(x,primary),w=rarityValue(x,other);
 var main=v==null?'<span class="tier">'+(primary==="psnp"?"PSNProfiles":"PSN")+': N/A</span>':'<span class="tier t-'+tierOf(v).key+'">'+(primary==="psnp"?"PSNProfiles":"PSN")+' · '+fmtPct(v)+'</span>';
 return main+(appPrefs.both&&w!=null?'<span class="when">'+(other==="psnp"?"PSNProfiles":"PSN")+' · '+fmtPct(w)+'</span>':"");
}
function renderList(){
  if(!S.ready)return;
  var f=sortItems(filtered());
  var earned=f.filter(function(x){return x.earned}).length;
  $("#sumline").innerHTML="<span>Showing <b>"+fmtNum(f.length)+"</b> of "+fmtNum(S.items.length)+" trophies</span><span><b>"+fmtNum(earned)+"</b> earned</span><span><b>"+fmtNum(pointsOf(f))+"</b> points earned</span>"+(f.length?'<button class="btn sm" type="button" data-act="copylist">Copy this list as CSV</button>':"");
  var el=$("#list");
  var existingGuide=$("#ylta-v15-detail");if(existingGuide)existingGuide.remove();
  if(S.game){var guidePanel=document.createElement("div");guidePanel.id="ylta-v15-detail";guidePanel.className="card";guidePanel.style.margin="12px 0";guidePanel.innerHTML="<h3>"+esc(S.game)+" — Trophy guide</h3>"+yltaGuideLinks(S.game);$("#sumline").insertAdjacentElement("afterend",guidePanel)}
  if(!S.items.length){
    el.innerHTML='<div class="empty"><h3>No trophies yet</h3><p>Import your PSN trophy collection using Import / export to start analyzing your achievements.</p><div class="actions" style="justify-content:center"><button class="btn primary" data-act="io" type="button">Sync or import</button></div></div>';
    return;
  }
  if(!f.length){
    el.innerHTML='<div class="empty"><h3>Nothing matches</h3><p>No trophy fits the current filters.</p><button class="btn" data-act="reset" type="button">Reset filters</button></div>';
    return;
  }
  var html="",shown=0,limit=S.limit;
  if(S.group==="none"){
    var part=f.slice(0,limit);shown=part.length;html=part.map(rowHtml).join("");
  }else{
    var order=[],map={};
    f.forEach(function(x){var g=groupInfo(x);if(!map[g]){map[g]=[];order.push(g)}map[g].push(x)});
    for(var gi=0;gi<order.length&&shown<limit;gi++){
      var g=order[gi],arr=map[g],e=arr.filter(function(x){return x.earned}).length;
      html+='<div class="group"><h2>'+esc(g)+"</h2><span>"+e+" of "+arr.length+" earned</span></div>";
      var take=arr.slice(0,limit-shown);shown+=take.length;html+=take.map(rowHtml).join("");
    }
  }
  if(shown<f.length){
    var left=f.length-shown;
    html+='<div class="more"><button class="btn" type="button" data-act="more">Show '+Math.min(PAGE,left)+' more</button>'+(left>PAGE?'<button class="btn" type="button" data-act="all">Show all '+fmtNum(left)+' remaining</button>':"")+"</div>";
  }
  el.innerHTML=html;
}
function refilter(){S.limit=PAGE;renderList()}

/* ---------- charts ---------- */
function barsSvg(values,labels,o){
  var W=o.W||640,H=o.H||200,pl=30,pr=8,pt=16,pb=28,iw=W-pl-pr,ih=H-pt-pb,n=values.length,cw=iw/n,bw=cw*0.62;
  var max=Math.max.apply(null,values),top=Math.max(4,Math.ceil(max/4)*4);
  var svg='<svg viewBox="0 0 '+W+" "+H+'" role="img" aria-label="'+esc(o.aria)+'">';
  [0,top/2,top].forEach(function(t){var y=pt+ih-(t/top)*ih;svg+='<line class="grid" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'"/><text x="'+(pl-6)+'" y="'+(y+3)+'" text-anchor="end">'+t+"</text>"});
  values.forEach(function(v,i){
    var x=pl+i*cw+(cw-bw)/2,h=(v/top)*ih,y=pt+ih-h;
    if(v>0){svg+='<rect class="barfill" x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" rx="2"><title>'+esc(labels[i])+": "+v+"</title></rect>";if(o.vals)svg+='<text class="val" x="'+(x+bw/2)+'" y="'+(y-4)+'" text-anchor="middle">'+v+"</text>"}
    if(!o.every||i%o.every===0)svg+='<text x="'+(x+bw/2)+'" y="'+(H-pb+15)+'" text-anchor="middle">'+esc(labels[i])+"</text>";
  });
  return svg+"</svg>";
}
var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function monthlyChart(){
  var now=new Date(),ms=[];
  for(var i=11;i>=0;i--){var d=new Date(now.getFullYear(),now.getMonth()-i,1);ms.push({key:d.getFullYear()+"-"+pad(d.getMonth()+1),m:d.getMonth(),y:d.getFullYear(),n:0})}
  S.items.forEach(function(x){if(!x.earned)return;var k=x.earned.slice(0,7);ms.forEach(function(m){if(m.key===k)m.n++})});
  return barsSvg(ms.map(function(m){return m.n}),ms.map(function(m,i){return MON[m.m]+((i===0||m.m===0)?" ’"+String(m.y).slice(2):"")}),{vals:true,aria:"Trophies earned per month over the last 12 months"});
}
function dayCounts(){var c={};S.items.forEach(function(x){if(x.earned){var k=x.earned.slice(0,10);c[k]=(c[k]||0)+1}});return c}
function heatmap(counts){
  var t=new Date(),today=new Date(t.getFullYear(),t.getMonth(),t.getDate());
  var start=new Date(today.getFullYear(),today.getMonth(),today.getDate()-today.getDay()-52*7);
  var cell=11,step=13,pl=26,pt=16,W=pl+53*step+4,H=pt+7*step+2;
  var svg='<svg viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Trophies earned per day over the last year">',lastM=-1,lastX=-99;
  [1,3,5].forEach(function(d){svg+='<text x="0" y="'+(pt+d*step+9)+'">'+["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]+"</text>"});
  for(var w=0;w<53;w++){for(var d=0;d<7;d++){
    var day=new Date(start.getFullYear(),start.getMonth(),start.getDate()+w*7+d);
    if(day>today)continue;
    var key=day.getFullYear()+"-"+pad(day.getMonth()+1)+"-"+pad(day.getDate());
    var n=counts[key]||0,lvl=n===0?0:n===1?1:n<=3?2:n<=6?3:4,x=pl+w*step;
    if(d===0&&day.getMonth()!==lastM){if(x-lastX>=30&&(w>0||day.getDate()<=7)){svg+='<text x="'+x+'" y="10">'+MON[day.getMonth()]+"</text>";lastX=x}lastM=day.getMonth()}
    svg+='<rect class="hm'+lvl+'" x="'+x+'" y="'+(pt+d*step)+'" width="'+cell+'" height="'+cell+'" rx="2"><title>'+day.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"})+": "+n+" trophy"+(n===1?"":"s")+"</title></rect>";
  }}
  return svg+"</svg>";
}
function streakInfo(counts){
  var keys=Object.keys(counts).sort();
  function num(k){var p=k.split("-");return Date.UTC(+p[0],+p[1]-1,+p[2])/86400000}
  var best=0,run=0,prev=null,bestEnd=null,bestDay=null,bestN=0;
  keys.forEach(function(k){var n=num(k);run=(prev!==null&&n-prev===1)?run+1:1;prev=n;if(run>best){best=run;bestEnd=k}if(counts[k]>bestN){bestN=counts[k];bestDay=k}});
  var cur=0;
  if(keys.length){
    var t=new Date(),tn=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())/86400000;
    if(tn-num(keys[keys.length-1])<=1){cur=1;for(var i=keys.length-2;i>=0;i--){if(num(keys[i+1])-num(keys[i])===1)cur++;else break}}
  }
  return{best:best,bestEnd:bestEnd,cur:cur,bestDay:bestDay,bestN:bestN,days:keys.length};
}
function dayStr(k){var p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}

/* ---------- stats ---------- */
function barRow(label,iconHtml,colorVar,earned,total){
  var w=total?Math.round(earned/total*100):0;
  return'<div class="brow"><div class="l">'+iconHtml+"<span>"+esc(label)+'</span></div><div class="track" style="color:var('+colorVar+')"><i style="width:'+w+'%"></i></div><div class="n"><span class="v16-ratio">'+fmtNum(earned)+" / "+fmtNum(total)+"</span></div></div>";
}
function miniRow(x,sub){
  return'<div class="mrow">'+cup(x.type,!!x.earned)+"<p>"+esc(dispName(x))+'<br><span class="s">'+esc(x.game)+(sub?" · "+esc(sub):"")+'</span></p><span class="tier t-'+tierOf(x.rarity).key+'">'+fmtPct(x.rarity)+"</span></div>";
}
function kv(k,v){return'<div class="kv"><span>'+k+"</span><b>"+v+"</b></div>"}
var MILESTONES=[10,25,50,100,250,500,1000,2500,5000,10000,25000];
function yltaEdition(x){var p=platsOf(x);return p.length===1?p[0]:p.length?p.slice().sort().join(" / "):"UNKNOWN"}
function yltaPlatformClass(p){return p==="PS5"?"ps5":p==="PS4"?"ps4":p==="PS3"?"ps3":p==="PSVITA"?"vita":"other"}
function yltaPlatformBadge(p){var label=p==="UNKNOWN"?"Platform unknown":platLabel(p);return '<span class="ylta-platform-badge ylta-platform-'+yltaPlatformClass(p)+'">'+esc(label)+'</span>'}
function gameStats(){
  var map=new Map();
  S.items.forEach(function(x){
    var platform=yltaEdition(x),key=JSON.stringify([x.game,platform]);
    if(!map.has(key))map.set(key,{name:x.game,platform:platform,arr:[]});
    map.get(key).arr.push(x);
  });
  return Array.from(map.values()).map(function(g){
    var arr=g.arr,e=arr.filter(function(x){return x.earned});
    var last=e.length?e.reduce(function(a,x){return x.earned>a?x.earned:a},""):"";
    return{name:g.name,platform:g.platform,arr:arr,earned:e,left:arr.length-e.length,last:last,pct:Math.round(e.length/arr.length*100),
      plats:g.platform==="UNKNOWN"?[]:[g.platform],plat:arr.some(function(x){return x.type==="platinum"&&x.earned})};
  });
}
/* Collapsible overview remembers selections without changing trophy data. */
var FOLD_KEY="ylta.dashboard.folds.v1";
function foldPrefs(){try{return JSON.parse(localStorage.getItem(FOLD_KEY)||"{}")||{}}catch(e){return{}}}
function foldOpen(id){return foldPrefs()[id]===false?"":" open"}
function foldBlock(id,title,icon,sub,body){
 return '<details class="dash-fold" data-ylta-fold="'+id+'"'+foldOpen(id)+'><summary><span class="dash-heading"><span class="dash-heading-icon" aria-hidden="true">'+icon+'</span><span>'+title+'</span></span><span style="display:flex;gap:16px;align-items:center;min-width:0"><span class="dash-subtitle">'+sub+'</span><i class="dash-chevron" aria-hidden="true"></i></span></summary><div class="dash-fold-content">'+body+'</div></details>';
}
function renderDashboard(){
 var data=S.items.filter(function(x){return !x.sample}), earned=data.filter(function(x){return x.earned}),total=data.length,completed=total?Math.round(1000*earned.length/total)/10:0;
 var pl=earned.filter(function(x){return x.type==="platinum"}).length,gameMap={};
 data.forEach(function(x){var g=gameMap[x.game]||(gameMap[x.game]={name:x.game,total:0,earned:0,plat:false});g.total++;if(x.earned){g.earned++;if(x.type==="platinum")g.plat=true}});
 var games=Object.values(gameMap),remaining=data.filter(function(x){return !x.earned}),recent=earned.slice().sort(function(a,b){return String(b.earned).localeCompare(String(a.earned))}).slice(0,5);
 var next=remaining.filter(function(x){return x.star}).sort(function(a,b){return (a.rarity||100)-(b.rarity||100)}).slice(0,5);
 var best=games.slice().sort(function(a,b){return b.earned/b.total-a.earned/a.total}).slice(0,5);
 // One shared welcome panel; keep its collection summary current after every import.
 var heroScore=$("#launchCompletion"),heroProgress=$("#launchProgress");
 if(heroScore)heroScore.textContent=total?completed+"%":"—";
 if($("#launchCompletionLabel"))$("#launchCompletionLabel").textContent=total?"Collection completion":"Your collection starts here";
 if($("#launchCollectionCount"))$("#launchCollectionCount").textContent=total?fmtNum(earned.length)+" of "+fmtNum(total)+" trophies earned":"Import your trophies to see your progress.";
 if(heroProgress){heroProgress.setAttribute("aria-valuenow",String(completed));heroProgress.setAttribute("aria-valuetext",total?completed+"% complete":"No collection imported");heroProgress.querySelector("i").style.width=completed+"%";}
 if($("#launchImportButton"))$("#launchImportButton").textContent=total?"Update my collection":"Import my trophies";
 if($("#launchDescription"))$("#launchDescription").textContent=total?"Explore your progress, choose your next goal and turn your collection into a hunter card.":"Turn your PlayStation trophies into personal stats, goals and shareable hunter cards. Get started on your phone or PC.";
 var h='';
 var kpis='';
 kpis+='<div class="dash-kpis"><div class="tile"><span>Platinum trophies</span><b>'+fmtNum(pl)+'</b><small>Earned</small></div><div class="tile"><span>All trophies</span><b>'+fmtNum(earned.length)+'</b><small>of '+fmtNum(total)+' tracked</small></div><div class="tile"><span>Games</span><b>'+fmtNum(games.length)+'</b><small>In your collection</small></div><div class="tile"><span>Still to earn</span><b>'+fmtNum(remaining.length)+'</b><small>Keep hunting</small></div></div>';
 h+=foldBlock('overview','Trophy overview','🏆','Your platinum, trophy and game totals',kpis);
 function items(rows,sub){return rows.length?rows.map(function(x){return '<div class="dash-entry"><span class="dot"></span><div><b>'+esc(x.name||x.game)+'</b><small>'+esc(sub(x))+'</small></div></div>'}).join(''):'<p class="hint">Nothing here yet. Import your trophies to get started.</p>'}
 var insight='<div class="dash-columns"><div class="card"><h2>★ Your next targets</h2>'+items(next,function(x){return x.game+' · PSN '+fmtPct(x.rarity)})+'</div><div class="card"><h2>Recently earned</h2>'+items(recent,function(x){return x.game+' · '+fmtDate(x.earned,false)})+'</div><div class="card"><h2>Top game progress</h2>'+items(best,function(x){return x.earned+' / '+x.total+' trophies · '+Math.round(100*x.earned/x.total)+'%'})+'</div></div>';
 h+=foldBlock('insights','Targets and activity','◈','Your next goals, recently earned and game progress',insight);

 if(S.goals.length){
   var snap=trophySnapshot(),upcoming=S.goals.filter(function(g){return !goalComplete(g,snap)}).slice(0,3),achieved=unlockedBadges(snap);
   var goalHtml='<div class="dash-goal-list">'+(upcoming.length?upcoming.map(function(g){var progress=goalProgress(g,snap);return '<div class="dash-goal-item"><div><strong>'+esc(g.title)+'</strong><small>'+esc(progress.label)+'</small></div><div class="goal-progress-track"><i style="width:'+progress.pct+'%"></i></div></div>'}).join(''):'<p class="hint">All current goals complete — create another challenge!</p>')+'</div><div class="actions" style="margin-top:12px"><button type="button" class="btn sm" id="goalsDashboardView">Open goals · '+S.goals.length+'</button><span class="hint">'+achieved.length+' / '+BADGE_RULES.length+' milestone badges unlocked</span></div>';
   h+=foldBlock('smartgoals','Goals & milestones','◎','Your active challenges and earned badges',goalHtml);
 }
 h='<div class="dash-section-tools"><strong>Dashboard sections</strong><div class="actions"><button class="btn sm" type="button" data-fold-all="close">Collapse all</button><button class="btn sm" type="button" data-fold-all="open">Expand all</button></div></div>'+h;
 if(S.items.some(function(x){return x.sample}))h+='<p class="hint">Demo trophies are excluded from the overview.</p>';
 $("#dashboardBody").innerHTML=h;
 if(window.yltaEnhanceDashboard)window.yltaEnhanceDashboard($("#dashboardBody"));
}
function renderStats(){
  var it=S.items,earned=it.filter(function(x){return x.earned});
  var host=$("#view-stats");
  if(!it.length){host.innerHTML='<div class="empty"><h3>No stats yet</h3><p>Stats appear once you have trophies in the ledger.</p></div>';return}
  var totalPts=it.reduce(function(s,x){return s+TYPES[x.type].pts},0),pts=pointsOf(it);
  var pct=Math.round(earned.length/it.length*1000)/10;
  var avg=earned.length?earned.reduce(function(s,x){return s+x.rarity},0)/earned.length:null;
  var next=MILESTONES.filter(function(m){return m>earned.length})[0];
  var h='<div class="tiles">'+
    '<div class="tile"><b>'+pct+'%</b><span>Complete</span></div>'+
    '<div class="tile"><b>'+fmtNum(earned.length)+" / "+fmtNum(it.length)+'</b><span>Trophies earned</span></div>'+
    '<div class="tile"><b>'+fmtNum(pts)+'</b><span>of '+fmtNum(totalPts)+' points</span></div>'+
    '<div class="tile"><b>'+(avg==null?"None":fmtPct(avg))+'</b><span>Average rarity earned</span></div>'+
    '<div class="tile"><b>'+(next?fmtNum(next-earned.length):"All")+'</b><span>'+(next?"to "+fmtNum(next)+" trophies":"milestones passed")+"</span></div></div>";
  h+='<div class="stats-board" id="statsBoard" aria-label="Customizable analytics cards">';
  h+='<div class="card"><h2>By type</h2>'+TYPE_ORDER.map(function(t){
    var all=it.filter(function(x){return x.type===t});
    return barRow(TYPES[t].label,cup(t),"--"+t,all.filter(function(x){return x.earned}).length,all.length);
  }).join("")+"</div>";
  var tc={ultra:"--t-ultra",very:"--t-very",rare:"--t-rare",common:"--t-common"};
  h+='<div class="card"><h2>By rarity</h2>'+TIERS.map(function(t){
    var all=it.filter(function(x){return tierOf(x.rarity).key===t.key});
    return barRow(t.label,"",tc[t.key],all.filter(function(x){return x.earned}).length,all.length);
  }).join("")+'</div>';
  var pm={};it.forEach(function(x){platsOf(x).forEach(function(p){var o=pm[p]=pm[p]||{e:0,t:0};o.t++;if(x.earned)o.e++})});
  var pk=Object.keys(pm);
  if(pk.length)h+='<div class="card"><h2>By platform</h2>'+pk.map(function(p){return barRow(platLabel(p),"","--accent",pm[p].e,pm[p].t)}).join("")+"</div>";
  var dc=it.filter(function(x){return x.dlc});
  if(dc.length)h+='<div class="card"><h2>Base game and DLC</h2>'+barRow("Base game","","--accent",it.filter(function(x){return!x.dlc&&x.earned}).length,it.length-dc.length)+barRow("DLC","","--t-very",dc.filter(function(x){return x.earned}).length,dc.length)+"</div>";
  var counts=dayCounts(),sk=streakInfo(counts);
  h+='<div class="card wide"><h2>Earned per day, last year</h2><div class="chartbox heat">'+heatmap(counts)+'</div><p class="hint">Darker squares mean more trophies that day. Hover a square for the date. Trophies imported with a date only count as that day.</p></div>';
  h+='<div class="card wide"><h2>Earned per month</h2><div class="chartbox">'+monthlyChart()+"</div></div>";
  var wd=[0,0,0,0,0,0,0],hr=[];for(var i=0;i<24;i++)hr.push(0);var timed=0;
  earned.forEach(function(x){var d=new Date(x.earned);if(isNaN(d))return;wd[(d.getDay()+6)%7]++;if(!/T00:00$/.test(x.earned)){hr[d.getHours()]++;timed++}});
  h+='<div class="card"><h2>By weekday</h2><div class="chartbox">'+barsSvg(wd,["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],{W:420,H:180,vals:true,aria:"Trophies earned by weekday"})+"</div></div>";
  h+='<div class="card"><h2>By hour of day</h2><div class="chartbox">'+(timed?barsSvg(hr,hr.map(function(v,i){return pad(i)}),{W:420,H:180,every:3,aria:"Trophies earned by hour of day"}):'<p class="hint">Needs trophies with a time of day.</p>')+"</div></div>";
  h+='<div class="card"><h2>Records</h2>'+
    kv("Longest streak",sk.best?sk.best+" day"+(sk.best===1?"":"s")+(sk.bestEnd?" ending "+dayStr(sk.bestEnd):""):"None")+
    kv("Current streak",sk.cur+" day"+(sk.cur===1?"":"s"))+
    kv("Best day",sk.bestDay?sk.bestN+" trophy"+(sk.bestN===1?"":"s")+" on "+dayStr(sk.bestDay):"None")+
    kv("Days with a trophy",fmtNum(sk.days))+
    (earned.length?kv("First trophy",esc(fmtDate(earned.reduce(function(a,x){return x.earned<a.earned?x:a}).earned,false))):"")+"</div>";
  var allGames=gameStats(),completedGames=allGames.filter(function(g){return g.pct===100}),inProgressGames=allGames.filter(function(g){return g.left>0&&g.earned.length>0}),untouchedGames=allGames.filter(function(g){return g.earned.length===0});
  var favDayIndex=wd.indexOf(Math.max.apply(null,wd)),favDay=wd.some(function(v){return v>0})?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][favDayIndex]:"—";
  var favHourIndex=hr.indexOf(Math.max.apply(null,hr)),favHour=timed?pad(favHourIndex)+":00":"—";
  var avgPerGame=allGames.length?(earned.length/allGames.length).toFixed(1):"0.0";
  var avgPerActiveDay=sk.days?(earned.length/sk.days).toFixed(1):"0.0";
  h+='<div class="card"><h2>Collection breakdown</h2>'+
    kv("Completed games",fmtNum(completedGames.length))+
    kv("Games in progress",fmtNum(inProgressGames.length))+
    kv("Untouched games",fmtNum(untouchedGames.length))+
    kv("Games with platinum",fmtNum(allGames.filter(function(g){return g.plat}).length))+
    kv("Average trophies per game",avgPerGame)+"</div>";
  h+='<div class="card"><h2>Activity highlights</h2>'+
    kv("Favorite weekday",favDay)+
    (timed?kv("Favorite hour",favHour):"")+
    kv("Average per active day",avgPerActiveDay)+
    kv("Latest trophy",earned.length?esc(fmtDate(earned.slice().sort(function(a,b){return cmp(b.earned,a.earned)})[0].earned,false)):"—")+
    kv("Active years",fmtNum(new Set(earned.filter(function(x){return x.earned}).map(function(x){return x.earned.slice(0,4)})).size))+"</div>";
  var plat=earned.filter(function(x){return x.type==="platinum"}).sort(function(a,b){return cmp(b.earned,a.earned)});
  h+='<div class="card"><h2>Platinum shelf</h2><div class="mini">'+(plat.length?plat.map(function(x){return miniRow(x,fmtDate(x.earned,false))}).join(""):'<p class="hint">No platinum earned yet.</p>')+"</div></div>";
  var easy=it.filter(function(x){return!x.earned}).sort(function(a,b){return b.rarity-a.rarity}).slice(0,6);
  h+='<div class="card"><h2>Easiest to earn next</h2><div class="mini">'+(easy.length?easy.map(function(x){return miniRow(x,"")}).join(""):'<p class="hint">Everything is earned.</p>')+"</div></div>";
  var close=gameStats().filter(function(g){return g.left>0&&g.earned.length>0}).sort(function(a,b){return a.left-b.left||b.arr.length-a.arr.length}).slice(0,6);
  h+='<div class="card"><h2>Closest to finishing</h2><div class="mini">'+(close.length?close.map(function(g){return'<div class="mrow">'+cup(g.plat?"platinum":"bronze")+'<p>'+esc(g.name)+'<br><span class="s">'+g.earned.length+" of "+g.arr.length+' earned</span></p><span class="tier t-rare">'+g.left+" left</span></div>"}).join(""):'<p class="hint">Nothing in progress.</p>')+"</div></div>";
  var rarest=earned.slice().sort(function(a,b){return a.rarity-b.rarity}).slice(0,6);
  h+='<div class="card"><h2>Rarest earned</h2><div class="mini">'+(rarest.length?rarest.map(function(x){return miniRow(x,fmtDate(x.earned,false))}).join(""):'<p class="hint">Nothing earned yet.</p>')+"</div></div>";
  var latest=earned.slice().sort(function(a,b){return cmp(b.earned,a.earned)}).slice(0,6);
  h+='<div class="card"><h2>Latest earned</h2><div class="mini">'+(latest.length?latest.map(function(x){return miniRow(x,fmtDate(x.earned))}).join(""):'<p class="hint">Nothing earned yet.</p>')+"</div></div>";
  h+="</div>";
  host.innerHTML=h;
  if(window.yltaEnhanceStats)window.yltaEnhanceStats(host);
}


/* v15 guide metadata: browser-local verified entries, no speculative scraping */
var YLTA_V15_KEY="ylta.guideMetadata.v15";
function yltaGuideRead(){try{return JSON.parse(localStorage.getItem(YLTA_V15_KEY)||"{}")||{}}catch(e){return {}}}
function yltaGuideSave(data){try{localStorage.setItem(YLTA_V15_KEY,JSON.stringify(data));return true}catch(e){alert("Unable to save guide metadata.");return false}}
function yltaGuideSearch(name,kind){
 var q=(kind==="psn"?"site:psnprofiles.com/trophies/ ":kind==="psnguide"?"site:psnprofiles.com/guide/ ":kind==="powerpyx"?"site:powerpyx.com ":"site:playstationtrophies.org ")+name+(kind==="psn"?"":" trophy guide");
 return "https://www.google.com/search?q="+encodeURIComponent(q);
}
function yltaGuideLinks(name){
 var d=yltaGuideRead()[name]||{},types=[["psn","PSNProfiles"],["psnguide","PSNP guide"],["powerpyx","PowerPyx"],["pst","PS Trophies"]];
 return '<div class="ylta-v15-resource">'+types.map(function(t){return '<a class="btn sm" href="'+esc(d[t[0]]||yltaGuideSearch(name,t[0]))+'" target="_blank" rel="noopener noreferrer">'+esc(t[1])+(d[t[0]]?" ✓":" ↗")+'</a>'}).join("")+'<button type="button" class="btn sm" data-act="v15edit" data-game="'+esc(name)+'">Edit guide data</button></div>';
}

function yltaGuideEdit(name){
 var all=yltaGuideRead(),d=Object.assign({},all[name]||{});
 var fields=[["psn","Direct PSNProfiles trophy URL"],["psnguide","Direct PSNProfiles guide URL"],["powerpyx","Direct PowerPyx guide URL"],["pst","Direct PlayStationTrophies guide URL"]];
 var domains={psn:"psnprofiles.com",psnguide:"psnprofiles.com",powerpyx:"powerpyx.com",pst:"playstationtrophies.org"};
 for(var i=0;i<fields.length;i++){
  var k=fields[i][0],v=prompt(name+" — "+fields[i][1]+"\nLeave blank if unknown. Cancel discards all changes.",d[k]==null?"":String(d[k]));
  if(v===null)return;v=v.trim();
  if(k==="difficulty"&&v&&(isNaN(Number(v))||Number(v)<0||Number(v)>10)){alert("Difficulty must be 0–10.");return}
  if(domains[k]&&v){try{var u=new URL(v),host=domains[k];if(u.protocol!=="https:"||(u.hostname!==host&&!u.hostname.endsWith("."+host)))throw Error();v=u.href}catch(e){alert("Use a valid HTTPS URL from "+domains[k]);return}}
  if(v)d[k]=k==="difficulty"?Number(v):v;else delete d[k];
 }
 if(Object.keys(d).length)all[name]=d;else delete all[name];
 if(yltaGuideSave(all)){renderGames();renderList();flash("Guide metadata saved for "+name)}
}

/* ---------- games ---------- */
function renderGames(){
  var gs=gameStats(),body=$("#gamesBody");
  if(!gs.length){body.innerHTML='<div class="empty"><h3>No games yet</h3><p>Games appear once you have trophies in the ledger.</p></div>';return}
  var by={recent:function(a,b){return cmp(b.last,a.last)||a.name.localeCompare(b.name)},pct:function(a,b){return b.pct-a.pct||a.name.localeCompare(b.name)},
    left:function(a,b){return(a.left===0)-(b.left===0)||a.left-b.left||a.name.localeCompare(b.name)},size:function(a,b){return b.arr.length-a.arr.length||a.name.localeCompare(b.name)},name:function(a,b){return a.name.localeCompare(b.name)}};
  gs.sort(by[S.gsort]);
  var shown=gs.slice(0,S.glimit);
  body.innerHTML='<p class="hint" style="margin:0 0 12px">'+fmtNum(gs.length)+" games, "+gs.filter(function(g){return g.pct===100}).length+' completed.</p><div class="grid2">'+shown.map(function(g){
    var rar=g.earned.slice().sort(function(a,b){return a.rarity-b.rarity})[0];
    return'<article class="gcard'+(g.pct===100?" done":"")+'"><div class="ghead"><h3>'+esc(g.name)+'</h3><span class="mono">'+g.earned.length+" / "+g.arr.length+" · "+g.pct+'%</span></div>'+
      '<div class="track"><i style="width:'+g.pct+'%"></i></div>'+
      '<div class="gtypes">'+TYPE_ORDER.map(function(t){
        var all=g.arr.filter(function(x){return x.type===t});if(!all.length)return"";
        return"<span>"+cup(t)+all.filter(function(x){return x.earned}).length+"/"+all.length+"</span>";
      }).join("")+(g.plat?'<span style="color:var(--platinum)">Platinum earned</span>':"")+yltaPlatformBadge(g.platform)+"</div>"+
      '<p class="hint">'+(g.left?g.left+" left. ":"Complete. ")+(rar?"Rarest earned: <b style=\"color:var(--fg);font-weight:500\">"+esc(dispName(rar))+"</b> ("+fmtPct(rar.rarity)+")":"No trophies earned yet")+(g.last?". Last earned "+esc(fmtDate(g.last,false)):"")+".</p>"+
      yltaGuideLinks(g.name)+'<div class="actions"><button class="btn sm" type="button" data-act="viewgame" data-game="'+esc(g.name)+'" data-platform="'+esc(g.platform)+'">View trophies</button></div></article>';
  }).join("")+"</div>"+(shown.length<gs.length?'<div class="more"><button class="btn" type="button" data-act="gmore">Show '+Math.min(GPAGE,gs.length-shown.length)+" more games</button></div>":"");
}

/* ---------- tabs ---------- */
function setTab(t){
  S.tab=t;
  if($("#launchIntro"))$("#launchIntro").hidden=t!=="dashboard";
  ["dashboard","trophies","stats","games","goals"].forEach(function(k){
    $("#view-"+k).hidden=k!==t;
    $("#tab-"+k).setAttribute("aria-selected",k===t?"true":"false");
  });
  if(!S.ready)return;
  if(t==="dashboard")renderDashboard();
  if(t==="stats")renderStats();
  if(t==="games")renderGames();
  if(t==="trophies")renderList();
  if(t==="goals")renderGoals();
}
function renderAll(){renderTally();refreshOptions();setTab(S.tab)}
function flash(msg){var m=$("#msg");m.textContent=msg;clearTimeout(flash.t);flash.t=setTimeout(function(){m.textContent=""},4500)}


/* ---------- Goals: manual checklists and smart targets from imported trophy data ---------- */
var SMART_TYPES={manual:{label:"Checklist",unit:"checklist steps"},trophies:{label:"Trophies earned",unit:"trophies"},platinums:{label:"Platinums earned",unit:"platinums"},games_completed:{label:"Completed games",unit:"games completed"},completion:{label:"Overall completion",unit:"% completion"},game_completion:{label:"Game completion",unit:"% of game"}};
var goalBadgeFilter="all";
function normalizeGoals(input){
  if(!Array.isArray(input))return [];
  var ids=new Set();
  return input.slice(0,200).map(function(g,i){
    if(!g||typeof g!=="object"||typeof g.title!=="string"||!g.title.trim())return null;
    var id=/^g[a-zA-Z0-9_-]{4,50}$/.test(String(g.id||""))?g.id:"g"+Date.now().toString(36)+"x"+i;
    if(ids.has(id))id="g"+Date.now().toString(36)+"xx"+i;
    ids.add(id);
    var tasks=Array.isArray(g.tasks)?g.tasks:[],kind=Object.prototype.hasOwnProperty.call(SMART_TYPES,g.kind)?g.kind:"manual";
    var target=Math.floor(Number(g.target));if(!Number.isFinite(target)||target<1)target=kind==="completion"||kind==="game_completion"?100:1;
    target=Math.min(target,(kind==="completion"||kind==="game_completion")?100:100000);
    return{id:id,title:g.title.trim().slice(0,100),game:String(g.game||"").slice(0,120),kind:kind,target:target,
      due:/^\d{4}-\d{2}-\d{2}$/.test(String(g.due||""))?g.due:"",notes:String(g.notes||"").slice(0,600),createdAt:String(g.createdAt||new Date().toISOString()).slice(0,40),
      tasks:tasks.slice(0,100).map(function(t,j){return t&&typeof t.text==="string"&&t.text.trim()?{id:/^s[a-zA-Z0-9_-]{4,50}$/.test(String(t.id||""))?t.id:"s"+i+j+Date.now().toString(36),text:t.text.trim().slice(0,180),done:!!t.done}:null}).filter(Boolean)};
  }).filter(Boolean);
}
function goalId(){return "g"+Date.now().toString(36)+Math.random().toString(36).slice(2,9)}
function goalTaskId(){return "s"+Date.now().toString(36)+Math.random().toString(36).slice(2,9)}
function realTrophies(){return S.items.filter(function(x){return !x.sample})}
function trophySnapshot(){
  var items=realTrophies(),earned=items.filter(function(x){return !!x.earned}),map=new Map();
  items.forEach(function(x){var k=x.game.toLowerCase();if(!map.has(k))map.set(k,{name:x.game,total:0,earned:0});var g=map.get(k);g.total++;if(x.earned)g.earned++});
  var completed=0;map.forEach(function(g){if(g.total&&g.earned===g.total)completed++});
  return{items:items,earned:earned,trophies:earned.length,platinums:earned.filter(function(x){return x.type==="platinum"}).length,completedGames:completed,completion:items.length?100*earned.length/items.length:0,games:map,ultraRare:earned.filter(function(x){return Number.isFinite(x.rarity)&&x.rarity<=5}).length};
}
function goalProgress(g,snap){
  var kind=g.kind||"manual";
  if(kind==="manual"){
    var done=g.tasks.filter(function(t){return t.done}).length;
    return{done:done,total:g.tasks.length,pct:g.tasks.length?Math.round(100*done/g.tasks.length):0,label:done+" of "+g.tasks.length+" checklist steps",complete:g.tasks.length>0&&done===g.tasks.length};
  }
  snap=snap||trophySnapshot();
  var target=Math.max(1,Number(g.target)||1),value=0,unit=SMART_TYPES[kind]?SMART_TYPES[kind].unit:"trophies",missing=false;
  if(kind==="trophies")value=snap.earned.length;
  else if(kind==="platinums")value=snap.platinums;
  else if(kind==="games_completed")value=snap.completedGames;
  else if(kind==="completion")value=snap.completion;
  else if(kind==="game_completion"){
    var item=snap.games.get(String(g.game||"").toLowerCase());
    value=item&&item.total?100*item.earned/item.total:0;
    missing=!item;
  }
  value=Math.max(0,Number(value)||0);
  var displayValue=Math.round(value*10)/10;
  return{done:value,total:target,pct:Math.min(100,Math.floor(value/target*100)),label:unit.startsWith("%")?displayValue+"% / "+target+"% "+(kind==="game_completion"?"game completion":"overall completion"):displayValue+" / "+target+" "+unit,complete:!missing&&value>=target,missing:missing};
}
function goalComplete(g,snap){return goalProgress(g,snap).complete}
var BADGE_RULES=[
 {id:"first-trophy",icon:"🏆",name:"First Victory",desc:"Earn your first trophy",metric:"trophies",threshold:1},
 {id:"trophy100",icon:"🥉",name:"Century Club",desc:"Earn 100 trophies",metric:"trophies",threshold:100},
 {id:"trophy1000",icon:"⭐",name:"Trophy Legend",desc:"Earn 1,000 trophies",metric:"trophies",threshold:1000},
 {id:"plat1",icon:"💎",name:"First Platinum",desc:"Earn a platinum trophy",metric:"platinums",threshold:1},
 {id:"plat10",icon:"👑",name:"Platinum Hunter",desc:"Earn 10 platinum trophies",metric:"platinums",threshold:10},
 {id:"plat25",icon:"✨",name:"Platinum Master",desc:"Earn 25 platinum trophies",metric:"platinums",threshold:25},
 {id:"games1",icon:"🎮",name:"First 100%",desc:"Complete every trophy in one game",metric:"completedGames",threshold:1},
 {id:"games10",icon:"🏅",name:"Completionist",desc:"Complete 10 games",metric:"completedGames",threshold:10},
 {id:"rare1",icon:"🌠",name:"Rare Find",desc:"Earn a PSN ultra-rare trophy (≤5%)",metric:"ultraRare",threshold:1},
 {id:"rare10",icon:"🌌",name:"Ultra-Rare Hunter",desc:"Earn 10 PSN ultra-rare trophies",metric:"ultraRare",threshold:10},
 {id:"half",icon:"📊",name:"Halfway There",desc:"Reach 50% collection completion",metric:"completion",threshold:50},
 {id:"all",icon:"🚀",name:"The Final Trophy",desc:"Reach 100% collection completion",metric:"completion",threshold:100}
];
function unlockedBadges(snap){return BADGE_RULES.filter(function(b){return snap.items.length&&(snap[b.metric]||0)>=b.threshold})}
function renderBadges(snap){
  snap=snap||trophySnapshot();
  var earnedBadges=unlockedBadges(snap),host=$("#badgeGrid");
  $("#badgeSubtitle").textContent=earnedBadges.length+" / "+BADGE_RULES.length+" unlocked · calculated from imported trophies";
  document.querySelectorAll("[data-badge-filter]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.badgeFilter===goalBadgeFilter))});
  var visible=BADGE_RULES.filter(function(b){var yes=snap.items.length&&(snap[b.metric]||0)>=b.threshold;return goalBadgeFilter==="all"||(goalBadgeFilter==="unlocked"?yes:!yes)});
  host.innerHTML=visible.length?visible.map(function(b){
    var value=snap.items.length?(snap[b.metric]||0):0,done=value>=b.threshold&&snap.items.length,pct=Math.min(100,Math.floor(value/b.threshold*100));
    return '<article class="achievement '+(done?'unlocked':'locked')+'"><div class="badge-symbol" aria-hidden="true">'+b.icon+'</div><h4>'+esc(b.name)+'</h4><p>'+esc(b.desc)+'</p><div class="badge-mini-track" aria-hidden="true"><i style="width:'+pct+'%"></i></div><span class="badge-count">'+Math.min(value,b.threshold)+' / '+b.threshold+(b.metric==="completion"?'%':'')+'</span><span class="badge-state">'+(done?'✓ Unlocked':'○ Locked')+'</span></article>';
  }).join(''):'<p class="hint">No badges in this view yet.</p>';
}
function renderGoals(){
  var host=$("#goalsList");if(!host)return;
  var snap=trophySnapshot(),goals=S.goals||[],finished=goals.filter(function(g){return goalComplete(g,snap)}),active=goals.filter(function(g){return !goalComplete(g,snap)}),steps=goals.reduce(function(a,g){return a+g.tasks.length},0),checked=goals.reduce(function(a,g){return a+g.tasks.filter(function(t){return t.done}).length},0);
  $("#goalMetrics").innerHTML='<div class="goal-metric"><b>'+active.length+'</b><span>Goals in progress</span></div><div class="goal-metric"><b>'+finished.length+'</b><span>Completed goals</span></div><div class="goal-metric"><b>'+checked+' / '+steps+'</b><span>Checklist steps done</span></div><div class="goal-metric"><b>'+unlockedBadges(snap).length+' / '+BADGE_RULES.length+'</b><span>Milestones earned</span></div>';
  renderBadges(snap);
  document.querySelectorAll("[data-goal-filter]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.goalFilter===S.goalFilter))});
  var visible=goals.filter(function(g){return S.goalFilter==="all"||(S.goalFilter==="completed"?goalComplete(g,snap):!goalComplete(g,snap))});
  if(!visible.length){
    host.innerHTML='<div class="goal-empty"><h3>'+(goals.length?'No goals in this view':'Set your first trophy target')+'</h3><p>'+(goals.length?'Choose another filter or create a new goal.':'Choose Smart goal to track platinums, trophies or completed games automatically. Or create a checklist for any gaming objective.')+'</p></div>';
    return;
  }
  host.innerHTML=visible.map(function(g){
    var stat=goalProgress(g,snap),done=stat.complete,overdue=!!g.due&&!done&&g.due<nowLocal().slice(0,10),gameStat="",kind=g.kind||"manual",automatic=kind!=="manual";
    if(g.game&&kind==='manual'){var related=snap.items.filter(function(x){return x.game.toLowerCase()===g.game.toLowerCase()});if(related.length){var n=related.filter(function(x){return !!x.earned}).length;gameStat='<span class="goal-pill">PSN '+n+'/'+related.length+' trophies</span>'}}
    var dateTag=g.due?'<span class="goal-pill'+(overdue?' overdue':'')+'">'+(overdue?'Overdue · ':'Target · ')+esc(g.due)+'</span>':'';
    var stepsHtml=automatic?'<div class="goal-smart-note"><b>Auto-tracked:</b> '+(stat.missing?'Game not found in your imported collection. Check the exact game title.':'Progress updates when you import or sync new PSN trophies.')+'</div>':
      '<ul class="goal-steps">'+(g.tasks.length?g.tasks.map(function(t){return '<li class="goal-step" data-step-id="'+esc(t.id)+'"><label><input type="checkbox" data-goal-check="'+esc(t.id)+'" '+(t.done?'checked':'')+'><span class="goal-step-text">'+esc(t.text)+'</span></label><button class="goal-step-remove" type="button" data-goal-action="remove-step" aria-label="Remove step" title="Remove step">×</button></li>'}).join(''):'<li class="hint">No steps yet. Add one below to begin.</li>')+'</ul><form class="goal-step-add" data-goal-add="'+esc(g.id)+'"><input type="text" maxlength="180" required placeholder="Add checklist step" aria-label="New checklist step"><button class="btn sm" type="submit">+ Add</button></form>';
    return '<article class="goal-card'+(done?' done':'')+'" data-goal-id="'+esc(g.id)+'">'+
      '<div class="goal-card-top"><div><h3>'+esc(g.title)+'</h3><div class="goal-sub">'+(done?'<span class="goal-pill success">✓ Complete</span>':'<span class="goal-pill">In progress</span>')+'<span class="goal-pill goal-type-pill">'+(automatic?'◎ Automatic':'☑ Checklist')+'</span>'+(g.game?'<span class="goal-pill">'+esc(g.game)+'</span>':'')+dateTag+gameStat+'</div></div><div class="goal-actions"><button class="goal-icon-button" data-goal-action="up" title="Move goal up" aria-label="Move goal up">↑</button><button class="goal-icon-button" data-goal-action="down" title="Move goal down" aria-label="Move goal down">↓</button><button class="goal-icon-button" data-goal-action="edit" title="Edit goal" aria-label="Edit goal">✎</button><button class="goal-icon-button" data-goal-action="delete" title="Delete goal" aria-label="Delete goal">×</button></div></div>'+
      '<div class="goal-progress"><span>'+esc(stat.label)+'</span><strong>'+stat.pct+'%</strong></div><div class="goal-progress-track" role="progressbar" aria-valuenow="'+stat.pct+'" aria-valuemin="0" aria-valuemax="100" aria-label="'+esc(g.title)+' progress"><i style="width:'+stat.pct+'%"></i></div>'+
      (g.notes?'<p class="goal-notes">'+esc(g.notes)+'</p>':'')+stepsHtml+'</article>';
  }).join('');
}
function updateGoalKind(){
  var kind=$("#goalKind").value,manual=kind==="manual",pct=kind==="completion"||kind==="game_completion";
  $("#goalTargetField").hidden=manual;
  $("#goalStepsField").hidden=!manual;
  $("#goalGameField").hidden=!manual&&kind!=="game_completion";
  $("#goalGame").required=kind==="game_completion";
  $("#goalTarget").required=!manual;
  $("#goalTarget").max=pct?100:100000;
  $("#goalTargetLabel").textContent=pct?"Target completion (%)":"Target number";
  $("#goalTargetHint").textContent=kind==="game_completion"?"Select the exact title from your imported game collection.":"Progress is computed from imported trophies, not manual checkboxes.";
  if(pct&&Number($("#goalTarget").value)>100)$("#goalTarget").value=100;
}
function openGoalForm(g,kind){
  S.goalEditingId=g?g.id:null;
  $("#goalForm").reset();$("#goalFormHeading").textContent=g?'Edit your goal':'Create a new goal';$("#goalSave").textContent=g?'Save changes':'Create goal';
  $("#goalKind").value=g?(g.kind||'manual'):(kind||'manual');
  $("#goalTarget").value=g&&g.target?g.target:(kind==='completion'||kind==='game_completion'?100:kind==='platinums'?5:kind==='games_completed'?3:25);
  $("#goalTitle").value=g?g.title:"";$("#goalGame").value=g?g.game:"";$("#goalDue").value=g?g.due:"";$("#goalNote").value=g?g.notes:"";
  $("#goalStepsHint").textContent=g?'Enter new steps here; existing checklist items will be kept.':'Enter one checklist item per line. You can add more later.';
  updateGoalKind();$("#goalEditor").hidden=false;$("#goalEditor").scrollIntoView({behavior:"smooth",block:"nearest"});$("#goalTitle").focus();
}
function closeGoalForm(){$("#goalEditor").hidden=true;S.goalEditingId=null;$("#goalForm").reset()}
$("#goalNew").addEventListener("click",function(){openGoalForm(null,'manual')});
$("#goalNewSmart").addEventListener("click",function(){openGoalForm(null,'trophies')});
$("#goalKind").addEventListener("change",function(){updateGoalKind()});
$("#goalCancel").addEventListener("click",closeGoalForm);
$("#goalFormClose").addEventListener("click",closeGoalForm);
$("#goalForm").addEventListener("submit",function(e){
  e.preventDefault();var title=$("#goalTitle").value.trim(),game=$("#goalGame").value.trim(),due=$("#goalDue").value,notes=$("#goalNote").value.trim(),kind=$("#goalKind").value;
  if(!title){$("#goalTitle").focus();return}
  if(!Object.prototype.hasOwnProperty.call(SMART_TYPES,kind))return;
  if(kind==="game_completion"&&!game){$("#goalGame").focus();flash("Select a game for game completion goals.");return}
  var target=Math.floor(Number($("#goalTarget").value));
  if(kind!=="manual"&&(!Number.isFinite(target)||target<1||target>(kind==="completion"||kind==="game_completion"?100:100000))){$("#goalTarget").focus();flash("Enter a valid target.");return}
  var lines=$("#goalSteps").value.split(/\r?\n/).map(function(v){return v.trim()}).filter(Boolean).slice(0,100);
  var steps=lines.map(function(t){return{id:goalTaskId(),text:t.slice(0,180),done:false}});
  var g=S.goals.find(function(g){return g.id===S.goalEditingId});
  if(g){g.title=title.slice(0,100);g.game=game.slice(0,120);g.kind=kind;g.target=kind==='manual'?1:target;g.due=due;g.notes=notes.slice(0,600);g.tasks=g.tasks.concat(kind==='manual'?steps:[]).slice(0,100)}
  else{S.goals.unshift({id:goalId(),title:title.slice(0,100),game:game.slice(0,120),kind:kind,target:kind==='manual'?1:target,due:due,notes:notes.slice(0,600),createdAt:new Date().toISOString(),tasks:kind==='manual'?steps:[]})}
  S.goalFilter='all';closeGoalForm();save();renderGoals();renderDashboardIfActive();flash('Goal saved.');
});
function renderDashboardIfActive(){if(S.tab==='dashboard')renderDashboard()}
$("#view-goals").addEventListener("change",function(e){
  var input=e.target.closest("[data-goal-check]");if(!input)return;
  var card=input.closest("[data-goal-id]"),g=card&&S.goals.find(function(g){return g.id===card.dataset.goalId});if(!g||g.kind&&g.kind!=='manual')return;
  var step=g.tasks.find(function(t){return t.id===input.dataset.goalCheck});if(!step)return;
  step.done=input.checked;save();renderGoals();if(goalComplete(g))flash("Goal completed! See it under Completed goals.");
});
$("#view-goals").addEventListener("submit",function(e){
  var form=e.target.closest('[data-goal-add]');if(!form)return;e.preventDefault();
  var g=S.goals.find(function(g){return g.id===form.dataset.goalAdd});if(!g||g.kind&&g.kind!=='manual'||g.tasks.length>=100)return;
  var input=form.querySelector('input'),value=input.value.trim().slice(0,180);if(!value)return;
  g.tasks.push({id:goalTaskId(),text:value,done:false});save();renderGoals();
});
document.addEventListener("click",function(e){
  if(e.target.closest("#goalsDashboardShortcut, #goalsDashboardView, #welcomeGoalShortcut")){document.getElementById("tab-goals").click()}
  if(e.target.closest("#onboardGuideBtn")){openGuide()}
});
$("#view-goals").addEventListener("click",function(e){
  var bf=e.target.closest('[data-badge-filter]');if(bf){goalBadgeFilter=bf.dataset.badgeFilter;renderBadges();return}
  var f=e.target.closest('[data-goal-filter]');if(f){S.goalFilter=f.dataset.goalFilter;renderGoals();return}
  var b=e.target.closest('[data-goal-action]');if(!b)return;
  var card=b.closest('[data-goal-id]'),g=card&&S.goals.find(function(g){return g.id===card.dataset.goalId});if(!g)return;
  var action=b.dataset.goalAction;
  if(action==='edit'){openGoalForm(g);return}
  if(action==='delete'){if(!confirm('Delete "'+g.title+'" and its checklist?'))return;S.goals=S.goals.filter(function(x){return x.id!==g.id});save();renderGoals();return}
  if(action==='remove-step'){if(g.kind&&g.kind!=='manual')return;var el=b.closest('[data-step-id]');if(!el)return;g.tasks=g.tasks.filter(function(t){return t.id!==el.dataset.stepId});save();renderGoals();return}
  if(action==='up'||action==='down'){var i=S.goals.indexOf(g),j=i+(action==='up'?-1:1);if(j<0||j>=S.goals.length)return;S.goals.splice(i,1);S.goals.splice(j,0,g);save();renderGoals();}
});

/* ---------- Import-only: trophies are managed by PSN sync and bulk imports ---------- */
function closeEditor(){ $("#editor").hidden=true; S.editing=null }

/* ---------- import / export ---------- */
function parseCSV(text){
  var delim=",",first=text.split(/\r?\n/)[0]||"";
  if(first.indexOf("\t")>=0)delim="\t";else if(first.split(";").length>first.split(",").length)delim=";";
  var rows=[],row=[],cur="",q=false;
  for(var i=0;i<text.length;i++){
    var c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else if(c==='"')q=true;
    else if(c===delim){row.push(cur);cur=""}
    else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cur);cur="";if(row.some(function(v){return v.trim()!==""}))rows.push(row);row=[]}
    else cur+=c;
  }
  row.push(cur);if(row.some(function(v){return v.trim()!==""}))rows.push(row);
  if(rows.length<2)return[];
  var head=rows[0].map(function(h){return h.trim()});
  return rows.slice(1).map(function(r){var o={};head.forEach(function(h,i){o[h]=r[i]});return o});
}
function pick(o,names){
  for(var n=0;n<names.length;n++){for(var k in o){
    if(k.toLowerCase().replace(/[^a-z]/g,"")===names[n]&&o[k]!=null&&String(o[k]).trim()!=="")return o[k];
  }}return"";
}
function truthy(v){return v===true||/^(true|yes|y|1)$/i.test(String(v).trim())}
function normDate(v){
  if(v==null||v===""||v===false||v===true)return null;
  var s=String(v).trim();if(!s)return null;
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s+"T00:00";
  if(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(s))return s.replace(" ","T");
  var d=new Date(s);if(isNaN(d))return null;
  return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());
}
function normRow(o){
  var game=String(pick(o,["game","title","gametitle"])).trim(),name=String(pick(o,["name","trophy","trophyname"])).trim();
  if(!game||!name)return null;
  var t=String(pick(o,["type","grade","trophytype"])).toLowerCase(),type=null;
  TYPE_ORDER.forEach(function(k){if(t.indexOf(k.slice(0,4))===0||t.indexOf(k)>=0)type=k});
  if(!type)return null;
  var r=parseFloat(String(pick(o,["rarity","percent","rate","earnedrate","globalrate"])).replace("%",""));
  if(isNaN(r))r=50;r=Math.max(0,Math.min(100,r));
  var pv=pick(o,["psnprofilesrarity","psnprofilespercent","psnppct","psnprarity","psnprate"]),pvn=pv===""?null:parseFloat(String(pv).replace("%",""));
  var row={psnpRarity:pvn!=null&&Number.isFinite(pvn)&&pvn>=0&&pvn<=100?pvn:undefined,game:game,name:name,type:type,rarity:r,earned:normDate(pick(o,["earned","earneddate","date","datetime","earnedat","earnedon","unlocked"])),desc:String(pick(o,["description","desc","detail"])).trim()};
  var plat=String(pick(o,["platform","platforms"])).trim().toUpperCase().replace(/\s+/g,"");if(plat)row.platform=plat.replace("VITA","VITA").replace("PSVITA","PSVITA");
  if(truthy(pick(o,["hidden","secret"])))row.hidden=true;
  if(truthy(pick(o,["dlc"])))row.dlc=true;
  if(truthy(pick(o,["star","starred"])))row.star=true;
  var note=String(pick(o,["note","notes"])).trim();if(note)row.note=note;
  var gid=pick(o,["gameid","npcommunicationid"]),tid=pick(o,["trophyid"]);
  if(gid!==""&&tid!==""){row.gid=String(gid);row.tid=String(tid)}
  return row;
}
function parseInput(text){
  text=String(text||"").trim();if(!text)return{rows:[],skipped:0,profile:null,goals:null,history:null,errors:[]};
  var raw,profile=null,goals=null,history=null,guideMetadata=null,isJson=/^[\[{]/.test(text);
  if(isJson){
    try{raw=JSON.parse(text)}catch(e){throw new Error("This looks like JSON but could not be opened. Export a complete .json file and select it without editing it.")}
    if(raw&&!Array.isArray(raw)){
      profile=raw.profile&&typeof raw.profile==="object"?raw.profile:null;
      goals=Array.isArray(raw.goals)?normalizeGoals(raw.goals):null;
      history=Array.isArray(raw.importHistory)?raw.importHistory:null;
      guideMetadata=raw.guideMetadata&&typeof raw.guideMetadata==="object"?raw.guideMetadata:null;
      guideMetadata=raw.guideMetadata&&typeof raw.guideMetadata==="object"&&!Array.isArray(raw.guideMetadata)?raw.guideMetadata:null;
      raw=Array.isArray(raw.trophies)?raw.trophies:Array.isArray(raw.items)?raw.items:null;
    }
    if(!Array.isArray(raw))throw new Error("JSON needs a trophies array, items array, or a YourLTA backup containing goals.");
  }else{
    var first=text.split(/\r?\n/)[0].toLowerCase();
    if(!/game|title/.test(first)||!/name|trophy/.test(first)||!/type|grade/.test(first))throw new Error("CSV missing required columns: game, name and type. Choose a PSN export file, not a PSNProfiles rarity file.");
    raw=parseCSV(text);
  }
  var rows=[],skipped=0,errors=[];
  raw.forEach(function(o,i){var n=o&&typeof o==="object"?normRow(o):null;if(n)rows.push(n);else{skipped++;if(errors.length<4)errors.push("Row "+(i+1)+" is missing a valid game, name or trophy grade.")}});
  return{rows:rows,skipped:skipped,profile:profile,goals:goals,history:history,guideMetadata:guideMetadata,errors:errors};
}
function nameKey(x){return(x.game+"|"+x.name).toLowerCase()}
function idKey(x){return x.gid&&x.tid!=null?x.gid+"#"+x.tid:null}
function cleanProfile(p){
  if(!p)return null;
  var o={};if(p.name)o.name=String(p.name);if(p.syncedAt)o.syncedAt=String(p.syncedAt);
  if(Number(p.level))o.level=Number(p.level);if(Number(p.tier))o.tier=Number(p.tier);return o;
}
var pending="",replArmed=false,replTimer=null,wipeArmed=false,wipeTimer=null;
var ioFileName="Pasted data",ioReview=null;
var IMPORT_LOG_KEY="ylta.importHistory.v1";

/* v16: status only from completed imports, never from opening or refreshing the page */
function yltaRefreshImportStatus(){
 var relative=document.getElementById("yltaLastImportRelative"),exact=document.getElementById("yltaLastImportExact"),backup=document.getElementById("yltaBackupHint");
 if(!relative||!exact)return;
 var rows=importLogRead().filter(function(e){return e&&e.date&&["Merge","Replace"].indexOf(e.action)>=0});
 if(!rows.length){relative.textContent="No imports recorded";exact.textContent="Import a trophy export to begin. Refreshing this page does not count as a sync.";if(backup)backup.textContent="Tip: keep a JSON backup outside this browser.";return}
 var d=new Date(rows[0].date),elapsed=Date.now()-d.getTime();
 if(!Number.isFinite(elapsed)||elapsed<0){relative.textContent="Date unavailable";return}
 var min=Math.floor(elapsed/60000),hour=Math.floor(min/60),day=Math.floor(hour/24);
 relative.textContent=min<1?"Just now":min<60?min+" minute"+(min===1?"":"s")+" ago":hour<24?hour+" hour"+(hour===1?"":"s")+" ago":day+" day"+(day===1?"":"s")+" ago";
 exact.textContent="Last successful file import: "+d.toLocaleString()+" · "+(rows[0].action||"Import")+" · Not a live PSN sync";
 if(backup)backup.textContent=day>=7?"Backup recommended: your last recorded import was over a week ago.":"Your trophy collection is stored locally in this browser. Download backups regularly.";
}
function yltaGuideRestore(metadata){
 if(!metadata||typeof metadata!=="object"||Array.isArray(metadata))return;
 var data=yltaGuideRead(),domains={psn:"psnprofiles.com",psnguide:"psnprofiles.com",powerpyx:"powerpyx.com",pst:"playstationtrophies.org"};
 Object.keys(metadata).slice(0,10000).forEach(function(name){
  if(name.length>250||!metadata[name]||typeof metadata[name]!=="object")return;
  var item=Object.assign({},data[name]||{});
  Object.keys(domains).forEach(function(key){
   var val=metadata[name][key];if(typeof val!=="string")return;
   try{var u=new URL(val),host=domains[key];if(u.protocol==="https:"&&(u.hostname===host||u.hostname.endsWith("."+host)))item[key]=u.href}catch(e){}
  });
  if(Object.keys(item).length)data[name]=item;
 });
 yltaGuideSave(data);
}

function importLogRead(){try{var x=JSON.parse(localStorage.getItem(IMPORT_LOG_KEY)||"[]");return Array.isArray(x)?x.filter(function(e){return e&&typeof e==="object"}).slice(0,20):[]}catch(e){return[]}}
function importLogWrite(records){try{localStorage.setItem(IMPORT_LOG_KEY,JSON.stringify(records.slice(0,20)))}catch(e){}}
function importLogAdd(action,stats){var entries=importLogRead();entries.unshift({id:newId(),date:new Date().toISOString(),name:String(ioFileName).slice(0,150),action:action,added:stats.added||0,updated:stats.updated||0,unchanged:stats.unchanged||0,skipped:stats.skipped||0});importLogWrite(entries);renderImportHistory();yltaRefreshImportStatus()}
function renderImportHistory(){var rows=importLogRead(),el=$("#importHistoryRows");if(!el)return;el.innerHTML=rows.length?rows.map(function(e){return '<div class="history-entry"><div><strong>'+esc(e.name||"Import")+'</strong><small>'+esc(e.action||"Merge")+' · '+fmtNum(e.added||0)+' new · '+fmtNum(e.updated||0)+' updated · '+fmtNum(e.unchanged||0)+' unchanged'+(e.skipped?' · '+fmtNum(e.skipped)+' skipped':'')+'</small></div><time class="history-date">'+esc(new Date(e.date).toLocaleString())+'</time></div>'}).join(""):'<p class="hint">No imports recorded yet.</p>'}
function importLogRestore(history){if(!Array.isArray(history))return;var existing=importLogRead(),seen=new Set(existing.map(function(x){return x.id}));history.slice(0,20).forEach(function(x){if(!x||typeof x!=="object"||typeof x.name!=="string"||typeof x.date!=="string")return;if(x.id&&seen.has(x.id))return;existing.push({id:String(x.id||newId()),date:x.date,name:x.name.slice(0,150),action:String(x.action||"Merge").slice(0,24),added:Math.max(0,Number(x.added)||0),updated:Math.max(0,Number(x.updated)||0),unchanged:Math.max(0,Number(x.unchanged)||0),skipped:Math.max(0,Number(x.skipped)||0)})});existing.sort(function(a,b){return String(b.date).localeCompare(String(a.date))});importLogWrite(existing);renderImportHistory()}
function inputText(){return pending||$("#ioText").value}
function resetArmed(){replArmed=false;$("#ioReplace").textContent="Replace everything";wipeArmed=false;$("#ioWipe").textContent="Delete all trophies";$("#yltaMobileWipe").textContent="Delete all trophies"}
function resetIoPreview(){ioReview=null;$("#ioPreview").hidden=true;$("#ioPreview").innerHTML="";$("#ioAdd").disabled=true;$("#ioReplace").disabled=true;resetArmed()}
function mergeMaps(items){var byId=new Map(),byName=new Map();items.forEach(function(x){var id=idKey(x),n=nameKey(x);if(id)byId.set(id,x);var list=byName.get(n)||[];list.push(x);byName.set(n,list)});return{byId:byId,byName:byName}}
function findImportMatch(row,maps){var id=idKey(row);if(id&&maps.byId.has(id))return{item:maps.byId.get(id)};
  var list=maps.byName.get(nameKey(row))||[];
  // Never equate trophies from two different PSN trophy sets solely by a shared name.
  if(id)list=list.filter(function(x){return !idKey(x)||!!x.sample});
  if(!id&&list.length>1)return{ambiguous:true};
  if(list.length===1)return{item:list[0]};
  if(list.length>1)return{ambiguous:true};
  return{item:null};
}
function mergeUpdatedFields(old,row){var updated=Object.assign({},old,row);
  if(!row.earned&&old.earned)updated.earned=old.earned;
  if(row.psnpRarity==null&&old.psnpRarity!=null)updated.psnpRarity=old.psnpRarity;
  if(old.star&&!row.star)updated.star=true;
  if(old.note&&!row.note)updated.note=old.note;
  if(!row.desc&&old.desc)updated.desc=old.desc;
  if(!row.platform&&old.platform)updated.platform=old.platform;
  if(!row.gid&&old.gid){updated.gid=old.gid;updated.tid=old.tid}
  delete updated.sample;return updated;
}
function relevantChange(old,updated){return["game","name","type","rarity","psnpRarity","earned","desc","platform","hidden","dlc","star","note","gid","tid"].some(function(k){return (old[k]??null)!==(updated[k]??null)})||!!old.sample}
function analyzeTrophyImport(parsed){var maps=mergeMaps(S.items.filter(function(x){return!x.sample})),seen=new Set();var actions=[],added=0,updated=0,unchanged=0,ambiguous=0,duplicates=0;
  parsed.rows.forEach(function(row){var id=idKey(row),name=nameKey(row),signature=id?"id:"+id:"name:"+name;
    if(seen.has(signature)){duplicates++;return}seen.add(signature);
    var m=findImportMatch(row,maps);
    if(m.ambiguous){ambiguous++;return}
    if(m.item){var change=mergeUpdatedFields(m.item,row);if(relevantChange(m.item,change)){updated++;actions.push({type:"updated",previous:m.item,data:change})}else unchanged++}
    else{added++;actions.push({type:"added",data:row})}
  });
  return{parsed:parsed,actions:actions,added:added,updated:updated,unchanged:unchanged,ambiguous:ambiguous,duplicates:duplicates,skipped:parsed.skipped+ambiguous+duplicates};
}
function makeImportReview(){var text=inputText();if(!text.trim()){resetIoPreview();$("#ioMsg").textContent="Choose your PSN export or YourLTA backup first.";return null}
  try{
    var parsed=parseInput(text),review=analyzeTrophyImport(parsed);
    if(!parsed.rows.length&&!(parsed.goals&&parsed.goals.length))throw new Error("No usable trophies or goals found. Check that you selected a PSN export or a complete YourLTA backup.");
    ioReview=review;
    var warnings=[];
    if(parsed.skipped)warnings.push(fmtNum(parsed.skipped)+" invalid rows ignored. "+parsed.errors.join(" "));
    if(review.ambiguous)warnings.push(fmtNum(review.ambiguous)+" trophies have ambiguous matches and will be skipped to avoid mixing different game lists.");
    if(review.duplicates)warnings.push(fmtNum(review.duplicates)+" duplicate rows within the file will be ignored.");
    if(S.items.some(function(x){return x.sample})&&parsed.rows.length)warnings.push("Example trophies will be removed when you import real PSN data.");
    var boxes=[['New',review.added],['Updated',review.updated],['Unchanged',review.unchanged],['Skipped',review.skipped]];
    $("#ioPreview").innerHTML='<h4>Review before importing</h4><p class="hint">'+esc(ioFileName)+' · '+fmtNum(parsed.rows.length)+' valid trophy rows'+(parsed.goals?' · '+fmtNum(parsed.goals.length)+' goals':'')+'</p><div class="import-review-summary">'+boxes.map(function(b){return'<div class="import-count"><b>'+fmtNum(b[1])+'</b><small>'+b[0]+'</small></div>'}).join("")+'</div>'+(warnings.length?'<ul class="import-warnings">'+warnings.map(function(w){return'<li>'+esc(w)+'</li>'}).join("")+'</ul>':'<p class="hint">No structural problems detected. Your existing local notes and PSNProfiles rarity will be preserved when not supplied.</p>')+'<p class="hint">Review complete. Click <b>Apply reviewed changes</b> to merge. <b>Replace everything</b> is a separate, destructive operation.</p>';
    $("#ioPreview").hidden=false;$("#ioAdd").disabled=false;$("#ioReplace").disabled=false;
    $("#ioMsg").textContent="Review complete. No changes have been saved yet.";
    return review;
  }catch(e){resetIoPreview();$("#ioMsg").textContent=e.message;return null}
}
$("#ioText").addEventListener("input",function(){pending="";ioFileName="Pasted data";resetIoPreview()});
$("#ioFile").addEventListener("change",function(){var f=this.files&&this.files[0];if(!f)return;resetIoPreview();pending="";$("#ioText").value="";ioFileName=f.name;
  if(f.size>25*1024*1024){$("#ioMsg").textContent="File is over 25 MB. Split it or use a smaller JSON export.";return}
  var reader=new FileReader();reader.onload=function(){var t=String(reader.result||"");if(t.length>300000){pending=t;$("#ioText").value=""}else{pending="";$("#ioText").value=t}makeImportReview()};
  reader.onerror=function(){$("#ioMsg").textContent="The file could not be read. Please choose it again."};reader.readAsText(f)
});

var yltaMobileAbort=null;
function showMobileImportReview(review){
 // Reopen every parent before scrolling: an import can finish after navigation.
 openIO();
 $("#yltaTabPSN").click();
 $("#yltaMethodWeb").click();
 $("#yltaMobileReviewSummary").innerHTML='<div class="import-review-summary">'+[
  ["New",review.added],["Updated",review.updated],["Unchanged",review.unchanged],["Skipped",review.skipped]
 ].map(function(b){return '<div class="import-count"><b>'+fmtNum(b[1])+'</b><small>'+b[0]+'</small></div>'}).join("")+'</div>';
 $("#yltaMobileReview").hidden=false;
 var apply=$("#yltaMobileApply");
 // Dismiss the phone keyboard and wait for the revealed layout to settle.
 if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
 requestAnimationFrame(function(){
  apply.focus({preventScroll:true});
  apply.scrollIntoView({behavior:"auto",block:"center"});
 });
}
$("#yltaMobileApply").addEventListener("click",function(){
 if(!ioReview){$("#yltaMobileStatus").textContent="No reviewed trophies are ready. Import again first.";return}
 $("#ioAdd").click();
 $("#yltaMobileReview").hidden=true;
 $("#yltaMobileReviewSummary").innerHTML="";
 $("#yltaMobileStatus").textContent="Trophies applied successfully. Your collection and statistics have been updated.";
});
$("#yltaMobileStop").addEventListener("click",function(){if(yltaMobileAbort)yltaMobileAbort.abort()});
$("#yltaMobileStart").addEventListener("click",async function(){
 var api="https://yourlta-mobile-api.onrender.com",token=$("#yltaMobileToken").value.trim(),status=$("#yltaMobileStatus");
 if(location.protocol==="file:"){status.textContent="Open YourLTA at https://yourlta.pages.dev — mobile sync cannot run from a local HTML file.";return}
 if(!/^https:\/\//i.test(api)||!token){status.textContent="Enter your NPSSO token.";return}
 if(!confirm("Your NPSSO token will be sent to "+api+". Only continue if you trust this server. Proceed?"))return;
 $("#yltaMobileReview").hidden=true;$("#yltaMobileReviewSummary").innerHTML="";
 var all=[],skipped=[],offset=0,controller=new AbortController();yltaMobileAbort=controller;
 this.disabled=true;$("#yltaMobileStop").disabled=false;
 try{
  for(var batch=0;batch<100;batch++){
   status.textContent="Fetching PSN games "+(offset+1)+" onward… "+all.length+" trophies received.";
   var response=await fetch(api+"/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({npsso:token,offset:offset}),signal:controller.signal,cache:"no-store"});
   var data=await response.json();if(!response.ok)throw Error(data.error||"Server error "+response.status);
   if(!Array.isArray(data.trophies))throw Error("Unexpected response from import server.");
   all.push(...data.trophies);skipped.push(...(data.skipped||[]));
   if(data.nextOffset==null)break;
   if(data.nextOffset<=offset)throw Error("Import pagination did not advance.");offset=data.nextOffset;
  }
  if(!all.length)throw Error("No trophies received. Try again later.");
  var result=JSON.stringify({app:"trophy-ledger",version:1,profile:{syncedAt:new Date().toISOString()},trophies:all});
  ioFileName="Mobile PSN import";pending=result;$("#ioText").value="";resetIoPreview();
  var mobileReview=makeImportReview();
  if(!mobileReview)throw Error("The server returned trophies, but the import review could not be prepared: "+$("#ioMsg").textContent);
  showMobileImportReview(mobileReview);
  status.textContent="Received "+all.length+" trophies. "+(skipped.length?skipped.length+" games could not be retrieved. ":"")+"Review the changes below, then tap Apply trophies to my collection. Your token was not saved.";

 }catch(e){status.textContent=e.name==="AbortError"?"Import stopped. No trophies changed.":"Import failed: "+(e.message==="Failed to fetch"?"Cannot reach the YourLTA import service. Try again later or contact support.":e.message)}
 finally{$("#yltaMobileToken").value="";yltaMobileAbort=null;$("#yltaMobileStart").disabled=false;$("#yltaMobileStop").disabled=true}
});
$("#ioPreviewBtn").addEventListener("click",makeImportReview);
$("#importWizardFile").addEventListener("click",function(){$("#yltaImportData").scrollIntoView({behavior:"smooth",block:"center"});$("#ioFile").focus()});
$("#importWizardPSNP").addEventListener("click",function(){$("#psnpHtmlSection").scrollIntoView({behavior:"smooth",block:"start"});$("#psnpHtmlFiles").focus()});
$("#clearImportHistory").addEventListener("click",function(){if(!this.dataset.armed){this.dataset.armed="1";this.textContent="Confirm clear history";return}delete this.dataset.armed;this.textContent="Clear history";importLogWrite([]);renderImportHistory()});
$("#ioAdd").addEventListener("click",function(){if(!ioReview){makeImportReview();return}var review=analyzeTrophyImport(ioReview.parsed),parsed=review.parsed;
  // Importing actual trophies supersedes demo data; a goals-only restore leaves demos intact.
  if(parsed.rows.length)S.items=S.items.filter(function(x){return!x.sample});
  review.actions.forEach(function(a){if(a.type==="updated")Object.assign(a.previous,a.data);else{a.data.id=newId();S.items.push(a.data)}});
  if(parsed.profile)S.profile=Object.assign({},S.profile,cleanProfile(parsed.profile));
  var goals=0;if(parsed.goals){parsed.goals.forEach(function(g){var prev=S.goals.findIndex(function(x){return x.id===g.id});if(prev>=0)S.goals[prev]=g;else S.goals.push(g);goals++})}
  if(parsed.history)importLogRestore(parsed.history);
  if(parsed.guideMetadata)yltaGuideRestore(parsed.guideMetadata);
  if(parsed.guideMetadata)yltaGuideSave(Object.assign({},yltaGuideRead(),parsed.guideMetadata));
  importLogAdd("Merge",review);save();S.limit=PAGE;renderAll();
  $("#ioMsg").textContent="Imported "+fmtNum(review.added)+" new, "+fmtNum(review.updated)+" updated, "+fmtNum(review.unchanged)+" unchanged"+(review.skipped?", "+fmtNum(review.skipped)+" skipped":"")+(goals?", "+fmtNum(goals)+" goals restored":"")+". No duplicate trophy rows were created.";
  resetIoPreview();
  applyIoCollapse(true);setTab("stats");window.scrollTo({top:0,behavior:"smooth"});
});
$("#ioReplace").addEventListener("click",function(){if(!ioReview){makeImportReview();return}var parsed=ioReview.parsed;
  if(!replArmed){resetArmed();replArmed=true;this.textContent="Confirm: replace trophies";clearTimeout(replTimer);replTimer=setTimeout(resetArmed,7000);$("#ioMsg").textContent="Warning: replaces your entire trophy collection. Download a JSON backup first.";return}
  resetArmed();var unique=new Set(),fresh=[],skipped=parsed.skipped;
  parsed.rows.forEach(function(row){var key=idKey(row)||nameKey(row);if(unique.has(key)){skipped++;return}unique.add(key);row.id=newId();fresh.push(row)});
  S.items=fresh;S.profile=cleanProfile(parsed.profile);if(parsed.goals!==null)S.goals=parsed.goals;
  if(parsed.history)importLogRestore(parsed.history);
  if(parsed.guideMetadata)yltaGuideRestore(parsed.guideMetadata);
  if(parsed.guideMetadata)yltaGuideSave(parsed.guideMetadata);
  importLogAdd("Replace",{added:fresh.length,skipped:skipped});save();S.limit=PAGE;renderAll();
  $("#ioMsg").textContent="Replaced the collection with "+fmtNum(fresh.length)+" trophies"+(parsed.goals!==null?" and "+fmtNum(S.goals.length)+" goals":" (existing goals preserved)")+".";
  resetIoPreview();
  applyIoCollapse(true);setTab("stats");window.scrollTo({top:0,behavior:"smooth"});
});
function deleteAllTrophies(){
 if(!wipeArmed){
  resetArmed();wipeArmed=true;
  $("#ioWipe").textContent=$("#yltaMobileWipe").textContent="Click again to delete everything";
  clearTimeout(wipeTimer);wipeTimer=setTimeout(resetArmed,4000);return;
 }
 resetArmed();S.items=[];S.profile=null;save();renderAll();resetIoPreview();
 $("#yltaMobileReview").hidden=true;$("#yltaMobileReviewSummary").innerHTML="";
 $("#ioMsg").textContent=$("#yltaMobileStatus").textContent="All trophies deleted.";
}
$("#ioWipe").addEventListener("click",deleteAllTrophies);
$("#yltaMobileWipe").addEventListener("click",deleteAllTrophies);
renderImportHistory();resetIoPreview();yltaRefreshImportStatus();setInterval(yltaRefreshImportStatus,60000);
function exportRows(list){return list.map(function(x){var o={game:x.game,name:x.name,type:x.type,rarity:x.rarity,psnpRarity:x.psnpRarity,earned:x.earned,description:x.desc,platform:x.platform||"",hidden:!!x.hidden,dlc:!!x.dlc,star:!!x.star,note:x.note||""};if(x.gid){o.gameId=x.gid;o.trophyId=x.tid}return o})}
function exportJSON(){return JSON.stringify({app:"ylta",version:4,profile:S.profile||undefined,trophies:exportRows(S.items),goals:S.goals,importHistory:importLogRead(),guideMetadata:yltaGuideRead()},null,2)}
function csvCell(v){v=v==null?"":String(v);return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function exportCSV(list){
  var cols=["game","name","type","rarity","psnpRarity","earned","description","platform","hidden","dlc","star","note"];
  var lines=[cols.join(",")];
  exportRows(list).forEach(function(r){lines.push(cols.map(function(c){return csvCell(r[c])}).join(","))});
  return lines.join("\n");
}
function copyOut(text,okMsg){
  var box=$("#ioText");pending="";box.value=text.length>400000?"":text;
  var done=function(){flash(okMsg);$("#ioMsg").textContent=okMsg};
  var fail=function(){$("#io").hidden=false;box.value=text;box.focus();box.select();$("#ioMsg").textContent="Copying was blocked. The data is selected below, so copy it with your keyboard."};
  try{navigator.clipboard.writeText(text).then(done,fail)}catch(e){fail()}
}
$("#ioJson").addEventListener("click",function(){copyOut(exportJSON(),"Copied your complete YLTA data as JSON, including goals.")});
$("#ioDownloadBackup").addEventListener("click",function(){downloadText("ylta-backup.json",exportJSON(),"application/json");$("#ioMsg").textContent="Downloaded YourLTA backup with trophies, goals and import history."});
$("#ioCsv").addEventListener("click",function(){copyOut(exportCSV(S.items),"Copied your data as CSV.")});
var ioCollapsed=false;try{ioCollapsed=JSON.parse(localStorage.getItem("trophyLedger.ioCollapsed.v1")||"false")}catch(e){}
function applyIoCollapse(collapsed){var inner=$("#ioInner"),btn=$("#ioCollapse"),sec=$("#io");if(!inner||!btn||!sec)return;inner.hidden=!!collapsed;sec.classList.toggle("io-collapsed",!!collapsed);btn.setAttribute("aria-expanded",String(!collapsed));btn.title=collapsed?"Expand import section":"Collapse import section";btn.innerHTML=collapsed?"⌄":"⌃";try{localStorage.setItem("trophyLedger.ioCollapsed.v1",JSON.stringify(!!collapsed))}catch(e){}}
$("#ioCollapse").addEventListener("click",function(){applyIoCollapse(!$("#ioInner").hidden)});applyIoCollapse(ioCollapsed);
function openIO(){$("#sharePanel").hidden=true;closeEditor();resetArmed();$("#io").hidden=false;applyIoCollapse(false);$("#io").scrollIntoView({behavior:"smooth",block:"start"})}
function openGuide(){openIO();var section=$("#yltaSimpleImport");if(section)section.scrollIntoView({behavior:"smooth",block:"start"})}


/* ---------- wiring ---------- */
$("#ioBtn").addEventListener("click",openIO);
$("#clearSamples").addEventListener("click",function(){
  S.items=S.items.filter(function(x){return!x.sample});save();renderAll();flash("Example trophies removed.");
});
document.querySelectorAll(".tab").forEach(function(b){b.addEventListener("click",function(){setTab(b.dataset.tab)})});
$("#q").addEventListener("input",function(){S.q=this.value;refilter()});
$("#sort").addEventListener("change",function(){S.sort=this.value;S.dir=SORT_DEFAULT[S.sort];syncControls();save();refilter()});
$("#dir").addEventListener("click",function(){S.dir=S.dir==="asc"?"desc":"asc";syncControls();save();refilter()});
$("#game").addEventListener("change",function(){S.game=this.value;S.gamePlatform="";refilter()});
$("#year").addEventListener("change",function(){S.year=this.value;refilter()});
$("#content").addEventListener("change",function(){S.content=this.value;refilter()});
$("#group").addEventListener("change",function(){S.group=this.value;save();refilter()});
$("#maxr").addEventListener("input",function(){var v=parseFloat(this.value);S.maxr=isNaN(v)?null:v;refilter()});
$("#reveal").addEventListener("change",function(){S.reveal=this.checked;save();refilter()});
$("#compact").addEventListener("change",function(){S.compact=this.checked;save();syncControls();refilter()});
$("#gsort").addEventListener("change",function(){S.gsort=this.value;S.glimit=GPAGE;save();renderGames()});
function clearFilters(){S.q="";$("#q").value="";S.status="earned";S.star=false;S.types.clear();S.tiers.clear();S.plats.clear();S.game="";S.gamePlatform="";S.year="";S.content="";S.maxr=null;S.group="none"}
function resetFilters(){clearFilters();syncControls();refilter()}
$("#reset").addEventListener("click",resetFilters);
function applyQuick(id){
  var q=QUICK.filter(function(z){return z.id===id})[0];if(!q)return;
  clearFilters();var p=q.patch;
  if(p.status)S.status=p.status;
  if(p.sort){S.sort=p.sort;S.dir=p.dir||SORT_DEFAULT[p.sort]}
  if(p.types)p.types.forEach(function(t){S.types.add(t)});
  if(p.tiers)p.tiers.forEach(function(t){S.tiers.add(t)});
  if(p.star)S.star=true;
  syncControls();refilter();
}
document.addEventListener("click",function(e){
  var qk=e.target.closest("[data-quick]");
  if(qk){applyQuick(qk.dataset.quick);return}
  var chip=e.target.closest("[data-chip]");
  if(chip){
    var k=chip.dataset.chip,v=chip.dataset.v;
    if(k==="status")S.status=v;
    else if(k==="star")S.star=!S.star;
    else{var set=k==="type"?S.types:k==="tier"?S.tiers:S.plats;if(set.has(v))set.delete(v);else set.add(v)}
    syncControls();refilter();return;
  }
  var b=e.target.closest("[data-act]");if(!b)return;
  var act=b.dataset.act,id=b.dataset.id;
  if(act==="v15edit"){yltaGuideEdit(b.dataset.game);return}
  if(act==="star"){
    S.items.forEach(function(x){if(x.id===id){x.star=x.star?undefined:true}});
    save();renderList();
  }else if(act==="io")openIO();
  else if(act==="reset")resetFilters();
  else if(act==="more"){S.limit+=PAGE;renderList()}
  else if(act==="all"){S.limit=1e9;renderList()}
  else if(act==="gmore"){S.glimit+=GPAGE;renderGames()}
  else if(act==="copylist")copyOut(exportCSV(sortItems(filtered())),"Copied the current list as CSV.");
  else if(act==="viewgame"){S.game=b.dataset.game;S.gamePlatform=b.dataset.platform||"";syncControls();setTab("trophies");S.limit=PAGE;renderList();window.scrollTo({top:0,behavior:"smooth"})}
});
document.addEventListener("keydown",function(e){
  if(e.key==="/"&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)&&S.tab==="trophies"){e.preventDefault();$("#q").focus()}
});

/* ---------- card creator: local, customizable, and responsive ---------- */
var APP_DEFAULT={theme:"dark",accent:"#66d6ff",density:"comfortable",rarity:"psn",landing:"dashboard",both:true};
var appPrefs=Object.assign({},APP_DEFAULT);
try{Object.assign(appPrefs,JSON.parse(localStorage.getItem("trophyLedger.appearance.v3")||"{}"))}catch(e){}
function appApply(){
 document.documentElement.dataset.theme=appPrefs.theme==="auto"?"":appPrefs.theme;
 document.documentElement.style.setProperty("--accent",appPrefs.accent);
 var hex=appPrefs.accent.replace('#','');var rgb=[0,2,4].map(function(i){return parseInt(hex.slice(i,i+2),16)});var light=appPrefs.theme==='light'||(appPrefs.theme==='auto'&&window.matchMedia('(prefers-color-scheme:light)').matches);var root=document.documentElement;
 function blend(base,f){return '#'+base.map(function(n,i){return Math.round(n*(1-f)+rgb[i]*f).toString(16).padStart(2,'0')}).join('')}
 root.style.setProperty('--accent-soft',blend(light?[235,241,248]:[13,29,49],.32));
 root.style.setProperty('--bg',blend(light?[202,211,222]:[7,13,24],light?.13:.17));
 root.style.setProperty('--surface',blend(light?[225,233,241]:[14,25,42],light?.11:.20));
 root.style.setProperty('--surface-2',blend(light?[206,218,230]:[19,35,55],light?.16:.23));
 root.style.setProperty('--line',blend(light?[145,165,185]:[46,70,98],light?.13:.26));
 root.style.setProperty('--theme-sidebar',blend(light?[179,195,211]:[11,22,39],light?.16:.22));
 root.style.setProperty('--theme-hero',blend(light?[27,46,66]:[15,34,55],light?.20:.27));
 root.style.setProperty('--theme-input',blend(light?[205,218,230]:[23,39,59],light?.13:.19));
 root.style.setProperty('--theme-chip',blend(light?[212,224,235]:[28,45,66],light?.13:.25));
 root.style.setProperty('--ylta-glow',rgb.join(','));
 root.style.setProperty('--ylta-rgb',rgb.join(','));
 root.style.setProperty('--on-accent',(rgb[0]*.299+rgb[1]*.587+rgb[2]*.114)>155?'#081322':'#ffffff');
 document.body.classList.toggle("dense",appPrefs.density==="compact");
 $("#raritySource").value=appPrefs.rarity;
 ["theme","accent","density","rarity","landing","both"].forEach(function(k){var el=$("#app"+k.charAt(0).toUpperCase()+k.slice(1));if(el){if(el.type==="checkbox")el.checked=!!appPrefs[k];else el.value=appPrefs[k]}});
}
function appSave(){try{localStorage.setItem("trophyLedger.appearance.v3",JSON.stringify(appPrefs))}catch(e){}}
appApply();
$("#settingsBtn").addEventListener("click",function(){$("#appSettings").hidden=false;$("#appSettings").scrollIntoView({behavior:"smooth",block:"start"})});
$("#settingsClose").addEventListener("click",function(){$("#appSettings").hidden=true});
["theme","accent","density","rarity","landing","both"].forEach(function(k){var el=$("#app"+k.charAt(0).toUpperCase()+k.slice(1));el.addEventListener(k==="accent"?"input":"change",function(){appPrefs[k]=el.type==="checkbox"?el.checked:el.value;appApply();appSave();renderAll()})});
$("#settingsReset").addEventListener("click",function(){appPrefs=Object.assign({},APP_DEFAULT);appApply();appSave();renderAll()});
$("#raritySource").addEventListener("change",function(){appPrefs.rarity=this.value;appSave();appApply();renderAll()});
function downloadText(name,content,mime){var b=new Blob([content],{type:mime||"text/plain"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000)}
/* ---------- saved PSNProfiles HTML rarity import ---------- */
var psnpPages=[];
function psnpNorm(s){return String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}
function parsePSNPPage(html,filename){
  if(html.length>8*1024*1024)throw new Error("Saved HTML exceeds 8 MB");
  // External scripts/styles/images are unnecessary and are stripped before inert parsing.
  var safe=html.replace(/<(script|style|iframe|object|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,"").replace(/<(?:img|source|link|base|embed)\b[^>]*>/gi,"");
  var doc=new DOMParser().parseFromString(safe,"text/html");
  var meta=doc.querySelector('meta[property="og:title"]'),canon=doc.querySelector('link[rel="canonical"]');
  var source=canon&&canon.getAttribute("href")||"",origin=doc.querySelector('meta[property="og:url"]');
  if(!source&&origin)source=origin.getAttribute("content")||"";
  if(!/^https?:\/\/(?:www\.)?psnprofiles\.com\/trophies\/\d+[-\/]/i.test(source))throw new Error("Not a saved PSNProfiles game trophy page");
  var title=meta&&meta.getAttribute("content")||"",game=title.replace(/\s+Trophies\s*$/i,"").trim();
  if(!game)throw new Error("Couldn't identify the game title");
  var rows=[],seen=new Set();
  doc.querySelectorAll('table.zebra tr').forEach(function(tr){
    var a=tr.querySelector('a.title[href*="/trophy/"]'),p=tr.querySelector('td.hover-hide .typo-top');
    if(!a||!p)return;
    var name=a.textContent.trim(),value=p.textContent.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
    if(!name||!value)return;
    var rarity=Number(value[1]);if(!Number.isFinite(rarity)||rarity<0||rarity>100)return;
    var gradeImg=tr.querySelector('img[title="Bronze"],img[title="Silver"],img[title="Gold"],img[title="Platinum"]');
    var grade=gradeImg?gradeImg.getAttribute("title").toLowerCase():"";
    var key=psnpNorm(name)+"|"+grade;if(seen.has(key))return;seen.add(key);
    rows.push({name:name,type:grade,psnpRarity:rarity});
  });
  if(!rows.length)throw new Error("No trophy percentages found; use the game's full Trophies page, saved as HTML");
  return{game:game,source:source,filename:filename,rows:rows,selected:"",error:""};
}

function parsePSNPCapture(payload,filename){
  if(typeof payload!=="string"||payload.length>10*1024*1024)throw new Error("Collector JSON exceeds 10 MB");
  var obj;try{obj=JSON.parse(payload)}catch(e){throw new Error("Invalid JSON file")}
  if(!obj||obj.app!=="ylta-psnp-capture"||obj.version!==1||!Array.isArray(obj.pages))throw new Error("Not a YLTA PSNProfiles collector export");
  if(!obj.pages.length||obj.pages.length>500)throw new Error("Collector must contain 1–500 game pages");
  var result=[];
  obj.pages.forEach(function(page,index){
    if(!page||typeof page.game!=="string"||page.game.length>240||!page.game.trim()||typeof page.source!=="string"||!/^https:\/\/(?:www\.)?psnprofiles\.com\/trophies\/\d+[-\/]/i.test(page.source)||!Array.isArray(page.rows)||!page.rows.length||page.rows.length>500)throw new Error("Invalid game page at index "+(index+1));
    var rows=[],seen=new Set();
    page.rows.forEach(function(t){
      if(!t||typeof t.name!=="string"||!t.name.trim()||t.name.length>240||!["bronze","silver","gold","platinum",""].includes(t.type)||typeof t.psnpRarity!=="number"||!Number.isFinite(t.psnpRarity)||t.psnpRarity<0||t.psnpRarity>100)throw new Error("Invalid trophy data in "+page.game);
      var key=psnpNorm(t.name)+"|"+t.type;if(seen.has(key))return;seen.add(key);
      rows.push({name:t.name.trim(),type:t.type,psnpRarity:t.psnpRarity});
    });
    result.push({game:page.game.trim(),source:page.source,filename:filename+" / "+page.game,rows:rows,selected:"",error:""});
  });
  return result;
}

function psnpGameGroups(){
  var map=new Map();S.items.filter(function(x){return !x.sample}).forEach(function(x){
    var key=x.gid?"gid:"+x.gid:"title:"+psnpNorm(x.game)+"|"+psnpNorm(x.platform||"");
    if(!map.has(key))map.set(key,{key:key,name:x.game,platform:x.platform||"",items:[]});
    map.get(key).items.push(x);
  });return Array.from(map.values());
}
function psnpMatchedRows(page,group){
  if(!group)return[];
  var byName=new Map();group.items.forEach(function(x){var k=psnpNorm(x.name);if(!byName.has(k))byName.set(k,[]);byName.get(k).push(x)});
  var matches=[];page.rows.forEach(function(r){
    var candidates=byName.get(psnpNorm(r.name))||[];
    if(r.type)candidates=candidates.filter(function(x){return x.type===r.type});
    if(candidates.length===1)matches.push({trophy:candidates[0],value:r.psnpRarity,row:r});
  });return matches;
}
function psnpGuess(page,groups){
  if(!groups.length)return "";
  function countOf(g){return g.items.length}
  var scored=groups.map(function(g){
    var exact=psnpNorm(g.name)===psnpNorm(page.game),match=psnpMatchedRows(page,g).length,sameCount=countOf(g)===page.rows.length;
    return{group:g,match:match,exact:exact,sameCount:sameCount};
  });
  var exactCount=scored.filter(function(x){return x.exact&&x.sameCount});
  if(exactCount.length===1)return exactCount[0].group.key;
  var exact=scored.filter(function(x){return x.exact&&x.match>0}).sort(function(a,b){return (b.sameCount-a.sameCount)||(b.match-a.match)});
  if(exact.length===1)return exact[0].group.key;
  if(exact.length>1){if(exact[0].sameCount&&!exact[1].sameCount)return exact[0].group.key;if(exact[0].match>=exact[1].match+3&&exact[0].match>=Math.ceil(page.rows.length*.65))return exact[0].group.key;return ""}
  var countOnly=scored.filter(function(x){return x.sameCount&&x.match>=Math.max(1,Math.ceil(page.rows.length*.45))}).sort(function(a,b){return b.match-a.match});
  if(countOnly.length===1)return countOnly[0].group.key;
  scored.sort(function(a,b){return (b.sameCount-a.sameCount)||(b.match-a.match)});
  var top=scored[0],runner=scored[1];
  if(top.sameCount&&top.match>=Math.max(2,Math.ceil(page.rows.length*.5))&&(!runner||top.match>=runner.match+2))return top.group.key;
  if(top.match>=3&&top.match>=Math.ceil(page.rows.length*.7)&&top.match>=Math.ceil(top.group.items.length*.5)&&(!runner||top.match>=runner.match+3))return top.group.key;
  return "";
}
function psnpPreview(){
  var host=$("#psnpPreview"),groups=psnpGameGroups();
  if(!psnpPages.length){host.hidden=true;host.innerHTML="";$("#psnpApplyHtml").disabled=true;$("#psnpExportHtml").disabled=true;return}
  var header='<table class="psnp-preview-table"><thead><tr><th>Saved game page</th><th>Found</th><th>Matched</th><th>Matching PSN game</th></tr></thead><tbody>';
  var body=psnpPages.map(function(p,i){
    var g=groups.find(function(g){return g.key===p.selected}),count=psnpMatchedRows(p,g).length;
    var opts='<option value="">Select game…</option>'+groups.map(function(g){
      return '<option value="'+esc(g.key)+'"'+(p.selected===g.key?' selected':'')+'>'+esc(g.name+' · '+(g.platform||'PSN')+' · '+g.items.length+' trophies')+'</option>';
    }).join('');
    return '<tr><td><b>'+esc(p.game)+'</b><div class="hint">'+esc(p.filename)+'</div></td><td>'+p.rows.length+'</td><td class="'+(count?'psnp-match':'psnp-warning')+'">'+count+'/'+p.rows.length+'</td><td><select data-psnp-index="'+i+'" aria-label="Choose PSN game for '+esc(p.game)+'">'+opts+'</select></td></tr>';
  }).join('');
  host.innerHTML=header+body+'</tbody></table>';
  host.hidden=false;$("#psnpExportHtml").disabled=false;
  $("#psnpApplyHtml").disabled=!psnpPages.some(function(p){var g=groups.find(function(g){return g.key===p.selected});return psnpMatchedRows(p,g).length>0});
}
$("#psnpPreview").addEventListener("change",function(e){
  var select=e.target.closest('[data-psnp-index]');if(!select)return;
  var idx=Number(select.dataset.psnpIndex);if(psnpPages[idx])psnpPages[idx].selected=select.value;
  psnpPreview();
});
$("#psnpHtmlFiles").addEventListener("change",function(){
  $("#psnpHtmlStatus").textContent=this.files.length?this.files.length+" page(s) selected. Click Analyze saved pages.":"No pages selected yet.";
});
$("#psnpAnalyze").addEventListener("click",async function(){
  var files=Array.from($("#psnpHtmlFiles").files||[]);
  if(!files.length){$("#psnpHtmlStatus").textContent="Choose saved game HTML files or a YLTA collector JSON first.";return}
  if(files.length>100){$("#psnpHtmlStatus").textContent="Select up to 100 files at a time.";return}
  this.disabled=true;$("#psnpHtmlStatus").textContent="Reading saved HTML files locally…";
  var parsed=[],failed=[];for(var i=0;i<files.length;i++){
    try{
      var file=files[i],source=await file.text();
      var pages=/\.json$/i.test(file.name)?parsePSNPCapture(source,file.name):[parsePSNPPage(source,file.name)];
      pages.forEach(function(page){page.selected=psnpGuess(page,psnpGameGroups());parsed.push(page)});
    }catch(e){failed.push(files[i].name+": "+e.message)}
  }
  if(parsed.length>500){parsed=parsed.slice(0,500);failed.push("Only the first 500 game pages were analyzed")}
  psnpPages=parsed;this.disabled=false;psnpPreview();
  var found=parsed.reduce(function(n,p){return n+p.rows.length},0),matched=parsed.reduce(function(n,p){return n+psnpMatchedRows(p,psnpGameGroups().find(function(g){return g.key===p.selected})).length},0),autoPages=parsed.filter(function(p){return !!p.selected}).length;
  $("#psnpHtmlStatus").textContent="Found "+found+" trophy percentages across "+parsed.length+" game page(s). Matched "+matched+" to your PSN collection."+(autoPages?" Auto-matched "+autoPages+" page(s).":"")+(failed.length?" Skipped "+failed.length+" file(s): "+failed.slice(0,2).join("; "):"")+(matched?" Review the matches, then click Apply.":" Sync your PSN trophies first, or select a matching game in the preview.");
});
$("#psnpApplyHtml").addEventListener("click",function(){
  var groups=psnpGameGroups(),changes=new Map(),ambiguous=0,used=0;
  psnpPages.forEach(function(p){var g=groups.find(function(g){return g.key===p.selected});if(!g)return;used++;
    psnpMatchedRows(p,g).forEach(function(m){if(changes.has(m.trophy)&&changes.get(m.trophy)!==m.value)ambiguous++;else changes.set(m.trophy,m.value)});
  });
  if(ambiguous){$("#psnpHtmlStatus").textContent="Conflicting values found in saved pages. Remove duplicate versions and analyze again; nothing has been changed.";return}
  if(!changes.size){$("#psnpHtmlStatus").textContent="No matching trophies to update. Import your PSN collection or choose the correct game.";return}
  changes.forEach(function(value,trophy){trophy.psnpRarity=value});
  save();renderAll();psnpPreview();
  $("#psnpHtmlStatus").textContent="Success: updated "+changes.size+" PSNProfiles percentages across "+used+" selected game page(s). Earned dates, grades and Sony rarity were preserved.";
});
$("#psnpExportHtml").addEventListener("click",function(){
  var rows=['game,name,psnpRarity'];psnpPages.forEach(function(p){p.rows.forEach(function(r){rows.push([p.game,r.name,r.psnpRarity].map(csvCell).join(','))})});
  downloadText('ylta-psnprofiles-rarity.csv',rows.join('\n'),'text/csv');
});
$("#psnpTemplate").addEventListener("click",function(){downloadText("psnprofiles-rarity-template.csv","game,name,psnpRarity\nExample Game,Example Trophy,12.34\n","text/csv")});
$("#psnpImport").addEventListener("click",async function(){
 var f=$("#psnpFile").files[0];if(!f){$("#psnpStatus").textContent="Choose a CSV file first.";return}
 try{var rows=parseCSV(await f.text()),updated=0,skipped=0;
 rows.forEach(function(r){var game=String(pick(r,["game","title"])).trim().toLowerCase(),name=String(pick(r,["name","trophy","trophyname"])).trim().toLowerCase(),raw=pick(r,["psnprofilesrarity","psnprofilespercent","psnprarity","psnppct"]),v=parseFloat(String(raw).replace("%",""));
 var x=S.items.find(function(x){return x.game.toLowerCase()===game&&x.name.toLowerCase()===name});if(!x||!Number.isFinite(v)||v<0||v>100){skipped++;return}x.psnpRarity=v;updated++});
 if(updated){save();renderAll()}$("#psnpStatus").textContent="Updated "+updated+" trophy percentages; skipped "+skipped+" unmatched/invalid rows.";
 }catch(e){$("#psnpStatus").textContent="CSV import failed: "+e.message}
});
var SHARE_IDS=["shareName","shareSubtitle","shareStyle","shareAccent","shareLayout","shareShape","shareGames","shareCompletion","shareLevel","shareDecor","sharePattern","shareFormat","shareScale"];
var SHARE_DEFAULT={shareName:"",shareSubtitle:"MY PLAYSTATION TROPHY COLLECTION",shareStyle:"dark",shareAccent:"#66b6ff",shareLayout:"classic",shareShape:"rounded",shareGames:true,shareCompletion:true,shareLevel:true,shareDecor:true,sharePattern:"rings",shareFormat:"landscape",shareScale:"1"};
var SHARE_THEMES={dark:["#0b1325","#f4f8ff","#aabbd3","#1b2942"],light:["#eff5fd","#12223b","#566a85","#ffffff"],violet:["#190d35","#f8f0ff","#c8b6ed","#302050"],sunset:["#351625","#fff4ed","#e8b6ac","#562d40"],forest:["#0c2928","#eafff7","#a4d2c7","#1a4140"],black:["#090a0d","#ffffff","#9ea3ad","#1c1e25"],ocean:["#071e32","#e9f8ff","#9ebfd4","#14374e"],rose:["#331d31","#fff0f5","#dcb9ce","#4c3048"],copper:["#291b16","#fff2e8","#d8b6a3","#473027"],slate:["#19232d","#eff4f7","#aebdc9","#2c3a48"],royal:["#081b42","#f4f8ff","#b4c7e8","#142c58"],crimson:["#2c0d19","#fff2f4","#e9a8b6","#4c1c2e"],aurora:["#071d29","#ecfff8","#a8d5d1","#123946"]};
function shareOptions(){var o={};SHARE_IDS.forEach(function(id){var el=$("#"+id);o[id]=el.type==="checkbox"?el.checked:el.value});return o}
function shareSave(){try{localStorage.setItem("trophyLedger.card.v2",JSON.stringify(shareOptions()))}catch(e){}}
function shareLoad(){var o={};try{o=JSON.parse(localStorage.getItem("trophyLedger.card.v2")||"{}")||{}}catch(e){};SHARE_IDS.forEach(function(id){var el=$("#"+id),v=Object.prototype.hasOwnProperty.call(o,id)?o[id]:SHARE_DEFAULT[id];if(el.type==="checkbox")el.checked=!!v;else if(el.tagName==="SELECT"&&![].some.call(el.options,function(opt){return opt.value===v}))el.value=SHARE_DEFAULT[id];else el.value=v})}
function shareDraw(){
 var o=shareOptions(),dimensions={landscape:[1200,630],square:[1080,1080],story:[1080,1920]},d=dimensions[o.shareFormat]||dimensions.landscape;
 var scale=Number(o.shareScale)||1,c=$("#shareCanvas"),ctx=c.getContext("2d");if(!ctx)return;
 c.width=d[0]*scale;c.height=d[1]*scale;ctx.setTransform(scale,0,0,scale,0,0);
 $("#shareDimensions").textContent=d[0]+" × "+d[1]+(scale>1?" · 2× export":"");
 var W=d[0],H=d[1],vertical=H>W,square=H===W,theme=SHARE_THEMES[o.shareStyle]||SHARE_THEMES.dark;
 var bg=theme[0],fg=theme[1],muted=theme[2],panel=theme[3],accent=o.shareAccent||"#66b6ff";
 var rows=S.items.filter(function(x){return !x.sample}),earned=rows.filter(function(x){return !!x.earned}),byType={};
 TYPE_ORDER.forEach(function(k){byType[k]=earned.filter(function(x){return x.type===k}).length});
 var games=new Set(rows.map(function(x){return x.game})).size,percent=rows.length?(100*earned.length/rows.length).toFixed(1):"0.0";
 var name=(o.shareName.trim()||(S.profile&&S.profile.name)||"TROPHY HUNTER").slice(0,40);
 var level=o.shareLevel&&S.profile&&S.profile.level!=null&&String(S.profile.level).trim()!==""?String(S.profile.level):null;
 function box(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,o.shareShape==="square"?0:o.shareShape==="soft"?Math.min(r*1.6,42):r);ctx.fill()}
 function line(x,y,xx,yy,color,width){ctx.strokeStyle=color;ctx.lineWidth=width||1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke()}
 function text(str,x,y,size,color,weight,max,align){ctx.font=(weight||"600")+" "+size+"px system-ui, Arial";ctx.fillStyle=color;ctx.textAlign=align||"left";ctx.textBaseline="alphabetic";var value=String(str);if(max){while(ctx.measureText(value).width>max&&value.length>2)value=value.slice(0,-2);if(value!==String(str))value+="…"}ctx.fillText(value,x,y);ctx.textAlign="left"}
 function rgba(hex,a){var v=hex.replace("#","");if(v.length!==6)return "rgba(120,160,220,"+a+")";return "rgba("+parseInt(v.slice(0,2),16)+","+parseInt(v.slice(2,4),16)+","+parseInt(v.slice(4,6),16)+","+a+")"}
 var grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,bg);grad.addColorStop(1,panel);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 // Decorative accents deliberately stay behind the information hierarchy.
 if(o.shareDecor){var glow=ctx.createRadialGradient(W*.82,H*.04,15,W*.82,H*.04,W*.9);glow.addColorStop(0,rgba(accent,.27));glow.addColorStop(1,rgba(accent,0));ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.beginPath();ctx.rect(W*.53,55,W*.47,H*.40);ctx.clip();ctx.globalAlpha=.075;ctx.strokeStyle=accent;ctx.lineWidth=1.5;
  if(o.sharePattern==="rings"){for(var i=0;i<6;i++){ctx.beginPath();ctx.arc(W*.98,H*.03,125+i*85,0,Math.PI*2);ctx.stroke()}}
  if(o.sharePattern==="grid"){for(var gx=0;gx<W;gx+=72)line(gx,0,gx,H,accent);for(var gy=0;gy<H;gy+=72)line(0,gy,W,gy,accent)}
  if(o.sharePattern==="stars"){for(var si=0;si<125;si++){var sx=(si*397.13)%W,sy=(si*211.79)%H;ctx.fillStyle=accent;ctx.fillRect(sx,sy,si%5===0?3:1.5,si%5===0?3:1.5)}}ctx.restore();
 }
 var m=vertical?72:square?66:56,inner=W-2*m;
 // Metallic-like edge, fine top accent, and brand mark.
 box(m,48,inner,5,3,accent);
 text("✦",m,106,34,"#D4AF37","900");text("YLTA",m+44,101,24,"#F3D16B","900");
 text("TROPHY COLLECTION",W-m,100,13,muted,"800",null,"right");
 var headerY=vertical?205: square?200:186;
 text(o.shareSubtitle.toUpperCase().slice(0,70),m,headerY-35,14,muted,"750",inner);
 var font=vertical?72:square?68:58;
 while(font>30){ctx.font="900 "+font+"px system-ui, Arial";if(ctx.measureText(name.toUpperCase()).width<=inner)break;font-=2}
 text(name.toUpperCase(),m,headerY+font-20,font,fg,"900",inner);
 var ruleY=headerY+font+12;line(m,ruleY,W-m,ruleY,rgba(muted,.32),2);
 // PSN level belongs in the upper-right identity header, not over trophy tiles.
 // Keep it inside the safe header area at every export aspect ratio.
 var contentY=ruleY+30;
 if(level){
  var levelText=String(level).slice(0,12), badgeW=vertical?215:200, badgeH=40;
  var badgeX=W-m-badgeW, badgeY=vertical?116:112;
  box(badgeX,badgeY,badgeW,badgeH,12,rgba(accent,.18));
  box(badgeX,badgeY,5,badgeH,3,accent);
  text("PSN LVL",badgeX+15,badgeY+25,12,muted,"800",82);
  text(levelText,badgeX+badgeW-15,badgeY+28,22,fg,"900",badgeW-108,"right");
 }
 var trophy=[{n:byType.platinum,l:"PLATINUM",c:"#80d4ff",glyph:"✦"},{n:byType.gold,l:"GOLD",c:"#f5c560",glyph:"◆"},{n:byType.silver,l:"SILVER",c:"#c7d0e1",glyph:"◇"},{n:byType.bronze,l:"BRONZE",c:"#d79a71",glyph:"⬡"}];
 var cardsY=Math.max(contentY,vertical?contentY+35:square?contentY+30:contentY+6);
 var cols=vertical||square?2:4,gap=vertical?20:16,cw=(inner-gap*(cols-1))/cols,ch=vertical?235:square?184:145;
 if(o.shareLayout==="banner"){
  // Spotlight card retains the other trophy counts below, without overlapping labels.
  var bigH=vertical?285:square?220:92;
  box(m,cardsY,inner,bigH,24,rgba(accent,.15));box(m,cardsY,7,bigH,4,accent);
  var bannerCompact=!vertical&&!square;
  text("PLATINUM HUNTER",m+32,cardsY+(bannerCompact?24:44),bannerCompact?15:18,muted,"800");
  text(byType.platinum,m+32,cardsY+bigH-(bannerCompact?13:38),bannerCompact?53:vertical?130:103,"#80d4ff","900",inner*.56);
  text("✦",W-m-60,cardsY+bigH-(bannerCompact?14:42),bannerCompact?62:vertical?115:85,accent,"800",null,"right");
  cardsY+=bigH+(vertical||square?20:12);trophy=trophy.slice(1);cols=vertical||square?2:3;cw=(inner-gap*(cols-1))/cols;if(!vertical&&!square)ch=82;
 }
 function drawTile(item,x,y,w,h,editorial){
  if(!editorial){box(x,y,w,h,20,rgba(fg,.065));box(x,y,5,h,3,item.c)}
  text(item.glyph,x+22,y+(h<90?19:h<115?24:38),h<90?15:h<115?18:27,item.c,"800");
  var val=String(item.n),sz=h<90?35:h<115?43:vertical?78:square?66:57;
  while(sz>30){ctx.font="900 "+sz+"px system-ui, Arial";if(ctx.measureText(val).width<w-44)break;sz-=2}
  text(val,x+22,y+h-(h<90?25:h<115?32:52),sz,fg,"900",w-44);
  text(item.l,x+22,y+h-(h<90?8:h<115?11:20),h<90?11:h<115?12:15,muted,"800",w-44);
 }
 trophy.forEach(function(item,i){var x=m+(i%cols)*(cw+gap),y=cardsY+Math.floor(i/cols)*(ch+gap);drawTile(item,x,y,cw,ch,o.shareLayout==="minimal")});
 var countRows=Math.ceil(trophy.length/cols),below=cardsY+countRows*(ch+gap)+15;
 var extras=[{n:earned.length.toLocaleString(),l:"TROPHIES EARNED"}];if(o.shareGames)extras.push({n:games.toLocaleString(),l:"GAMES TRACKED"});if(o.shareCompletion)extras.push({n:percent+"%",l:"COMPLETION"});
 var footer=H-(vertical?100:35),avail=footer-below;
 if(avail>92){var exCols=vertical?2:extras.length,ew=inner/exCols,eh=vertical?115:95;
 extras.forEach(function(e,i){var x=m+(i%exCols)*ew,y=below+Math.floor(i/exCols)*eh;text(e.n,x,y+43,vertical?45:35,fg,"900",ew-12);text(e.l,x,y+71,13,muted,"800",ew-12)})}
 // Footer is anchored to the bottom and visually separated from trophy tiles.
 var footerTop=footer-23;
 ctx.fillStyle=bg;ctx.fillRect(0,footerTop,W,H-footerTop);
 line(m,footerTop,W-m,footerTop,rgba(muted,.45),1);
 text("YOUR LOCAL TROPHY ANALYZER",m,footer,vertical?15:13,"#F3D16B","850",inner*.58);
 text("YOURLTA.PAGES.DEV",W-m,footer,vertical?15:13,muted,"750",inner*.4,"right");
 if(!rows.length)text("IMPORT YOUR TROPHIES TO PERSONALIZE THIS CARD",m,footer+23,13,muted,"750",inner);
}

function shareOpen(){
 $("#editor").hidden=true;$("#io").hidden=true;$("#sharePanel").hidden=false;
 if(!$("#shareName").value&&S.profile&&S.profile.name)$("#shareName").value=S.profile.name;
 $("#shareNative").hidden=!(navigator.canShare&&navigator.share&&window.File);
 shareDraw();$("#sharePanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function shareBlob(){return new Promise(function(resolve,reject){$("#shareCanvas").toBlob(function(blob){blob?resolve(blob):reject(new Error("Could not generate PNG"))},"image/png")})}
shareLoad();
$("#shareBtn").addEventListener("click",shareOpen);
SHARE_IDS.forEach(function(id){var el=$("#"+id);el.addEventListener(el.type==="text"||el.type==="color"?"input":"change",function(){shareSave();shareDraw()})});
$("#shareReset").addEventListener("click",function(){try{localStorage.removeItem("trophyLedger.card.v2")}catch(e){}shareLoad();shareDraw();$("#shareStatus").textContent="Card settings restored to defaults."});
$("#shareClose").addEventListener("click",function(){$("#sharePanel").hidden=true});
$("#shareDownload").addEventListener("click",async function(){try{shareDraw();var blob=await shareBlob(),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="yourlta-"+$("#shareFormat").value+".png";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},2000);$("#shareStatus").textContent="PNG downloaded."}catch(e){$("#shareStatus").textContent="Download failed: "+e.message}});
$("#shareNative").addEventListener("click",async function(){try{shareDraw();var file=new File([await shareBlob()],"yourlta-trophy-stats.png",{type:"image/png"});if(!navigator.canShare({files:[file]}))throw new Error("Image sharing is not supported on this device");await navigator.share({files:[file],title:"My YLTA trophy stats",text:"Track your PlayStation trophies at https://yourlta.pages.dev/"})}catch(e){if(e.name!=="AbortError")$("#shareStatus").textContent=e.message}});

/* ---------- boot ---------- */
buildChips();
syncControls();
store.load().then(function(d){
  if(d&&Array.isArray(d.items)){
    S.items=d.items;S.goals=normalizeGoals(d.goals);S.profile=d.profile||null;
    var p=d.prefs||{};
    if(SORT_DEFAULT[p.sort]){S.sort=p.sort;S.dir=p.dir==="asc"||p.dir==="desc"?p.dir:SORT_DEFAULT[p.sort]}
    if(["none","game","type","tier","month","year","status"].indexOf(p.group)>=0)S.group=p.group;
    S.reveal=!!p.reveal;S.compact=!!p.compact;if(["recent","pct","left","size","name"].indexOf(p.gsort)>=0)S.gsort=p.gsort;
  }else{S.items=sampleItems()}
  S.tab=appPrefs.landing;S.ready=true;renderAll();
}).catch(function(){S.items=sampleItems();S.tab=appPrefs.landing;S.ready=true;renderAll()});
})();
