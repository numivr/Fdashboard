import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertOut, IncidentOut } from '../models/models';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getIncidents(status?: 'open' | 'acknowledged' | 'resolved') {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<IncidentOut[]>(`${this.api}/incidents`, { params });
  }

  getIncidentById(id: number) {
    return this.http.get<IncidentOut>(`${this.api}/incidents/${id}`);
  }

  acknowledge(id: number) {
    return this.http.put<IncidentOut>(
      `${this.api}/incidents/${id}/acknowledge`,
      {}
    );
  }

  resolve(id: number) {
    return this.http.put<IncidentOut>(
      `${this.api}/incidents/${id}/resolve`,
      {}
    );
  }

  getAlerts(unreadOnly = false) {
    let params = new HttpParams();
    if (unreadOnly) params = params.set('unread_only', 'true');
    return this.http.get<AlertOut[]>(`${this.api}/alerts`, { params });
  }

  markAlertRead(id: number) {
    return this.http.put<AlertOut>(`${this.api}/alerts/${id}/read`, {});
  }

  markAllAlertsRead() {
    return this.http.put<{ updated: number }>(
      `${this.api}/alerts/read-all`,
      {}
    );
  }
}