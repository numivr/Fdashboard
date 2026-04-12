import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WsAlertMessage } from '../models/models';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private readonly messages$ = new Subject<WsAlertMessage>();

  readonly alerts$ = this.messages$.asObservable();

  connect(token: string) {
    if (this.socket) return;

    const url = `${environment.wsUrl}/alerts?token=${token}`;
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const data: WsAlertMessage = JSON.parse(event.data);
        this.messages$.next(data);
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