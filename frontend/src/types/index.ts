export type Role = 'admin' | 'engineer' | 'viewer';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SiteStatus = 'up' | 'down' | 'degraded' | 'maintenance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
  avatar?: string;
  isOnCall?: boolean;
  category?: string;
  preferences?: string[];
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  category: string;
  preferences: string[];
}

export interface Website {
  id: string;
  name: string;
  url: string;
  status: SiteStatus;
  checkInterval: number;
  lastChecked?: string;
  responseTime?: number;
  uptimePercent?: number;
  dependsOn: string[];
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  category: string;
  source: 'auto' | 'manual' | 'github-webhook';
  siteId?: string | Website;
  companyId: string;
  assignedTo: (string | User)[];
  createdBy?: string | User;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  mttr?: number;
  healthScore?: number;
  aiSitrep?: string;
  aiRootCause?: string;
  timeline: TimelineEvent[];
}

export interface LogSummary {
  info: number;
  warning: number;
  error: number;
  fatal: number;
}

export interface UptimeSnapshot {
  id?: string;
  siteId: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode?: number;
  timestamp: string;
}

export interface TimelineEvent {
  id?: string;
  message: string;
  type: 'system' | 'observation' | 'remediation' | 'status_change';
  timestamp: string;
  updatedBy?: string | User;
  isPublic: boolean;
}

export interface ServerLog {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  serverIp?: string;
  metadata?: Record<string, any>;
}

export interface Postmortem {
  id: string;
  incidentId: string | Incident;
  title: string;
  status: 'draft' | 'in_review' | 'published';
  summary: string;
  rootCause: string;
  impact: string;
  whatWentWell: string;
  whatWentWrong: string;
  preventionSteps: string;
  timelineNarrative: string;
  actionItems: ActionItem[];
  aiQualityScore?: number;
  aiQualityFeedback?: string;
  aiDraftGenerated?: boolean;
  createdAt: string;
}

export interface ActionItem {
  id?: string;
  title: string;
  assignedTo?: string | User;
  status: 'open' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Invite {
  id: string;
  email: string;
  name: string;
  role: Role;
  category: string;
  expiresAt: string;
  used: boolean;
}
