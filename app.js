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
const M = { root: null, parts: new Map(), sphere: null, meta: null };
const isGhost = m => (m.transparent && m.opacity < .75) || (m.transmission || 0) > .3;
async function load() {
  const man = await (await fetch('models/atlas_manifest.json')).json(); M.meta = man.models.find(m => m.id === 'overview');
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const g = await loader.loadAsync('models/' + M.meta.file, e => { if (e.total) $('load').textContent = 'Loading the cell… ' + Math.round(e.loaded / e.total * 100) + '%'; });
  const root = M.root = g.scene, byId = new Map(M.meta.parts.map(p => [p.id, p])), cache = new Map();
  root.traverse(o => {
    if (!o.isMesh) return;
    let pid = ''; for (let q = o; q; q = q.parent) if (q.userData && q.userData.part !== undefined) { pid = q.userData.part; break; }
    if (MERGE[pid]) pid = MERGE[pid]; o.userData.pid = pid;
    const mats = (Array.isArray(o.material) ? o.material : [o.material]).map(m => {
      if ((m.transmission || 0) > 0) { m.transmission = 0; m.transparent = true; m.opacity = Math.min(m.opacity, .35); m.depthWrite = false; }
      if (m.transparent && m.opacity < .5 && m.color) { m.opacity *= .6; const h = {}; m.color.getHSL(h); m.color.setHSL(h.h, h.s, h.l * .85); }
      const k = m.uuid + '|' + pid; if (!cache.has(k)) { const c = m.clone(); c.userData.base = { e: c.emissive ? c.emissive.clone() : null, ei: c.emissiveIntensity ?? 1 }; c.userData.ghost = isGhost(c); cache.set(k, c); }
      return cache.get(k);
    });
    o.material = Array.isArray(o.material) ? mats : mats[0];
    if (!pid) return;
    if (!M.parts.has(pid)) M.parts.set(pid, { id: pid, meshes: [], meta: byId.get(pid) });
    M.parts.get(pid).meshes.push(o);
  });
  scene.add(root); root.updateMatrixWorld(true);
  for (const P of M.parts.values()) { const b = new THREE.Box3(); P.meshes.forEach(m => b.expandByObject(m, true)); P.center = b.getCenter(new THREE.Vector3()); P.r = b.getBoundingSphere(new THREE.Sphere()).radius; }
  M.sphere = new THREE.Box3().setFromObject(root, true).getBoundingSphere(new THREE.Sphere());
  controls.minDistance = M.sphere.radius * .12; controls.maxDistance = M.sphere.radius * 5;
  home(true); show('load', false);
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
function select(id) {
  selected = id; show('tag', !!id);
  if (id) { $('tagT').textContent = title(id); $('tagJ').textContent = BASIC[id]?.job || ''; flyTo(M.parts.get(id).center); }
  M.root && M.root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { const b = m.userData.base; if (m.emissive && b.e && !(id && o.userData.pid === id)) { m.emissive.copy(b.e); m.emissiveIntensity = b.ei; } }); });
}
function pulse(now) {
  if (!selected) return; const v = .4 + .4 * (.5 + .5 * Math.sin(now / 260));
  for (const o of M.parts.get(selected).meshes) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.emissive) { m.emissive.copy(SEL); m.emissiveIntensity = v; } });
}
const ray = new THREE.Raycaster();
function pick(x, y) {
  if (!M.root) return null;
  ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -y / innerHeight * 2 + 1), camera);
  const hits = ray.intersectObject(M.root, true).filter(h => h.object.userData.pid && h.object.visible);
  const solid = h => { const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material; return !m.userData.ghost && m.opacity > .5; };
  const h = hits.find(solid) || hits[0]; return h ? h.object.userData.pid : null;
}

// ---------------------------------------------------------------- touch: tap = pick, double-tap empty = reset (turning and zoom are OrbitControls)
let down = null, lastTap = 0;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now(), n: (down?.n || 0) + 1 }; tween = null; });
canvas.addEventListener('pointerup', e => {
  if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 350; down = null;
  if (moved > 8 || !quick) return;
  const id = pick(e.clientX, e.clientY), now = performance.now();
  if (id) select(id === selected ? null : id);
  else { if (now - lastTap < 350) home(false); else select(null); lastTap = now; }
});
$('tag').onclick = () => select(null);

