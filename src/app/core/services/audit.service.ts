import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuditRunOut, AuditRunSummary } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  runAudit(assetId: number) {
    return this.http.post<{ run_id: number; message: string }>(
      `${this.api}/audit/run/${assetId}`,
      {}
    );
  }

  getRuns() {
    return this.http.get<AuditRunSummary[]>(`${this.api}/audit/runs`);
  }

  getRunById(runId: number) {
    return this.http.get<AuditRunOut>(`${this.api}/audit/runs/${runId}`);
  }
}