Perfect. I have everything. Let me now design the complete schema.

---

# Smart Incident Response Platform — Database Schema

---

## 🗂️ The Database Layer — What It Represents

Before the tables, understand **why** the DB is structured this way:

```
TENANT LAYER        → organizations
STRUCTURE LAYER     → projects → teams → team_categories → members
MONITORING LAYER    → services → platform_integrations → flagged_logs
INCIDENT LAYER      → incidents → responders → updates → timeline
KNOWLEDGE LAYER     → postmortems → action_items
VISIBILITY LAYER    → status_page → subscribers
INTELLIGENCE LAYER  → incident_metrics → incident_tags → similar_incidents
SYSTEM LAYER        → notifications → on_call_schedules → audit_logs
```

---

## 📦 GROUP 1 — Tenant & Structure Layer

### `organizations`
The root of every tenant. Everything lives under this.

```sql
CREATE TABLE organizations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(100) UNIQUE NOT NULL,  -- used in URLs: /org/acme
  logo_url         TEXT,
  domain           VARCHAR(255),                  -- acme.com (for SSO matching)
  status_page_slug VARCHAR(100) UNIQUE,           -- status.acme.com custom slug
  plan             VARCHAR(50) DEFAULT 'free',    -- free | pro | enterprise
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
```

---

### `users`
Global user table. A user can belong to multiple orgs.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  timezone      VARCHAR(100) DEFAULT 'UTC',
  is_verified   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

---

### `organization_members`
Who belongs to which org, and what is their org-level role.

```sql
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(50) NOT NULL,
  -- 'owner' | 'admin' | 'member' | 'viewer'
  joined_at       TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, user_id)
);
```

---

### `projects`
Each org has many projects. A project is a product, app, or system being monitored.

```sql
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) NOT NULL,
  description     TEXT,
  color           VARCHAR(7),    -- hex color for UI identification #FF5733
  icon            VARCHAR(50),   -- icon name for UI
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, slug)
);
```

---

### `teams`
Each project has many teams. A team owns a slice of the project.

```sql
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE(project_id, name)
);
```

---

### `team_categories`
The sub-specialization inside a team — Frontend, Backend, DevOps, Testing, etc.

```sql
CREATE TABLE team_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  -- 'frontend' | 'backend' | 'devops' | 'testing' | 'database' | 'security'
  color      VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(team_id, name)
);
```

---

### `team_members`
Users assigned to teams, with their category and role within the team.

```sql
CREATE TABLE team_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id             UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_category_id    UUID REFERENCES team_categories(id),
  role                VARCHAR(50) NOT NULL,
  -- 'team_lead' | 'responder' | 'viewer'
  joined_at           TIMESTAMPTZ DEFAULT now(),

  UNIQUE(team_id, user_id)
);
```

---

## 📦 GROUP 2 — Monitoring & Integration Layer

### `services`
Services belong to a project. These show up on the status page.

