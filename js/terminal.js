class Terminal {
  constructor(containerEl) {
    this.container  = containerEl;
    this.output     = containerEl.querySelector(".term-output");
    this.inputLine  = containerEl.querySelector(".term-input-line");
    this.inputEl    = containerEl.querySelector(".term-input");
    this.promptEl   = containerEl.querySelector(".term-prompt");
    this.fs         = new FileSystem();
    this.history    = [];
    this.histIdx    = -1;
    this.tempInput  = "";

    this._bindEvents();
    this._focus();
  }


  boot(lines, delay = 40) {
    return new Promise(resolve => {
      let i = 0;
      const next = () => {
        if (i >= lines.length) {
          setTimeout(resolve, 300);
          return;
        }
        const line = lines[i++];
        const { text, cls, gap, html } = line;
        if (gap) {
          this._appendRaw("");
        } else if (html) {
          this._appendRaw(`<span class="${cls || ""}">${text}</span>`);
        } else {
          
          const safe = (text || "")
            .replace(/&(?![a-zA-Z#])/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          this._appendRaw(`<span class="${cls || ""}">${safe}</span>`);
        }
        setTimeout(next, delay);
      };
      next();
    });
  }

  

  _bindEvents() {
    
    this.container.addEventListener("click", () => this._focus());

    this.inputEl.addEventListener("keydown", e => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          this._submit();
          break;
        case "ArrowUp":
          e.preventDefault();
          this._histUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          this._histDown();
          break;
        case "Tab":
          e.preventDefault();
          this._autocomplete();
          break;
        case "l":
          if (e.ctrlKey) { e.preventDefault(); this._run("clear", []); }
          break;
        case "c":
          if (e.ctrlKey) { e.preventDefault(); this._appendPromptLine(this.inputEl.value, "^C"); this.inputEl.value = ""; }
          break;
      }
    });
  }

  _focus() { this.inputEl.focus(); }

  _submit() {
    const raw = this.inputEl.value.trim();
    this.inputEl.value = "";

    
    this._appendCommandLine(raw);

    if (!raw) { this._appendPrompt(); return; }

    
    if (raw !== this.history[this.history.length - 1]) {
      this.history.push(raw);
    }
    this.histIdx  = -1;
    this.tempInput = "";
    const parts = raw.split("&&").map(s => s.trim());
    for (const part of parts) {
      const stop = this._run(part);
      if (stop) break;
    }

    this._appendPrompt();
    this._scrollBottom();
  }

  _run(cmdStr) {
    const tokens = this._tokenize(cmdStr);
    if (!tokens.length) return false;

    let [cmd, ...args] = tokens;

    
    if (cmd.startsWith("./")) {
      const result = COMMANDS._exec(cmd, this.fs);
      if (result.output) this._appendOutput(result.output, result.html);
      return false;
    }

    if (cmd === "cd") {
      const result = COMMANDS.cd(args, this.fs);
      if (result.output) this._appendOutput(result.output, result.html);
      this._updatePrompt();
      return false;
    }

    if (cmd === "clear") {
      this.output.innerHTML = "";
      return false;
    }

    if (COMMANDS[cmd]) {
      const result = COMMANDS[cmd](args, this.fs, this);
      if (result.clear) { this.output.innerHTML = ""; return false; }
      if (result.output) this._appendOutput(result.output, result.html);
      this._updatePrompt();
      return false;
    }

    this._appendOutput(`bash: ${cmd}: command not found\nType 'help' for available commands.`);
    return false;
  }

  _tokenize(str) {
    const tokens = [];
    let current  = "";
    let inQuote  = false;
    for (const ch of str) {
      if (ch === '"' || ch === "'") { inQuote = !inQuote; continue; }
      if (ch === " " && !inQuote) {
        if (current) { tokens.push(current); current = ""; }
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  _autocomplete() {
    const raw    = this.inputEl.value;
    const tokens = raw.trim().split(/\s+/);

    if (tokens.length <= 1) {
      const partial  = tokens[0] || "";
      const matches  = Object.keys(COMMANDS)
        .filter(k => !k.startsWith("_") && k.startsWith(partial));
      this._handleMatches(matches, partial);
    } else {
      const partial   = tokens[tokens.length - 1];
      const dirPart   = partial.includes("/") ? partial.split("/").slice(0, -1).join("/") : "";
      const filePart  = partial.includes("/") ? partial.split("/").pop() : partial;
      const lsResult  = this.fs.ls(dirPart || ".");
      if (!lsResult.ok) return;
      const matches   = Object.keys(lsResult.entries)
        .filter(n => n.startsWith(filePart))
        .map(n => (dirPart ? dirPart + "/" : "") + n +
             (lsResult.entries[n.replace(dirPart ? dirPart + "/" : "", "")] ||
              lsResult.entries[n] && lsResult.entries[n].type === "dir" ? "/" : ""));
      const entryMatches = Object.entries(lsResult.entries)
        .filter(([n]) => n.startsWith(filePart))
        .map(([n, node]) => (dirPart ? dirPart + "/" : "") + n + (node.type === "dir" ? "/" : ""));
      this._handleMatches(entryMatches, partial, tokens.slice(0, -1).join(" ") + " ");
    }
  }

  _handleMatches(matches, partial, prefix = "") {
    if (matches.length === 0) return;
    if (matches.length === 1) {
      this.inputEl.value = prefix + matches[0];
    } else {
      this._appendCommandLine(this.inputEl.value, true);
      this._appendOutput(matches.join("  "), false);
      let common = matches[0];
      for (const m of matches) {
        while (!m.startsWith(common)) common = common.slice(0, -1);
      }
      if (common.length > partial.length) {
        this.inputEl.value = prefix + common;
      }
    }
  }

  _histUp() {
    if (!this.history.length) return;
    if (this.histIdx === -1) this.tempInput = this.inputEl.value;
    this.histIdx = Math.min(this.histIdx + 1, this.history.length - 1);
    this.inputEl.value = this.history[this.history.length - 1 - this.histIdx];
  }

  _histDown() {
    if (this.histIdx <= 0) { this.histIdx = -1; this.inputEl.value = this.tempInput; return; }
    this.histIdx--;
    this.inputEl.value = this.history[this.history.length - 1 - this.histIdx];
  }

  _appendCommandLine(cmd, suppressPrompt = false) {
    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = `${this.fs.prompt()} <span class="term-cmd-text">${this._escape(cmd)}</span>`;
    this.output.appendChild(line);
  }

  _appendPromptLine(cmd, suffix) {
    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = `${this.fs.prompt()} <span class="term-cmd-text">${this._escape(cmd)}</span> <span class="c-muted">${suffix}</span>`;
    this.output.appendChild(line);
  }

  _appendOutput(text, isHtml = false) {
    if (!text && text !== 0) return;
    const block = document.createElement("div");
    block.className = "term-output-block";
    if (isHtml) {
      block.innerHTML = text;
    } else {
      block.textContent = text;
    }
    this.output.appendChild(block);
  }

  _appendRaw(html) {
    if (!this.output) return;
    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = html || "&nbsp;";
    this.output.appendChild(line);
    this._scrollBottom();
  }

  _appendPrompt() {
    this._updatePrompt();
  }

  _updatePrompt() {
    if (this.promptEl) this.promptEl.innerHTML = this.fs.prompt();
    try {
      const tabTitle = document.querySelector('.ktab-title');
      if (tabTitle) {
        const dir = this.fs.cwd.length === 0 ? '~' : this.fs.cwd.join('/');
        tabTitle.textContent = `visitor@int0x8000: ${dir}`;
      }
    } catch(e) {}
  }

  _scrollBottom() {
    try {
      this.container.scrollTop = this.container.scrollHeight;
    } catch(e) {}
  }

  _escape(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
}
