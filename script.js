// ===== Theme (remembers the visitor's choice) =====
const root = document.documentElement;
const savedTheme = (() => { try { return localStorage.getItem("theme"); } catch { return null; } })();
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
root.setAttribute("data-theme", savedTheme || (prefersLight ? "light" : "dark"));

document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch {}
});

// ===== Mobile menu =====
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// ===== Nav background on scroll + active link =====
const nav = document.getElementById("nav");
const sections = [...document.querySelectorAll("main section[id]")];
const links = [...navLinks.querySelectorAll("a")];
function onScroll() {
  nav.classList.toggle("scrolled", window.scrollY > 20);
  let current = "";
  for (const s of sections) if (window.scrollY >= s.offsetTop - 120) current = s.id;
  links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Typing effect =====
const roles = [
  "production AI systems",
  "LLM-powered document extraction",
  "agentic AI on Google Cloud",
  "computer vision solutions",
  "scalable FastAPI backends"
];
const typedEl = document.getElementById("typed");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  let r = 0, c = roles[0].length, deleting = true;
  setTimeout(function tick() {
    const word = roles[r];
    c += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, c);
    let delay = deleting ? 35 : 70;
    if (!deleting && c === word.length) { deleting = true; delay = 1800; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 300; }
    setTimeout(tick, delay);
  }, 2000);
}

// ===== Reveal on scroll + count-up stats =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    if (e.target.classList.contains("tl-item")) e.target.parentElement.classList.add("drawn");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll(".projects .project, .skills .skill-card, .tl-item").forEach((el, i, all) => {
  el.style.setProperty("--d", (i % 3) * 120 + "ms");
});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

function countUp(el) {
  const target = +el.dataset.count;
  if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
  const start = performance.now(), dur = 1400;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

// ===== Project filters =====
const chips = document.querySelectorAll("#filters .chip");
const projects = document.querySelectorAll(".project");
chips.forEach(chip => chip.addEventListener("click", () => {
  chips.forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  const f = chip.dataset.filter;
  projects.forEach(p => {
    const show = f === "all" || p.dataset.tags.split(" ").includes(f);
    p.classList.toggle("hide", !show);
    if (show) {
      p.classList.add("visible");
      p.classList.remove("pop"); void p.offsetWidth; p.classList.add("pop");
    }
  });
}));

// ===== Copy email =====
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}
document.getElementById("copyEmail").addEventListener("click", async () => {
  const email = "shorif.mahmud.abdullah@gmail.com";
  try { await navigator.clipboard.writeText(email); showToast("Email copied!"); }
  catch { showToast(email); }
});

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();


// ===== Hero headline: split into words that rise in =====
(() => {
  const h1 = document.querySelector(".hero h1");
  if (!h1) return;
  let i = 0;
  const wrap = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) { frag.append(part); return; }
          const sp = document.createElement("span");
          sp.className = "w"; sp.style.setProperty("--i", i++); sp.textContent = part;
          frag.append(sp);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        if (n.classList.contains("grad")) {
          // keep gradient text intact, animate each word inside it
          wrap(n);
        } else wrap(n);
      }
    });
  };
  wrap(h1);
})();

// ===== Scroll progress bar =====
const progress = document.getElementById("progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
}
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// ===== Cursor spotlight + card spotlight + tilt (mouse devices only) =====
const canHover = window.matchMedia("(hover: hover)").matches;
if (canHover && !reduceMotion) {
  const glow = document.getElementById("cursorGlow");
  addEventListener("mousemove", e => {
    glow.classList.add("on");
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }, { passive: true });
  document.addEventListener("mouseleave", () => glow.classList.remove("on"));

  const spot = el => el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  });
  document.querySelectorAll(".project, .skill-card, .tl-card, .edu-col").forEach(spot);

  const tilt = (el, max) => {
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(800px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-6px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  };
  document.querySelectorAll(".project").forEach(p => { p.classList.add("tilt"); tilt(p, 8); });
  const photo = document.getElementById("tiltPhoto");
  if (photo) tilt(photo, 14);

  // magnetic buttons
  document.querySelectorAll(".btn, .socials a").forEach(b => {
    b.addEventListener("mousemove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
    });
    b.addEventListener("mouseleave", () => { b.style.transform = ""; });
  });
}

// ===== Interactive particle network background =====
(() => {
  const cv = document.getElementById("bgCanvas");
  if (!cv || reduceMotion) return;
  const ctx = cv.getContext("2d");
  let w, h, dpr, pts = [], mouse = { x: -999, y: -999 }, color = "20,184,166";
  const readColor = () => {
    const c = getComputedStyle(root).getPropertyValue("--accent").trim();
    const m = /^#([0-9a-f]{6})$/i.exec(c);
    if (m) color = [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16)).join(",");
  };
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
    const n = Math.round(Math.min(90, innerWidth * innerHeight / 17000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .35 * dpr, vy: (Math.random() - .5) * .35 * dpr, r: (Math.random() * 1.4 + .8) * dpr
    }));
  };
  addEventListener("resize", resize);
  addEventListener("mousemove", e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
  new MutationObserver(readColor).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  readColor(); resize();
  const link = 140 * 1;
  (function frame() {
    ctx.clearRect(0, 0, w, h);
    const L = link * dpr;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120 * dpr) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = `rgba(${color},.8)`; ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dd = Math.hypot(p.x - q.x, p.y - q.y);
        if (dd < L) {
          ctx.strokeStyle = `rgba(${color},${(1 - dd / L) * .35})`;
          ctx.lineWidth = dpr * .8;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  })();
})();
