// ── Auth ──────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  is_active: boolean;
  created_at: string;
}


// ── Assets ────────────────────────────────────────────────────

export interface AssetCreate {
  name: string;
  ip_address?: string;
  os_type?: string;
}

export interface AssetUpdate {
  name?: string;
  ip_address?: string;
  os_type?: string;
  status?: string;
}

export interface AssetOut {
  id: number;
  name: string;
  ip_address: string | null;
  os_type: string | null;
  status: 'online' | 'offline' | 'unknown';
  created_at: string;
  updated_at: string;
}


// ── Pilar 1: Auditoría ────────────────────────────────────────

export interface AuditCheckOut {
  id: number;
  category: string;
  check_name: string;
  description: string | null;
  passed: boolean;
  detail: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export interface AuditRunOut {
  id: number;
  asset_id: number;
  score: number | null;
  status: 'pending' | 'running' | 'completed' | 'error';
  started_at: string;
  finished_at: string | null;
  checks: AuditCheckOut[];
}

export interface AuditRunSummary {
  id: number;
  asset_id: number;
  asset_name: string;
  score: number | null;
  status: string;
  started_at: string;
  finished_at: string | null;
  total_checks: number;
  passed_checks: number;
}


// ── Pilar 2: Pipeline CI/CD ───────────────────────────────────

export interface PipelineRunRequest {
  project_name: string;
  commit_ref?: string;
  triggered_by?: string;
}

export interface PipelineCheckOut {
  id: number;
  check_name: string;
  category: string | null;
  passed: boolean;
  detail: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export interface PipelineRunOut {
  id: number;
  project_name: string;
  commit_ref: string | null;
  triggered_by: string | null;
  result: 'SECURE' | 'UNSAFE' | 'RUNNING' | 'ERROR';
  score: number | null;
  started_at: string;
  finished_at: string | null;
  checks: PipelineCheckOut[];
}

export interface PipelineRunSummary {
  id: number;
  project_name: string;
  commit_ref: string | null;
  result: 'SECURE' | 'UNSAFE' | 'RUNNING' | 'ERROR';
  score: number | null;
  started_at: string;
  finished_at: string | null;
  total_checks: number;
  passed_checks: number;
}


// ── Pilar 3: Incidentes ───────────────────────────────────────

export interface IncidentOut {
  id: number;
  asset_id: number | null;
  type: string;
  title: string;
  description: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'resolved';
  detected_at: string;
  resolved_at: string | null;
}

export interface AlertOut {
  id: number;
  incident_id: number | null;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  is_read: boolean;
  created_at: string;
}


// ── Dashboard ─────────────────────────────────────────────────

export interface DashboardStats {
  total_assets: number;
  online_assets: number;
  open_incidents: number;
  unread_alerts: number;
  last_audit_score: number | null;
  last_pipeline_result: string | null;
  secure_pipelines: number;
  unsafe_pipelines: number;
}


// ── WebSocket ─────────────────────────────────────────────────

export interface WsAlertMessage {
  type: 'alert';
  alert: AlertOut;
}

export interface WsAuditMessage {
  type: 'audit_complete';
  run: {
    id: number;
    asset_name: string;
    score: number | null;
    status: string;
  };
}

export type WsMessage = WsAlertMessage | WsAuditMessage;
