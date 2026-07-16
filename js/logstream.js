const LOG_LINES = [
  "Jun 30 01:14:22 graylog syslog: received 847 messages from authentik [192.168.1.254]",
  "Jun 30 01:14:23 wazuh wazuh-manager: INFO: Agent 'jellyfin' (192.168.1.216) connected",
  "Jun 30 01:14:24 proxserver proxmox: TASK OK: vzdump CT 139 (graylog) — backup complete",
  "Jun 30 01:14:25 authentik authentik.events: LOGIN_SUCCESS user=admin source_ip=192.168.1.140",
  "Jun 30 01:14:26 ansible-control ansible: PLAY RECAP — 34 hosts ok, 0 failed, 0 unreachable",
  "Jun 30 01:14:27 grafana grafana: INFO HTTP server listen addr=0.0.0.0:3000",
  "Jun 30 01:14:28 graylog graylog-server: Processed 1,204 messages in last 30s",
  "Jun 30 01:14:29 pihole pihole-FTL: blocked gravity.blacklist.io → 0.0.0.0",
  "Jun 30 01:14:30 proxserver kernel: [UFW BLOCK] IN=vmbr0 SRC=45.33.32.156 DPT=22",
  "Jun 30 01:14:31 wazuh wazuh-manager: WARN: Multiple failed SSH logins from 198.51.100.42",
  "Jun 30 01:14:32 cloudflared cloudflared: Registered tunnel connection connIndex=0",
  "Jun 30 01:14:33 uptime-kuma uptime-kuma: Monitor 'Authentik' — status UP latency=12ms",
  "Jun 30 01:14:34 vaultwarden vaultwarden: INFO: Vault item accessed by user admin",
  "Jun 30 01:14:35 prometheus prometheus: Scrape target up: grafana:9090 duration=0.003s",
  "Jun 30 01:14:36 graylog opensearch: Index shard health GREEN — all 5 shards assigned",
  "Jun 30 01:14:37 ansible-control ansible: CHANGED rsyslog config deployed to servarr",
  "Jun 30 01:14:38 proxserver pve-firewall: ACCEPT IN=fwbr139i0 SRC=192.168.x.x DPT=9000",
  "Jun 30 01:14:39 wazuh wazuh-agent[jellyfin]: ossec: File integrity check passed",
  "Jun 30 01:14:40 pihole pihole-FTL: query blocked: ads.doubleclick.net → NXDOMAIN",
  "Jun 30 01:14:41 graylog graylog-server: Stream 'Security Events' matched 14 messages",
  "Jun 30 01:14:42 beszel beszel: CT 132 (immich) CPU=12% MEM=2.1GB/8GB NET=↑1.2MB ↓0.4MB",
  "Jun 30 01:14:43 cloudflared cloudflared: Health check OK tunnel=aminlab.cc latency=8ms",
  "Jun 30 01:14:44 proxserver patchmon: LXC 107 (homarr) — 3 packages updated successfully",
  "Jun 30 01:14:45 authentik authentik.core: Flow 'default-authentication' completed for admin",
  "Jun 30 01:14:46 graylog sigma-pipeline: Rule 'SSH Brute Force' matched — src=45.33.32.156",
];

class LogStream {
  constructor(containerEl) {
    this.container = containerEl;
    this.inner     = containerEl.querySelector(".logstream-inner");
    this.lines     = [...LOG_LINES, ...LOG_LINES];
    this.current   = 0;
    this._build();
    this._animate();
  }

  _build() {
    this.inner.innerHTML = "";
    this.lines.forEach(line => {
      const span = document.createElement("span");
      span.className = "logstream-line";
      span.innerHTML = this._colorize(line);
      this.inner.appendChild(span);
      const sep = document.createElement("span");
      sep.className = "logstream-sep";
      sep.textContent = " │ ";
      this.inner.appendChild(sep);
    });
  }

  _colorize(line) {
    return line
      .replace(/^(Jun \d+ \d+:\d+:\d+)/, '<span class="ls-date">$1</span>')
      .replace(/(\w+)\s+(\w[\w.-]+):/, '<span class="ls-host">$1</span> <span class="ls-svc">$2</span>:')
      .replace(/(WARN:|ERROR:|BLOCK|blocked|failed|FAILED)/g, '<span class="ls-warn">$1</span>')
      .replace(/(OK|UP|SUCCESS|GREEN|connected|complete|passed)/g, '<span class="ls-ok">$1</span>')
      .replace(/(INFO:|CHANGED|Processed|Registered)/g, '<span class="ls-info">$1</span>')
      .replace(/(\d+\.\d+\.\d+\.\d+)/g, '<span class="ls-ip">$1</span>');
  }

  _animate() {
    
    this.inner.style.animation = "none";
    requestAnimationFrame(() => {
      const totalW = this.inner.scrollWidth / 2;
      const speed  = 80;
      const dur    = totalW / speed;
      this.inner.style.animation = `logscroll ${dur}s linear infinite`;
    });
  }
}
