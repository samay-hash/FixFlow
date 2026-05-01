# FixFlow Project Details

## Project Summary

FixFlow is a full-stack incident monitoring and response platform built with an Express + MongoDB backend and a React + Vite frontend. The application monitors websites, detects downtime, opens incidents automatically, sends alerts, supports manual incident management, and uses AI to generate SITREPs and postmortems.

The system is organized as a multi-tenant app, so every user, site, incident, log, and postmortem is scoped to a company. Authentication is handled with JWT, role access is enforced on the backend, and live updates are pushed through Socket.IO.

## What Has Been Built

### Core product behavior

- Website uptime monitoring runs on a cron schedule every minute.
- Each monitored site is checked with HTTP requests and classified as up, degraded, or down.
- Monitoring snapshots are stored in MongoDB for uptime history and reporting.
- When a site goes down, the backend auto-creates a critical incident.
- When the site recovers, the backend auto-resolves the incident and calculates MTTR.
- Real-time incident, site, and log events are broadcast to connected clients.
- Email alerts are sent to admin and engineer users when outages happen.
- AI is used for incident SITREP summaries, postmortems, and postmortem scoring.
- The frontend dashboard visualizes uptime, incidents, logs, and site status.

### Recent fix that was completed

- Added a dedicated New Incident page at /incidents/new.
- Added a frontend route so /incidents/new no longer falls through to /incidents/:id.
- Added backend validation for invalid incident IDs so bad values return 400 instead of causing a 500.
- Connected the New Incident form to the existing POST /api/incidents endpoint.

## Backend Overview

The backend lives in backend/src and is an Express API with MongoDB models, JWT auth, role guards, monitoring jobs, AI services, email notifications, and Socket.IO.

### Server startup

- backend/src/index.js bootstraps Express, MongoDB, Socket.IO, cron monitoring, security middleware, and route registration.
- Helmet is enabled for basic security headers.
- CORS is enabled with credentials support.
- JSON request bodies are parsed with a 1 MB limit.
- Morgan logs requests through the app logger.
- A health check endpoint exists at /health.

### Routes that exist

- /api/auth
- /api/sites
- /api/incidents
- /api/logs
- /api/postmortems

### Authentication and authorization

- JWT auth is handled in backend/src/middleware/auth.middleware.js.
- Requests must include a Bearer token in the Authorization header.
- The token is verified with JWT_SECRET.
- The current user is attached to req.user after lookup.
- Role authorization is handled in backend/src/middleware/role.middleware.js.
- Admin and engineer permissions are used for create and edit operations.

### Incident management

Incident behavior is implemented in backend/src/controllers/incident.controller.js and backend/src/routes/incident.routes.js.

Implemented incident capabilities:

- List incidents by company.
- Filter incidents by status and severity.
- View a single incident with populated site, assignee, creator, and timeline data.
- Create incidents manually.
- Update incident status, severity, assignees, title, and description.
- Add timeline updates to an incident.
- Trigger a demo chaos incident in non-production environments.
- Return aggregate incident stats for the dashboard.

Important incident rules:

- Manual incident creation is restricted to admin and engineer roles.
- Incident records belong to a company.
- Invalid incident IDs now return 400 instead of a server error.
- When incidents are created or updated, realtime Socket.IO events are emitted to the company room.

### Site monitoring

Site behavior is implemented in backend/src/controllers/site.controller.js and backend/src/routes/site.routes.js.

Implemented site capabilities:

- List monitored sites for the current company.
- Add new sites to monitoring.
- Update site metadata.
- Delete a site.
- Return uptime history snapshots.
- Serve a public status page payload for a company slug.

### Monitoring service

backend/src/services/monitor.service.js handles the automated health check loop.

What it does:

- Pulls all active websites.
- Sends HTTP GET requests to each site.
- Measures response time.
- Marks a site up, degraded, or down.
- Saves uptime snapshots.
- Updates site health fields.
- Recalculates 30-day uptime percentages.
- Emits realtime site:status updates.
- Creates incidents automatically when a site transitions to down.
- Auto-resolves incidents when a site returns to up.

