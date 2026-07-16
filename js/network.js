function getBootSequence() {
  const uptime = (() => {
    const ms = Date.now() - DATA.homelab.since.getTime();
    const d  = Math.floor(ms / 86400000);
    const h  = Math.floor((ms % 86400000) / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    return `${d}d ${h}h ${m}m`;
  })();

  return [
    { text: `${DATA.homelab.host} login: visitor`, cls: "c-muted" },
    { gap: true },
    { text: `Linux ${DATA.homelab.host} 6.8.0-proxmox #1 SMP PREEMPT_DYNAMIC x86_64`, cls: "c-muted" },
    { gap: true },
    { text: `  ██╗███╗   ██╗████████╗ ██████╗ ██╗  ██╗ █████╗  ██████╗  ██████╗  ██████╗`, cls: "c-blue-dim" },
    { text: `  ██║████╗  ██║╚══██╔══╝██╔═████╗╚██╗██╔╝██╔══██╗██╔═████╗██╔═████╗██╔═████╗`, cls: "c-blue-dim" },
    { text: `  ██║██╔██╗ ██║   ██║   ██║██╔██║ ╚███╔╝ ╚█████╔╝██║██╔██║██║██╔██║██║██╔██║`, cls: "c-blue-dim" },
    { text: `  ██║██║╚██╗██║   ██║   ████╔╝██║ ██╔██╗ ██╔══██╗████╔╝██║████╔╝██║████╔╝██║`, cls: "c-blue-dim" },
    { text: `  ██║██║ ╚████║   ██║   ╚██████╔╝██╔╝ ██╗╚█████╔╝╚██████╔╝╚██████╔╝╚██████╔╝`, cls: "c-blue-dim" },
    { text: `  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝ ╚════╝  ╚═════╝  ╚═════╝  ╚═════╝`, cls: "c-blue-dim" },
    { gap: true },
    { text: `  Systems & Security Engineer`, cls: "c-text" },
    { text: `  Greater Atlanta, GA  ·  github.com/int0x8000`, cls: "c-muted" },
    { gap: true },
    { text: `  Homelab:    <span class="c-green">ONLINE</span>  ·  ${DATA.homelab.containers} containers  ·  uptime ${uptime}`, cls: "c-muted", html: true },
    { text: `  Status:     <span class="c-green">open to opportunities</span>`, cls: "c-muted", html: true },
    { gap: true },
    { text: `Type <span class="c-blue">help</span> to get started, or <span class="c-blue">ls</span> to explore.`, cls: "c-muted", html: true },
    { gap: true },
  ];
}
