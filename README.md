<div align="center">

# 🔥 FixFlow
### Smart Incident Monitoring & Response System

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-Pro-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

**Production-grade uptime monitoring with AI-powered incident response, auto-resolution, and intelligent postmortem generation.**

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Screenshots](#-screenshots)

</div>

---

## 🚀 Overview

FixFlow is a full-stack SRE (Site Reliability Engineering) platform that monitors your websites every minute, automatically creates incidents when outages occur, and uses **Google Gemini AI** to generate professional postmortem reports and real-time SITREP summaries. Built for hackathons and production environments alike.

### Why FixFlow?
- ⚡ **Zero-touch incident lifecycle** — detection → creation → notification → resolution, all automated
- 🤖 **AI-Powered** — Gemini Pro generates postmortems, SITREP summaries, and auto-remediation scripts
- 📡 **Real-time** — WebSocket-powered live dashboard with no polling
- 📧 **Email Alerts** — Instant Nodemailer notifications on site down/recovery
- 📊 **30-Day Uptime Tracking** — Accurate uptime percentages from historical snapshots

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Uptime Monitoring** | Cron-based health checks every 60 seconds per site |
| 🚨 **Auto Incident Creation** | Incidents created instantly when a site goes `down` |
| ✅ **Auto Resolution** | Incidents auto-closed with MTTR calculated when site recovers |
| 🤖 **AI Postmortems** | Gemini Pro generates structured RCA reports from incident timelines |
| 📋 **SITREP Generation** | Live AI situation reports for active incidents in the war room |
| 🛠️ **Auto Remediation** | AI suggests Bash/Kubectl/AWS CLI commands to mitigate outages |
| 📊 **Recharts Dashboard** | Response time trends, uptime %, incident history visualized |
| 🔔 **Real-time Alerts** | Socket.io push notifications across all connected clients |
| 📧 **Email Notifications** | Nodemailer alerts on outage and recovery |
| 🔐 **JWT Auth** | Role-based access control (Admin / Member) |
| 🏢 **Multi-Tenant** | Company-scoped data isolation |
| 📄 **Public Status Page** | Shareable uptime page for external stakeholders |

---

## 🏗️ Architecture

```
FixFlow
├── backend/                   # Express.js REST API
│   └── src/
│       ├── config/            # MongoDB connection
│       ├── controllers/       # Route handlers
│       │   ├── auth.controller.js
│       │   ├── incident.controller.js
│       │   ├── postmortem.controller.js
│       │   ├── site.controller.js
│       │   └── log.controller.js
│       ├── models/            # Mongoose schemas
│       │   ├── User.js
│       │   ├── Company.js
│       │   ├── Website.js
│       │   ├── Incident.js
│       │   ├── Postmortem.js
│       │   ├── Log.js
│       │   └── UptimeSnapshot.js
│       ├── services/
│       │   ├── monitor.service.js   # Cron-based health checks
│       │   ├── ai.service.js        # Gemini AI integration
│       │   └── notification.service.js  # Email alerts
│       ├── socket/
│       │   └── socket.js            # Socket.io setup
│       ├── middleware/
│       │   ├── auth.middleware.js   # JWT verification
│       │   └── role.middleware.js   # RBAC guards
│       └── routes/            # Express routers
│
└── frontend/                  # React + Vite SPA
    └── src/
        ├── pages/             # Route-level components
        │   ├── Dashboard.jsx
        │   ├── Incidents.jsx
        │   ├── IncidentDetail.jsx
        │   ├── Sites.jsx
        │   ├── Postmortems.jsx
        │   ├── Logs.jsx
        │   ├── StatusPage.jsx
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── components/
        │   ├── Sidebar.jsx
        │   └── AutoRemediation.jsx  # AI terminal UI
        ├── store/             # Redux Toolkit state
        ├── context/           # Socket.io React context
        └── api/               # Axios instance
```

### Tech Stack

**Backend**
- **Express.js 5** — REST API framework
- **MongoDB + Mongoose** — Database & ODM
- **Socket.io** — Real-time bidirectional communication
- **node-cron** — Scheduled monitoring ticks (every 1 minute)
- **Winston** — Structured logging
- **Nodemailer** — Email notifications
- **bcryptjs + JWT** — Authentication

**Frontend**
- **React 18** + **Vite** — UI framework & build tool
- **Redux Toolkit** — Global state management
- **Framer Motion** — Animations
- **Recharts** — Data visualization
- **Tailwind CSS** — Utility-first styling
- **Lucide React** — Icon library
- **React Hot Toast** — Notification toasts
- **Socket.io Client** — Real-time updates

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)
- Google Gemini API key *(optional — mock fallback built-in)*
- SMTP credentials *(optional — for email alerts)*

