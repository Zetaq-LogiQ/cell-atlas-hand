// app.js - Cell Atlas, hand edition. The whole animal cell from the Cell Atlas (same model, same text), with clean controls:
//   touch : one finger turns, two fingers pinch to zoom / move, tap a part to name it, double-tap empty space to reset
//   hand  : pinch + move = turn, fist + pull toward you = zoom in (push away = zoom out), point + hold = pick a part
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BASIC, MERGE, TITLE_OVERRIDE } from './content.js';
import { createGestures } from './gesture.js';

const $ = id => document.getElementById(id), clamp = THREE.MathUtils.clamp;
const show = (id, on) => $(id).classList.toggle('hide', !on);

// ---------------------------------------------------------------- scene
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = .88; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .8;
scene.add(new THREE.HemisphereLight(0xe6f2ff, 0x2a2018, .55));
const camera = new THREE.PerspectiveCamera(40, 1, .01, 2000);
const key = new THREE.DirectionalLight(0xfff4e0, 1.6); key.position.set(2, 3, 2); camera.add(key, key.target); key.target.position.set(0, 0, -1); scene.add(camera);
const controls = new OrbitControls(camera, canvas);
Object.assign(controls, { enableDamping: true, dampingFactor: .09, rotateSpeed: .8, zoomSpeed: 1, panSpeed: .8, screenSpacePanning: true });
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
function layout() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', layout); layout();

