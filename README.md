<div align="center">
  <img src="./frontend/public/logo.png" alt="FixFlow Logo" width="120" />

  # 🔥 FixFlow AI
  ### Smart Incident Monitoring & Autonomous Response System

  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
  [![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
  [![Google Gemini](https://img.shields.io/badge/Gemini_AI-Pro-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
  [![Vercel Ready](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

  **Production-grade uptime monitoring with AI-powered incident response, auto-resolution, and a pixel-perfect premium UI.**

  ### 🌐 [Live Demo: fixflow-eta.vercel.app](https://fixflow-eta.vercel.app)

  [Features](#-features) · [Architecture](#-architecture) · [What's New](#-whats-new) · [Quick Start](#-quick-start) · [Deployment](#-deployment)
</div>

---

## 🚀 Overview

FixFlow AI is a full-stack SRE (Site Reliability Engineering) platform that monitors your websites every minute, automatically creates incidents when outages occur, and uses **Cascading AI Models (Gemini → Groq → Local)** to generate professional postmortem reports and real-time SITREP summaries. 

Built with an obsessive focus on **design fidelity**, the application features a stunning layout, scroll-driven micro-animations, and a responsive workspace tailored for modern DevOps and SRE teams.

### Why FixFlow?
- ⚡ **Zero-Touch Incident Lifecycle** — Detection → Creation → Notification → Resolution, completely automated.
- 🤖 **Cascading AI Fallbacks** — Rock-solid AI integration prioritizing Gemini Pro, gracefully falling back to Groq, and lastly local mocked data if external APIs fail.
- 📡 **Real-Time Data** — WebSocket-powered live dashboard with no polling.
- ✨ **Premium Aesthetics** — High-end UI with Framer Motion animations, scroll-driven navbars, and glassmorphism styling.
- 🚀 **Serverless Ready** — Pre-configured for seamless Vercel deployment.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Uptime Monitoring** | Cron-based health checks every 60 seconds per site. |
| 🚨 **Auto Incident Creation** | Incidents are triggered instantly when a site goes `down`. |
| ✅ **Auto Resolution** | Incidents auto-close with MTTR calculated upon site recovery. |
| 🤖 **AI Postmortems** | Structured RCA reports generated from incident timelines via AI. |
| 📋 **Live SITREP** | On-demand AI situation reports for active incidents in the war room. |
| 🛠️ **Auto Remediation** | Contextual Bash/Kubectl/AWS CLI commands suggested to mitigate outages. |
| 🎨 **Scroll-Driven UI** | Fluid, state-based animations (e.g., dynamic "pill-shaped" floating navbars). |
| 🔔 **Real-Time Alerts** | Socket.io push notifications across all connected clients. |
| 📧 **Email Notifications** | Nodemailer alerts sent securely on outage and recovery. |
| 🔐 **Redux Auth State** | JWT authentication driving UI state globally via Redux Toolkit. |
| 🏢 **Multi-Tenant Architecture** | Complete data isolation mapped by `companyId`. |

---

## 🌟 What's New? (Latest Updates)

- **Vercel Serverless Support**: Added robust `vercel.json` configurations allowing the Express REST API and React SPA to deploy directly on Vercel infrastructure out of the box.
- **Cascading AI Engine**: The backend now attempts resolution through Gemini, switches to Groq LLaMA if rate-limited, and ultimately falls back to local data — guaranteeing uptime for the AI features.
- **Stunning UI/UX Refinements**: 
  - Overhauled typography (`font-black` replaced with elegant `font-semibold` weights for readability).
  - Consistent branding integration using the central `logo.png`.
  - Removed visual artifacts for a pristine, premium background layout across the hero and dashboard.
  - Interactive, dynamic scroll-driven landing page components built with `framer-motion`.

---

## 🏗️ Architecture & Tech Stack

### Backend Engine
- **Framework**: Express.js 5 (REST API)
- **Database**: MongoDB + Mongoose ODM
- **Real-Time**: Socket.io
- **Cron Jobs**: `node-cron` for minute-by-minute sweeps
- **AI Processing**: `@google/generative-ai`, `groq-sdk`
- **Security & Auth**: `bcryptjs`, JWT

### Frontend Client
- **Core**: React 18 + Vite
- **State Management**: Redux Toolkit + React Context
- **Styling**: Tailwind CSS + `clsx`
- **Animations**: Framer Motion
- **Visualizations**: Recharts
- **Icons**: Lucide React

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)

### 1. Clone & Install
```bash
git clone https://github.com/samay-hash/FixFlow.git
cd FixFlow

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend (`backend/.env`)**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fixflow

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Primary AI (Required for full experience)
GEMINI_API_KEY=your_gemini_key

# Fallback AI (Optional)
GROQ_API_KEY=your_groq_key
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Launch Development Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Visit **http://localhost:5173** and explore your new SRE command center!

---

## 🚀 Deployment (Vercel)

FixFlow AI is heavily optimized for Serverless deployments on Vercel.

1. **Deploy Frontend:**
   - Import the repository to Vercel.
   - Set the Root Directory to `frontend`.
   - Framework Preset: **Vite**.
   - Add Environment Variables: `VITE_API_URL` (pointing to your deployed backend URL).

2. **Deploy Backend:**
   - Import the repository to Vercel again as a new project.
   - Set the Root Directory to `backend`.
   - Framework Preset: **Other**.
   - Ensure the Vercel project overrides the build command to `npm install`.
   - Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.
   
*(Note: Because Vercel is serverless, persistent Socket.io connections and `node-cron` background tasks require long-running compute. For full functionality of real-time web-sockets and background cron jobs, deploying the backend on **Render** or **Railway** is recommended.)*

---

## 🤝 Contributing

We welcome contributions to make FixFlow even better!
1. Fork the repository
2. Create a feature branch — `git checkout -b feat/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

<div align="center">
  <br />
  Built with ❤️ for modern SRE teams and hackathons.<br />
  <strong>If FixFlow helped you, please give it a ⭐ on GitHub!</strong>
</div>
