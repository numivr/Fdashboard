import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PipelineRunOut, PipelineRunRequest, PipelineRunSummary } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PipelineService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  triggerRun(request: PipelineRunRequest) {
    return this.http.post<{ run_id: number; message: string }>(
      `${this.api}/pipeline/run`,
      request
    );
  }

  getRuns() {
    return this.http.get<PipelineRunSummary[]>(`${this.api}/pipeline/runs`);
  }

  getRunById(runId: number) {
    return this.http.get<PipelineRunOut>(`${this.api}/pipeline/runs/${runId}`);
  }
}