// ---------------------------------------------------------------- the cell (Cell Atlas overview model)
const SEL = new THREE.Color('#6fd6d2');
const holder = new THREE.Group(); scene.add(holder);                    // the cell lives in here; in AR it is moved, turned and sized in your room
// every model of the Cell Atlas: the whole cell ('overview') and 11 close-up organelles. M = the one on show now.
let M = { root: null, parts: new Map(), sphere: null, meta: null }, MAN = null;
const MODELS = {}, gltf = new GLTFLoader(); gltf.setMeshoptDecoder(MeshoptDecoder);
const isGhost = m => (m.transparent && m.opacity < .75) || (m.transmission || 0) > .3;
async function prep(id) {
  if (MODELS[id]) return MODELS[id];
  const meta = MAN.models.find(m => m.id === id), m = { id, meta, parts: new Map() };
  const g = await gltf.loadAsync('models/' + meta.file, e => { if (e.total) $('load').textContent = 'Loading ' + meta.name + '… ' + Math.round(e.loaded / e.total * 100) + '%'; });
  const root = m.root = g.scene, byId = new Map(meta.parts.map(p => [p.id, p])), cache = new Map();
  root.traverse(o => {
    if (!o.isMesh) return;
    let pid = ''; for (let q = o; q; q = q.parent) if (q.userData && q.userData.part !== undefined) { pid = q.userData.part; break; }
    if (id === 'overview' && MERGE[pid]) pid = MERGE[pid]; o.userData.pid = pid;
    const mats = (Array.isArray(o.material) ? o.material : [o.material]).map(x => {
      if ((x.transmission || 0) > 0) { x.transmission = 0; x.transparent = true; x.opacity = Math.min(x.opacity, .35); x.depthWrite = false; }
      if (x.transparent && x.opacity < .5 && x.color) { x.opacity *= .6; const h = {}; x.color.getHSL(h); x.color.setHSL(h.h, h.s, h.l * .85); }
      const k = x.uuid + '|' + pid; if (!cache.has(k)) { const c = x.clone(); c.userData.base = { e: c.emissive ? c.emissive.clone() : null, ei: c.emissiveIntensity ?? 1 }; c.userData.ghost = isGhost(c); cache.set(k, c); }
      return cache.get(k);
    });
    o.material = Array.isArray(o.material) ? mats : mats[0];
    if (!pid) return;
    if (!m.parts.has(pid)) m.parts.set(pid, { id: pid, meshes: [], meta: byId.get(pid) });
    m.parts.get(pid).meshes.push(o);
  });
  root.updateMatrixWorld(true);
  for (const P of m.parts.values()) { const b = new THREE.Box3(); P.meshes.forEach(x => b.expandByObject(x, true)); P.center = b.getCenter(new THREE.Vector3()); }
  m.sphere = new THREE.Box3().setFromObject(root, true).getBoundingSphere(new THREE.Sphere());
  return (MODELS[id] = m);
}
// put a model on show, in the same place and at the same size as the one before (a quick shrink / grow between them)
let swapping = false;
async function showModel(id) {
  if (swapping || (M.meta && M.meta.id === id)) return; swapping = true; show('load', true);
  try {
    const m = await prep(id);
    if (M.root) { await anim(250, k => holder.scale.setScalar(Math.max(1e-4, hs0 * (1 - k)))); holder.remove(M.root); M.root.position.set(0, 0, 0); }
    select(null); M = m; holder.add(m.root);
    controls.minDistance = m.sphere.radius * .12; controls.maxDistance = m.sphere.radius * 5;
    if (mode === '3d') { holder.scale.setScalar(1); home(true); }
    else { m.root.position.copy(m.sphere.center).negate(); arScale = AR_S / m.sphere.radius; TG.s = arScale; const s1 = arScale; await anim(300, k => holder.scale.setScalar(Math.max(1e-4, s1 * k))); }
    show('bBack', id !== 'overview'); $('title').textContent = id === 'overview' ? 'Animal cell' : m.meta.name;
  } catch (e) { console.warn(e); toast('Could not load that model.'); }
  show('load', false); swapping = false;
}
let hs0 = 1;
function anim(ms, f) { hs0 = holder.scale.x; return new Promise(r => { const t0 = performance.now(); const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); f(k * k * (3 - 2 * k)); k < 1 ? requestAnimationFrame(step) : r(); }; step(); }); }
async function load() {
  MAN = await (await fetch('models/atlas_manifest.json')).json();
  await showModel('overview');
}
const b2g = v => new THREE.Vector3(v[0], v[2], -v[1]);                  // Blender (Z up) -> glTF (Y up)
function homeView() {
  const c = M.meta.camera, dir = b2g(c.position).sub(b2g(c.target)).normalize();
  const vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect), d = M.sphere.radius / Math.sin(Math.min(vf, hf)) * .85;
  return { t: M.sphere.center.clone(), p: M.sphere.center.clone().add(dir.multiplyScalar(d)) };
}
let tween = null;
function flyTo(t, p, ms = 650) { tween = { t0: performance.now(), ms, a: controls.target.clone(), b: t.clone(), pa: camera.position.clone(), pb: p ? p.clone() : null }; }
function home(now) { const v = homeView(); if (now) { controls.target.copy(v.t); camera.position.copy(v.p); } else flyTo(v.t, v.p); select(null); }
function stepTween(now) {
  if (!tween) return; const k = Math.min(1, (now - tween.t0) / tween.ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const off = camera.position.clone().sub(controls.target);
  controls.target.lerpVectors(tween.a, tween.b, e);
  if (tween.pb) camera.position.lerpVectors(tween.pa, tween.pb, e); else camera.position.copy(controls.target).add(off);   // keep the same view, just re-centre
  if (k >= 1) tween = null;
}

// ---------------------------------------------------------------- picking a part: a name and one line, nothing more
let selected = null;
const title = id => TITLE_OVERRIDE[id] || M.parts.get(id)?.meta?.title || id;
const linkOf = id => M.meta && M.meta.id === 'overview' && MAN.models[0].links ? MAN.models[0].links[id] : null;
const line = id => BASIC[id]?.job || (M.parts.get(id)?.meta?.description || '').split(/(?<=\.)\s/)[0].slice(0, 110);
function select(id) {
  selected = id; show('tag', !!id);
  if (id) { $('tagT').textContent = title(id); $('tagJ').textContent = line(id); show('bOpen', !!linkOf(id)); if (mode === '3d') flyTo(M.parts.get(id).center); }
  M.root && M.root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { const b = m.userData.base; if (m.emissive && b.e && !(id && o.userData.pid === id)) { m.emissive.copy(b.e); m.emissiveIntensity = b.ei; } }); });
}
function choose(id) {
  if (!id) return select(null);
  if (id === selected) { if (linkOf(id)) return showModel(linkOf(id)); return select(null); }
  select(id); setHover(null);
}
function pulse(now) {
  if (!selected) return; const v = .4 + .4 * (.5 + .5 * Math.sin(now / 260));
  for (const o of M.parts.get(selected).meshes) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.emissive) { m.emissive.copy(SEL); m.emissiveIntensity = v; } });
}
const ray = new THREE.Raycaster();
// a tap or a fingertip picks the first solid part under it; if it lands between parts, a ring of nearby points (a fingertip wide)
// is tried. The see-through outer shells (membrane, cytoplasm) only count when nothing else is there.
const SHELL = new Set(['plasma_cell_membrane', 'cytoplasm_cytosol']);
const RING = Array.from({ length: 8 }, (_, i) => [Math.cos(i * Math.PI / 4), Math.sin(i * Math.PI / 4)]);
function hitOf(r) {
  ray.ray.copy(r);
  const hits = ray.intersectObject(M.root, true).filter(h => h.object.userData.pid && h.object.visible);
  const solid = h => { const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material; return !m.userData.ghost && m.opacity > .5 && !SHELL.has(h.object.userData.pid); };
  const h = hits.find(solid); return { part: h ? h.object.userData.pid : null, shell: hits.length ? hits[0].object.userData.pid : null };
}
function pickWith(rayAt, x, y) {
  if (!M.root) return null;
  const h0 = hitOf(rayAt(x, y)); if (h0.part) return h0.part; let shell = h0.shell;
  for (const rad of [14, 26]) for (const [a, b] of RING) { const h = hitOf(rayAt(x + a * rad, y + b * rad)); if (h.part) return h.part; shell = shell || h.shell; }
  return shell;
}
const camRay = (x, y) => { ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -y / innerHeight * 2 + 1), camera); return ray.ray.clone(); };
function pick(x, y) { return pickWith(camRay, x, y); }
function pickRay(r) { if (!M.root) return null; const h = hitOf(r); return h.part || h.shell; }

