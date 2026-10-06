// Runs verbatim application handlers with small DOM adapters. No detector inference.
// Set FACE_REDACTOR_CANVAS to an installed @napi-rs/canvas module for real PNG checks.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createHash } = require('node:crypto');
const { gunzipSync } = require('node:zlib');
const target = process.env.FACE_REDACTOR_HTML || path.join(__dirname, '../src/index.template.html');
let html = fs.readFileSync(target, 'utf8');
const packed = html.match(/<script id="self-extract-payload" type="application\/octet-stream">([A-Za-z0-9+/=\r\n]+)<\/script>/);
if (packed) html = gunzipSync(Buffer.from(packed[1], 'base64')).toString('utf8');
const nativeCanvas = process.env.FACE_REDACTOR_CANVAS ? require(process.env.FACE_REDACTOR_CANVAS) : null;
function section(start, end) {
  const a = html.indexOf(start), b = html.indexOf(end, a);
  assert(a >= 0 && b > a, `Application section: ${start}`);
  return html.slice(a, b);
}
const code = [
  section('function snapshot(){', 'function applyZoom(){'),
  section('const cfg=()=>', ' const msg='),
  section('function padded(f){', 'function drawBoxes(){'),
  section('function faceThumb(f){', 'function nms(a,t){'),
  section('function nms(a,t){', "$('inputToggle').onclick="),
  section('canvas.onpointerup=', ";$('play').onclick="),
  section("for(const name of ['pointerup','pointercancel'])", "\ndocument.addEventListener('keydown'"),
  section('function saveExt(type){', 'function updateQuickEffect(){'),
  section('function updateReviewSummary(){', 'function closeHeaderMenu(){')
].join('\n');
function copy(v) { return JSON.parse(JSON.stringify(v)); }
function node() {
  const classes = new Set();
  return { value: '', checked: false, disabled: false, textContent: '', style: {}, listeners: {},
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x), toggle(x, on) { if (on ?? !classes.has(x)) { classes.add(x); return true; } classes.delete(x); return false; } },
    addEventListener(type, fn) { this.listeners[type] = fn; },
    click() { if (!this.disabled) this.onclick?.({ preventDefault() {}, stopPropagation() {} }); },
    setAttribute() {}, removeAttribute() {}, load() {}, pause() {}, remove() {}, select() {}, focus() {}
  };
}
function fakeCanvas(w = 1, h = 1) {
  const ctx = { drawImage() {}, fillRect() {}, clearRect() {}, save() {}, restore() {}, fillText() {}, getImageData() { return { data: new Uint8ClampedArray(640 * 640 * 4) }; } };
  return Object.assign(node(), { width: w, height: h, getContext: () => ctx, toDataURL: () => 'data:image/png;base64,', toBlob: fn => fn(new Blob(['test'])) });
}
function harness(initial = []) {
  const createCanvas = nativeCanvas?.createCanvas || fakeCanvas;
  const canvas = createCanvas(100, 80), source = createCanvas(100, 80), ctx = canvas.getContext('2d');
  const canvasEvents = {};
  canvas.style = {}; canvas.addEventListener = (name, fn) => { (canvasEvents[name] ||= []).push(fn); };
  const sourceCtx = source.getContext('2d');
  sourceCtx.fillStyle = '#ffffff'; sourceCtx.fillRect(0, 0, 100, 80);
  sourceCtx.fillStyle = '#c04080'; sourceCtx.fillRect(20, 20, 20, 20);
  sourceCtx.fillStyle = '#2080c0'; sourceCtx.fillRect(60, 20, 20, 20);
  const nodes = {}, controls = {}, downloads = [], blobs = [], images = [];
  const get = id => nodes[id] ||= node();
  const values = { scale: 640, score: .5, nms: .3, minface: 24, padding: 0, effect: 'fill', pixel: 20, blur: 20, colour: '#000000', opacity: 100, shape: 'rect', eyeLength: 1.44, eyeHeight: .32, format: 'image/png', quality: .92, exportScale: 100, saveFilename: 'synthetic_redacted.png' };
  for (const [id, value] of Object.entries(values)) get(id).value = String(value);
  let markup = '';
  Object.defineProperty(get('faces'), 'innerHTML', { get: () => markup, set(text) {
    markup = text;
    for (const kind of ['en', 'sel', 'del', 'download']) controls[kind] = [...text.matchAll(new RegExp('<(?:input|button)[^>]*data-' + kind + '=(\\d+)[^>]*>', 'g'))].map(m => Object.assign(node(), { dataset: { [kind]: m[1] }, checked: /\bchecked\b/.test(m[0]), disabled: /\bdisabled\b/.test(m[0]) }));
  } });
  const document = { querySelectorAll: s => controls[s.match(/data-(\w+)/)?.[1]] || [], body: { append() {} }, createElement(tag) {
    if (tag === 'canvas') return createCanvas(1, 1);
    if (tag === 'a') return Object.assign(node(), { click() { downloads.push(this); } });
    throw Error(tag);
  } };
  let objectId = 0;
  const s = { canvas, ctx, source, sourceType: 'image', video: node(), faces: copy(initial), selected: -1, detectionRan: false, history: [], future: [], actionStart: null, drag: null, moveDrag: null, panDrag: null, pinch: null, touchPoints: new Map(), busy: false, manualMode: false, stampMode: false, sourceBaseName: 'synthetic', overlayImage: null, overlayUrl: null, currentUrl: 'source:initial', loop: 0, videoFrame: 0, appLanguage: 'en', session: null,
    $: get, document, tr: (ja, en) => s.appLanguage === 'ja' ? ja : en,
    drawBoxes() {}, pointerPos: e => ({ x: e.clientX, y: e.clientY }), stage: { querySelectorAll: () => [] },
    setTimeout() {}, cancelAnimationFrame() {}, msg() {}, syncDetectionQuick() {}, syncMobileActions() {}, updateQuickEffect() {}, resetZoom() {}, renderActionLabels() {}, applyLanguage() { s.updateReviewSummary(); }, setCanvas(w, h) { canvas.width = w; canvas.height = h; }, navigator: {},
    Image: function () { images.push(this); },
    URL: { createObjectURL(b) { blobs.push(b); return 'blob:synthetic/' + ++objectId; }, revokeObjectURL() {} }, console
  };
  vm.createContext(s); vm.runInContext(code, s);
  const run = x => vm.runInContext(x, s);
  run('updateFaces();render();refreshHistory()');
  return { s, nodes, controls, canvas, canvasEvents, source, run, images, downloads, blobs,
    toggle(i, value) { const n = controls.en.find(n => +n.dataset.en === i); assert(n); n.checked = value; n.onchange(); return n; },
    bulk() { assert.equal(typeof get('enableAllMasks').onclick, 'function', 'Enable all action is bound'); get('enableAllMasks').onclick(); },
    draw() { run('beginAction();drag={x:20,y:20,nowX:40,nowY:40};canvas.onpointerup({clientX:40,clientY:40});'); },
    state: () => copy(s.snapshot())
  };
}
const rect = { x: 20, y: 20, w: 20, h: 20, manual: true, enabled: true };
const detected = { x: 60, y: 20, w: 20, h: 20, enabled: false, score: .75, land: [62, 25, 75, 25, 70, 30, 64, 35, 76, 35] };
const stamp = { x: 2, y: 2, w: 8, h: 8, stamp: true, enabled: false, symbol: '*' };