### AI service

backend/src/services/ai.service.js handles Gemini-powered and fallback AI behavior.

Implemented AI features:

- Generate a postmortem draft from incident data.
- Score a postmortem for quality.
- Generate a live SITREP for active incidents.
- Fall back to mock drafts when GEMINI_API_KEY is not set.

The AI service uses:

- incident title
- severity
- status
- MTTR
- affected site details
- responders
- timeline history

### Notification service

backend/src/services/notification.service.js handles email alerts.

Implemented notification behavior:

- Creates a Nodemailer transporter only when SMTP credentials are present.
- Sends outage alerts to admin and engineer users in the company.
- Includes incident and site context in the email.
- Builds a deep link to the frontend incident page.

### Logging

backend/src/controllers/log.controller.js provides log ingestion and reporting.

Implemented log capabilities:

- List logs with pagination and filtering.
- Ingest logs from external systems.
- Broadcast new logs to the company Socket.IO room.
- Return 24-hour log summaries for the dashboard.

### Postmortems

backend/src/controllers/postmortem.controller.js handles incident-to-postmortem workflows.

Implemented postmortem capabilities:

- List company postmortems.
- Create an AI-generated postmortem draft from an incident.
- Prevent duplicate postmortems for the same incident.
- Update postmortem drafts.
- Mark postmortems as published.
- Re-score edited postmortems with AI.

### Public status page

The backend exposes a public status endpoint for a company slug.

It returns:

- company name
- active monitored sites
- active unresolved incidents

## Database and Data Models

The data layer uses MongoDB with Mongoose models in backend/src/models.

### Company

- Stores company identity and slug.
- Used as the tenant boundary for all records.

### User

- Stores name, email, password hash, role, avatar, and company association.
- Used for JWT login and role-based access.

### Website

- Stores site name, URL, status, last check time, response time, uptime percent, check interval, dependency links, and company ownership.

### Incident

- Stores title, description, severity, status, source, site link, assignees, creator, timeline, health score, AI summary fields, timestamps, and MTTR/MTTD.
- Includes a pre-save health score calculation.

### Log

- Stores message, level, source, metadata, site link, incident link, company ownership, and timestamps.

### Postmortem

- Stores generated and edited postmortem content, status, quality score, publication state, incident link, and company ownership.

### UptimeSnapshot

- Stores per-check monitoring history used for uptime reporting.

## Frontend Overview

The frontend lives in frontend/src and is a React SPA using Redux Toolkit, React Router, Socket.IO Client, Tailwind, Framer Motion, Recharts, and toast notifications.

### Routing

frontend/src/App.jsx defines the app routes.

Public routes:

- /login
- /register
- /status/:slug

Private routes:

- /dashboard
- /sites
- /incidents
- /incidents/new
- /incidents/:id
- /logs
- /postmortems

### Global app behavior

- The app wraps pages in Redux Provider.
- The app wraps authenticated areas in SocketProvider.
- PrivateRoute blocks unauthenticated access.
- PublicRoute redirects signed-in users away from login/register pages.

### Socket client behavior

frontend/src/context/SocketContext.jsx does the realtime client work.

It:

- Connects to VITE_SOCKET_URL or localhost:5000.
- Uses websocket transport.
- Emits authenticate with the stored JWT token after connection.
- Listens for incident:created, incident:updated, notification:alert, site:status, and disconnect events.
- Updates Redux state and shows toast notifications.

### Pages that exist

#### Dashboard

- Shows infrastructure overview and greeting.
- Displays active incidents, in-progress incidents, sites monitored, and resolved today.
- Visualizes uptime trends with Recharts.
- Shows log severity summary for the last 24 hours.
- Lists recent incidents.
- Shows site status cards.

#### Sites

- Lists monitored sites.
- Allows admins to add new sites.
- Allows admins to delete sites.
- Shows uptime, response time, interval, and current health.

#### Incidents

- Lists all incidents for the current company.
- Supports status and severity filters.
- Shows severity badges, status labels, assignee counts, and timeline counts.
- Includes a Trigger Chaos button for admins.
- Navigates into incident detail pages.