// ---------------------------------------------------------------- touch: tap = pick, double-tap empty = reset (turning and zoom are OrbitControls)
let down = null, lastTap = 0;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now(), n: (down?.n || 0) + 1 }; tween = null; });
canvas.addEventListener('pointerup', e => {
  if (!down || mode === 'xr') return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 350; down = null;
  if (moved > 8 || !quick) return;
  if (mode === 'gyro') return gyroTap(e.clientX, e.clientY);
  const id = pick(e.clientX, e.clientY), now = performance.now();
  if (id) choose(id);
  else { if (now - lastTap < 350) home(false); else select(null); lastTap = now; }
});
$('bOpen').onclick = e => { e.stopPropagation(); if (selected && linkOf(selected)) showModel(linkOf(selected)); };
$('bBack').onclick = () => showModel('overview');
$('tag').onclick = () => select(null);

// ---------------------------------------------------------------- modes: '3d' (screen), 'xr' (Android AR: the cell stays in your room),
// 'gyro' (iPhone: back camera + motion sensor; turn the phone freely but stand in one place)
let mode = '3d';
const vid = $('vid'), H = createGestures(vid);
function hint(s) { $('hint').textContent = s || ''; show('hint', !!s); }

// the hand does the same three things everywhere; only "turn", "size" and "aim" differ per mode
const sph = new THREE.Spherical();
function orbitBy(dTheta, dPhi) { const off = camera.position.clone().sub(controls.target); sph.setFromVector3(off); sph.theta += dTheta; sph.phi = clamp(sph.phi + dPhi, .15, Math.PI - .15); off.setFromSpherical(sph); camera.position.copy(controls.target).add(off); }
function setDist(d) { const off = camera.position.clone().sub(controls.target); off.setLength(clamp(d, controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(off); }
const TG = { ry: 0, rx: 0, s: 1, on: false, vy: 0, vx: 0, hold: false };                             // where the hand wants the cell to be
const ACT = {
  turn(dx, dy) { if (mode === '3d') orbitBy(-dx * 5.5, -dy * 4); else { TG.ry += dx * TURN_Y; TG.rx = clamp(TG.rx + dy * TURN_X, -1.3, 1.3); } },
  sizeStart() { return mode === '3d' ? camera.position.distanceTo(controls.target) : TG.s; },
  size(s0, k) { if (mode === '3d') setDist(s0 / k); else TG.s = clamp(s0 * k, arScale * .35, arScale * 5); },
  aim(x, y) { return mode === 'xr' ? pickWith(xrRay, x, y) : pick(x, y); }
};
function glide(dt) {
  if (mode === '3d' || !TG.on) return; const k = 1 - Math.exp(-dt * 10);
  if (!TG.hold && (Math.abs(TG.vy) > .01 || Math.abs(TG.vx) > .01)) { TG.ry += TG.vy * dt; TG.rx = clamp(TG.rx + TG.vx * dt, -1.3, 1.3); const f = Math.exp(-dt * 4.5); TG.vy *= f; TG.vx *= f; }
  holder.rotation.y += (TG.ry - holder.rotation.y) * k; holder.rotation.x += (TG.rx - holder.rotation.x) * k;
  holder.scale.setScalar(Math.exp(Math.log(holder.scale.x) + (Math.log(TG.s) - Math.log(holder.scale.x)) * k));   // size glides evenly
}

// The hand, like a headset: AIM with the pointer (the part under it glows and shows its name), CLICK with a quick pinch,
// TURN by pinching and moving (it glides to a stop when you let go), ZOOM with a fist pulled toward you.
// Nothing is picked or opened unless you click.
let prev = 'none', grab = null, hfLast = 0, pz = null, hoverId = null;
const hovHist = [];                                                       // what was under the pointer a moment ago (fingers move as a pinch closes)
const GLABEL = { open: 'Open hand: aim', point: 'Pointing: aim', pinch: 'Pinch', fist: 'Fist: zoom', none: 'No hand' };
function handFrame(now, _dt, src) {
  const G = H.G, fresh = H.step(now, src), dt = Math.min(.2, (now - (hfLast || now)) / 1000); hfLast = now;
  const live = G.lm && now - G.seen < 250, g = live ? G.gesture : 'none';
  $('gl2').textContent = G.ready ? (pz && pz.turning ? 'Pinch: turning' : GLABEL[g]) + (g === 'fist' ? ` · ${Math.round(G.z)} cm` : '') : G.msg;
  show('cur', live);
  if (!live) { if (pz) endPinch(false); prev = 'none'; grab = null; setHover(null); return; }
  const cx = G.tip.x * innerWidth, cy = G.tip.y * innerHeight - 48, c = $('cur');   // the pointer sits 48 px above the fingertip
  c.style.transform = `translate(${cx}px, ${cy}px)`; c.setAttribute('class', 'g-' + g);
  // aim
  if ((g === 'open' || g === 'point') && isPlaced() && fresh) { const id = aimOne(cx, cy); setHover(id, cx, cy); hovHist.push({ t: now, id, x: cx, y: cy }); while (hovHist.length && now - hovHist[0].t > 600) hovHist.shift(); }
  else if (g === 'fist') setHover(null);
  // pinch: a quick one is a click; pinch and move to turn
  if (g === 'pinch' && prev !== 'pinch') {
    const was = hovHist.filter(h => now - h.t > 120).pop() || hovHist[hovHist.length - 1] || { id: hoverId, x: cx, y: cy };
    pz = { t: now, x: G.pinchPt.x, y: G.pinchPt.y, lx: G.pinchPt.x, ly: G.pinchPt.y, moved: 0, turning: false, aim: was };
  }
  if (g === 'pinch' && pz) {
    const dx = G.pinchPt.x - pz.lx, dy = G.pinchPt.y - pz.ly; pz.lx = G.pinchPt.x; pz.ly = G.pinchPt.y;
    pz.moved = Math.max(pz.moved, Math.hypot(G.pinchPt.x - pz.x, G.pinchPt.y - pz.y));
    if (!pz.turning && pz.moved > .035 && isPlaced()) { pz.turning = true; setHover(null); TG.hold = true; }
    if (pz.turning && Math.hypot(dx, dy) > .0012) { ACT.turn(dx, dy); const dts = Math.max(.03, (now - (pz.lt || now - 40)) / 1000); pz.lt = now; spin(dx * TURN_Y / dts, dy * TURN_X / dts); }
  }
  if (g !== 'pinch' && prev === 'pinch' && pz) endPinch(true);
  // zoom: close your hand and pull it toward you = bigger (the back camera sees the hand come nearer)
  if (g === 'fist' && prev !== 'fist') grab = { z: G.z, s: ACT.sizeStart() };
  if (g === 'fist' && grab && G.z > 5) { const r = grab.z / G.z; ACT.size(grab.s, Math.pow(G.mirror ? 1 / r : r, 2.2)); }
  if (g !== 'fist') grab = null;
  prev = g;
}
function endPinch(ok) {
  const p = pz; pz = null; TG.hold = false; if (!p || !ok) return;
  if (p.turning) { if (performance.now() - (p.lt || 0) > 140) TG.vx = TG.vy = 0; return; }   // a turn: it glides on and slows down (not if your hand had already stopped)
  if (performance.now() - p.t > 700) return;                              // a long still pinch is not a click
  if (!isPlaced()) return placeNow();
  ripple(p.aim.x, p.aim.y); choose(p.aim.id || ACT.aim(p.aim.x, p.aim.y));
}
// what is under the pointer: one ray, real parts only (not the see-through shells)
function aimOne(x, y) { if (!M.root) return null; return hitOf(mode === 'xr' ? xrRay(x, y) : camRay(x, y)).part; }
function setHover(id, x, y) {
  if (id !== hoverId) {
    const paint = (pid, on) => { const P = pid && M.parts.get(pid); if (!P || pid === selected) return; for (const o of P.meshes) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { const b = m.userData.base; if (!m.emissive || !b.e) return; if (on) { m.emissive.set('#ffffff'); m.emissiveIntensity = .22; } else { m.emissive.copy(b.e); m.emissiveIntensity = b.ei; } }); };
    paint(hoverId, false); paint(id, true); hoverId = id;
  }
  const h = $('hov'); show('hov', !!id && id !== selected);
  if (id) { h.textContent = title(id); h.style.left = x + 'px'; h.style.top = (y - 26) + 'px'; }
}

// touch in room view: drag to turn, two fingers to resize, tap to place / pick (the same targets the hand uses)
const TURN_Y = 4, TURN_X = 3, SPIN_MAX = 2.2;                            // rad/s at most after you let go
function spin(vy, vx) { TG.vy += (clamp(vy, -SPIN_MAX, SPIN_MAX) - TG.vy) * .5; TG.vx += (clamp(vx, -SPIN_MAX, SPIN_MAX) - TG.vx) * .5; }
const tl = $('touch'), tps = new Map(); let tdown = null, tp0 = 0, ts0 = 1;
tl.addEventListener('pointerdown', e => {
  tl.setPointerCapture(e.pointerId); tps.set(e.pointerId, { x: e.clientX, y: e.clientY }); TG.hold = true;
  if (tps.size === 1) tdown = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, lt: performance.now() };
  else { tdown = null; const [a, b] = [...tps.values()]; tp0 = Math.hypot(a.x - b.x, a.y - b.y) || 1; ts0 = TG.s; }
});
tl.addEventListener('pointermove', e => {
  const q = tps.get(e.pointerId); if (!q) return; const dx = e.clientX - q.x, dy = e.clientY - q.y; q.x = e.clientX; q.y = e.clientY;
  if (tps.size === 1 && tdown) {
    tdown.moved += Math.abs(dx) + Math.abs(dy);
    if (tdown.moved > 8 && isPlaced()) { const now = performance.now(), dt = Math.max(.012, (now - tdown.lt) / 1000); tdown.lt = now; ACT.turn(dx / innerWidth, dy / innerHeight); spin(dx / innerWidth * TURN_Y / dt, dy / innerHeight * TURN_X / dt); }
  } else if (tps.size === 2) { const [a, b] = [...tps.values()]; TG.s = clamp(ts0 * Math.hypot(a.x - b.x, a.y - b.y) / tp0, arScale * .35, arScale * 5); TG.vx = TG.vy = 0; }
});
function tup(e) {
  if (!tps.has(e.pointerId)) return; tps.delete(e.pointerId); if (!tps.size) TG.hold = false;
  if (tdown && tdown.moved <= 8 && performance.now() - tdown.t < 400) {
    TG.vx = TG.vy = 0;
    if (!isPlaced()) placeNow(); else { const id = ACT.aim(e.clientX, e.clientY); ripple(e.clientX, e.clientY); choose(id); }
  }
  if (tdown && performance.now() - tdown.lt > 100) TG.vx = TG.vy = 0;
  if (!tps.size) tdown = null;
}
tl.addEventListener('pointerup', tup); tl.addEventListener('pointercancel', tup);

