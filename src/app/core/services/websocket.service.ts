import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WsAlertMessage, WsAuditMessage } from '../models/models';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private readonly alertMessages$ = new Subject<WsAlertMessage>();
  private readonly auditMessages$ = new Subject<WsAuditMessage>();

  readonly alerts$ = this.alertMessages$.asObservable();
  readonly auditUpdates$ = this.auditMessages$.asObservable();

  connect(token: string) {
    if (this.socket) return;

    const url = `${environment.wsUrl}/alerts?token=${token}`;
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'alert') {
          this.alertMessages$.next(data as WsAlertMessage);
        } else if (data.type === 'audit_complete') {
          this.auditMessages$.next(data as WsAuditMessage);
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}