test('manual creation control has working Undo and Redo', () => {
  const h = harness(); h.draw(); assert.equal(h.s.history.length, 1); h.nodes.undo.click(); assert.equal(h.s.faces.length, 0); h.nodes.redo.click(); assert.equal(h.s.faces.length, 1);
});
test('draw, uncheck, Undo keeps the mask and restores enabled state', () => {
  const h = harness(); h.draw(); const checkbox = h.toggle(0, false);
  assert.equal(h.s.history.length, 2); assert.equal(h.controls.en[0], checkbox, 'Keep keyboard focus by retaining the checkbox node');
  h.nodes.undo.click(); assert.equal(h.s.faces.length, 1); assert.equal(h.s.faces[0].enabled, true); assert.equal(h.controls.en[0].checked, true);
  h.nodes.redo.click(); assert.equal(h.s.faces[0].enabled, false); assert.equal(h.controls.en[0].checked, false);
});
test('checkbox edits reverse in order and clear a previous Redo branch', () => {
  const h = harness([rect, detected]); h.toggle(0, false); h.toggle(1, true); h.nodes.undo.click(); assert.equal(h.s.faces[1].enabled, false); h.nodes.undo.click(); assert.equal(h.s.faces[0].enabled, true);
  h.toggle(0, false); assert.equal(h.s.future.length, 0); assert.equal(h.nodes.redo.disabled, true);
});
test('bulk changes non-stamps in one transaction preserving every other value and selection', () => {
  const h = harness([{ ...rect, enabled: false }, detected, stamp, { ...stamp, enabled: true }]); h.s.selected = 1; const before = h.state(); const settings = h.run('cfg()');
  h.bulk(); assert.equal(h.s.history.length, 1); assert.equal(h.s.selected, 1);
  const expected = copy(before); expected.faces[0].enabled = expected.faces[1].enabled = true;
  assert.deepEqual(h.state(), expected); assert.deepEqual(h.run('cfg()'), settings); assert.deepEqual(h.controls.en.map(n => n.checked), [true, true]);
  assert.equal(h.nodes.maskStateCounts.textContent, '2 enabled · 0 disabled');
  h.nodes.undo.click(); assert.deepEqual(h.state(), before); assert.equal(h.nodes.maskStateCounts.textContent, '0 enabled · 2 disabled');
  h.nodes.redo.click(); assert.deepEqual(h.state(), expected);
});
test('no-op bulk and checkbox events preserve Redo and selection creates no history', () => {
  for (const masks of [[], [stamp], [rect]]) {
    const h = harness(masks); h.s.future = [{ faces: [detected], selected: -1 }]; h.run('refreshHistory();updateReviewSummary()'); h.bulk();
    assert.equal(h.s.history.length, 0); assert.equal(h.s.future.length, 1); assert.equal(h.nodes.enableAllMasks.disabled, true);
    if (masks[0] === rect) { h.toggle(0, true); h.controls.sel[0].click(); assert.equal(h.s.history.length, 0); assert.equal(h.s.future.length, 1); }
  }
});
test('bulk after Undo invalidates Redo only when there is an actual mask edit', () => {
  const h = harness([rect, detected]); h.toggle(0, false); h.nodes.undo.click(); assert.equal(h.s.future.length, 1); h.bulk(); assert.equal(h.s.future.length, 0); assert.equal(h.s.history.length, 1);
});
test('counts and action translate without reload and ignore stamps', () => {
  const h = harness([rect, detected, stamp]); assert.equal(h.nodes.maskStateCounts.textContent, '1 enabled · 1 disabled'); assert.equal(h.nodes.enableAllMasks.textContent, 'Enable all masks'); assert.equal(h.nodes.enableAllMasks.disabled, false);
  h.s.appLanguage = 'ja'; h.run('updateReviewSummary()'); assert.equal(h.nodes.maskStateCounts.textContent, '有効 1件・無効 1件'); assert.equal(h.nodes.enableAllMasks.textContent, 'すべてのマスクを有効化');
  h.s.source = null; h.run('updateReviewSummary()'); assert.equal(h.nodes.enableAllMasks.disabled, true);
});
test('busy detection and active gestures block bulk and checkbox edits without taking history ownership', () => {
  for (const [key, value] of [['busy', true], ['actionStart', { faces: [], selected: -1 }], ['drag', {}], ['moveDrag', {}], ['panDrag', {}], ['pinch', {}]]) {
    const h = harness([detected]); h.s[key] = value; h.s.future = [{ faces: [rect], selected: 0 }]; const before = h.state();
    h.bulk(); const check = h.toggle(0, true); assert.deepEqual(h.state(), before, key); assert.equal(check.checked, false); assert.equal(h.s.history.length, 0); assert.equal(h.s.future.length, 1); assert.equal(h.s[key], value);
  }
});
test('history remains bounded to 60 enabled-state edits', () => {
  const h = harness([rect]); for (let i = 0; i < 70; i++) h.toggle(0, i % 2 === 1); assert.equal(h.s.history.length, 60); assert.equal(h.s.future.length, 0);
});
test('replacing media clears old masks and both history branches immediately, before decode', () => {
  const h = harness([rect]); h.run('beginAction();faces.push({x:60,y:20,w:20,h:20,enabled:true});commitAction()'); h.nodes.undo.click(); assert.equal(h.s.future.length, 1);
  h.run('beginAction();faces[0].enabled=false;commitAction()'); assert.equal(h.s.history.length, 1);
  h.run('load({name:"second.png",type:"image/png",size:10})'); h.nodes.undo.click(); h.nodes.redo.click();
  assert.equal(h.s.faces.length, 0); assert.equal(h.s.history.length, 0); assert.equal(h.s.future.length, 0); assert.equal(h.s.actionStart, null);
});
test('clear session removes mask history and disables the action', () => {
  const h = harness([rect]); h.toggle(0, false); h.nodes.clearAccept.click(); assert.equal(h.s.source, null); assert.equal(h.s.faces.length, 0); assert.equal(h.s.history.length, 0); assert.equal(h.s.future.length, 0); assert.equal(h.nodes.enableAllMasks.disabled, true);
});
test('save acknowledgement resets on cancel/reopen and output controls remain available', () => {
  const h = harness([rect]); h.nodes.export.click(); assert.equal(h.nodes.reviewCheck.checked, false); assert.equal(h.nodes.saveAccept.disabled, true);
  h.nodes.reviewCheck.checked = true; h.nodes.reviewCheck.listeners.change(); assert.equal(h.nodes.saveAccept.disabled, false); h.nodes.saveCancel.click(); h.nodes.export.click(); assert.equal(h.nodes.reviewCheck.checked, false); assert.equal(h.nodes.saveAccept.disabled, true);
  for (const format of ['image/jpeg', 'image/png', 'image/webp']) assert(html.includes(`value="${format}"`));
});
test('embedded assets and privacy invariants are unchanged', () => {
  const assets = html.split('\n').find(line => line.startsWith('const ORT_JS=')); assert(assets);
  assert.equal(createHash('sha256').update(assets).digest('hex'), '2aac611036be35a81b359a07dd61fd5588e8ae6caf6d4ced779b76d1c6990e5d');
  assert(html.includes("connect-src 'none'")); assert(html.includes('Detection can miss faces.')); assert(html.includes('I reviewed the whole image'));
  assert.match(html, /<button[^>]+id="enableAllMasks"[^>]+type="button"/);
});
test('preview pixels and decoded PNG match enabled-state Undo and Redo', { skip: !nativeCanvas && 'Set FACE_REDACTOR_CANVAS for native PNG validation' }, async () => {
  const h = harness([{ ...rect, enabled: false }, detected]);
  async function check(expected) {
    h.run('render()'); const pixel = x => [...h.canvas.getContext('2d').getImageData(x, 25, 1, 1).data];
    assert.deepEqual([pixel(25), pixel(65)], expected);
    const n = h.blobs.length; h.run('saveImage()');
    for (let i = 0; i < 100 && h.blobs.length === n; i++) await new Promise(r => setTimeout(r, 5));
    assert.equal(h.blobs.length, n + 1); const bytes = Buffer.from(await h.blobs[n].arrayBuffer()); assert.deepEqual([...bytes.subarray(0, 8)], [137,80,78,71,13,10,26,10]);
    const image = await nativeCanvas.loadImage(bytes), out = nativeCanvas.createCanvas(image.width, image.height), ctx = out.getContext('2d'); ctx.drawImage(image, 0, 0);
    assert.equal(image.width, 100); assert.equal(image.height, 80); assert.deepEqual([25, 65].map(x => [...ctx.getImageData(x, 25, 1, 1).data]), expected);
  }
  const original = [[192,64,128,255], [32,128,192,255]], covered = [[0,0,0,255], [0,0,0,255]];
  await check(original); h.bulk(); await check(covered); h.nodes.undo.click(); await check(original); h.nodes.redo.click(); await check(covered); h.toggle(0, false); await check([original[0], covered[1]]); h.nodes.undo.click(); await check(covered);
});

