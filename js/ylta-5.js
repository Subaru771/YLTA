
(function(){
 function start(){
  var psn=document.getElementById('yltaSimplePSN'),psnp=document.getElementById('yltaSimplePSNP');
  var psnBtn=document.getElementById('yltaTabPSN'),psnpBtn=document.getElementById('yltaTabPSNP');
  var importData=document.getElementById('yltaImportData'),rarity=document.getElementById('psnpHtmlSection');
  if(!psn||!psnp||!importData||!rarity)return;
  document.getElementById('yltaPCMethod').appendChild(importData);
  document.getElementById('yltaPSNPFileSlot').appendChild(rarity);
  function show(mode){
   var isPSN=mode==='psn';psn.hidden=!isPSN;psnp.hidden=isPSN;
   psnBtn.classList.toggle('primary',isPSN);psnpBtn.classList.toggle('primary',!isPSN);
   psnBtn.setAttribute('aria-pressed',String(isPSN));psnpBtn.setAttribute('aria-pressed',String(!isPSN));
   try{localStorage.setItem('ylta.importTab',mode)}catch(e){}
  }
  var webBtn=document.getElementById('yltaMethodWeb'),pcBtn=document.getElementById('yltaMethodPC');
  var webPanel=document.getElementById('yltaWebMethod'),pcPanel=document.getElementById('yltaPCMethod');
  function method(which){
   var web=which==='web';webPanel.hidden=!web;pcPanel.hidden=web;importData.hidden=web;
   webBtn.setAttribute('aria-expanded',String(web));pcBtn.setAttribute('aria-expanded',String(!web));
  }
  webBtn.addEventListener('click',function(){method('web')});
  pcBtn.addEventListener('click',function(){method('pc')});
  webPanel.hidden=true;pcPanel.hidden=true;importData.hidden=true;
  psnBtn.addEventListener('click',function(){show('psn')});
  psnpBtn.addEventListener('click',function(){show('psnp')});
  show(localStorage.getItem('ylta.importTab')==='psnp'?'psnp':'psn');
  // Existing quick actions select the correct section instead of scrolling to hidden content.
  document.getElementById('importWizardFile').addEventListener('click',function(){show('psn');method('pc')},true);
  document.getElementById('importWizardPSNP').addEventListener('click',function(){show('psnp')},true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
