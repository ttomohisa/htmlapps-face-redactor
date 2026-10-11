// Actual Help/Clear/Save handlers with a bounded DOM adapter, not native layout evidence.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test'),{gunzipSync}=require('node:zlib');
let html=fs.readFileSync(process.env.FACE_REDACTOR_HTML||path.join(__dirname,'../src/index.template.html'),'utf8');
const packed=html.match(/<script id="self-extract-payload" type="application\/octet-stream">([A-Za-z0-9+/=\r\n]+)<\/script>/);if(packed)html=gunzipSync(Buffer.from(packed[1],'base64')).toString();
function slice(a,b){let i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i,a);return html.slice(i,j)}
function harness(){
 const nodes={},events={},timers=[],workflow=[],saved=[];let doc;
 function node(id,hidden=false){const classes=new Set(hidden?['hidden']:[]);const n={id,isConnected:true,disabled:false,inert:false,tabIndex:0,children:[],parentElement:null,style:{},attrs:{},listeners:{},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},getClientRects(){return !this.isConnected||this.hidden||this.classList.contains('hidden')||this.parentElement?.getClientRects().length===0?[]:[{}]},contains(x){return x===this||this.children.some(c=>c.contains(x))},closest(s){if(s==='[inert]')return this.inert?this:this.parentElement?.closest(s);return null},focus(){if(this.getClientRects().length&&!this.disabled&&!this.closest('[inert]'))doc.activeElement=this},setAttribute(k,v){this.attrs[k]=v;if(k==='tabindex')this.tabIndex=+v},getAttribute(k){return this.attrs[k]??null},removeAttribute(k){delete this.attrs[k]},addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)},querySelectorAll(){return this.children.flatMap(c=>[c,...c.querySelectorAll()])},select(){this.focus();this.selected=true},click(){if(!this.disabled)this.onclick?.({target:this,preventDefault(){},stopPropagation(){}})}};nodes[id]=n;return n}
 const root=node('html'),body=node('body'),header=node('header'),main=node('main'),bar=node('bar'),help=node('helpModal',true),clear=node('clearConfirm',true),save=node('saveConfirm',true);root.children=[body];body.parentElement=root;body.children=[header,main,bar,help,clear,save];body.children.forEach(n=>n.parentElement=body);
 const add=(p,id)=>{let n=node(id);n.parentElement=p;p.children.push(n);return n};
 for(const id of ['helpToggle','menuToggle','languageToggle','export'])add(header,id);add(main,'canvasOpen');add(bar,'mobileMore');nodes.mobileMore.hidden=true;
 const menu=add(header,'headerMenu');menu.classList.add('hidden');add(menu,'clear');
 for(const id of ['format','quality','exportScale'])add(main,id);nodes.format.value='image/png';nodes.quality.value='.92';nodes.exportScale.value='100';
 for(const id of ['saveFilename','saveFormat','saveQuality','saveScale','reviewCheck','saveCancel','saveAccept'])add(save,id);
 add(help,'helpClose');add(help,'helpBody');add(clear,'clearCancel');add(clear,'clearAccept');
 doc={body,documentElement:root,activeElement:body,querySelectorAll(s){return s.includes('.confirm-modal')?[help,clear,save].filter(n=>!n.classList.contains('hidden')):[]},querySelector(s){return s==='dialog:modal'?null:null},addEventListener(k,f){(events[k]??=[]).push(f)}};
 const c={$:id=>nodes[id],document:doc,console,getComputedStyle:()=>({visibility:'visible'}),closeHeaderMenu(){menu.classList.add('hidden')},closeMobileActionMenu(){},sourceBaseName:'synthetic',saveExt:type=>type==='image/png'?'png':type==='image/jpeg'?'jpg':'webp',safeOutputFilename:(name,type)=>name.replace(/\.[^.]+$/,'')+'.'+(type==='image/png'?'png':type==='image/jpeg'?'jpg':'webp'),updateSaveDetails(){},updateWorkflowProgress:on=>workflow.push(on),saveImage:()=>saved.push({name:nodes.saveFilename.value,format:nodes.format.value,quality:nodes.quality.value,scale:nodes.exportScale.value}),setTimeout:fn=>timers.push(fn)};vm.createContext(c);
 const helper=html.includes('// Help/Clear overlay lifecycle')?slice('// Help/Clear overlay lifecycle',"$('helpToggle').onclick="):'';
 vm.runInContext(helper+slice("$('helpToggle').onclick=","document.addEventListener('paste'"),c);
 vm.runInContext(slice("$('clear').onclick=","$('clearAccept').onclick="),c);
 vm.runInContext(slice("$('export').onclick=","$('share').onclick="),c);
 const key=(key,shiftKey=false)=>{const e={key,shiftKey,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true},stopImmediatePropagation(){this.stopped=true}};for(const f of events.keydown||[]){f(e);if(e.stopped)break}return e};
 const pointer=(id,target=id)=>{const event={target:nodes[target],defaultPrevented:false,preventDefault(){this.defaultPrevented=true}};for(const f of nodes[id].listeners.pointerdown||[])f(event);if(!event.defaultPrevented){if(target===id)doc.activeElement=body;else nodes[target].focus()}return event};
 const run=x=>vm.runInContext(x,c);
 return{nodes,doc,key,pointer,run,workflow,saved,flush(){while(timers.length)timers.shift()()},openSave(){nodes.export.focus();nodes.export.click()},change(id){for(const fn of nodes[id].listeners.change||[])fn()},openHelp(){nodes.helpToggle.focus();nodes.helpToggle.click()},openClear(mobile=false){nodes.mobileMore.hidden=!mobile;nodes.menuToggle.hidden=mobile;menu.classList.remove('hidden');nodes.clear.focus();nodes.clear.click();menu.classList.add('hidden')}};
}
test('Help makes background inert and locks both scroll roots, then restores previous ownership',()=>{const h=harness();h.nodes.main.inert=true;h.nodes.html.classList.add('modal-open');h.openHelp();assert.equal(h.doc.activeElement.id,'helpClose');assert(h.nodes.header.inert);assert(h.nodes.body.classList.contains('modal-open'));h.nodes.helpClose.click();assert.equal(h.nodes.header.inert,false);assert.equal(h.nodes.main.inert,true);assert.equal(h.nodes.html.classList.contains('modal-open'),true);assert.equal(h.nodes.body.classList.contains('modal-open'),false);assert.equal(h.doc.activeElement.id,'helpToggle')});
test('actual forward and reverse Tab wrap inside Help and recover escaped focus',()=>{const h=harness();h.openHelp();h.nodes.helpClose.focus();assert(h.key('Tab',true).prevented);assert.equal(h.doc.activeElement.id,'helpBody');assert(h.key('Tab').prevented);assert.equal(h.doc.activeElement.id,'helpClose');h.doc.activeElement=h.nodes.body;h.key('Tab');assert.equal(h.doc.activeElement.id,'helpClose')});
test('Help inside click stays; backdrop and Escape dismiss and return opener on repeated use',()=>{const h=harness();h.openHelp();h.pointer('helpModal','helpBody');assert(!h.nodes.helpModal.classList.contains('hidden'));h.pointer('helpModal');assert(h.nodes.helpModal.classList.contains('hidden'));assert.equal(h.doc.activeElement.id,'helpToggle');h.openHelp();h.key('Escape');assert(h.nodes.helpModal.classList.contains('hidden'));assert.equal(h.doc.activeElement.id,'helpToggle')});
test('Clear starts on Cancel, confines Tab, and restores the visible closed-menu trigger',()=>{for(const mobile of [false,true]){const h=harness();h.openClear(mobile);assert.equal(h.doc.activeElement.id,'clearCancel');assert(h.nodes.header.inert);h.key('Tab',true);assert.equal(h.doc.activeElement.id,'clearAccept');h.key('Tab');assert.equal(h.doc.activeElement.id,'clearCancel');h.nodes.clearCancel.click();assert.equal(h.doc.activeElement.id,mobile?'mobileMore':'menuToggle')}});
test('Clear Escape/backdrop preserve state and use current breakpoint opener',()=>{for(const route of ['Escape','backdrop']){const h=harness();h.openClear();h.nodes.menuToggle.hidden=true;h.nodes.mobileMore.hidden=false;if(route==='Escape')h.key('Escape');else h.pointer('clearConfirm');assert(h.nodes.clearConfirm.classList.contains('hidden'));assert.equal(h.doc.activeElement.id,'mobileMore')}});
test('hidden disabled disconnected openers fall back without changing page or menu state',()=>{for(const kind of ['hidden','disabled','disconnected']){const h=harness();h.openHelp();if(kind==='disconnected')h.nodes.helpToggle.isConnected=false;else h.nodes.helpToggle[kind]=true;h.nodes.helpClose.click();assert.equal(h.doc.activeElement.id,'menuToggle');assert(h.nodes.headerMenu.classList.contains('hidden'))}});
test('stale close does not release newer Help/Clear ownership',()=>{const h=harness();h.openHelp();h.run("openAuditModal('clearConfirm', $('menuToggle'), 'clearCancel')");h.run("closeAuditModal('helpModal')");assert.equal(h.doc.activeElement.id,'clearCancel');assert(h.nodes.header.inert);assert(h.nodes.body.classList.contains('modal-open'));h.nodes.clearCancel.click();assert.equal(h.nodes.header.inert,false)});
test('unrelated visible Save overlay prevents return-focus theft',()=>{const h=harness();h.openHelp();h.nodes.saveConfirm.classList.remove('hidden');h.doc.activeElement=h.nodes.saveConfirm;h.nodes.helpClose.click();assert.equal(h.doc.activeElement.id,'saveConfirm');assert.equal(h.nodes.saveConfirm.inert,false)});
test('Help/Clear layering remains above header and mobile bars',()=>{assert.match(html.slice(0,html.indexOf('const ORT_JS=')+1)+html.slice(html.indexOf('const ORT_JS=')).split('\n').slice(1).join('\n'),/#helpModal,#clearConfirm\s*\{[^}]*z-index:\s*1300/);assert.match(html.slice(0,html.indexOf('const ORT_JS=')+1)+html.slice(html.indexOf('const ORT_JS=')).split('\n').slice(1).join('\n'),/html\.modal-open,body\.modal-open\s*\{[^}]*overflow:hidden/);assert.match(html.slice(0,html.indexOf('const ORT_JS=')+1)+html.slice(html.indexOf('const ORT_JS=')).split('\n').slice(1).join('\n'),/class="help-scroll"[^>]*tabindex="0"/)});
test('narrow title/version remain visible without changing brand artwork',()=>{assert.match(html.slice(0,html.indexOf('const ORT_JS=')+1)+html.slice(html.indexOf('const ORT_JS=')).split('\n').slice(1).join('\n'),/@media\(max-width:420px\)\{\s*header h1\.brand-name\{[^}]*white-space:normal!important/);assert.match(html.slice(0,html.indexOf('const ORT_JS=')+1)+html.slice(html.indexOf('const ORT_JS=')).split('\n').slice(1).join('\n'),/header \.version-badge\{display:inline-flex!important;[^}]*margin-left:0!important/)});
test('background shortcuts and confirmed Clear handlers use lifecycle',()=>{assert.match(html.slice(0,html.indexOf('const ORT_JS=')+1)+html.slice(html.indexOf('const ORT_JS=')).split('\n').slice(1).join('\n'),/document\.addEventListener\('keydown',e=>\{if\(auditModal\)return;/);assert.match(html.slice(0,html.indexOf('const ORT_JS=')+1)+html.slice(html.indexOf('const ORT_JS=')).split('\n').slice(1).join('\n'),/\$\('clearAccept'\)\.onclick=\(\)=>\{ closeAuditModal\('clearConfirm'\)/)});

// These contracts verify source structure; native geometry is checked separately.
test('Save shell bounds its title, scroll body and actions above app chrome',()=>{
 const css=html.slice(0,html.indexOf('</head>')),markup=slice('id="saveConfirm"','id="clearConfirm"');
 assert.match(css,/#saveConfirm\s*\{[^}]*z-index:\s*1300/);
 assert.match(css,/#saveConfirm \.save-confirm-card\s*\{[^}]*display:grid[^}]*grid-template-rows:auto minmax\(0,1fr\) auto[^}]*max-height:calc\(100dvh - 28px\)[^}]*overflow:hidden/);
 assert.match(css,/#saveConfirm \.save-confirm-body\s*\{[^}]*min-height:0[^}]*overflow:auto[^}]*overscroll-behavior:contain/);
 assert.match(markup,/id="saveConfirmTitle"[^>]*>[^<]+<\/strong><div class="save-confirm-body">/);
 assert.match(markup,/id="saveEstimate"[^>]*>[^<]+<\/p><\/div><div class="save-confirm-actions">/);
});
test('Save opens with immediate filename selection, inert background and prior scroll ownership',()=>{
 const h=harness();h.nodes.main.inert=true;h.nodes.html.classList.add('modal-open');h.openSave();
 assert.equal(h.doc.activeElement.id,'saveFilename');assert(h.nodes.saveFilename.selected);assert(h.nodes.header.inert);assert(h.nodes.bar.inert);assert(h.nodes.body.classList.contains('modal-open'));
 h.nodes.saveCancel.click();assert.equal(h.nodes.main.inert,true);assert.equal(h.nodes.header.inert,false);assert(h.nodes.html.classList.contains('modal-open'));assert.equal(h.nodes.body.classList.contains('modal-open'),false);assert.equal(h.doc.activeElement.id,'export');
});
test('Save Tab endpoints track disabled review acceptance and recover escaped focus',()=>{
 const h=harness();h.openSave();assert(h.key('Tab',true).prevented);assert.equal(h.doc.activeElement.id,'saveCancel');assert(h.key('Tab').prevented);assert.equal(h.doc.activeElement.id,'saveFilename');
 h.nodes.reviewCheck.checked=true;h.change('reviewCheck');h.nodes.saveFilename.focus();h.key('Tab',true);assert.equal(h.doc.activeElement.id,'saveAccept');h.key('Tab');assert.equal(h.doc.activeElement.id,'saveFilename');h.doc.activeElement=h.nodes.body;h.key('Tab',true);assert.equal(h.doc.activeElement.id,'saveAccept');
});
test('Save Cancel, Escape and direct backdrop close repeatedly and restore visible export or fallback',()=>{
 for(const route of ['cancel','Escape','backdrop'])for(const opener of ['export','hidden','disabled','disconnected']){
  const h=harness();for(let i=0;i<2;i++){h.nodes.export.hidden=false;h.nodes.export.disabled=false;h.nodes.export.isConnected=true;h.openSave();h.pointer('saveConfirm','saveFilename');assert(!h.nodes.saveConfirm.classList.contains('hidden'));
   if(opener==='disconnected')h.nodes.export.isConnected=false;else if(opener!=='export')h.nodes.export[opener]=true;
   h.nodes.menuToggle.hidden=opener!=='export';h.nodes.mobileMore.hidden=opener==='export';
   if(route==='cancel')h.nodes.saveCancel.click();else if(route==='Escape')h.key('Escape');else assert(h.pointer('saveConfirm').defaultPrevented);
   assert(h.nodes.saveConfirm.classList.contains('hidden'),route);assert.equal(h.doc.activeElement.id,opener==='export'?'export':'mobileMore');assert.equal(h.nodes.header.inert,false);assert.equal(h.nodes.body.classList.contains('modal-open'),false);assert.equal(h.workflow.at(-1),false);assert.equal(h.saved.length,0);
  }
 }
});
test('Save preserves review gate and output controls and restores export after accepted save',()=>{
 const h=harness();h.openSave();assert.equal(h.nodes.reviewCheck.checked,false);assert.equal(h.nodes.saveAccept.disabled,true);h.nodes.saveAccept.click();assert.equal(h.saved.length,0);
 h.nodes.saveFilename.value='reviewed.webp';h.nodes.saveFormat.value='image/webp';h.nodes.saveQuality.value='.74';h.nodes.saveScale.value='65';h.nodes.reviewCheck.checked=true;h.change('reviewCheck');h.nodes.saveAccept.focus();h.nodes.saveAccept.click();
 assert.deepEqual(h.saved,[{name:'reviewed.webp',format:'image/webp',quality:.74,scale:65}]);assert(h.nodes.saveConfirm.classList.contains('hidden'));assert.equal(h.doc.activeElement.id,'export');assert.equal(h.nodes.header.inert,false);assert.equal(h.workflow.at(-1),false);
 h.openSave();assert.equal(h.nodes.reviewCheck.checked,false);assert.equal(h.nodes.saveAccept.disabled,true);
});
test('stale Save close and delayed selection cannot steal newer Help focus or release its locks',()=>{
 const h=harness();h.openSave();h.run("openAuditModal('helpModal', $('helpToggle'), 'helpClose')");h.nodes.saveCancel.click();h.flush();
 assert(h.nodes.saveConfirm.classList.contains('hidden'));assert.equal(h.doc.activeElement.id,'helpClose');assert(h.nodes.header.inert);assert(h.nodes.body.classList.contains('modal-open'));h.nodes.helpClose.click();assert.equal(h.nodes.header.inert,false);
});
test('Save close preserves newer unrelated modal focus and restores preexisting locks',()=>{
 const h=harness();h.nodes.body.classList.add('modal-open');h.openSave();h.nodes.helpModal.classList.remove('hidden');h.doc.activeElement=h.nodes.helpClose;h.nodes.saveCancel.click();
 assert.equal(h.doc.activeElement.id,'helpClose');assert.equal(h.nodes.helpModal.inert,false);assert(h.nodes.body.classList.contains('modal-open'));
});

test('closing and reopening Save leaves no stale selection that overrides a newer field focus',()=>{
 const h=harness();h.openSave();h.nodes.saveCancel.click();h.openSave();h.nodes.reviewCheck.focus();h.flush();assert.equal(h.doc.activeElement.id,'reviewCheck');
});