// ---------------------------------------------------------------- hand
const vid = $('vid'), H = createGestures(vid);
const sph = new THREE.Spherical();
function orbitBy(dTheta, dPhi) { const off = camera.position.clone().sub(controls.target); sph.setFromVector3(off); sph.theta += dTheta; sph.phi = clamp(sph.phi + dPhi, .15, Math.PI - .15); off.setFromSpherical(sph); camera.position.copy(controls.target).add(off); }
function setDist(d) { const off = camera.position.clone().sub(controls.target); off.setLength(clamp(d, controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(off); }
let handOn = false, prev = 'none', grab = null, dwell = 0, dwellId = null;
$('bHand').onclick = async () => {
  if (handOn) { H.stop(); handOn = false; $('bHand').textContent = 'Use my hand'; show('pip', false); show('cur', false); return; }
  try { await H.start(); } catch (e) { console.warn(e); return toast('Could not open the camera. Allow camera access and try again.'); }
  handOn = true; $('bHand').textContent = 'Stop hand'; show('pip', true);
  toast('Pinch and move to turn. Make a fist and pull toward you to zoom in. Point and hold to pick a part.');
};
const GLABEL = { open: 'Open hand', point: 'Pointing', pinch: 'Pinch: turning', fist: 'Fist: zoom', none: 'No hand' };
function handFrame(now, dt) {
  H.step(now); const G = H.G;
  const live = G.lm && now - G.seen < 250, g = live ? G.gesture : 'none';
  $('gl2').textContent = G.ready ? GLABEL[g] + (g === 'fist' ? ` · ${Math.round(G.z)} cm` : '') : G.msg;
  show('cur', live);
  if (!live) { grab = null; prev = 'none'; dwell = 0; return; }
  const cx = G.tip.x * innerWidth, cy = G.tip.y * innerHeight, c = $('cur');
  c.style.transform = `translate(${cx}px, ${cy}px)`; c.setAttribute('class', 'g-' + g);
  if (g !== prev) { grab = g === 'pinch' ? { x: G.pinchPt.x, y: G.pinchPt.y } : g === 'fist' ? { z: G.z, d: camera.position.distanceTo(controls.target) } : null; tween = null; }
  if (g === 'pinch' && grab) {                                           // turn: the cell follows your pinch, like holding it
    const dx = G.pinchPt.x - grab.x, dy = G.pinchPt.y - grab.y; grab.x = G.pinchPt.x; grab.y = G.pinchPt.y;
    orbitBy(-dx * 5.5, -dy * 4);
  } else if (g === 'fist' && grab && G.z > 5) {                          // zoom: pull toward you = closer; 2x for every ~25 % change in hand distance
    setDist(grab.d * Math.pow(grab.z / G.z, 3));
  }
  if (g === 'point') {                                                   // hold the fingertip on a part for 0.7 s to pick it
    const id = pick(cx, cy);
    if (id && id === dwellId) { dwell += dt; if (dwell > .7 && id !== selected) { select(id); dwell = -1; } } else { dwellId = id; dwell = 0; }
  } else { dwell = 0; dwellId = null; }
  $('ring').style.strokeDashoffset = 100 - 100 * clamp(dwell / .7, 0, 1);
  prev = g;
}
// the small camera view (mirrored) with the hand skeleton: shows what the tracker sees
const pc = $('pipc'), p2 = pc.getContext('2d');
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
function drawPip() {
  if (!handOn) return; const W = pc.width, Hh = pc.height;
  p2.save(); p2.translate(W, 0); p2.scale(-1, 1); if (vid.readyState >= 2) p2.drawImage(vid, 0, 0, W, Hh); p2.restore();
  const L = H.G.lm; if (!L || performance.now() - H.G.seen > 250) return;
  const P = L.map(p => [(1 - p.x) * W, p.y * Hh]), col = { pinch: '#ffd36b', fist: '#ff8a6b', point: '#6fe0ff', open: '#ffffff' }[H.G.gesture] || '#fff';
  p2.strokeStyle = col; p2.lineWidth = 2.5; p2.beginPath(); for (const [a, b] of BONES) { p2.moveTo(...P[a]); p2.lineTo(...P[b]); } p2.stroke();
  p2.fillStyle = col; for (const q of P) { p2.beginPath(); p2.arc(q[0], q[1], 2.6, 0, 7); p2.fill(); }
}

let toastT = 0;
function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 4200); }

// ---------------------------------------------------------------- loop
let last = performance.now();
renderer.setAnimationLoop(now => {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (handOn) handFrame(now, dt);
  stepTween(now); controls.update(); pulse(now);
  renderer.render(scene, camera); drawPip();
});
load().catch(e => { console.warn(e); $('load').textContent = 'Could not load the cell model.'; });
window.__cell = { M, camera, controls, H, select, pick, THREE };
