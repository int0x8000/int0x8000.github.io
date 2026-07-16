const TOPOLOGY = {

  nodes: [
    // Core
    { id: "proxmox",    label: "Proxmox VE",    group: "core",     x: .5,  y: .45 },
    // Security
    { id: "graylog",    label: "Graylog",        group: "security", x: .18, y: .25 },
    { id: "wazuh",      label: "Wazuh",          group: "security", x: .12, y: .5  },
    { id: "authentik",  label: "Authentik",      group: "security", x: .22, y: .72 },
    { id: "vaultwarden",label: "Vaultwarden",    group: "security", x: .08, y: .72 },
    // Monitoring
    { id: "grafana",    label: "Grafana",        group: "monitor",  x: .78, y: .22 },
    { id: "prometheus", label: "Prometheus",     group: "monitor",  x: .88, y: .45 },
    { id: "uptime",     label: "Uptime Kuma",    group: "monitor",  x: .82, y: .68 },
    { id: "beszel",     label: "Beszel",         group: "monitor",  x: .68, y: .78 },
    // Networking
    { id: "cloudflared",label: "Cloudflared",    group: "network",  x: .5,  y: .15 },
    { id: "pihole",     label: "Pi-hole",        group: "network",  x: .35, y: .12 },
    // Automation
    { id: "ansible",    label: "Ansible",        group: "auto",     x: .65, y: .12 },
    // Media / other
    { id: "jellyfin",   label: "Jellyfin",       group: "media",    x: .35, y: .78 },
    { id: "immich",     label: "Immich",         group: "media",    x: .5,  y: .82 },
  ],

  edges: [
    ["proxmox","graylog"],["proxmox","wazuh"],["proxmox","authentik"],
    ["proxmox","grafana"],["proxmox","prometheus"],["proxmox","ansible"],
    ["proxmox","cloudflared"],["proxmox","pihole"],["proxmox","jellyfin"],
    ["proxmox","immich"],["proxmox","uptime"],["proxmox","beszel"],
    ["proxmox","vaultwarden"],
    ["authentik","cloudflared"],["graylog","wazuh"],
    ["grafana","prometheus"],["ansible","proxmox"],
    ["cloudflared","authentik"],["pihole","cloudflared"],
    ["uptime","beszel"],
  ],

  // Gruvbox colors
  colors: {
    core:     "#FABD2F",
    security: "#FB4934",
    monitor:  "#83A598",
    network:  "#8EC07C",
    auto:     "#FE8019",
    media:    "#D3869B",
  },
};

class TopologyCanvas {
  constructor(canvasEl) {
    this.canvas  = canvasEl;
    this.ctx     = canvasEl.getContext("2d");
    this.W       = 0;
    this.H       = 0;
    this.nodes   = [];
    this.packets = [];
    this.frame   = 0;
    this.animId  = null;

    this._initNodes();
    this._resize();
    window.addEventListener("resize", () => this._resize());
    this._spawnPackets();
    this._loop();
  }

  _initNodes() {
    this.nodes = TOPOLOGY.nodes.map(n => ({
      ...n,
      px: 0, py: 0,       
      pulse: Math.random() * Math.PI * 2,
      radius: n.group === "core" ? 7 : 5,
    }));
  }

  _resize() {
    const rect  = this.canvas.parentElement.getBoundingClientRect();
    this.W      = this.canvas.width  = rect.width;
    this.H      = this.canvas.height = rect.height;
    this.nodes.forEach(n => {
      n.px = n.x * this.W;
      n.py = n.y * this.H;
    });
  }

  _nodeById(id) {
    return this.nodes.find(n => n.id === id);
  }

  _spawnPackets() {
    const spawn = () => {
      const edge = TOPOLOGY.edges[Math.floor(Math.random() * TOPOLOGY.edges.length)];
      const reverse = Math.random() > .5;
      this.packets.push({
        from: reverse ? edge[1] : edge[0],
        to:   reverse ? edge[0] : edge[1],
        t: 0,
        speed: .004 + Math.random() * .004,
        color: TOPOLOGY.colors[this._nodeById(reverse ? edge[1] : edge[0])?.group] || "#FABD2F",
      });
      setTimeout(spawn, 600 + Math.random() * 1400);
    };
    spawn();
  }

  _loop() {
    this.animId = requestAnimationFrame(() => this._loop());
    this._draw();
    this.frame++;
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    
    TOPOLOGY.edges.forEach(([aId, bId]) => {
      const a = this._nodeById(aId);
      const b = this._nodeById(bId);
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.strokeStyle = "rgba(80,73,69,.5)";
      ctx.lineWidth   = .8;
      ctx.stroke();
    });

    
    this.packets = this.packets.filter(p => {
      p.t += p.speed;
      if (p.t > 1) return false;
      const a = this._nodeById(p.from);
      const b = this._nodeById(p.to);
      if (!a || !b) return false;
      const x = a.px + (b.px - a.px) * p.t;
      const y = a.py + (b.py - a.py) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = .8;
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });

    
    const t = Date.now() / 1000;
    this.nodes.forEach(n => {
      const color  = TOPOLOGY.colors[n.group] || "#FABD2F";
      const glow   = .5 + .5 * Math.sin(t * 1.2 + n.pulse);
      const radius = n.radius;

      
      const grad = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, radius * 4);
      grad.addColorStop(0,   hexAlpha(color, .18 * glow));
      grad.addColorStop(1,   hexAlpha(color, 0));
      ctx.beginPath();
      ctx.arc(n.px, n.py, radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      
      ctx.beginPath();
      ctx.arc(n.px, n.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(color, .7 + .3 * glow);
      ctx.fill();

      
      ctx.font         = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle    = hexAlpha(color, .65);
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      ctx.fillText(n.label, n.px, n.py + radius + 4);
    });
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this._resize);
  }
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