// ---------------------------------------------------------------- AR: place the cell in your room
const AR_S = .3 / 2;                                                      // in AR the cell is 30 cm across to start (scale is set from its radius)
let arScale = 1;
function arHolder(at) {                                                  // centre the cell on 'at', 30 cm across, facing you
  M.root.position.copy(M.sphere.center).negate(); arScale = AR_S / M.sphere.radius;
  holder.position.copy(at); holder.scale.setScalar(arScale); holder.rotation.set(0, 0, 0); Object.assign(TG, { ry: 0, rx: 0, s: arScale, on: true });
}
function arOff() { TG.on = false; if (M.root) M.root.position.set(0, 0, 0); M.root.position.set(0, 0, 0); holder.position.set(0, 0, 0); holder.scale.setScalar(1); holder.rotation.set(0, 0, 0); holder.visible = true; }

$('bAR').onclick = async () => {
  const xrOK = navigator.xr && await Promise.race([navigator.xr.isSessionSupported('immersive-ar').catch(() => false), new Promise(r => setTimeout(() => r(false), 2000))]);
  return xrOK ? startXR() : startGyro();
};
$('bExit').onclick = () => mode === 'xr' ? renderer.xr.getSession()?.end() : stopGyro();
function uiAR(on) {
  show('bAR', !on); show('bExit', on); show('title', !on); show('touch', on); document.body.classList.toggle('ar', on); setHover(null); TG.vx = TG.vy = 0;
  controls.enabled = !on; select(null);
}

