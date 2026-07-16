const FS = {
  type: "dir",
  children: {

    "about.txt": {
      type: "file",
      get content() { return DATA.about; }
    },

    "skills.yaml": {
      type: "file",
      get content() {
        const d = DATA.skills;
        let out = "# Technical Skills\nskills:\n";
        for (const [cat, items] of Object.entries(d)) {
          out += `\n  ${cat}:\n`;
          items.forEach(i => out += `    - ${i}\n`);
        }
        return out;
      }
    },

    "whoami.txt": {
      type: "file",
      get content() {
        const w = DATA.whoami;
        return [
          `name:     ${w.name}`,
          `handle:   ${w.handle}`,
          `role:     ${w.role}`,
          `location: ${w.location}`,
          `github:   ${w.github}`,
          `linkedin: ${w.linkedin}`,
          `status:   ${w.status}`,
        ].join("\n");
      }
    },

    "contact.sh": {
      type: "file",
      executable: true,
      get content() {
        const w = DATA.whoami;
        return `#!/bin/bash\n# Contact Matthew\n\necho ""\necho "  email:    ${w.email}"\necho "  github:   https://${w.github}"\necho "  linkedin: https://${w.linkedin}"\necho ""\necho "  Status: ${w.status}"\necho "  Location: ${w.location}"\necho "  Remote: yes | Relocation: negotiable"\necho ""`;
      }
    },

    "homelab-status.sh": {
      type: "file",
      executable: true,
      get content() {
        return `#!/bin/bash\n# Homelab Status\n\necho ""\necho "  host:       ${DATA.homelab.host}"\necho "  hardware:   ${DATA.homelab.hardware}"\necho "  hypervisor: ${DATA.homelab.hypervisor}"\necho "  containers: ${DATA.homelab.containers} LXC running"\necho "  uptime:     $(calculate_uptime)"\necho ""`;
      }
    },

    "resume.txt": {
      type: "file",
      content: `Matthew Nifong
Systems & Security Engineer — Greater Atlanta, GA

Download the full PDF: assets/matthew-resume.pdf
LinkedIn: https://www.linkedin.com/in/matthew-nifong/
GitHub:   github.com/int0x8000

Run 'cat about.txt' for summary
Run 'ls projects/' to browse projects
Run 'cat skills.yaml' for technical skills`
    },

    "certifications.txt": {
      type: "file",
      get content() {
        return DATA.certifications.map(c =>
          `[${c.status === "active" ? "ACTIVE  " : "PROGRESS"}] ${c.name}\n          Issued: ${c.issued}`
        ).join("\n\n");
      }
    },

    "projects": {
      type: "dir",
      get children() {
        const dirs = {};
        for (const [key, proj] of Object.entries(DATA.projects)) {
          dirs[key] = {
            type: "dir",
            children: {
              "README.md": {
                type: "file",
                content: proj.readme,
              },
              "status.txt": {
                type: "file",
                content: `Project: ${proj.name}\nStatus:  ${proj.status}\nTags:    ${proj.tags.join(", ")}\n\n${proj.summary}`,
              }
            }
          };
        }
        return dirs;
      }
    },

    ".hidden": {
      type: "dir",
      children: {
        "secret.txt": {
          type: "file",
          content: `You found the hidden directory.\n\nGood instinct checking for hidden files.\nThat's exactly what a security engineer should do.\n\nWhat IS here:\n  - proof that you know how ls -a works\n  - a reminder that curiosity beats credentials\n  - this message\n\nWhat is NOT here:\n  /etc/shadow\n  /etc/passwd  \n  id_rsa\n\n$ sudo cat /root/.ssh/id_rsa\nsudo: you wish.`
        },
        ".env": {
          type: "file",
          content: `# Environment Variables\n\nDB_HOST=localhost\nDB_USER=visitor\nDB_PASS=***REDACTED***\nSECRET_KEY=***REDACTED***\nGRAYLOG_API_KEY=***REDACTED***\n\n# Nice try. These aren't real.\n# Real secrets live in Vaultwarden.`
        },
        "notes.txt": {
          type: "file",
          content: `Things to do:\n\n[x] Deploy Graylog across 34 LXCs\n[x] Build Detection-as-Code pipeline\n[x] Set up Ansible fleet management\n[x] Get A+ cert\n[ ] Pass SC-300\n[ ] Land a better job\n[ ] Sleep`
        }
      }
    },

  }
};

class FileSystem {
  constructor() {
    this.root = FS;
    this.cwd  = [];
  }

  resolve(pathStr) {
    const parts = Array.isArray(pathStr) ? pathStr : this._parse(pathStr);
    let node = this.root;
    for (const part of parts) {
      if (node.type !== "dir" || !node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  }

  _parse(pathStr) {
    let parts;
    if (pathStr.startsWith("/")) {
      parts = pathStr.split("/").filter(Boolean);
    } else {
      parts = [...this.cwd, ...pathStr.split("/").filter(Boolean)];
    }
    const resolved = [];
    for (const p of parts) {
      if (p === "..") resolved.pop();
      else if (p !== ".") resolved.push(p);
    }
    return resolved;
  }

  cd(pathStr) {
    if (!pathStr || pathStr === "~") { this.cwd = []; return { ok: true }; }
    const parts = this._parse(pathStr);
    const node  = this.resolve(parts.join("/") || "/");
    if (!node)               return { ok: false, err: `cd: ${pathStr}: No such file or directory` };
    if (node.type !== "dir") return { ok: false, err: `cd: ${pathStr}: Not a directory` };
    this.cwd = parts;
    return { ok: true };
  }

  ls(pathStr = "") {
    const target = pathStr ? this.resolve(pathStr) : this._cwdNode();
    if (!target)               return { ok: false, err: `ls: ${pathStr}: No such file or directory` };
    if (target.type !== "dir") return { ok: false, err: `ls: ${pathStr}: Not a directory` };
    return { ok: true, entries: target.children };
  }

  cat(pathStr) {
    const node = this.resolve(pathStr) || this.resolve([...this.cwd, pathStr].join("/"));
    if (!node)               return { ok: false, err: `cat: ${pathStr}: No such file or directory` };
    if (node.type === "dir") return { ok: false, err: `cat: ${pathStr}: Is a directory` };
    return { ok: true, content: node.content };
  }

  exec(pathStr) {
    const node = this.resolve(pathStr) || this.resolve([...this.cwd, pathStr].join("/"));
    if (!node)       return { ok: false, err: `bash: ${pathStr}: No such file or directory` };
    if (!node.executable) return { ok: false, err: `bash: ${pathStr}: Permission denied` };
    return { ok: true, content: node.content };
  }

  pwd() {
    return "/" + this.cwd.join("/");
  }

  prompt() {
    const dir = this.cwd.length === 0 ? "~" : this.cwd[this.cwd.length - 1];
    return `<span class="p-user">visitor</span><span class="p-at">@</span><span class="p-host">int0x8000</span><span class="p-sep">:</span><span class="p-dir">${dir}</span><span class="p-dollar">$</span>`;
  }

  _cwdNode() {
    if (this.cwd.length === 0) return this.root;
    let node = this.root;
    for (const part of this.cwd) {
      if (node.type !== "dir" || !node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  }
}
