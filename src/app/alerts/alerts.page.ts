import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonButton,
  IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner, IonIcon,
  IonItemSliding, IonItemOptions, IonItemOption,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, mailOpenOutline } from 'ionicons/icons';
import { IncidentsService } from '../core/services/incidents.service';
import { AlertStateService } from '../core/services/alert-state.service';
import { AlertOut } from '../core/models/models';

@Component({
  selector: 'app-alerts',
  templateUrl: 'alerts.page.html',
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonButton,
    IonContent, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner, IonIcon,
    IonItemSliding, IonItemOptions, IonItemOption,
  ],
})
export class AlertsPage implements OnInit {
  private svc = inject(IncidentsService);
  private alertState = inject(AlertStateService);
  private toastCtrl = inject(ToastController);

  alerts = signal<AlertOut[]>([]);
  loading = signal(false);
  error = signal('');

  constructor() { addIcons({ checkmarkDoneOutline, mailOpenOutline }); }

  ngOnInit() { this.load(); }

  load(event?: any) {
    this.loading.set(true);
    this.error.set('');
    this.svc.getAlerts().subscribe({
      next: (a) => {
        this.alerts.set(a);
        this.loading.set(false);
        event?.target.complete();
        this.alertState.set(a.filter((x) => !x.is_read).length);
      },
      error: (e) => { this.error.set(e.message); this.loading.set(false); event?.target.complete(); },
    });
  }

  markRead(alert: AlertOut) {
    if (alert.is_read) return;
    this.svc.markAlertRead(alert.id).subscribe(() => {
      this.alerts.update((list) => list.map((a) => a.id === alert.id ? { ...a, is_read: true } : a));
      this.alertState.decrement();
    });
  }

  async markAllRead() {
    this.svc.markAllAlertsRead().subscribe(async (res) => {
      this.alerts.update((list) => list.map((a) => ({ ...a, is_read: true })));
      this.alertState.reset();
      const t = await this.toastCtrl.create({ message: `${res.updated} alertas marcadas como leídas`, duration: 2000, color: 'success' });
      await t.present();
    });
  }

  severityColor(s: string) {
    const m: Record<string, string> = { critical: 'danger', high: 'warning', medium: 'tertiary', low: 'success' };
    return m[s] ?? 'medium';
  }

  get unreadCount() { return this.alerts().filter((a) => !a.is_read).length; }
}