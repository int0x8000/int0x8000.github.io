const COMMANDS = {

  help(args, fs) {
    return { output: `
<span class="c-comment"># Available commands</span>

  <span class="c-cmd">ls</span>       [path]     list directory contents
  <span class="c-cmd">cd</span>       [path]     change directory
  <span class="c-cmd">cat</span>      &lt;file&gt;     display file contents
  <span class="c-cmd">pwd</span>                 print working directory
  <span class="c-cmd">clear</span>               clear the terminal
  <span class="c-cmd">whoami</span>              display current user info
  <span class="c-cmd">history</span>             show command history
  <span class="c-cmd">uname</span>    [-a]       system information
  <span class="c-cmd">projects</span>            list all projects
  <span class="c-cmd">skills</span>              display technical skills
  <span class="c-cmd">resume</span>              display resume summary
  <span class="c-cmd">open</span>     &lt;name&gt;     open a project page (graylog, detection, intune)

<span class="c-comment"># Try these to get started:</span>
  <span class="c-str">ls</span>
  <span class="c-str">cat about.txt</span>
  <span class="c-str">cd projects/ &amp;&amp; ls</span>
  <span class="c-str">./contact.sh</span>
  <span class="c-str">./homelab-status.sh</span>

<span class="c-comment"># Feeling curious? Try:</span>
  <span class="c-str">nmap</span>  <span class="c-str">sudo rm -rf /</span>  <span class="c-str">cowsay</span>  <span class="c-str">fortune</span>  <span class="c-str">top</span>  <span class="c-str">ls -a</span>
`, html: true };
  },

  ls(args, fs) {
    const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al");
    const longForm   = args.includes("-l") || args.includes("-la") || args.includes("-al");
    const pathArg    = args.find(a => !a.startsWith("-")) || "";
    const result     = fs.ls(pathArg);
    if (!result.ok)  return { output: result.err };

    const entries = Object.entries(result.entries)
      .filter(([name]) => showHidden || !name.startsWith("."))
      .sort(([a], [b]) => a.localeCompare(b));

    if (entries.length === 0) return { output: "" };

    if (longForm) {
      const lines = entries.map(([name, node]) => {
        const isDir  = node.type === "dir";
        const isExec = node.executable;
        const perm   = isDir ? "drwxr-xr-x" : (isExec ? "-rwxr-xr-x" : "-rw-r--r--");
        const cls    = isDir ? "c-dir" : (isExec ? "c-exec" : "c-file");
        const suffix = isDir ? "/" : (isExec ? "*" : "");
        return `${perm}  visitor  homelab  <span class="${cls}">${name}${suffix}</span>`;
      });
      return { output: lines.join("\n"), html: true };
    }

    const parts = entries.map(([name, node]) => {
      const isDir  = node.type === "dir";
      const isExec = node.executable;
      const cls    = isDir ? "c-dir" : (isExec ? "c-exec" : "c-file");
      const suffix = isDir ? "/" : "";
      return `<span class="${cls}">${name}${suffix}</span>`;
    });
    return { output: parts.join("  "), html: true };
  },

  cd(args, fs) {
    const path   = args[0] || "~";
    const result = fs.cd(path);
    return result.ok ? { output: "" } : { output: result.err };
  },

  cat(args, fs) {
    if (!args.length) return { output: "cat: missing operand" };
    const results = [];
    for (const arg of args) {
      const r = fs.cat(arg);
      results.push(r.ok ? r.content : r.err);
    }
    return { output: results.join("\n\n") };
  },

  pwd(args, fs) {
    return { output: fs.pwd() };
  },

  clear() {
    return { output: "", clear: true };
  },

  whoami(args, fs) {
    const w = DATA.whoami;
    return { output:
`<span class="c-key">name</span>:     ${w.name}
<span class="c-key">handle</span>:   <span class="c-green">${w.handle}</span>
<span class="c-key">role</span>:     ${w.role}
<span class="c-key">location</span>: ${w.location}
<span class="c-key">github</span>:   <span class="c-blue">${w.github}</span>
<span class="c-key">status</span>:   <span class="c-green">${w.status}</span>`, html: true };
  },

  uname(args) {
    if (args.includes("-a")) {
      return { output: `Linux int0x8000 6.8.0-proxmox #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux` };
    }
    return { output: "Linux" };
  },

  history(args, fs, term) {
    if (!term.history.length) return { output: "(no history)" };
    const lines = term.history.map((cmd, i) => `  ${String(i + 1).padStart(3)}  ${cmd}`);
    return { output: lines.join("\n") };
  },

  projects(args, fs) {
    const lines = [`<span class="c-comment"># Projects</span>\n`];
    for (const [key, proj] of Object.entries(DATA.projects)) {
      const statusCls = proj.status === "ONLINE" ? "c-green" : "c-blue";
      lines.push(`  <span class="c-dir">${key}/</span>`);
      lines.push(`    <span class="c-key">name</span>:   ${proj.name}`);
      lines.push(`    <span class="c-key">status</span>: <span class="${statusCls}">${proj.status}</span>`);
      lines.push(`    <span class="c-key">tags</span>:   ${proj.tags.join(", ")}`);
      lines.push("");
    }
    lines.push(`<span class="c-comment"># Run: cd projects/&lt;name&gt; &amp;&amp; cat README.md</span>`);
    return { output: lines.join("\n"), html: true };
  },

  skills(args, fs) {
    const lines = [`<span class="c-comment"># Technical Skills</span>\nskills:\n`];
    for (const [cat, items] of Object.entries(DATA.skills)) {
      lines.push(`  <span class="c-key">${cat}</span>:`);
      items.forEach(i => lines.push(`    <span class="c-green">-</span> ${i}`));
      lines.push("");
    }
    return { output: lines.join("\n"), html: true };
  },

  ssh(args)     { return { output: DATA.easter_eggs.ssh }; },
  sudo(args)    { return { output: DATA.easter_eggs.sudo }; },
  vim(args)     { return { output: DATA.easter_eggs.vim }; },
  vi(args)      { return { output: DATA.easter_eggs.vim }; },
  nano(args)    { return { output: DATA.easter_eggs.vim.replace("VIM - Vi IMproved", "GNU nano").replace(":q!", "Ctrl+X") }; },
  nmap(args)    { return { output: DATA.easter_eggs.nmap }; },
  ping(args)    { return { output: DATA.easter_eggs.ping }; },
  rm(args)      { return { output: DATA.easter_eggs.rm }; },
  reboot(args)  { return { output: DATA.easter_eggs.reboot }; },
  shutdown(args){ return { output: DATA.easter_eggs.reboot }; },
  top(args)     { return { output: DATA.easter_eggs.top }; },
  htop(args)    { return { output: DATA.easter_eggs.top }; },
  cowsay(args)  { return { output: DATA.easter_eggs.cowsay }; },
  fortune(args) { return { output: DATA.easter_eggs.fortune }; },
  sl(args)      { return { output: DATA.easter_eggs.sl }; },
  yes(args)     { return { output: DATA.easter_eggs.yes }; },
  matrix(args)  { return { output: DATA.easter_eggs.matrix }; },
  hack(args)    { return { output: DATA.easter_eggs.hack }; },
  make(args)    { return { output: DATA.easter_eggs.make }; },
  ifconfig(args){ return { output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n      inet 10.0.1.10  netmask 255.255.255.0  broadcast 10.0.1.100\n      ether de:ad:be:ef:00:01  txqueuelen 1000  (Ethernet)` }; },
  ip(args)      { return { output: `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>\n    link/ether de:ad:be:ef:00:01 brd ff:ff:ff:ff:ff:ff\n    inet 10.0.1.20/24 brd 10.0.1.100 scope global eth0` }; },

  curl(args) {
    if (!args.length) return { output: `curl: try 'curl https://github.com/int0x8000'` };
    return { output: `curl: (6) Could not resolve host: ${args[0]}\nHint: you're already here.` };
  },

  grep(args) {
    return { output: `grep: pattern matching not implemented.\nTry 'cat' and read with your own eyes.` };
  },

  exit() {
    return { output: `logout\nSession closed.\n\n(refresh to reconnect)` };
  },

  echo(args) {
    return { output: args.join(" ") || "" };
  },

  date() {
    return { output: new Date().toString() };
  },

  uptime() {
    const since = DATA.homelab.since;
    const ms    = Date.now() - since.getTime();
    const d     = Math.floor(ms / 86400000);
    const h     = Math.floor((ms % 86400000) / 3600000);
    const m     = Math.floor((ms % 3600000) / 60000); 
    return { output: ` ${new Date().toTimeString().split(" ")[0]} up ${d} days, ${h}:${String(m).padStart(2,"0")},  1 user,  load average: 0.42, 0.38, 0.35` };
  },

  man(args) {
    if (!args.length) return { output: "What manual page do you want?\nFor example: man ls" };
    return { output: `No manual entry for ${args[0]}.\nTry 'help' for available commands.` };
  },

  open(args) {
    if (!args.length) return { output: "open: missing argument\nUsage: open <project>\nTry: open graylog, open detection, open intune" };
    const map = {
      "graylog":           "projects/graylog.html",
      "detection":         "projects/detection.html",
      "detection-as-code": "projects/detection.html",
      "intune":            "projects/intune.html",
      "github":            "https://github.com/int0x8000",
      "linkedin":          "https://www.linkedin.com/in/matthew-nifong/",
      "resume":            "assets/matthew-resume.pdf",
    };
    const key = args[0].replace("projects/","").replace(".html","").toLowerCase();
    const url = map[key];
    if (url) {
      setTimeout(() => window.open(url, url.startsWith("http") ? "_blank" : "_self"), 300);
      return { output: `Opening ${args[0]}...`, html: false };
    }
    return { output: `open: no handler for '${args[0]}'\nAvailable: graylog, detection, intune, github, linkedin, resume` };
  },

  resume(args, fs) {
    const w = DATA.whoami;
    return { output:
`<span class="c-comment">########################################</span>
<span class="c-comment">#  RESUME — ${w.name.padEnd(28)}#</span>
<span class="c-comment">########################################</span>

<span class="c-key">role</span>:     <span class="c-blue">Systems & Security Engineer</span>
<span class="c-key">location</span>: <span class="c-str">${w.location}</span>
<span class="c-key">github</span>:   <span class="c-blue">${w.github}</span>
<span class="c-key">email</span>:    <span class="c-blue">${w.email}</span>

<span class="c-yellow">EXPERIENCE</span>
  Hardware Configuration Specialist — MSP
  2024 — Present
  • Leading multi-tenant Intune/Entra ID rollout (1,000+ endpoints)
  • Windows Autopilot, compliance policies, Conditional Access
  • Win32 app packaging, AD administration, PowerShell scripting

  Service Technician — uBreakiFix by Asurion
  06/2024 — 12/2024

<span class="c-yellow">CERTIFICATIONS</span>
  CompTIA A+          April 2025        <span class="c-green">ACTIVE</span>
  SC-300 Microsoft IAM                  <span class="c-blue">IN PROGRESS</span>

<span class="c-yellow">HOMELAB HIGHLIGHTS</span>
  • 34-node LXC homelab on Dell PowerEdge R630 (Proxmox VE)
  • Graylog centralized log management — fleet-wide via Ansible
  • Detection-as-Code pipeline — Sigma + GitHub Actions CI/CD
  • Wazuh SIEM, Authentik SSO, Cloudflare Tunnel zero-trust

<span class="c-yellow">SKILLS</span>
  Intune · Entra ID · Autopilot · Active Directory · Authentik
  Trend Vision One XDR · Incident Response · Endpoint Isolation
  Graylog · Wazuh · Sigma · MITRE ATT&CK · OpenSearch
  Ansible · PowerShell · Bash · GitHub Actions · Docker · LXC

<span class="c-comment">── Full PDF: open resume ─────────────────</span>`, html: true };
  },

  which(args) {
    if (!args.length) return { output: "which: missing argument" };
    const cmd = args[0];
    if (COMMANDS[cmd]) return { output: `/usr/bin/${cmd}` };
    return { output: `which: no ${cmd} in (/usr/local/bin:/usr/bin:/bin)` };
  },

  touch(args) {
    if (!args.length) return { output: "touch: missing file operand" };
    return { output: `touch: cannot touch '${args[0]}': Read-only file system\n(This portfolio is static — try editing data.js instead)` };
  },

  mkdir(args) {
    return { output: `mkdir: cannot create directory: Read-only file system` };
  },

  ps(args) {
    return { output: `  PID TTY          TIME CMD\n    1 pts/0    00:00:00 bash\n   42 pts/0    00:00:00 node\n  139 pts/0    00:00:01 graylog\n  140 pts/0    00:00:00 ansible\n 9999 pts/0    00:00:00 portfolio` };
  },

  _exec(scriptName, fs) {
    const name = scriptName.replace("./", "");
    const result = fs.exec(name);
    if (!result.ok) return { output: result.err };

    const lines = result.content.split("\n")
      .filter(l => l.trim().startsWith("echo"))
      .map(l => l.replace(/^.*?echo\s+"?(.*?)"?\s*$/, "$1")
                  .replace(/\\n/g, "\n")
                  .replace(/\$\(calculate_uptime\)/, getUptime()));
    return { output: lines.join("\n") };
  },

};

function getUptime() {
  const since = DATA.homelab.since;
  const ms    = Date.now() - since.getTime();
  const d     = Math.floor(ms / 86400000);
  const h     = Math.floor((ms % 86400000) / 3600000);
  const m     = Math.floor((ms % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
}
