
(function(){
var tabs=document.querySelector('.bar .tabs'),side=document.getElementById('yltaSideTabs');if(tabs&&side){Array.from(tabs.querySelectorAll('[data-tab]')).forEach(function(b){side.appendChild(b)});}
var names={dashboard:['Dashboard','Your PlayStation trophies at a glance.'],games:['Games','Explore completion and your game library.'],trophies:['Trophies','Search, filter and manage your achievements.'],stats:['Analytics','Detailed trophy statistics and rarity insights.'],goals:['Goals','Set smart trophy goals, build checklists, and earn milestones.']};
function update(){var active=document.querySelector('#yltaSideTabs .tab[aria-selected="true"]');var name=active&&names[active.dataset.tab]||names.dashboard;document.getElementById('yltaPageTitle').textContent=name[0];document.getElementById('yltaPageDesc').textContent=name[1];}
side.addEventListener('click',function(){setTimeout(update,0)});update();
function link(a,b){var x=document.getElementById(a),y=document.getElementById(b);if(x&&y)x.addEventListener('click',function(){y.click()})}
link('yltaImport','ioBtn');link('yltaTopImport','ioBtn');link('yltaShare','shareBtn');link('yltaSettings','settingsBtn');
document.getElementById('yltaTopSearch').addEventListener('click',function(){document.getElementById('tab-trophies').click();update();var q=document.getElementById('q');q.focus();q.scrollIntoView({behavior:'smooth',block:'center'})});
/* Persist open sections across dashboard navigation, refresh and redeployments. */
var foldKey='ylta.dashboard.folds.v1';
function readFold(){try{return JSON.parse(localStorage.getItem(foldKey)||'{}')||{}}catch(e){return {}}}
function writeFold(v){try{localStorage.setItem(foldKey,JSON.stringify(v))}catch(e){}}
document.addEventListener('toggle',function(e){
 var d=e.target;if(!d.matches||!d.matches('details[data-ylta-fold]'))return;
 var state=readFold();state[d.dataset.yltaFold]=d.open;writeFold(state);
},true);
document.addEventListener('click',function(e){
 var btn=e.target.closest('[data-fold-all]');if(!btn)return;
 var open=btn.dataset.foldAll==='open',state=readFold();
 document.querySelectorAll('details[data-ylta-fold]').forEach(function(d){d.open=open;state[d.dataset.yltaFold]=open});writeFold(state);
});
var brand=document.getElementById('yltaBrandLink');if(brand)brand.addEventListener('click',function(e){e.preventDefault();document.getElementById('tab-dashboard').click();update()});

})();
