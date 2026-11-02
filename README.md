# Engineering Docs for Google Antigravity (AGY)

> **22 composable, auto-triggering skills** that turn Google Antigravity into a principal software engineer — from raw idea to production-ready documentation.

[![Google Antigravity Plugin](https://img.shields.io/badge/Google%20Antigravity-Plugin-4285F4?logo=google&logoColor=white)](https://antigravity.google) [![npm version](https://img.shields.io/npm/v/engineering-docs-agy.svg)](https://www.npmjs.com/package/engineering-docs-agy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![GitHub stars](https://img.shields.io/github/stars/fattain-naime/engineering-docs-agy.svg)](https://github.com/fattain-naime/engineering-docs-agy)

---

## Overview

Your coding agent in Antigravity is powerful, but building complex systems requires deep upfront architectural clarity. **Engineering Docs for Antigravity** provides a complete suite of **22 engineering documentation skills**, **4 subagents**, an **MCP validation server**, **always-on auto-trigger rules**, and a **SessionStart lifecycle hook**:

- **Idea to Production Blueprint** — business concept → technical spec → system architecture → API & database design → security threat model → test strategy → implementation roadmap → deployment runsheet
- **Socratic Brainstorming** — Interactive clarifying phase asking 3–5 targeted questions before drafting
- **Context-Aware Routing (`rules/AGENTS.md`)** — Detects intent automatically and routes to the right skill without requiring manual skill selection
- **Antigravity Subagents (`agents/`)** — Specialized subagents (`api-designer`, `architecture-reviewer`, `documentation-generator`, `test-strategist`) with `MODEL_TIER_INHERIT`
- **Native MCP Validation Server (`mcp_config.json`)** — Dynamic cross-document consistency checks and master index generation
- **Progress Reminder Hook (`hooks.json`)** — Resumes in-progress drafts across sessions automatically

---

## Quickstart

### 1. From the Antigravity App UI (Marketplace)
1. Open the left sidebar and navigate to **Customizations > Marketplace**.
2. Search for **Engineering Docs**.
3. Click **Install**.

### 2. From Antigravity CLI (`agy`)
```bash
agy plugin install git+https://github.com/fattain-naime/engineering-docs-agy.git
```

### 3. Via NPX Installer
Install globally across all your projects:
```bash
npx engineering-docs-agy --global
```
Or install locally in your current workspace project (`.agents/plugins/`):
```bash
npx engineering-docs-agy --local
```

---

## Suggested Prompts

Once enabled, you can start with any of the following prompts in Antigravity chat:

> "Turn my project idea into complete engineering documentation"

> "Create a system architecture document with C4 diagrams and tech stack"

> "Validate our existing engineering docs and check cross-document consistency"

---

## Antigravity Plugin Architecture

```text
engineering-docs-agy/
├── plugin.json                 # Antigravity plugin manifest (https://antigravity.google/schemas/v1/plugin.json)
├── mcp_config.json             # Model Context Protocol stdio validation server configuration
├── hooks.json                  # SessionStart lifecycle progress hook
├── rules/
│   └── AGENTS.md               # Contextual agent routing rules and behavioral standards
├── skills/                     # 22 engineering documentation skills
│   ├── using-engineering-docs/ # Master orchestrator & router
│   ├── business-concept/
│   ├── system-architecture-document/
│   ├── api-design-document/
│   ├── database-design-document/
│   ├── security-threat-model/
│   └── ...
├── agents/                     # 4 specialized Antigravity subagents
│   ├── api-designer.md
│   ├── architecture-reviewer.md
│   ├── documentation-generator.md
│   └── test-strategist.md
└── assets/
    ├── plugin-icon.png         # Plugin icon (512x512)
    └── plugin-workflow.gif     # Workflow demonstration
```

---

## Extensibility Components

### 1. Auto-Trigger Rules (`rules/AGENTS.md`)
Antigravity automatically discovers and activates `rules/AGENTS.md` whenever the plugin is enabled. When you say:
- *"I have an idea"* or *"help me plan this project"* → triggers `using-engineering-docs`
- *"write an API spec"* or *"REST API contract"* → triggers `api-design-document`
- *"document our architecture"* or *"C4 diagram"* → triggers `system-architecture-document`
- *"database schema"* or *"ERD for"* → triggers `database-design-document`
- *"threat model"* or *"STRIDE analysis"* → triggers `security-threat-model`
- *"test plan"* or *"test strategy"* → triggers `test-strategy-document`

### 2. Dedicated Subagents (`agents/`)
Launch specialized subagents directly in Antigravity or let the parent agent delegate complex tasks:
- **`api-designer`**: Designs RESTful APIs with OpenAPI 3.1, RFC 7807 problem details, and semantic versioning.
- **`architecture-reviewer`**: Reviews system designs for horizontal scalability, single points of failure, and security risks.
- **`documentation-generator`**: Generates production-ready technical specifications, runbooks, and developer documentation.
- **`test-strategist`**: Designs testing pyramids, coverage thresholds, and automated CI test execution strategies.

### 3. Model Context Protocol Tools (`mcp_config.json`)
The bundled MCP server connects via stdio and provides 3 tools:
- `validate_document_set`: Validates that all required documents in `.engineering-docs/` exist with valid frontmatter.
- `check_consistency`: Verifies cross-document consistency, dependency references, and entity naming.
- `generate_index`: Automatically builds a master project index table (`index.md`) summarizing the document set.

### 4. Lifecycle Hooks (`hooks.json`)
Registers a `SessionStart` command hook that executes `hooks/check-progress.js`. It checks if `.engineering-docs/` exists in your workspace and injects a helpful system notification if draft documents remain unfinished.

---

## Skills Catalog (22 Skills)

### Discovery & Planning
| Skill | Output Document | Description |
|:---|:---|:---|
| `using-engineering-docs` | Master Orchestrator | Interactive router that guides your idea into the right sequence of documents |
| `business-concept` | `business-concept.md` | Problem definition, target users, value proposition, and monetization model |
| `project-plan` | `project-plan.md` | Scope, delivery milestones, RACI matrix, WBS, and risk register |
| `user-personas-behavior` | `user-personas.md` | Goal- and behavior-driven user personas, jobs-to-be-done, and analytics plan |

### Specification & Feasibility
| Skill | Output Document | Description |
|:---|:---|:---|
| `technical-specification` | `technical-specification.md` | ISO/IEC/IEEE 29148 requirements, EARS syntax, and traceability matrix |
| `technical-feasibility-study` | `technical-feasibility-study.md` | Stack assessment, technical risks, and go/no-go recommendation |

### Architecture & System Design
| Skill | Output Document | Description |
|:---|:---|:---|
| `system-architecture-document` | `system-architecture.md` | C4 model diagrams (Context, Container, Component), 4+1 views, and NFRs |
| `architecture-decision-record` | `adr/ADR-XXX.md` | Immutable architectural decisions following MADR standard |
| `database-design-document` | `database-design.md` | Entity-Relationship Diagrams (ERD), schema definitions, and migration plans |
| `api-design-document` | `api-design.md` | OpenAPI 3.1 RESTful contracts, error schemas, pagination, and rate limits |
| `admin-access-control-specification` | `admin-access-control.md` | Role-Based Access Control (RBAC) matrix, audit logging, and break-glass procedures |
| `technical-blueprint` | `technical-blueprint.md` | Feature-level Technical Design Documents (TDD) before implementation |
| `ux-flow-specification` | `ux-flow-specification.md` | Information architecture, user journey maps, screen flows, and UI states |
| `design-system-specification` | `design-system.md` | Design tokens, component contracts, accessibility (WCAG 2.2), and theme specs |

### Security & Quality
| Skill | Output Document | Description |
|:---|:---|:---|
| `security-threat-model` | `security-threat-model.md` | STRIDE analysis, trust boundaries, attack vectors, and concrete mitigations |
| `test-strategy-document` | `test-strategy.md` | Test pyramid distribution, coverage thresholds, and automated CI quality gates |

### Implementation & Operations
| Skill | Output Document | Description |
|:---|:---|:---|
| `implementation-plan` | `implementation-plan.md` | Phased build sequence, dependency-driven milestones, and phase gates |
| `deployment-plan` | `deployment-plan.md` | Release runsheets, blue-green / canary rollouts, and rollback procedures |
| `slo-error-budget-document` | `slo-error-budget.md` | SLIs, SLOs, error budgets, and multi-window multi-burn-rate alerting policies |
| `technical-runbook` | `technical-runbook.md` | On-call incident response, diagnostic commands, and recovery procedures |
| `disaster-recovery-plan` | `disaster-recovery-plan.md` | RTO/RPO commitments, backup strategies, and failover disaster recovery plans |
| `incident-postmortem` | `postmortem-XXX.md` | Blameless root cause analysis (RCA), timeline, and preventive action items |

---

## License

MIT © [Fattain Naime](https://github.com/fattain-naime)
