# ⚡ Agentra — Autonomous Agentic AI Operations Platform

**Agentra** is a next-generation, high-performance autonomous operations platform that converts natural language automation prompts into executable visual DAG workflows. It orchestrates execution through a cooperating swarm of 5 specialized AI agents, integrates seamlessly with Gmail, Slack, Discord, and Google Sheets over OAuth, provides real-time event streaming via Socket.IO, and automatically recovers or escalates failures with exponential backoff.

---

## 🌟 Key Capabilities

- 🪄 **Natural Language Prompt Synthesizer**: Instant AI graph compiler supporting OpenRouter, Google Gemini, and deterministic neural builders.
- 🎨 **Cybernetic Laser Canvas**: Futuristic dark operator console with drag-and-drop node palette, animated glowing laser edges, and real-time step highlighting.
- 🧠 **5-Agent Cooperating Swarm**:
  - **Planner Agent**: DAG topological sort, graph traversal, and confidence scoring.
  - **Execution Agent**: Dynamic variable interpolation (`{{nodes.<id>.output}}`) and OAuth execution.
  - **Validation Agent**: Output schema constraints and integrity checks.
  - **Recovery Agent**: Canonical failure classification (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and exponential backoff retry.
  - **Monitoring Agent**: Real-time event broadcasting over Socket.IO and execution memory tracking.
- 🔐 **AES-256-GCM Credential Vault**: Token encryption at rest with application-level key.
- ⚡ **Zero-Config Local Hosting**: High-fidelity in-memory fallbacks for both MongoDB and Redis/BullMQ so the platform runs immediately out-of-the-box with **zero external dependencies required**!

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
- **Email**: `operator@agentra.ai` *(or `operator@agentflow.ai`)*
- **Password**: `Operator123!`
- **Role**: `Operator (Full Permissions)`

*(You can also use the **"Fill Demo Login"** 1-click button directly on `/login`).*

---

## 🧭 Application Routes

- **`/`**: Landing page with multi-agent orchestration showcase and interactive simulation.
- **`/login`**: Operator authentication with 1-click demo login bypass.
- **`/register`**: Operator identity enrollment with role selection (`operator` | `admin`).
- **`/dashboard`**: Operator console with telemetry metrics, active workflows, and live AI feed.
- **`/workflows`**: Searchable workflow catalog with duplicate, execute, and tag filtering.
- **`/workflows/builder`**: AI Prompt-to-Workflow Studio with instant recipe compilation.
- **`/workflows/[id]`**: Visual React Flow editor with palette, canvas, and node property drawer.
- **`/executions`**: Multi-agent execution audit history and filterable run statuses.
- **`/executions/[id]`**: Deep execution inspection with real-time Socket.IO agent stream, memory inspector, and pause/resume/cancel controls.
- **`/integrations`**: Credential management for Gmail, Slack, Discord, Google Sheets, and AI models.
- **`/settings`**: Profile information, AES-256 vault health check, and system diagnostics.

---

## 📄 License
MIT License • Built with pride by Agentra Engineering.
