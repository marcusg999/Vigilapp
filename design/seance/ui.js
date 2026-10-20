// Technique 3: live generative backdrop (ash motes) + scroll progress for the
// 3D hero, and Technique 2: a view-transition morph of the orange ember as the
// active chapter changes.

// --- hero scroll progress → window.__p (scene.js reads it) ---
const hero = document.querySelector(".hero");
function updateP() {
  const total = hero.offsetHeight - innerHeight;
  const p = Math.min(Math.max(-hero.getBoundingClientRect().top / total, 0), 1);
  window.__p = p;
  document.documentElement.style.setProperty("--p", p.toFixed(4));
}
addEventListener("scroll", updateP, { passive: true });
addEventListener("resize", updateP);
updateP();

// --- ash backdrop on the 2D canvas ---
const fx = document.getElementById("fx"), g = fx.getContext("2d");
let W, H, motes = [];
const mk = () => ({
  x: Math.random() * W, y: Math.random() * H,
  r: Math.random() * 1.6 + 0.3, vy: -(Math.random() * 0.25 + 0.05),
  vx: (Math.random() - 0.5) * 0.12, a: Math.random() * 0.4 + 0.1,
});
function resizeFx() {
  W = fx.width = innerWidth; H = fx.height = innerHeight;
  motes = Array.from({ length: Math.min(110, Math.floor(W / 14)) }, mk);
}
addEventListener("resize", resizeFx); resizeFx();
(function fxFrame() {
  g.clearRect(0, 0, W, H);
  for (const m of motes) {
    m.y += m.vy; m.x += m.vx;
    if (m.y < -6) { m.y = H + 6; m.x = Math.random() * W; }
    g.beginPath(); g.arc(m.x, m.y, m.r, 0, 7);
    g.fillStyle = m.y > H * 0.52 ? `rgba(255,120,60,${m.a})` : `rgba(200,196,188,${m.a * 0.7})`;
    g.fill();
  }
  requestAnimationFrame(fxFrame);
})();

// --- chapter rail: the orange ember morphs between marks (View Transitions API) ---
const rail = document.getElementById("rail");
const links = [...rail.querySelectorAll("a")];
const targets = links.map((a) => document.querySelector(a.getAttribute("href")));
const ember = document.createElement("span"); ember.className = "ember";

function setActive(i) {
  links.forEach((a) => a.classList.remove("active"));
  links[i].classList.add("active");
  links[i].appendChild(ember); // moving the shared-name element triggers the morph
}
function activate(i) {
  if (i < 0 || links[i].classList.contains("active")) return;
  if (document.startViewTransition) document.startViewTransition(() => setActive(i));
  else setActive(i);
}
links.forEach((a, i) => a.addEventListener("click", () => activate(i)));

const io = new IntersectionObserver(
  (entries) => entries.forEach((en) => { if (en.isIntersecting) activate(targets.indexOf(en.target)); }),
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
);
targets.forEach((t) => t && io.observe(t));
setActive(0);
