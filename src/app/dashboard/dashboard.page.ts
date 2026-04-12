import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonIcon, IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  serverOutline, shieldCheckmarkOutline, gitBranchOutline,
  warningOutline, notificationsOutline, trendingUpOutline,
} from 'ionicons/icons';
import { DashboardService } from '../core/services/dashboard.service';
import { WebsocketService } from '../core/services/websocket.service';
import { AuthService } from '../core/services/auth.service';
import { DashboardStats, AlertOut } from '../core/models/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonRefresher, IonRefresherContent,
    IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonBadge, IonNote, IonIcon, IonSpinner,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  private svc = inject(DashboardService);
  private ws = inject(WebsocketService);
  private auth = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  liveAlerts = signal<{ time: string; title: string; severity: string }[]>([]);
  loading = signal(false);
  error = signal('');

  private wsSub?: Subscription;

  constructor() {
    addIcons({ serverOutline, shieldCheckmarkOutline, gitBranchOutline, warningOutline, notificationsOutline, trendingUpOutline });
  }

  ngOnInit() {
    this.load();
    this.wsSub = this.ws.alerts$.subscribe((msg) => {
      this.liveAlerts.update((prev) => [
        { time: new Date().toLocaleTimeString(), title: msg.alert.title, severity: msg.alert.severity },
        ...prev.slice(0, 9),
      ]);
    });
  }

  load(event?: any) {
    this.loading.set(true);
    this.error.set('');
    this.svc.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); event?.target.complete(); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); event?.target.complete(); },
    });
  }

  severityColor(s: string) {
    const m: Record<string, string> = { critical: 'danger', high: 'warning', medium: 'tertiary', low: 'success' };
    return m[s] ?? 'medium';
  }

  pipelineColor(r: string | null) {
    return r === 'SECURE' ? 'success' : r === 'UNSAFE' ? 'danger' : 'medium';
  }

  ngOnDestroy() { this.wsSub?.unsubscribe(); }
}