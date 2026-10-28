

/* YourLTA v13 — accessibility, fast actions, and progressive disclosure */
(function(){
 'use strict';
 const $=s=>document.querySelector(s);
 const themeBtn=$('#yltaThemeToggle');
 function currentTheme(){
   const explicit=document.documentElement.getAttribute('data-theme');
   if(explicit==='light'||explicit==='dark')return explicit;
   return window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
 }
 function updateThemeLabel(){
   const light=currentTheme()==='light';
   themeBtn.textContent=light?'☾':'☼';
   themeBtn.title=light?'Switch to dark mode':'Switch to light mode';
   themeBtn.setAttribute('aria-label',themeBtn.title);
 }
 themeBtn.addEventListener('click',function(){
   const newTheme=currentTheme()==='light'?'dark':'light';
   const select=$('#appTheme');
   select.value=newTheme;
   select.dispatchEvent(new Event('change',{bubbles:true}));
   updateThemeLabel();
 });
 updateThemeLabel();
 // Keep the actual upload/restore tool immediately after the entry choices.
 const wizard=$('#yltaImportWizard'),uploader=$('#yltaImportData');
 // File uploader stays inside the PC-only method. Never move it into the shared wizard.
 // Search works consistently from every tab. Shortcuts never intercept typed text.
 document.addEventListener('keydown',function(e){
   const target=e.target;
   const typing=target&&(target.matches('input,textarea,select')||target.isContentEditable);
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
     e.preventDefault();$('#yltaTopSearch').click();return;
   }
   if(e.key==='Escape'&&!typing){
     const settings=$('#appSettings'),share=$('#sharePanel');
     if(settings&&!settings.hidden){settings.hidden=true;return}
     if(share&&!share.hidden){share.hidden=true;return}
   }
 },false);
 // Keep the page context visible when navigating on phone.
 $('#yltaSideTabs').addEventListener('click',function(e){
   if(e.target.closest('[data-tab]'))window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 });
 // Preserve richer layouts per user while showing advanced filters on demand.
 const more=$('#filterMore');
 if(more){
   const k='yourlta.filters.expanded.v1';
   try{more.open=localStorage.getItem(k)==='yes'}catch(e){}
   more.addEventListener('toggle',function(){try{localStorage.setItem(k,more.open?'yes':'no')}catch(e){}});
 }
 // The initial IndexedDB hydration can select a tab after the header was initialized.
 const names={dashboard:['Dashboard','Your PlayStation trophies at a glance.'],trophies:['Trophies','Search, filter and manage your achievements.'],stats:['Analytics','Detailed trophy statistics and rarity insights.'],games:['Games','Explore completion and your game library.'],goals:['Goals','Set smart trophy goals, build checklists, and earn milestones.']};
 const nav=$('#yltaSideTabs');
 function syncHeader(){
   const active=nav.querySelector('.tab[aria-selected="true"]');
   const data=names[active?.dataset.tab||'dashboard'];
   if(data){$('#yltaPageTitle').textContent=data[0];$('#yltaPageDesc').textContent=data[1];}
 }
 new MutationObserver(syncHeader).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
 setTimeout(syncHeader,0);
})();

