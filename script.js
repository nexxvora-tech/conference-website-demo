/* ---------- Navigation ---------- */
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

/* ---------- Demo form ---------- */
const form = document.querySelector('#registration-form');
const message = document.querySelector('#form-message');
if (form && message) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    message.textContent = 'Thank you! This is a visual demo. Connect a backend to receive registrations.';
    form.reset();
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const siblings = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
        e.target.style.setProperty('--d', Math.min(siblings.indexOf(e.target), 5) * 90 + 'ms');
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

/* ---------- 3D tilt cards ---------- */
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      card.classList.add('tilting');
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

/* ---------- Agenda tabs ---------- */
const tabs = document.querySelectorAll('.agenda-tabs [role="tab"]');
const panels = document.querySelectorAll('.agenda-list');
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
  panels.forEach(p => { p.hidden = p.dataset.panel !== tab.dataset.day; });
}));

/* ---------- Countdown ---------- */
const cd = document.querySelector('#countdown');
if (cd) {
  const target = new Date(cd.dataset.target).getTime();
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    document.querySelector('#cd-d').textContent = pad(d);
    document.querySelector('#cd-h').textContent = pad(h);
    document.querySelector('#cd-m').textContent = pad(m);
    document.querySelector('#cd-s').textContent = pad(s);
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- Animated stat counters ---------- */
const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const co = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / 1400, 1);
      const v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = end < 10 ? String(v).padStart(2, '0') : v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    co.unobserve(el);
  }), { threshold: 0.6 });
  counters.forEach(c => co.observe(c));
}

/* ---------- 3D hero scene (Three.js) ---------- */
(function initHero3D() {
  const holder = document.getElementById('hero-visual');
  const canvas = document.getElementById('hero-canvas');
  if (!holder || !canvas || !window.THREE) { document.body.classList.add('no-webgl'); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) { document.body.classList.add('no-webgl'); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  /* lights: pink + cyan rim lights give the metal its colour */
  scene.add(new THREE.AmbientLight(0x8877aa, 0.55));
  const pink = new THREE.PointLight(0xec48ba, 2.6, 30); pink.position.set(-5, 3, 5); scene.add(pink);
  const cyan = new THREE.PointLight(0x8ad9ed, 2.4, 30); cyan.position.set(5, -3, 4); scene.add(cyan);
  const violet = new THREE.PointLight(0x9152ed, 2.2, 30); violet.position.set(0, 5, -3); scene.add(violet);

  const group = new THREE.Group(); scene.add(group);

  /* hero object: glossy torus-knot */
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.25, 0.38, 240, 36, 2, 3),
    new THREE.MeshPhysicalMaterial({ color: 0x7a4de0, metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, emissive: 0x1d0f3a, emissiveIntensity: 0.6 })
  );
  group.add(knot);

  /* wireframe shell */
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.55, 1)),
    new THREE.LineBasicMaterial({ color: 0x8ad9ed, transparent: true, opacity: 0.28 })
  );
  group.add(shell);

  /* orbit rings */
  const rings = [];
  [[2.1, 0xec48ba, 0.9, 0.2], [2.9, 0x8ad9ed, 0.55, 1.1], [3.4, 0xb08cff, 0.4, 2.0]].forEach(([r, c, o, tilt]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o }));
    ring.rotation.x = Math.PI / 2 + tilt * 0.3; ring.rotation.y = tilt;
    group.add(ring); rings.push(ring);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshBasicMaterial({ color: c }));
    ring.add(dot); dot.userData = { r, speed: 0.4 + tilt * 0.25 };
  });

  /* floating shards */
  const shards = [];
  const shardGeo = new THREE.OctahedronGeometry(0.16, 0);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(shardGeo, new THREE.MeshStandardMaterial({ color: i % 2 ? 0xec48ba : 0x8ad9ed, metalness: 0.7, roughness: 0.25, emissive: 0x220a30 }));
    const a = Math.random() * Math.PI * 2, rad = 3.3 + Math.random() * 2.2;
    m.position.set(Math.cos(a) * rad, (Math.random() - 0.5) * 4.2, Math.sin(a) * rad * 0.6);
    m.userData = { s: 0.4 + Math.random() * 0.9, p: Math.random() * 6, y: m.position.y };
    m.scale.setScalar(0.6 + Math.random() * 1.2);
    scene.add(m); shards.push(m);
  }

  /* particle field */
  const N = 900, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 22; pos[i * 3 + 1] = (Math.random() - 0.5) * 12; pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2; }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xd9c8ff, size: 0.035, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(particles);

  /* layout + resize */
  function resize() {
    const w = holder.clientWidth, h = holder.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const wide = w > 760;
    group.position.set(wide ? 2.6 : 0, wide ? 0.1 : 1.2, 0);
    group.scale.setScalar(wide ? 1 : 0.62);
  }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(holder); else window.addEventListener('resize', resize);

  /* pointer parallax */
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  holder.addEventListener('pointermove', e => {
    const r = holder.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  holder.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

  /* render loop (paused when off-screen or tab hidden) */
  let visible = true, raf = 0;
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    cur.x += (target.x - cur.x) * 0.05; cur.y += (target.y - cur.y) * 0.05;
    knot.rotation.x = t * 0.22 + cur.y * 0.5; knot.rotation.y = t * 0.3 + cur.x * 0.7;
    shell.rotation.y = -t * 0.12; shell.rotation.x = t * 0.08;
    rings.forEach((rg, i) => { rg.rotation.z = t * (0.15 + i * 0.08); const d = rg.children[0]; const a = t * d.userData.speed; d.position.set(Math.cos(a) * d.userData.r, Math.sin(a) * d.userData.r, 0); });
    shards.forEach(s => { s.rotation.x += 0.01 * s.userData.s; s.rotation.y += 0.014 * s.userData.s; s.position.y = s.userData.y + Math.sin(t * s.userData.s + s.userData.p) * 0.35; });
    particles.rotation.y = t * 0.012 + cur.x * 0.08; particles.rotation.x = cur.y * 0.05;
    camera.position.x = cur.x * 0.5; camera.position.y = -cur.y * 0.35; camera.lookAt(0, 0, 0);
    pink.position.x = -5 + Math.sin(t * 0.6) * 2; cyan.position.x = 5 + Math.cos(t * 0.5) * 2;
    renderer.render(scene, camera);
    if (visible && !reduceMotion) raf = requestAnimationFrame(frame);
  }
  function start() { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(holder);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) start(); });
  canvas.classList.add('ready');
  start();
})();
