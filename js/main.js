let term;

document.addEventListener("DOMContentLoaded", async () => {

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const topoCanvas = document.getElementById("topology-canvas");
  if (topoCanvas) {
    const topo = new TopologyCanvas(topoCanvas);
    // Stop animating once the hero is scrolled out of view — no point
    // burning CPU/battery on a canvas nobody can see.
    const heroObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) topo.resume(); else topo.pause();
    }, { threshold: 0 });
    heroObs.observe(topoCanvas);
  }

  const logstreamEl = document.querySelector(".logstream-strip");
  if (logstreamEl && !reduceMotion) new LogStream(logstreamEl);

  const container = document.querySelector(".terminal-container");
  term = new Terminal(container);

  const bootLines = getBootSequence();
  await term.boot(bootLines, 30);

  term._updatePrompt();
  container.querySelector(".term-input-line").style.display = "flex";
  term._focus();

  function updateUptime() {
    const el = document.getElementById("hero-uptime");
    if (!el) return;
    const ms = Date.now() - DATA.homelab.since.getTime();
    const d  = Math.floor(ms / 86400000);
    const h  = Math.floor((ms % 86400000) / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    const s  = Math.floor((ms % 60000) / 1000);
    el.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }
  updateUptime();
  setInterval(updateUptime, 1000);

  
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));

  
  const revealEls = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("revealed");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));

  
  const menuBtn = document.querySelector(".nav-menu-btn");
  const navLinks2 = document.querySelector(".nav-links");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      navLinks2.classList.toggle("open");
    });
  }

});
