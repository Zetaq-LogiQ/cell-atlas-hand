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
  holder.add(root); root.updateMatrixWorld(true);
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
  if (id) { $('tagT').textContent = title(id); $('tagJ').textContent = BASIC[id]?.job || ''; if (mode === '3d') flyTo(M.parts.get(id).center); }
  M.root && M.root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { const b = m.userData.base; if (m.emissive && b.e && !(id && o.userData.pid === id)) { m.emissive.copy(b.e); m.emissiveIntensity = b.ei; } }); });
}
function pulse(now) {
  if (!selected) return; const v = .4 + .4 * (.5 + .5 * Math.sin(now / 260));
  for (const o of M.parts.get(selected).meshes) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.emissive) { m.emissive.copy(SEL); m.emissiveIntensity = v; } });
}
const ray = new THREE.Raycaster();
function pick(x, y) { ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -y / innerHeight * 2 + 1), camera); return pickRay(ray.ray); }
function pickRay(r) {
  if (!M.root) return null; ray.ray.copy(r);
  const hits = ray.intersectObject(M.root, true).filter(h => h.object.userData.pid && h.object.visible);
  const solid = h => { const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material; return !m.userData.ghost && m.opacity > .5; };
  const h = hits.find(solid) || hits[0]; return h ? h.object.userData.pid : null;
}

// ---------------------------------------------------------------- touch: tap = pick, double-tap empty = reset (turning and zoom are OrbitControls)
let down = null, lastTap = 0;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now(), n: (down?.n || 0) + 1 }; tween = null; });
canvas.addEventListener('pointerup', e => {
  if (!down || mode === 'xr') return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 350; down = null;
  if (moved > 8 || !quick) return;
  if (mode === 'gyro') return gyroTap(e.clientX, e.clientY);
  const id = pick(e.clientX, e.clientY), now = performance.now();
  if (id) select(id === selected ? null : id);
  else { if (now - lastTap < 350) home(false); else select(null); lastTap = now; }
});
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
const ACT = {
  turn(dx, dy) { if (mode === '3d') orbitBy(-dx * 5.5, -dy * 4); else { holder.rotation.y += dx * 5.5; holder.rotation.x = clamp(holder.rotation.x + dy * 4, -1.3, 1.3); } },
  sizeStart() { return mode === '3d' ? camera.position.distanceTo(controls.target) : holder.scale.x; },
  size(s0, k) { if (mode === '3d') setDist(s0 / k); else holder.scale.setScalar(clamp(s0 * k, AR_S * .35, AR_S * 5)); },
  aim(x, y) { return mode === 'xr' ? pickRay(xrRay(x, y)) : pick(x, y); }
};

let handOn = false, prev = 'none', grab = null, dwell = 0, dwellId = null, hfLast = 0;
const GLABEL = { open: 'Open hand', point: 'Pointing', pinch: 'Pinch: turning', fist: 'Fist: zoom', none: 'No hand' };
function handFrame(now, _dt, src) {
  const G = H.G; H.step(now, src); const dt = Math.min(.2, (now - (hfLast || now)) / 1000); hfLast = now;
  const live = G.lm && now - G.seen < 250, g = live ? G.gesture : 'none';
  $('gl2').textContent = G.ready ? GLABEL[g] + (g === 'fist' ? ` · ${Math.round(G.z)} cm` : '') : G.msg;
  show('cur', live);
  if (!live) { grab = null; prev = 'none'; dwell = 0; return; }
  const cx = G.tip.x * innerWidth, cy = G.tip.y * innerHeight, c = $('cur');
  c.style.transform = `translate(${cx}px, ${cy}px)`; c.setAttribute('class', 'g-' + g);
  if (g === 'pinch' && prev !== 'pinch' && !isPlaced()) { placeNow(); prev = g; return; }
  if (g !== prev) { grab = g === 'pinch' ? { x: G.pinchPt.x, y: G.pinchPt.y } : g === 'fist' ? { z: G.z, s: ACT.sizeStart() } : null; tween = null; }
  if (g === 'pinch' && grab) { const dx = G.pinchPt.x - grab.x, dy = G.pinchPt.y - grab.y; grab.x = G.pinchPt.x; grab.y = G.pinchPt.y; ACT.turn(dx, dy); }
  // zoom: close your hand and pull it toward you = bigger / closer (the front camera sees the hand move away, the back camera sees it come nearer)
  else if (g === 'fist' && grab && G.z > 5) { const r = grab.z / G.z; ACT.size(grab.s, Math.pow(G.mirror ? 1 / r : r, 3)); }
  if (g === 'point' && (mode !== 'xr' || placed) && (mode !== 'gyro' || gPlaced)) {
    const id = ACT.aim(cx, cy);
    if (id && id === dwellId) { dwell += dt; if (dwell > .7 && id !== selected) { select(id); dwell = -1; } } else { dwellId = id; dwell = 0; }
  } else { dwell = 0; dwellId = null; }
  $('ring').style.strokeDashoffset = 100 - 100 * clamp(dwell / .7, 0, 1);
  prev = g;
}