#### New Incident

- Provides a manual incident creation form.
- Lets admins and engineers choose title, description, severity, site, and responders.
- Posts data to /api/incidents.
- Redirects to the newly created incident after success.

#### Incident Detail

- Shows incident metadata and full timeline.
- Supports status changes.
- Lets responders assign themselves.
- Supports timeline updates.
- Shows AI SITREP content.
- Supports AI-assisted remediation display through the AutoRemediation component.

#### Logs

- Shows log history and filtering.
- Supports viewing operational log streams.

#### Postmortems

- Lists postmortems.
- Supports AI-generated drafts and edits.

#### Login and Register

- Handle authentication and account creation.

#### Status Page

- Provides a public-facing service health page for a company slug.

### Shared frontend components

- Sidebar: persistent navigation for the app.
- AutoRemediation: AI remediation helper shown inside incident detail.

### Frontend state management

Redux store slices include:

- authSlice for login state and user data.
- incidentSlice for incident lists, stats, and realtime incident updates.

### API client

frontend/src/api/axios.js configures the shared Axios instance.

It:

- Uses VITE_API_URL or localhost:5000/api.
- Sends JSON requests.
- Attaches the JWT token from localStorage as a Bearer token.
- Logs out the user automatically on 401 responses.

## Realtime and Event Flow

Socket.IO is used to keep the UI updated without polling.

Emitted or handled events include:

- site:status
- incident:created
- incident:updated
- notification:alert
- log:new
- incident:sitrep

The socket server joins users into company-scoped rooms using company_<companyId>, which keeps tenant data isolated.

## API Surface

### Auth endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/team
- POST /api/auth/invite

### Site endpoints

- GET /api/sites
- POST /api/sites
- PUT /api/sites/:id
- DELETE /api/sites/:id
- GET /api/sites/:id/uptime
- GET /api/sites/public/:slug

### Incident endpoints

- GET /api/incidents
- GET /api/incidents/stats
- GET /api/incidents/:id
- POST /api/incidents
- PUT /api/incidents/:id
- POST /api/incidents/:id/timeline
- POST /api/incidents/debug/chaos

### Log endpoints

- GET /api/logs
- GET /api/logs/summary
- POST /api/logs/ingest

### Postmortem endpoints

- GET /api/postmortems
- POST /api/postmortems
- PUT /api/postmortems/:id

### System endpoint

- GET /health

## Feature Tags Present in the Project

These are the major feature labels represented in the codebase and UI:

- Uptime Monitoring
- Auto Incident Creation
- Auto Resolution
- AI Postmortems
- SITREP Generation
- Auto Remediation
- Real-time Alerts
- Email Notifications
- JWT Auth
- Multi-Tenant Isolation
- Public Status Page
- Dashboard Analytics
- Log Ingestion
- Incident Timeline Management
- Manual Incident Creation
- Role-Based Access Control

## Current Project State

The project is not just scaffolding. It already includes:

- backend business logic
- frontend screens for the main workflows
- database schemas for core entities
- realtime socket integration
- AI-driven incident and postmortem workflows
- automated uptime monitoring and incident lifecycle handling
- a public status page endpoint
- the recent incident-create fix and invalid ID guard

## Notes on the Latest Fix

The earlier create-incident bug came from /incidents/new being treated like a MongoDB ID route.

The completed fix now ensures:

- /incidents/new has its own page
- the page submits a real POST /api/incidents request
- invalid incident IDs are rejected cleanly
- the incident detail route remains reserved for real incident IDs only

## Overall Summary

FixFlow is a monitoring and incident-response product with the following end-to-end flow:

1. Monitor sites on a schedule.
2. Detect outages or degraded performance.
3. Create incidents automatically or manually.
4. Notify users through UI, sockets, and email.
5. Track the incident timeline and responders.
6. Generate AI SITREPs and postmortems.
7. Resolve incidents and calculate MTTR.
8. Store operational history for dashboards and reports.

This file is intended to be the current project reference for what has already been built in the repository.