### 1. Clone the repo

```bash
git clone https://github.com/samay-hash/FixFlow.git
cd FixFlow
```

### 2. Configure the Backend

```bash
cd backend
cp .env.example .env   # or create .env manually
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fixflow

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Optional: Google Gemini AI (postmortems & SITREPs)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Email alerts via SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERT_FROM=alerts@fixflow.io
```

### 3. Configure the Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

**Start the backend:**
```bash
cd backend
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173** and register your account.

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user + company |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |

### Sites

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sites` | List all monitored sites |
| `POST` | `/api/sites` | Add a new site to monitor |
| `PUT` | `/api/sites/:id` | Update site details |
| `DELETE` | `/api/sites/:id` | Remove a site |
| `GET` | `/api/sites/:id/uptime` | Get uptime snapshots |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/incidents` | List all incidents |
| `GET` | `/api/incidents/:id` | Get incident with full timeline |
| `POST` | `/api/incidents` | Manually create an incident |
| `PUT` | `/api/incidents/:id` | Update status / add timeline entry |
| `POST` | `/api/incidents/:id/sitrep` | Generate AI SITREP |

### Postmortems

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/postmortems` | List all postmortems |
| `POST` | `/api/postmortems/generate/:incidentId` | AI-generate postmortem from incident |
| `PUT` | `/api/postmortems/:id` | Edit postmortem draft |
| `POST` | `/api/postmortems/:id/score` | AI quality score a postmortem |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

---

## 📡 WebSocket Events

The server emits real-time events to company-scoped rooms (`company_<id>`):

| Event | Payload | Trigger |
|-------|---------|---------|
| `site:status` | `{ siteId, name, status, responseTime, uptimePercent }` | Every monitoring tick |
| `incident:created` | Incident object | Site goes down |
| `incident:updated` | Incident object | Status changes |
| `notification:alert` | `{ message, severity, incidentId }` | Down/recovery events |

---

## 🤖 AI Features

### Postmortem Generation
When you resolve an incident, FixFlow can generate a structured postmortem using Gemini Pro with:
- Executive Summary
- Root Cause Analysis
- Impact Assessment
- What Went Well / Wrong
- 3–5 Prevention Steps
- Timeline Narrative
- Quality Score (1–10)

### SITREP (Situation Report)
Live AI-written situation reports for active war-room incidents — updated on demand with the latest timeline context.

### Auto-Remediation Terminal
AI suggests contextual Bash, Kubectl, or AWS CLI commands based on the incident title and severity — displayed in a terminal-style UI component.

> **Fallback:** If `GEMINI_API_KEY` is not set, all AI features gracefully fall back to structured mock data so the app remains fully functional.

---

## 📊 Monitoring Logic

```
Every 60 seconds:
  for each active site:
    → HTTP GET with 10s timeout
    → status = 'down'    if HTTP >= 500 or connection error
    → status = 'degraded' if response > 3000ms
    → status = 'up'      otherwise

    → Save UptimeSnapshot
    → Recalculate 30-day uptime %
    → Broadcast via Socket.io

    if was UP, now DOWN  → createDownIncident() + email alert
    if was DOWN, now UP  → autoResolveIncident() + calculate MTTR
```

---

## 🔐 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Backend port |
| `NODE_ENV` | No | `development` | Environment |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry |
| `GEMINI_API_KEY` | No | — | Google AI Studio key |
| `SMTP_HOST` | No | — | SMTP server host |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASS` | No | — | SMTP password |

---

## 🗂️ Database Models

| Model | Key Fields |
|-------|-----------|
| `User` | name, email, password, role, companyId |
| `Company` | name, slug, plan |
| `Website` | url, name, status, uptimePercent, responseTime, companyId |
| `Incident` | title, severity, status, timeline[], mttr, siteId, companyId |
| `Postmortem` | rootCause, preventionSteps, qualityScore, incidentId |
| `Log` | message, level, source, siteId, incidentId |
| `UptimeSnapshot` | status, responseTime, statusCode, timestamp |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feat/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

Built with ❤️ for hackathons and production SRE teams.

**[⭐ Star this repo](https://github.com/samay-hash/FixFlow)** if FixFlow helped you!

</div>
