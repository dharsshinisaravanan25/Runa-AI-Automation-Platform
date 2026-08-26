# ⚡ RUNA — Autonomous Agentic AI Operations Platform
### *"You define it. We run it."*

**RUNA** is an enterprise-grade autonomous operations platform that compiles natural language automation prompts into executable visual DAG workflows. It coordinates a cooperating swarm of 5 specialized AI agents, integrates seamlessly with real-life platforms (**WhatsApp, Telegram, LinkedIn, Instagram, Facebook, Google Sheets, Gmail, Slack, and Discord**), provides real-time event streaming via Socket.IO, and self-heals transient errors with jittered exponential backoff.

---

## 🌟 Key Capabilities

- 🪄 **Natural Language Prompt Synthesizer**: Instant AI graph compiler powered by **Google Gemini 2.5 Flash** and deterministic rule templates.
- 📱 **Real-Life Omnichannel Nodes**:
  - 💬 **WhatsApp**: Direct alerts, customer messaging, and template dispatches.
  - ✈️ **Telegram**: Incident room alerts, bot commands, and channel broadcasts.
  - 💼 **LinkedIn**: Automated thought leadership posting and InMail outreach.
  - 📸 **Instagram**: Scheduled reel captions, carousel posts, and smart DM replies.
  - 👥 **Facebook**: Page broadcasts and Lead Ad form ingestion.
  - 📊 **Google Sheets**: Persistent audit ledgers and dynamic row updates.
  - 📧 **Gmail**: Inbound email filters and outbound HTML dispatches.
  - 💬 **Slack & Discord**: War room alerts, webhook broadcasts, and team updates.
- 🎨 **Luminous Modern Luxury UI**: Crisp slate & pure white neutral palette, high contrast readability, visual React Flow canvas, and in-app event testing sandbox.
- 🧠 **5-Agent Cooperating Swarm**:
  - **Planner Agent**: DAG topological sort, graph traversal, and confidence scoring.
  - **Execution Agent**: Dynamic variable interpolation (`{{nodes.<id>.output}}`) and OAuth execution.
  - **Validation Agent**: Output schema constraints and integrity checks.
  - **Recovery Agent**: Canonical failure classification and exponential backoff retry.
  - **Monitoring Agent**: Real-time event broadcasting over Socket.IO and execution memory tracking.
- 🔐 **AES-256-GCM Credential Vault**: Token encryption at rest with application-level key.
- ⚡ **Zero-Config Persistent Cloud Storage**: MongoDB Atlas cluster support + in-memory failover.

---

## ⚡ Quick Start & Local Hosting Guide

### Step 1: Run with 1-Click
- Double-click [`start-app.bat`](./start-app.bat) or run:
```bash
npm run dev
```

### Step 2: Open Operator Console
Your browser will be ready at: **`http://localhost:3000`**

### 🔑 Default Demo Operator Account
- **Email**: `operator@runa.ai` *(or `operator@agentra.ai`)*
- **Password**: `Operator123!`
- **Role**: `Operator (Full Permissions)`

*(You can also use the **"Fill Demo Login"** 1-click button directly on `/login`).*

---

## 🧭 Application Routes

- **`/`**: Landing page with multi-channel swarm simulation HUD and feature showcase.
- **`/login`**: Operator authentication with 1-click demo login bypass.
- **`/register`**: Operator identity enrollment with role selection (`operator` | `admin`).
- **`/dashboard`**: Command console with RUNA AI prompt box, metric cards, and live feed.
- **`/workflows`**: Searchable workflow catalog with duplicate, execute, and tag filtering.
- **`/workflows/builder`**: AI Prompt-to-Workflow Studio with instant recipe compilation.
- **`/workflows/[id]`**: Visual React Flow editor with palette, canvas, and event test sandbox.
- **`/executions`**: Multi-agent execution audit history and filterable run statuses.
- **`/executions/[id]`**: Deep execution inspection with real-time Socket.IO agent stream and memory inspector.
- **`/integrations`**: Credential vault for WhatsApp, Telegram, LinkedIn, Instagram, Facebook, Google Sheets, Gmail, Slack, and Gemini.
- **`/settings`**: Profile information, AES-256 vault health check, and system diagnostics.

---

## 📄 License
MIT License • Built with pride by RUNA Engineering.
*(You define it. We run it.)*