// ---- Android: WebXR (true room tracking). Hand: the AR camera picture goes to the hand tracker (camera-access).
renderer.xr.enabled = true;
const reticle = new THREE.Mesh(new THREE.RingGeometry(.07, .09, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd36b' }));
reticle.matrixAutoUpdate = false; reticle.visible = false; scene.add(reticle);
let hitSrc = null, placed = false, camOK = false, glBind = null, camFB = null;
async function startXR() {
  try {
    const session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay', 'camera-access'], domOverlay: { root: $('ui') } });
    renderer.xr.setReferenceSpaceType('local'); await renderer.xr.setSession(session);
    hitSrc = await session.requestHitTestSource({ space: await session.requestReferenceSpace('viewer') });
    camOK = !!(session.enabledFeatures && session.enabledFeatures.includes('camera-access')); glBind = null; camFB = null;
    session.addEventListener('end', endXR); session.addEventListener('select', onXRSelect);
    mode = 'xr'; placed = false; holder.visible = false; uiAR(true); document.body.style.background = 'transparent';
    hint('Move the phone slowly over the floor or a table. When the yellow ring appears, tap or pinch to place the cell.');
    if (camOK) { H.load(); H.G.map = p => ({ x: p.x, y: p.y }); show('pip', true); }
    else { toast('This phone AR cannot share the camera with hand tracking: using camera mode instead.'); fallback = true; session.end(); }
  } catch (e) { console.warn(e); toast('Could not start AR on this phone.'); }
}
let fallback = false;
function endXR() { if (fallback) { fallback = false; hitSrc = null; mode = '3d'; placed = false; reticle.visible = false; arOff(); uiAR(false); hint(''); return startGyro(); }
  hitSrc = null; mode = '3d'; placed = false; reticle.visible = false; arOff(); uiAR(false); hint(''); show('pip', false); show('cur', false); document.body.style.background = ''; home(true); layout(); }
$('ui').addEventListener('beforexrselect', e => e.preventDefault());
const m4 = new THREE.Matrix4();
function onXRSelect(e) {
  if (!placed) { xrPlace(); return; }
  const pose = e.frame && e.frame.getPose(e.inputSource.targetRaySpace, renderer.xr.getReferenceSpace()); if (!pose) return;
  m4.fromArray(pose.transform.matrix);
  const r = new THREE.Ray(new THREE.Vector3().setFromMatrixPosition(m4), new THREE.Vector3(0, 0, -1).transformDirection(m4));
  const s = r.at(.5, new THREE.Vector3()).applyMatrix4(Vm.clone().invert()).applyMatrix4(Pm.clone().invert());   // where on the screen the tap was
  const x = (s.x + 1) / 2 * innerWidth, y = (1 - s.y) / 2 * innerHeight, id = pickWith(xrRay, x, y);
  ripple(x, y); choose(id);
}
function xrPlace() {
  if (!placed) {
    if (!reticle.visible) return;
    const p = new THREE.Vector3().setFromMatrixPosition(reticle.matrix).add(new THREE.Vector3(0, .25, 0));   // floats 25 cm above the spot
    arHolder(p); const c = renderer.xr.getCamera().position; holder.rotation.y = TG.ry = Math.atan2(c.x - p.x, c.z - p.z);
    holder.visible = true; placed = true; reticle.visible = false; hint('');
    toast('Walk around it. Hold the phone in one hand and show your other hand to the camera.');
  }
}
const isPlaced = () => mode === 'xr' ? placed : gPlaced;
function placeNow() { if (mode === 'xr') xrPlace(); else if (mode === 'gyro') gyroTap(innerWidth / 2, innerHeight / 2); }
// the AR camera picture (a GPU texture) -> a small canvas for the hand tracker, about 12 times a second
const gl = renderer.getContext(); let camProg = null, camBuf = null, camPix = null, camCv = null, camCtx = null, camW = 0, camH = 0, camT = 0;
function camSetup(w, h) {
  camW = 320; camH = Math.max(64, Math.round(320 * h / w));
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
  camProg = gl.createProgram();
  gl.attachShader(camProg, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }'));
  gl.attachShader(camProg, sh(gl.FRAGMENT_SHADER, 'precision mediump float; uniform sampler2D t; varying vec2 uv; void main(){ gl_FragColor = texture2D(t, vec2(uv.x, 1. - uv.y)); }'));
  gl.linkProgram(camProg);
  camBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, camBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const out = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, out); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, camW, camH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  camFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, camFB); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, out, 0);
  camPix = new Uint8ClampedArray(camW * camH * 4); camCv = document.createElement('canvas'); camCv.width = camW; camCv.height = camH; camCtx = camCv.getContext('2d');
}
const Pm = new THREE.Matrix4(), Vm = new THREE.Matrix4();
function xrRay(x, y) { const o = new THREE.Vector3().setFromMatrixPosition(Vm), q = new THREE.Vector3(x / innerWidth * 2 - 1, -y / innerHeight * 2 + 1, .5).applyMatrix4(Pm).applyMatrix4(Vm); return new THREE.Ray(o, q.sub(o).normalize()); }
function xrCamera(now, frame) {
  const view = frame.getViewerPose(renderer.xr.getReferenceSpace())?.views[0]; if (!view) return null;
  Pm.fromArray(view.projectionMatrix).invert(); Vm.fromArray(view.transform.matrix);
  if (!camOK || !view.camera || now - camT < 80) return null; camT = now;
  try {
    glBind = glBind || new XRWebGLBinding(renderer.xr.getSession(), gl);
    const tex = glBind.getCameraImage(view.camera); if (!tex) return null;
    if (!camFB) camSetup(view.camera.width, view.camera.height);
    if (gl.bindVertexArray) gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, camFB); gl.viewport(0, 0, camW, camH);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.disable(gl.SCISSOR_TEST);
    gl.useProgram(camProg); gl.bindBuffer(gl.ARRAY_BUFFER, camBuf);
    const loc = gl.getAttribLocation(camProg, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(gl.getUniformLocation(camProg, 't'), 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.readPixels(0, 0, camW, camH, gl.RGBA, gl.UNSIGNED_BYTE, camPix); gl.disableVertexAttribArray(loc);
  } catch (e) { console.warn(e); renderer.resetState(); camOK = false; $('gl2').textContent = 'No camera picture in AR: tap to pick'; return null; }
  renderer.resetState(); camCtx.putImageData(new ImageData(camPix, camW, camH), 0, 0); return camCv;
}

// ---- iPhone (and phones without AR): back camera + motion sensor
let gPlaced = false, ori = null, sensor = null, sensQ = null, longFov = 63;
try { const f = +localStorage.getItem('pb_fov'); if (f >= 45 && f <= 85) longFov = f; } catch (e) { }
const onOri = e => { if (e.alpha != null) ori = e; };
const qFix = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), qT = new THREE.Quaternion(), qX = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2), qS = new THREE.Quaternion(), eul = new THREE.Euler();
async function startGyro() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission && await DeviceOrientationEvent.requestPermission() !== 'granted') return toast('Motion access is needed so the cell can stay in place.');
    await H.start('environment');
  } catch (e) { console.warn(e); return toast('Could not open the camera. Allow camera access and try again.'); }
  addEventListener('deviceorientation', onOri);
  if (typeof RelativeOrientationSensor !== 'undefined') try { sensor = new RelativeOrientationSensor({ frequency: 60, referenceFrame: 'screen' }); sensor.addEventListener('reading', () => sensQ = sensor && sensor.quaternion); sensor.addEventListener('error', () => { sensor = null; sensQ = null; }); sensor.start(); } catch (e) { sensor = null; }
  mode = 'gyro'; gPlaced = false; holder.visible = false; uiAR(true); show('vid', true); show('pip', true); document.body.style.background = '#000';
  H.G.map = p => { const W = innerWidth, Hh = innerHeight, vw = vid.videoWidth, vh = vid.videoHeight, s = Math.max(W / vw, Hh / vh); return { x: ((W - vw * s) / 2 + p.x * vw * s) / W, y: ((Hh - vh * s) / 2 + p.y * vh * s) / Hh }; };
  camera.position.set(0, 0, 0); camera.near = .02; camera.far = 50;
  hint('Point the phone where you want the cell, then tap or pinch.');
}
function stopGyro() {
  removeEventListener('deviceorientation', onOri); ori = null; try { sensor && sensor.stop(); } catch (e) { } sensor = sensQ = null;
  H.stop(); H.G.map = null; mode = '3d'; arOff(); uiAR(false); hint(''); show('vid', false); show('pip', false); show('cur', false); document.body.style.background = '';
  camera.near = .01; camera.far = 2000; camera.quaternion.identity(); home(true); layout();
}
function gyroFrame() {
  let got = false;
  if (sensQ) { qT.fromArray(sensQ).premultiply(qFix); got = true; }
  else if (ori) { const D = THREE.MathUtils.degToRad, o = D(screen.orientation?.angle ?? window.orientation ?? 0); eul.set(D(ori.beta), D(ori.alpha), -D(ori.gamma), 'YXZ'); qT.setFromEuler(eul).multiply(qX).multiply(qS.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -o)); got = true; }
  if (got) { if (camera.quaternion.angleTo(qT) > .5) camera.quaternion.copy(qT); else camera.quaternion.slerp(qT, sensQ ? .85 : .5); }
  const vw = vid.videoWidth || 720, vh = vid.videoHeight || 1280, f = Math.max(vw, vh) / 2 / Math.tan(THREE.MathUtils.degToRad(longFov / 2)), s = Math.max(innerWidth / vw, innerHeight / vh);
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(innerHeight / 2 / s / f)); camera.aspect = innerWidth / innerHeight; camera.position.set(0, 0, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
}
function gyroTap(x, y) {
  if (!gPlaced) {                                                        // the cell floats 60 cm ahead, where the screen's middle points
    const at = new THREE.Vector3(0, 0, -.6).applyQuaternion(camera.quaternion); arHolder(at);
    holder.rotation.y = TG.ry = Math.atan2(-at.x, -at.z); holder.visible = true; gPlaced = true; hint('');
    toast('Show your hand to the camera: pinch to turn, fist and pull toward you to zoom, point and hold to pick.'); return;
  }
  const id = pick(x, y); ripple(x, y); choose(id);
}

