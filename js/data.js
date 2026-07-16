const DATA = {

  whoami: {
    name:     "Matthew Nifong",
    handle:   "int0x8000",
    role:     "Systems & Security Engineer",
    location: "Greater Atlanta, GA",
    email:    "matthew@ganifongs.com",
    github:   "github.com/int0x8000",
    linkedin: "https://www.linkedin.com/in/matthew-nifong/",
    status:   "open to opportunities",
  },

  homelab: {
    host:       "proxserver",
    hypervisor: "Proxmox VE 9.2.3",
    hardware:   "Dell PowerEdge R630 — 2x Xeon E5-2630 v3, 110GB RAM",
    containers: 34,
    // Homelab start date — used for uptime counter
    since: new Date("2024-01-01T00:00:00"),
  },

  about: `Matthew is a systems and security engineer with hands-on
experience designing and deploying enterprise infrastructure
across multi-tenant MSP environments.

Currently leading a Microsoft Intune + Entra ID device management
rollout covering 1,000+ Windows endpoints across hybrid Azure AD
and cloud-only client environments.

Outside of work: a 34-node self-hosted homelab running on a Dell
PowerEdge R630, spanning security monitoring, centralized logging,
identity management, and detection engineering. Every project is
documented and version-controlled as a portfolio artifact.

Target roles: Systems Engineering | IAM Engineering | SecOps
Certification: CompTIA A+ | SC-300 in progress`,

  skills: {
    identity_and_access_management: [
      "Microsoft Entra ID (Azure AD)",
      "Microsoft Intune (multi-tenant MDM)",
      "Windows Autopilot",
      "Conditional Access & Compliance Policies",
      "Active Directory (AD DS)",
      "Authentik SSO / IdP (OIDC, SAML)",
      "Vaultwarden (self-hosted Bitwarden)",
    ],
    xdr_and_security_operations: [
      "Trend Vision One XDR",
      "Security event investigation & triage",
      "Endpoint isolation & incident response",
      "Detection analysis (malware, suspicious scripts, lateral movement)",
    ],

    security_and_detection: [
      "Graylog (centralized log management)",
      "Wazuh SIEM",
      "Sigma Rules & Detection-as-Code",
      "GitHub Actions CI/CD",
      "OpenSearch / Lucene queries",
      "MITRE ATT&CK framework",
    ],
    infrastructure_and_automation: [
      "Ansible (fleet configuration management)",
      "PowerShell scripting",
      "Bash / shell scripting",
      "Proxmox VE hypervisor",
      "LXC containers & Docker",
      "Git / GitHub",
    ],
    networking_and_zero_trust: [
      "Cloudflare Tunnel (ZTNA)",
      "WireGuard VPN",
      "VLANs & network segmentation",
      "Unifi (UCG Max)",
      "Pi-hole DNS filtering",
    ],
    monitoring_and_observability: [
      "Prometheus & Grafana",
      "Uptime Kuma",
      "Beszel",
      "ntfy push alerting",
    ],
  },

  projects: {
    graylog: {
      name:    "Centralized Log Management",
      status:  "ONLINE",
      tags:    ["Graylog", "Ansible", "OpenSearch", "rsyslog"],
      category: "SIEM / Log Management",
      summary: `Fleet-wide syslog collection across 34 LXC containers
using Graylog + OpenSearch + MongoDB. rsyslog forwarding
deployed via Ansible playbook. Security, system, and
application log streams with real-time dashboards.`,
      readme: `# Graylog — Centralized Log Management

## Stack
  Graylog Server   → log processing, streams, web UI
  MongoDB          → metadata and configuration
  OpenSearch       → indexing and search backend

## Architecture
  34 LXC Containers
       │ rsyslog UDP (port 1514)
       ▼
  Graylog (LXC 139)
       ├── Security Events stream
       ├── System Events stream
       └── Application Logs stream
               │
               ▼
         OpenSearch (Data Node)

## Deployment
  rsyslog forwarding config deployed fleet-wide
  via Ansible playbook in a single run:

  $ ansible-playbook playbooks/rsyslog-graylog.yml
  PLAY RECAP: 34 hosts ok, 0 failed, 0 unreachable

## Streams
  Security Events  → auth failures, SSH, sudo, PAM
  System Events    → kernel, service crashes, OOM
  Application Logs → daemon and application syslog`,
    },

    "detection-as-code": {
      name:    "Detection-as-Code Pipeline",
      status:  "ONLINE",
      tags:    ["Sigma", "GitHub Actions", "MITRE ATT&CK", "OpenSearch"],
      category: "Detection Engineering",
      summary: `Sigma rules version-controlled in Git, automatically
validated and converted to OpenSearch Lucene queries
via GitHub Actions CI/CD. Every detection is reviewed,
tested, and auditable before deployment.`,
      readme: `# Detection-as-Code Pipeline

## Why Detection-as-Code?
  Traditional: rules clicked into SIEM UI, no audit trail
  This pipeline: every change tracked in git, peer-reviewed,
  automatically tested before hitting production.

## Pipeline
  Engineer writes Sigma rule (YAML)
       │ git push
       ▼
  GitHub Actions triggers
       ├── sigma check  (validate syntax + MITRE tags)
       ├── sigma convert -t opensearch_lucene
       └── upload artifact (converted Lucene queries)

## Rules
  rules/ssh/ssh-brute-force.yml      T1110.001  medium
  rules/auth/auth-failure-burst.yml  T1110      medium
  rules/auth/sudo-usage.yml          T1548.003  low
  rules/auth/new-user-created.yml    T1136.001  high
  rules/system/service-crash.yml     T1499      medium

## Converted Output (Graylog Lucene)
  message:*Failed\\ password*
  message:*authentication\\ failure*
  message:*sudo*
  message:*new\\ user*
  message:*Failed\\ to\\ start*`,
    },

    intune: {
      name:    "Multi-Tenant Intune Deployment",
      status:  "IN PROGRESS",
      tags:    ["Microsoft Intune", "Entra ID", "Autopilot", "Conditional Access"],
      category: "IAM / Endpoint Management",
      summary: `Designing and implementing Microsoft Intune device
management across multiple client tenants at an MSP,
covering 1,000+ Windows endpoints in hybrid Azure AD
and cloud-only environments.`,
      readme: `# Multi-Tenant Intune Deployment

## Scope
  Devices:  1,000+ Windows endpoints
  Tenants:  Multiple MSP client tenants
  Models:   Hybrid Azure AD joined + Cloud-only

## Enrollment
  Windows Autopilot   → zero-touch provisioning
  Auto-enrollment     → via Entra ID device groups
  ESP configured      → blocks desktop until apps applied

## Baseline (all tenants)
  BitLocker           → full disk encryption, key to Entra ID
  Windows Hello       → PIN + biometrics enforced
  Defender            → real-time + cloud protection
  Update rings        → pilot → early adopter → broad
  Compliance policy   → enforced via Conditional Access

## Per-Client Config
  OneDrive KFM        → Desktop/Docs/Pictures to OneDrive
  SharePoint sync     → auto-configured on first sign-in
  Mapped drives       → PowerShell scripts via Intune
  LOB apps            → Win32 (.intunewin) packaging

## Status: Design & Testing Phase`,
    },

    ansible: {
      name:    "Ansible Fleet Management",
      status:  "ONLINE",
      tags:    ["Ansible", "Proxmox", "IaC", "SSH"],
      category: "Infrastructure Automation",
      summary: `Dedicated Ansible control node (LXC 140) managing
34 hosts via SSH key-based access. SSH keys bootstrapped
via Proxmox pct exec. Fleet config as version-controlled
playbooks.`,
      readme: `# Ansible Fleet Management

## Control Node
  CTID:     140
  Hostname: ansible-control
  OS:       Debian 12 (Bookworm)

## Bootstrap
  SSH keys distributed via Proxmox pct exec:

  for ctid in $(seq 103 139); do
    pct exec $ctid -- bash -c "echo '$PUBKEY' >> \
      /root/.ssh/authorized_keys"
  done

  Works regardless of prior SSH state on each container.

## Inventory
  34 hosts in [lxc_containers] group
  Graylog in separate [graylog] group (excluded from
  log-forwarding playbooks to avoid circular logging)

## Playbooks
  rsyslog-graylog.yml  → deploy syslog forwarding fleet-wide

## First Run Results
  34 hosts reachable | 0 failed | 1 offline (CTID 113)`,
    },

    authentik: {
      name:    "Authentik SSO / Identity Provider",
      status:  "ONLINE",
      tags:    ["Authentik", "OIDC", "SAML", "Cloudflare"],
      category: "Identity",
      summary: `Self-hosted identity provider with OIDC/SAML integration
across all internal services. Zero-trust external access
via Cloudflare Tunnel — no open inbound ports.`,
      readme: `# Authentik SSO

## Role
  Identity provider (IdP) for all homelab services.
  SSO via OIDC and SAML. External access via Cloudflare
  Tunnel — zero open inbound firewall ports.

## Integrations
  Graylog        → OIDC
  Grafana        → OIDC
  Portainer      → OIDC
  Vaultwarden    → SSO (in progress)

## External Access Flow
  Internet
    → Cloudflare Edge (DDoS + TLS)
    → Cloudflare Tunnel (outbound-only)
    → Authentik (identity verification)
    → Internal Service`,
    },

    wazuh: {
      name:    "Wazuh SIEM",
      status:  "ONLINE",
      tags:    ["Wazuh", "FIM", "SIEM", "ntfy"],
      category: "Security",
      summary: `Agent-based threat detection, file integrity monitoring,
and log analysis across the homelab fleet. Alerts routed
to ntfy for real-time push notifications.`,
      readme: `# Wazuh SIEM

## Coverage
  Agent-based monitoring across key LXC containers.
  File integrity monitoring (FIM) on critical paths.
  Log analysis and correlation across the fleet.
  Real-time alerts routed to ntfy push notifications.

## Detection Coverage
  SSH brute force attempts
  Privilege escalation (sudo)
  File integrity violations
  Authentication failures
  Service anomalies`,
    },
  },

  certifications: [
    { name: "CompTIA A+", issued: "April 2025", status: "active" },
    { name: "SC-300: Microsoft Identity and Access Administrator", issued: "In Progress", status: "progress" },
  ],

  easter_eggs: {
    ssh:    `ssh: connect to host int0x8000.github.io port 22: Connection refused\nHint: try 'cat contact.sh' instead`,
    sudo:   `[sudo] password for visitor: \nSorry, try again.\n[sudo] password for visitor: \nSorry, try again.\n[sudo] password for visitor: \nsudo: 3 incorrect password attempts`,
    vim:    `\nVIM - Vi IMproved\n\nEntering normal mode...\ntype :q! to quit (good luck)`,
    nmap:   `Starting Nmap scan...\n\nNmap scan report for int0x8000.github.io\nHost is up (0.001s latency).\n\nPORT     STATE    SERVICE\n22/tcp   filtered ssh\n80/tcp   open     http\n443/tcp  open     https\n9000/tcp filtered graylog\n\nNmap done: 1 IP address scanned`,
    ping:   `PING int0x8000.github.io: 56 data bytes\n64 bytes from int0x8000.github.io: icmp_seq=0 ttl=64 time=0.1ms\n64 bytes from int0x8000.github.io: icmp_seq=1 ttl=64 time=0.1ms\n64 bytes from int0x8000.github.io: icmp_seq=2 ttl=64 time=0.1ms\n\n--- int0x8000.github.io ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`,
    rm:     `rm: it looks like you're trying to destroy my portfolio.\nNice try.`,
    reboot: `Broadcast message from root@portfolio\n\nThe system is going down for reboot...\n\nJust kidding. GitHub Pages doesn't let me do that.`,
    top:    `Tasks: 187 total,   1 running, 186 sleeping\nCPU:  2.1% us,  0.7% sy, 97.2% id\nMem:  110G total, 34G used, 76G free\n\n  PID USER      COMMAND\n 1337 root      proxmox-ve\n 2048 root      graylog\n 3127 root      wazuh-manager\n 4096 root      grafana-server\n 8192 root      ansible\n99999 visitor   portfolio`,
    cowsay: ` _______________________\n< Thanks for visiting! >\n -----------------------\n       \\   ^__^\n        \\  (oo)\\_______\n           (__)\\       )\\/\\\n               ||----w |\n               ||     ||`,
    fortune:`"The best way to predict the future is to automate it."\n\n— Someone who got tired of doing things manually.`,
    sl:     `bash: sl: command not found\n\n(You probably meant 'ls'.)`,
    yes:    `y\ny\ny\ny\ny\ny\n^C`,
    matrix: `Wake up, visitor...\nThe portfolio has you.\nFollow the white rabbit.`,
    hack:   `Initializing Hollywood Protocol...\n\n[████████████████████] 100%\n\nAccess Granted.\n\n...just kidding`,
    make:   `make: *** No targets specified and no makefile found. Stop.`,
  },

};
