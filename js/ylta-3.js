
/* YLTA v8 analytics layout and accessible dashboard arrangement. All choices stay in this browser. */
(function(){
 'use strict';
 var STATS_KEY='ylta.stats.layout.v2',DASH_KEY='ylta.dashboard.order.v1';
 var CATEGORY={
  'By type':'Distribution','By rarity':'Distribution','By platform':'Distribution','Base game and DLC':'Distribution',
  'Earned per day, last year':'Activity','Earned per month':'Activity','By weekday':'Activity','By hour of day':'Activity',
  'Records':'Activity','Activity highlights':'Activity',
  'Collection breakdown':'Collection','Platinum shelf':'Collection','Rarest earned':'Collection','Latest earned':'Collection',
  'Easiest to earn next':'Goals','Closest to finishing':'Goals'
 };
 var ORDER=['By type','By rarity','By platform','Base game and DLC','Collection breakdown','Earned per day, last year','Earned per month','By weekday','By hour of day','Records','Activity highlights','Platinum shelf','Rarest earned','Latest earned','Easiest to earn next','Closest to finishing'];
 var dragItem=null,editStats=false,editDashboard=false,raf=0;
 function stored(key){try{var arr=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(arr)?arr.filter(function(v){return typeof v==='string'&&v.length<100}):[]}catch(e){return []}}
 function persist(key,items,attr){try{localStorage.setItem(key,JSON.stringify(items.map(function(c){return c.getAttribute(attr)}).filter(Boolean)))}catch(e){}}
 function clear(key){try{localStorage.removeItem(key)}catch(e){}}
 function moveCard(card,direction,board,selector,key,attr){
  var siblings=Array.from(board.querySelectorAll(':scope > '+selector)),idx=siblings.indexOf(card),other=siblings[idx+direction];
  if(!other)return;
  if(direction<0)board.insertBefore(card,other);else board.insertBefore(other,card);
  persist(key,Array.from(board.querySelectorAll(':scope > '+selector)),attr);
  if(board.id==='statsBoard')requestStatsLayout(board);
  card.querySelector('.stats-drag')?.focus();
 }
 function applySaved(board,selector,key,attr,defaultOrder){
  var cards=Array.from(board.querySelectorAll(':scope > '+selector)),saved=stored(key),ids=saved.length?saved:defaultOrder;
  cards.sort(function(a,b){
   var ia=ids.indexOf(a.getAttribute(attr)),ib=ids.indexOf(b.getAttribute(attr));
   if(ia<0)ia=ids.length+defaultOrder.indexOf(a.getAttribute(attr));
   if(ib<0)ib=ids.length+defaultOrder.indexOf(b.getAttribute(attr));
   return ia-ib;
  });
  cards.forEach(function(card){board.appendChild(card)});
 }
 function requestStatsLayout(board){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(function(){
   if(!board||!board.isConnected||board.getBoundingClientRect().width<1)return;
   var cards=Array.from(board.querySelectorAll(':scope > .stats-card'));
   cards.forEach(function(card){card.style.gridRowEnd='span 1'});
   raf=requestAnimationFrame(function(){
    if(!board.isConnected||board.getBoundingClientRect().width<1)return;
    var style=getComputedStyle(board),row=parseFloat(style.gridAutoRows)||8,gap=parseFloat(style.rowGap)||12;
    cards.forEach(function(card){var height=card.getBoundingClientRect().height+2,span=Math.max(1,Math.ceil((height+gap)/(row+gap)));card.style.gridRowEnd='span '+span});
   });
  });
 }
 function setupDnD(container,itemSelector,key,attr,afterMove){
  if(container.dataset.sortableBound)return;
  container.dataset.sortableBound='1';
  container.addEventListener('dragstart',function(e){
   var handle=e.target.closest('.stats-drag'),card=handle&&handle.closest(itemSelector);
   if(!card||!container.contains(card)||!(container.classList.contains('is-editing')||container.classList.contains('is-arranging'))){e.preventDefault();return}
   dragItem=card;card.classList.add('is-dragging');
   if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',card.getAttribute(attr)||'YLTA')}
  });
  container.addEventListener('dragover',function(e){
   if(!dragItem||!container.contains(dragItem))return;
   var target=e.target.closest(itemSelector);if(!target||target===dragItem)return;
   e.preventDefault();e.dataTransfer.dropEffect='move';
   container.querySelectorAll('.is-drop-target').forEach(function(n){n.classList.remove('is-drop-target')});
   target.classList.add('is-drop-target');
  });
  container.addEventListener('drop',function(e){
   if(!dragItem||!container.contains(dragItem))return;
   var target=e.target.closest(itemSelector);if(!target||target===dragItem)return;
   e.preventDefault();
   var siblings=Array.from(container.querySelectorAll(':scope > '+itemSelector));
   var from=siblings.indexOf(dragItem),to=siblings.indexOf(target);
   if(from<to)container.insertBefore(dragItem,target.nextSibling);else container.insertBefore(dragItem,target);
   persist(key,Array.from(container.querySelectorAll(':scope > '+itemSelector)),attr);
   if(afterMove)afterMove();
  });
  container.addEventListener('dragend',function(){
   container.querySelectorAll('.is-drop-target,.is-dragging').forEach(function(n){n.classList.remove('is-drop-target','is-dragging')});dragItem=null;
  });
  container.addEventListener('click',function(e){
   var btn=e.target.closest('[data-reorder]');if(!btn||!container.contains(btn))return;
   e.preventDefault();e.stopPropagation();
   var card=btn.closest(itemSelector),dir=btn.dataset.reorder==='up'?-1:1;
   if(!card)return;
   moveCard(card,dir,container,itemSelector,key,attr);
   if(afterMove)afterMove();
  });
 }
 function controls(label){
  var wrapper=document.createElement('div');wrapper.className='stats-edit-controls';
  var up=document.createElement('button');up.type='button';up.className='stats-move';up.dataset.reorder='up';up.textContent='↑';up.title='Move '+label+' up';up.setAttribute('aria-label','Move '+label+' earlier');
  var down=document.createElement('button');down.type='button';down.className='stats-move';down.dataset.reorder='down';down.textContent='↓';down.title='Move '+label+' down';down.setAttribute('aria-label','Move '+label+' later');
  var handle=document.createElement('button');handle.type='button';handle.className='stats-move stats-drag';handle.draggable=true;handle.textContent='⠿';handle.title='Drag to rearrange '+label;handle.setAttribute('aria-label','Drag '+label+' to rearrange');
  wrapper.append(up,down,handle);return wrapper;
 }
 function enhanceStats(host){
  var board=host.querySelector('#statsBoard');if(!board)return;
  var cards=Array.from(board.children);
  cards.forEach(function(card){
   var h=card.querySelector(':scope > h2');if(!h)return;
   var title=h.textContent.trim();card.dataset.statTitle=title;card.classList.add('stats-card');
   var header=document.createElement('div');header.className='stats-card-header';
   var cap=document.createElement('div');cap.className='stats-title';
   var tag=document.createElement('span');var category=CATEGORY[title]||'Analytics';tag.className='stats-tag '+category.toLowerCase();tag.textContent=category;
   cap.append(h,tag);header.append(cap,controls(title));card.prepend(header);
  });
  applySaved(board,'.stats-card',STATS_KEY,'data-stat-title',ORDER);
  var toolbar=document.createElement('div');toolbar.className='stats-layout-bar';
  toolbar.innerHTML='<div><strong>Analytics workspace</strong><small>Organized cards · move and save your own layout</small></div>';
  var actions=document.createElement('div');actions.className='stats-layout-actions';
  var toggle=document.createElement('button');toggle.type='button';toggle.className='btn';toggle.id='statsArrange';toggle.textContent=editStats?'✓ Done arranging':'↕ Rearrange cards';toggle.setAttribute('aria-pressed',String(editStats));
  var reset=document.createElement('button');reset.type='button';reset.className='btn';reset.textContent='↺ Reset layout';reset.hidden=!editStats;
  actions.append(toggle,reset);toolbar.append(actions);host.insertBefore(toolbar,board);
  function edit(value){editStats=value;board.classList.toggle('is-editing',value);toggle.textContent=value?'✓ Done arranging':'↕ Rearrange cards';toggle.setAttribute('aria-pressed',String(value));reset.hidden=!value;requestStatsLayout(board)}
  toggle.addEventListener('click',function(){edit(!editStats)});
  reset.addEventListener('click',function(){clear(STATS_KEY);applySaved(board,'.stats-card',STATS_KEY,'data-stat-title',ORDER);requestStatsLayout(board)});
  edit(editStats);
  setupDnD(board,'.stats-card',STATS_KEY,'data-stat-title',function(){requestStatsLayout(board)});
  requestStatsLayout(board);
 }
 function enhanceDashboard(host){
  var folds=Array.from(host.querySelectorAll(':scope > .dash-fold'));
  if(!folds.length)return;
  var order=['welcome','overview','insights'];
  applySaved(host,'.dash-fold',DASH_KEY,'data-ylta-fold',order);
  folds.forEach(function(fold){
   var summary=fold.querySelector('summary');if(!summary)return;
   var label=fold.dataset.yltaFold||'section',wrapper=controls(label);wrapper.className='dash-reorder-control';
   wrapper.addEventListener('click',function(e){
    var btn=e.target.closest('[data-reorder]');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    moveCard(fold,btn.dataset.reorder==='up'?-1:1,host,'.dash-fold',DASH_KEY,'data-ylta-fold');
   });
   summary.append(wrapper);
  });
  var tools=host.querySelector('.dash-section-tools .actions');if(!tools)return;
  var toggle=document.createElement('button');toggle.type='button';toggle.className='btn sm';toggle.textContent=editDashboard?'✓ Done arranging':'↕ Rearrange';
  var reset=document.createElement('button');reset.type='button';reset.className='btn sm';reset.textContent='↺ Reset order';reset.hidden=!editDashboard;
  tools.append(toggle,reset);
  function edit(value){editDashboard=value;host.classList.toggle('is-arranging',value);toggle.textContent=value?'✓ Done arranging':'↕ Rearrange';reset.hidden=!value}
  toggle.addEventListener('click',function(){edit(!editDashboard)});
  reset.addEventListener('click',function(){clear(DASH_KEY);applySaved(host,'.dash-fold',DASH_KEY,'data-ylta-fold',order)});
  edit(editDashboard);
  setupDnD(host,'.dash-fold',DASH_KEY,'data-ylta-fold');
 }
 window.yltaEnhanceStats=enhanceStats;
 window.yltaEnhanceDashboard=enhanceDashboard;
 window.addEventListener('resize',function(){var b=document.querySelector('#view-stats:not([hidden]) #statsBoard');if(b)requestStatsLayout(b)},{passive:true});
})();