test('empty or unsupported replacements do not reset the current session', () => {
  for (const file of [null, { name: 'notes.txt', type: 'text/plain', size: 10 }, { name: 'unknown', type: '', size: 0 }]) {
    const h = harness([rect]); h.toggle(0, false); const before = h.state(), url = h.s.currentUrl, source = h.s.source;
    h.s.nextFile = file; h.run('load(nextFile)'); assert.deepEqual(h.state(), before); assert.equal(h.s.history.length, 1); assert.equal(h.s.currentUrl, url); assert.equal(h.s.source, source);
  }
});
test('canceling an active draw releases history ownership without losing Redo', () => {
  const h = harness([detected]); h.s.future = [{ faces: [rect], selected: 0 }]; h.run('beginAction();drag={x:1,y:1};canvas.onpointercancel()');
  assert.equal(h.s.actionStart, null); assert.equal(h.s.history.length, 0); assert.equal(h.s.future.length, 1); assert.equal(h.nodes.enableAllMasks.disabled, false); h.bulk(); assert.equal(h.s.faces[0].enabled, true);
});
function detector(h) {
  let resolve, reject; const deferred = new Promise((a,b) => { resolve = a; reject = b; });
  h.s.ort = { Tensor: function () {} }; h.s.session = { inputNames: ['input'], run: () => deferred };
  const pending = h.run('detect()');
  const result = { cls_8: { data: [1] }, obj_8: { data: [1] }, bbox_8: { data: [4,4,Math.log(4),Math.log(4)] }, kps_8: { data: Array(10).fill(3) } };
  return { pending, resolve: () => resolve(result), reject: () => reject(new Error('controlled old-source failure')) };
}
test('completed detection re-enables bulk controls without changing detection math', async () => {
  const h = harness([detected]); h.nodes.minface.value = '1'; const d = detector(h); assert.equal(h.nodes.enableAllMasks.disabled, true);
  d.resolve(); await d.pending; assert.equal(h.s.busy, false); assert.equal(h.s.history.length, 1); assert.equal(h.s.faces.length, 1); assert.equal(h.s.faces[0].score, 1); assert.equal(h.s.faces[0].enabled, true);
});
test('old detector success and failure cannot publish masks or history after replacement or clear', async () => {
  for (const boundary of ['load({name:"second.png",type:"image/png",size:10})', "$('clearAccept').click()"]) for (const outcome of ['resolve', 'reject']) {
    const h = harness([rect]); h.nodes.minface.value = '1'; const messages = []; h.s.msg = m => messages.push(m); h.s.console = { error() {} };
    const d = detector(h); h.run(boundary); const count = messages.length; d[outcome](); await d.pending;
    assert.equal(h.s.faces.length, 0, `${boundary} ${outcome}`); assert.equal(h.s.history.length, 0); assert.equal(h.s.future.length, 0); assert.equal(h.s.actionStart, null); assert.equal(h.s.busy, false); assert.equal(messages.length, count);
  }
});

