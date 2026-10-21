// Technique 1 + motion signature: a real WebGL fly-through of a brutalist
// concrete nave toward a single orange flame, scrubbed by scroll (window.__p).
import * as THREE from "three";

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070a);
scene.fog = new THREE.FogExp2(0x07070a, 0.028);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 400);

// --- board-formed concrete texture, drawn procedurally ---
function concreteTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const x = c.getContext("2d");
  x.fillStyle = "#726e66"; x.fillRect(0, 0, 512, 512);
  const img = x.getImageData(0, 0, 512, 512), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = Math.random() * 36 - 18; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  x.putImageData(img, 0, 0);
  x.strokeStyle = "rgba(0,0,0,0.22)"; x.lineWidth = 2;        // form-board seams
  for (let y = 26; y < 512; y += 64) { x.beginPath(); x.moveTo(0, y); x.lineTo(512, y); x.stroke(); }
  x.fillStyle = "rgba(0,0,0,0.30)";                           // tie-rod holes
  for (let yy = 58; yy < 512; yy += 128) for (let xx = 70; xx < 512; xx += 160) { x.beginPath(); x.arc(xx, yy, 3, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.repeat.set(2, 4);
  return t;
}
const concreteMat = new THREE.MeshStandardMaterial({ color: 0x8a8681, map: concreteTexture(), roughness: 1, metalness: 0 });

// --- the nave: pillars lining a corridor into the dark, + floor + ceiling ---
const BAYS = 16, SPAN = 5, X = 6.5;
const endZ = -(BAYS - 1.5) * SPAN;
const pillarGeo = new THREE.BoxGeometry(2.4, 13, 2.4);
for (let i = 0; i < BAYS; i++) {
  for (const sx of [-X, X]) {
    const m = new THREE.Mesh(pillarGeo, concreteMat);
    m.position.set(sx, 2.0, -i * SPAN); scene.add(m);
  }
}
const slab = new THREE.PlaneGeometry(40, BAYS * SPAN + 24);
const floor = new THREE.Mesh(slab, concreteMat); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -4.5, -(BAYS * SPAN) / 2); scene.add(floor);
const ceil = new THREE.Mesh(slab, concreteMat); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 8.6, -(BAYS * SPAN) / 2); scene.add(ceil);

// --- the altar + the one flame (low brutalist block, flame unobstructed) ---
const altar = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.6, 3.0), concreteMat);
altar.position.set(0, -3.9, endZ); scene.add(altar);            // top ≈ -3.1

function flameTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,244,214,1)"); g.addColorStop(.25, "rgba(255,150,60,.95)");
  g.addColorStop(.6, "rgba(255,90,31,.35)"); g.addColorStop(1, "rgba(255,90,31,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTexture(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
flame.scale.set(2.0, 2.6, 1); flame.position.set(0, -2.4, endZ); scene.add(flame);
const flameLight = new THREE.PointLight(0xff5a1f, 160, 54, 2.0); flameLight.position.set(0, -2.3, endZ); scene.add(flameLight);

// cold, dim fill so the concrete reads but the orange dominates
scene.add(new THREE.HemisphereLight(0x2a2f3a, 0x050509, 0.55));
const key = new THREE.DirectionalLight(0x9fb0c8, 0.45); key.position.set(3, 10, 2); scene.add(key);

// 3D dust in the volume
const DUST = 650, dg = new THREE.BufferGeometry(), dp = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) { dp[i * 3] = (Math.random() - .5) * 22; dp[i * 3 + 1] = Math.random() * 12 - 4; dp[i * 3 + 2] = -Math.random() * BAYS * SPAN; }
dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffb98a, size: 0.05, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(dust);

const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clock = new THREE.Clock();

function frame() {
  const t = clock.getElapsedTime();
  const e = ease(Math.min(Math.max(window.__p || 0, 0), 1));
  camera.position.z = 14 - e * (14 - (endZ + 6)); // enter → stop ~6 short of the altar
  camera.position.y = -0.2 + Math.sin(t * 0.3) * 0.12;
  camera.position.x = Math.sin(t * 0.18) * 0.4;
  camera.lookAt(0, -2.6, endZ);

  flameLight.intensity = 150 + Math.sin(t * 9) * 22 + Math.sin(t * 23) * 10; // flicker
  flame.scale.set(2.3 + Math.sin(t * 7) * 0.12, 2.9 + Math.sin(t * 5) * 0.14, 1);

  const pos = dg.attributes.position.array;
  for (let i = 0; i < DUST; i++) { pos[i * 3 + 1] += 0.004; if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = -4; }
  dg.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