```sql
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  status          VARCHAR(50) DEFAULT 'operational',
  -- 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'
  display_order   INTEGER DEFAULT 0,      -- order shown on status page
  is_public       BOOLEAN DEFAULT true,   -- show on public status page?
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

### `platform_integrations`
Stores the webhook/log drain config per project per platform.

```sql
CREATE TABLE platform_integrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform         VARCHAR(50) NOT NULL,
  -- 'vercel' | 'railway' | 'render'
  webhook_secret   VARCHAR(255),          -- to verify incoming payloads
  log_drain_url    TEXT,                  -- the endpoint we give to the platform
  access_token     TEXT,                  -- encrypted platform API token (optional)
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now(),
  last_received_at TIMESTAMPTZ,           -- last time we got a ping from this platform

  UNIQUE(project_id, platform)
);
```

---

### `flagged_logs`
Only summarized + critical logs are stored here (not raw full logs).

```sql
CREATE TABLE flagged_logs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_integration_id UUID REFERENCES platform_integrations(id),
  project_id              UUID NOT NULL REFERENCES projects(id),
  incident_id             UUID REFERENCES incidents(id),  -- linked after incident created
  platform                VARCHAR(50) NOT NULL,
  severity                VARCHAR(20),
  -- 'fatal' | 'error' | 'warning'
  original_message        TEXT NOT NULL,       -- the raw log line that triggered this
  ai_summary              TEXT,                -- Claude's one-line summary
  error_type              VARCHAR(255),        -- ECONNREFUSED, OOM, BUILD_FAILED etc.
  service_name            VARCHAR(255),        -- which service on the platform
  deployment_id           VARCHAR(255),        -- platform's deployment ID
  commit_sha              VARCHAR(100),        -- git commit that caused this
  occurred_at             TIMESTAMPTZ NOT NULL,
  created_at              TIMESTAMPTZ DEFAULT now()
);
```

---

## 📦 GROUP 3 — Incident Core Layer

### `incidents`
The heart of the entire platform.

```sql
CREATE TABLE incidents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id),
  project_id          UUID NOT NULL REFERENCES projects(id),
  incident_number     SERIAL,               -- INC-0001, INC-0002 (per org)
  title               VARCHAR(255) NOT NULL,
  headline            TEXT,                 -- one-line AI summary
  description         TEXT,
  severity            VARCHAR(10) NOT NULL,
  -- 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  status              VARCHAR(50) DEFAULT 'investigating',
  -- 'investigating'|'identified'|'monitoring'|'resolved'
  source              VARCHAR(50) DEFAULT 'manual',
  -- 'manual' | 'vercel' | 'railway' | 'render'
  ai_root_cause       TEXT,                 -- Claude's probable root cause
  ai_severity_reason  TEXT,                 -- why AI suggested this severity
  flagged_log_id      UUID REFERENCES flagged_logs(id),  -- if auto-detected
  created_by          UUID REFERENCES users(id),          -- null if auto-created
  commander_id        UUID REFERENCES users(id),          -- incident commander
  detected_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at     TIMESTAMPTZ,
  identified_at       TIMESTAMPTZ,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- For fast lookup of INC-XXXX numbers per org
CREATE SEQUENCE incident_number_seq;
```

---

### `incident_tags`
Many tags per incident. Supports both AI-generated and manual tags.

```sql
CREATE TABLE incident_tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  tag         VARCHAR(100) NOT NULL,
  source      VARCHAR(20) DEFAULT 'manual',  -- 'manual' | 'ai'
  created_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE(incident_id, tag)
);
```

---

### `incident_services`
Which services are affected by this incident (many-to-many).

```sql
CREATE TABLE incident_services (
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  PRIMARY KEY (incident_id, service_id)
);
```

---

### `incident_responders`
Who is assigned to this incident and in what role.

```sql
CREATE TABLE incident_responders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  role        VARCHAR(50) NOT NULL,
  -- 'commander' | 'responder' | 'observer'
  category    VARCHAR(100),
  -- 'backend' | 'devops' | 'frontend' | 'database'
  assigned_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,  -- when they confirmed they're on it

  UNIQUE(incident_id, user_id)
);
```

---

### `incident_updates`
Every message posted in the war room. Feeds the timeline automatically.

```sql
CREATE TABLE incident_updates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id  UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  author_id    UUID REFERENCES users(id),       -- null if system-generated
  content      TEXT NOT NULL,
  update_type  VARCHAR(50) NOT NULL,
  -- 'observation' | 'action_taken' | 'status_change'
  -- 'escalation'  | 'system'       | 'voice_transcription'
  is_public    BOOLEAN DEFAULT false,           -- show on public status page?
  status_transition VARCHAR(100),
  -- 'investigating→identified' etc. (set on status_change type)
  created_at   TIMESTAMPTZ DEFAULT now()
  -- NOTE: No updated_at — timeline entries are immutable
);
```

---

## 📦 GROUP 4 — Postmortem Layer

### `postmortems`
One postmortem per incident. AI-drafted, human-edited.

```sql
CREATE TABLE postmortems (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id         UUID UNIQUE NOT NULL REFERENCES incidents(id),
  title               VARCHAR(255) NOT NULL,
  status              VARCHAR(50) DEFAULT 'draft',
  -- 'draft' | 'in_review' | 'published'
  summary             TEXT,
  timeline_narrative  TEXT,       -- AI-written narrative of what happened
  root_cause          TEXT,       -- confirmed root cause (team edits AI draft)
  impact              TEXT,       -- how many users, how long, what broke
  what_went_well      TEXT,
  what_went_wrong     TEXT,
  ai_draft_generated  BOOLEAN DEFAULT false,
  ai_draft_at         TIMESTAMPTZ,
  published_at        TIMESTAMPTZ,
  published_by        UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
```

---

### `postmortem_action_items`
Follow-up tasks born from the postmortem.

```sql
CREATE TABLE postmortem_action_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postmortem_id  UUID NOT NULL REFERENCES postmortems(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  assigned_to    UUID REFERENCES users(id),
  status         VARCHAR(50) DEFAULT 'open',
  -- 'open' | 'in_progress' | 'done'
  priority       VARCHAR(20) DEFAULT 'medium',
  due_date       DATE,
  external_ticket_url TEXT,        -- link to Jira/Linear ticket
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
```

---

## 📦 GROUP 5 — Status Page & Visibility Layer

### `status_page_subscribers`
People who subscribe to email updates on the public status page.

```sql
CREATE TABLE status_page_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL,
  confirmed       BOOLEAN DEFAULT false,
  confirm_token   VARCHAR(255),
  subscribed_at   TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, email)
);
```

---

### `service_status_history`
Records every status change for historical uptime calculation.

```sql
CREATE TABLE service_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  old_status  VARCHAR(50),
  new_status  VARCHAR(50) NOT NULL,
  changed_by  UUID REFERENCES users(id),   -- null if auto-changed
  incident_id UUID REFERENCES incidents(id),
  changed_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 📦 GROUP 6 — Intelligence & Metrics Layer