test('two-touch end/cancel refreshes bulk availability after pinch cleanup', () => {
  for (const event of ['pointerup', 'pointercancel']) {
    const h = harness([detected]); h.s.touchPoints.set(1, {}); h.s.touchPoints.set(2, {}); h.s.pinch = { d: 20, z: 1 };
    h.run('beginAction();drag={x:1,y:1};');
    h.canvas['on' + event]({ pointerId: 1, clientX: 1, clientY: 1 });
    for (const fn of h.canvasEvents[event]) fn({ pointerId: 1 });
    assert.equal(h.s.pinch, null); assert.equal(h.run('maskStateEditBlocked()'), false); assert.equal(h.nodes.enableAllMasks.disabled, false); h.bulk(); assert.equal(h.s.faces[0].enabled, true);
  }
});

test('source replacement and clear discard pending pointer contacts and gesture state', () => {
  for (const boundary of ['load({name:"next.png",type:"image/png",size:10})', "$('clearAccept').click()"]) {
    const h = harness([rect]); h.s.touchPoints.set(1, { x: 20, y: 20 }); h.s.touchPoints.set(2, { x: 40, y: 40 }); h.s.pinch = { d: 20, z: 1 }; h.s.drag = { x: 20, y: 20 }; h.s.moveDrag = {}; h.s.panDrag = {}; h.run('beginAction()'); h.run(boundary);
    assert.equal(h.s.touchPoints.size, 0); for (const key of ['actionStart', 'drag', 'moveDrag', 'panDrag', 'pinch']) assert.equal(h.s[key], null, key);
  }
});

test('canceling an overlay move during detection does not discard the detector transaction', async () => {
  const h = harness([rect]); h.nodes.minface.value = '1'; const d = detector(h); const detectorStart = h.s.actionStart;
  // Existing overlay-box pointerdown selects/moves without beginning a new action.
  h.s.moveDrag = { kind: 'move', index: 0, dx: 1, dy: 1 }; h.canvas.onpointercancel();
  assert.equal(h.s.actionStart, detectorStart); d.resolve(); await d.pending; assert.equal(h.s.history.length, 1); assert.equal(h.s.faces.length, 2); h.nodes.undo.click(); assert.equal(h.s.faces.length, 1);
});
