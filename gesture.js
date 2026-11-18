// gesture.js - your hand in front of the camera -> a few clear gestures. No mat: we only need how the hand moves, not where the table is.
//   open  : a cursor follows your index fingertip
//   point : index finger out, others folded -> hold on a part to select it
//   pinch : thumb and index tips together -> move to turn the cell
//   fist  : all fingers folded -> pull toward you to zoom in, push away to zoom out
// Distance from the camera comes from the hand's 3D shape (MediaPipe world landmarks) fitted to the picture, so it does not
// change when you turn your hand, only when you move it nearer or farther.
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function createGestures(video) {
  const G = { on: false, ready: false, lm: null, wl: null, gesture: 'none', raw: 'none', same: 0, seen: 0, z: 0, tip: null, pinchPt: null, msg: '', cpu: false };
  let hl = null, lastT = 0, err = 0;

  async function start() {
    const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 540 } }, audio: false });
    video.srcObject = st; await video.play(); G.on = true;
    if (!hl) await load();
  }
  function stop() { const st = video.srcObject; st && st.getTracks().forEach(t => t.stop()); video.srcObject = null; G.on = false; G.lm = null; G.gesture = 'none'; }
  async function load() {
    G.msg = 'Loading hand tracking…';
    try {
      const { FilesetResolver, HandLandmarker } = await import(MP + '/vision_bundle.mjs');
      const fs = await FilesetResolver.forVisionTasks(MP + '/wasm');
      const opts = d => ({ baseOptions: { modelAssetPath: MODEL, delegate: d }, runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: .55, minHandPresenceConfidence: .5, minTrackingConfidence: .5 });
      hl = await HandLandmarker.createFromOptions(fs, opts('GPU')).catch(() => { G.cpu = true; return HandLandmarker.createFromOptions(fs, opts('CPU')); });
      G.ready = true; G.msg = 'Show your hand';
    } catch (e) { console.warn(e); G.msg = 'Hand tracking could not load'; }
  }

  const d3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  function classify(w) {
    const curled = (pip, tip) => d3(w[tip], w[0]) < d3(w[pip], w[0]) * 1.08;
    const ext = (pip, tip) => d3(w[tip], w[0]) > d3(w[pip], w[0]) * 1.25;
    const fold = [curled(6, 8), curled(10, 12), curled(14, 16), curled(18, 20)];
    const gap = d3(w[4], w[8]) * 100;                                     // cm between thumb tip and index tip
    if (fold.every(Boolean)) return 'fist';
    if (gap < (G.gesture === 'pinch' ? 4.2 : 2.6)) return 'pinch';
    if (ext(6, 8) && fold[1] && fold[2] && fold[3]) return 'point';
    return 'open';
  }
  // hand distance (cm) from the camera: fit the hand's own 3D shape to where its points are in the picture
  function depth(lm, wl) {
    const W = video.videoWidth || 960, H = video.videoHeight || 540, f = W / 2 / Math.tan(31 * Math.PI / 180), cx = W / 2, cy = H / 2;
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], b = [0, 0, 0];
    const add = (r, v) => { for (let i = 0; i < 3; i++) { b[i] += r[i] * v; for (let j = 0; j < 3; j++) A[i][j] += r[i] * r[j]; } };
    for (let i = 0; i < 21; i++) { const u = lm[i].x * W - cx, v = lm[i].y * H - cy; add([f, 0, -u], u * wl[i].z - f * wl[i].x); add([0, f, -v], v * wl[i].z - f * wl[i].y); }
    const det = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(A); if (Math.abs(D) < 1e-12) return 0;
    return det(A.map((row, i) => row.map((x, j) => j === 2 ? b[i] : x))) / D * 100;
  }

  // about 25 looks a second
  function step(now) {
    if (!hl || !G.on || video.readyState < 2 || now - lastT < 38) return false;
    lastT = now;
    let r; try { r = hl.detectForVideo(video, now); err = 0; } catch (e) { if (++err > 5) G.msg = 'Hand tracking error'; return false; }
    const lm = r.landmarks && r.landmarks[0], wl = r.worldLandmarks && r.worldLandmarks[0];
    if (!lm || !wl) { if (now - G.seen > 250) { G.lm = null; G.gesture = 'none'; G.tip = null; } return true; }
    G.seen = now; G.lm = lm; G.wl = wl;
    const raw = classify(wl);                                             // a gesture counts once it is seen twice in a row (no flicker)
    G.same = raw === G.raw ? G.same + 1 : 0; G.raw = raw; if (G.same >= 1 || G.gesture === 'none') G.gesture = raw;
    const z = depth(lm, wl); if (z > 5) G.z = G.z ? G.z + (z - G.z) * .45 : z;
    // the picture is shown mirrored (like a mirror), so x is flipped; the middle 70 % of the picture covers the whole screen
    const map = p => ({ x: Math.min(1, Math.max(0, (1 - p.x - .15) / .7)), y: Math.min(1, Math.max(0, (p.y - .12) / .7)) });
    const tip = map(lm[8]), pp = map({ x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 });
    G.tip = G.tip ? { x: G.tip.x + (tip.x - G.tip.x) * .5, y: G.tip.y + (tip.y - G.tip.y) * .5 } : tip;
    G.pinchPt = G.pinchPt ? { x: G.pinchPt.x + (pp.x - G.pinchPt.x) * .5, y: G.pinchPt.y + (pp.y - G.pinchPt.y) * .5 } : pp;
    return true;
  }
  return { G, start, stop, step };
}