### `incident_metrics`
Pre-computed stats per incident. Feeds the analytics dashboard.

```sql
CREATE TABLE incident_metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id    UUID UNIQUE NOT NULL REFERENCES incidents(id),
  mttd_seconds   INTEGER,   -- Mean Time to Detect (detected → acknowledged)
  mttr_seconds   INTEGER,   -- Mean Time to Resolve (detected → resolved)
  update_count   INTEGER DEFAULT 0,
  responder_count INTEGER DEFAULT 0,
  escalation_count INTEGER DEFAULT 0,
  health_score   INTEGER,   -- 0–100 live score during incident
  calculated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### `on_call_schedules`
Who is on call, when, for which team.

```sql
CREATE TABLE on_call_schedules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time   TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📦 GROUP 7 — System Layer

### `notifications`
Every alert sent out — email, Slack, SMS — logged here.

```sql
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  incident_id  UUID REFERENCES incidents(id),
  channel      VARCHAR(50) NOT NULL,
  -- 'email' | 'slack' | 'sms'
  type         VARCHAR(100) NOT NULL,
  -- 'incident_created' | 'severity_changed' | 'resolved' | 'assigned'
  status       VARCHAR(50) DEFAULT 'pending',
  -- 'pending' | 'sent' | 'failed'
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

### `audit_logs`
Immutable record of every important action in the system.

```sql
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(255) NOT NULL,
  -- 'incident.created' | 'severity.changed' | 'responder.assigned' etc.
  entity_type     VARCHAR(100),   -- 'incident' | 'postmortem' | 'user'
  entity_id       UUID,
  metadata        JSONB,          -- any extra context
  ip_address      INET,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 🗺️ Complete Schema Relationship Map

```
organizations
    │
    ├──── organization_members ──── users
    │
    ├──── projects
    │         │
    │         ├──── teams
    │         │        ├──── team_categories
    │         │        ├──── team_members ──── users
    │         │        └──── on_call_schedules
    │         │
    │         ├──── services
    │         │        └──── service_status_history
    │         │
    │         ├──── platform_integrations
    │         │        └──── flagged_logs
    │         │
    │         └──── incidents
    │                  ├──── incident_tags
    │                  ├──── incident_services ──── services
    │                  ├──── incident_responders ── users
    │                  ├──── incident_updates
    │                  ├──── incident_metrics
    │                  ├──── flagged_logs (linked after auto-detect)
    │                  └──── postmortems
    │                             └──── postmortem_action_items
    │
    ├──── status_page_subscribers
    ├──── notifications
    └──── audit_logs
```

---

## 📊 Table Count Summary

| Group | Tables | Purpose |
|---|---|---|
| Tenant & Structure | 6 | Orgs, Projects, Teams, Categories, Members |
| Monitoring & Integration | 3 | Services, Platform webhooks, Flagged logs |
| Incident Core | 5 | Incidents, Tags, Services, Responders, Updates |
| Postmortem | 2 | Postmortems, Action items |
| Status Page | 2 | Subscribers, Status history |
| Intelligence & Metrics | 2 | Metrics, On-call schedules |
| System | 2 | Notifications, Audit logs |
| **Total** | **22 tables** | Full platform coverage |

---

This schema is built to scale from a 5-person startup to an enterprise with thousands of incidents. Want me to now write the actual **SQL migration files**, or move on to designing the **API layer / backend routes** next?