// the small camera view with the hand skeleton: shows what the tracker sees
const pc = $('pipc'), p2 = pc.getContext('2d');
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
function drawPip(src) {
  if ($('pip').classList.contains('hide')) return; const W = pc.width, Hh = pc.height, mir = H.G.mirror && mode === '3d';
  p2.save(); if (mir) { p2.translate(W, 0); p2.scale(-1, 1); }
  if (src && (src.readyState >= 2 || src.width)) p2.drawImage(src, 0, 0, W, Hh); else { p2.fillStyle = '#111'; p2.fillRect(0, 0, W, Hh); }
  p2.restore();
  const L = H.G.lm; if (!L || performance.now() - H.G.seen > 250) return;
  const P = L.map(p => [(mir ? 1 - p.x : p.x) * W, p.y * Hh]), col = { pinch: '#ffd36b', fist: '#ff8a6b', point: '#6fe0ff', open: '#ffffff' }[H.G.gesture] || '#fff';
  p2.strokeStyle = col; p2.lineWidth = 2.5; p2.beginPath(); for (const [a, b] of BONES) { p2.moveTo(...P[a]); p2.lineTo(...P[b]); } p2.stroke();
  p2.fillStyle = col; for (const q of P) { p2.beginPath(); p2.arc(q[0], q[1], 2.6, 0, 7); p2.fill(); }
}