// ---------------------------------------------------------------- AR: place the cell in your room
const AR_S = .3 / 2;                                                      // in AR the cell is 30 cm across to start (scale is set from its radius)
let arScale = 1;
function arHolder(at) {                                                  // centre the cell on 'at', 30 cm across, facing you
  M.root.position.copy(M.sphere.center).negate(); arScale = AR_S / M.sphere.radius;
  holder.position.copy(at); holder.scale.setScalar(arScale); holder.rotation.set(0, 0, 0);
}
function arOff() { M.root.position.set(0, 0, 0); holder.position.set(0, 0, 0); holder.scale.setScalar(1); holder.rotation.set(0, 0, 0); holder.visible = true; }
ACT.size = (s0, k) => { if (mode === '3d') setDist(s0 / k); else holder.scale.setScalar(clamp(s0 * k, arScale * .35, arScale * 5)); };

$('bAR').onclick = async () => {
  const xrOK = navigator.xr && await Promise.race([navigator.xr.isSessionSupported('immersive-ar').catch(() => false), new Promise(r => setTimeout(() => r(false), 2000))]);
  return xrOK ? startXR() : startGyro();
};
$('bExit').onclick = () => mode === 'xr' ? renderer.xr.getSession()?.end() : stopGyro();
function uiAR(on) {
  show('bAR', !on); show('bExit', on); show('title', !on); document.body.classList.toggle('ar', on);
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
$('ui').addEventListener('beforexrselect', e => { if (e.target.closest('button, #tag')) e.preventDefault(); });
const m4 = new THREE.Matrix4();
function onXRSelect(e) {
  if (!placed) { xrPlace(); return; }
  const pose = e.frame && e.frame.getPose(e.inputSource.targetRaySpace, renderer.xr.getReferenceSpace()); if (!pose) return;
  m4.fromArray(pose.transform.matrix);
  const id = pickRay(new THREE.Ray(new THREE.Vector3().setFromMatrixPosition(m4), new THREE.Vector3(0, 0, -1).transformDirection(m4)));
  select(id && id !== selected ? id : null);
}
function xrPlace() {
  if (!placed) {
    if (!reticle.visible) return;
    const p = new THREE.Vector3().setFromMatrixPosition(reticle.matrix).add(new THREE.Vector3(0, .25, 0));   // floats 25 cm above the spot
    arHolder(p); const c = renderer.xr.getCamera().position; holder.rotation.y = Math.atan2(c.x - p.x, c.z - p.z);
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
    holder.rotation.y = Math.atan2(-at.x, -at.z); holder.visible = true; gPlaced = true; hint('');
    toast('Show your hand to the camera: pinch to turn, fist and pull toward you to zoom, point and hold to pick.'); return;
  }
  const id = pick(x, y); select(id && id !== selected ? id : null);
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
  pulse(now);
  renderer.render(scene, camera); drawPip(src);
});
load().catch(e => { console.warn(e); $('load').textContent = 'Could not load the cell model.'; });
window.__cell = { M, camera, controls, H, select, pick, THREE, holder, get mode() { return mode; }, startGyro, gyroTap };
