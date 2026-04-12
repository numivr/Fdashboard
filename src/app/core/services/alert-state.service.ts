import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AlertStateService {
  unreadCount = signal(0);

  set(n: number) { this.unreadCount.set(n); }
  increment() { this.unreadCount.update((n) => n + 1); }
  decrement() { this.unreadCount.update((n) => Math.max(0, n - 1)); }
  reset() { this.unreadCount.set(0); }
}