function ripple(x, y) { const r = document.createElement('div'); r.className = 'rip'; r.style.left = x + 'px'; r.style.top = y + 'px'; $('ui').appendChild(r); setTimeout(() => r.remove(), 600); }
let toastT = 0;
function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 4200); }

// ---------------------------------------------------------------- loop
let last = performance.now();
renderer.setAnimationLoop((now, frame) => {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  let src = vid;
  if (mode === 'xr' && frame) {
    if (hitSrc && !placed) { const res = frame.getHitTestResults(hitSrc), pose = res.length && res[0].getPose(renderer.xr.getReferenceSpace()); reticle.visible = !!pose; if (pose) reticle.matrix.fromArray(pose.transform.matrix); }
    const cv = xrCamera(now, frame); src = camCv;
    if (cv) handFrame(now, dt, cv);
  } else if (mode === 'gyro') { gyroFrame(); handFrame(now, dt, vid); }
  if (mode === '3d') { stepTween(now); controls.update(); }
  glide(dt); pulse(now);
  renderer.render(scene, camera); drawPip(src);
});
load().catch(e => { console.warn(e); $('load').textContent = 'Could not load the cell model.'; });
window.__cell = { get M() { return M; }, camera, controls, H, select, pick, THREE, holder, get mode() { return mode; }, startGyro, gyroTap };
