import { Component, inject, signal, OnInit } from '@angular/core';
import { SlicePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonRefresher, IonRefresherContent,
  IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonBadge, IonNote, IonSpinner, IonButton, IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { IncidentsService } from '../core/services/incidents.service';
import { IncidentOut } from '../core/models/models';

type Filter = 'open' | 'acknowledged' | 'resolved';

@Component({
  selector: 'app-incidents',
  templateUrl: 'incidents.page.html',
  imports: [
    SlicePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonRefresher, IonRefresherContent,
    IonSegment, IonSegmentButton, IonLabel,
    IonList, IonItem, IonBadge, IonNote, IonSpinner, IonButton, IonIcon,
  ],
})
export class IncidentsPage implements OnInit {
  private svc = inject(IncidentsService);
  private toastCtrl = inject(ToastController);

  incidents = signal<IncidentOut[]>([]);
  loading = signal(false);
  error = signal('');
  filter = signal<Filter>('open');

  constructor() { addIcons({ checkmarkOutline, checkmarkDoneOutline }); }

  ngOnInit() { this.load(); }

  load(event?: any) {
    this.loading.set(true);
    this.error.set('');
    this.svc.getIncidents(this.filter()).subscribe({
      next: (i) => { this.incidents.set(i); this.loading.set(false); event?.target.complete(); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); event?.target.complete(); },
    });
  }

  onFilterChange(event: any) {
    this.filter.set(event.detail.value as Filter);
    this.load();
  }

  async acknowledge(incident: IncidentOut) {
    this.svc.acknowledge(incident.id).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({ message: 'Marcado como reconocido', duration: 2000, color: 'primary' });
        await t.present();
        this.load();
      },
    });
  }

  async resolve(incident: IncidentOut) {
    this.svc.resolve(incident.id).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({ message: 'Incidente resuelto', duration: 2000, color: 'success' });
        await t.present();
        this.load();
      },
    });
  }

  severityColor(s: string) {
    const m: Record<string, string> = { critical: 'danger', high: 'warning', medium: 'tertiary', low: 'success' };
    return m[s] ?? 'medium';
  }

  statusColor(s: string) {
    const m: Record<string, string> = { open: 'danger', acknowledged: 'warning', resolved: 'success' };
    return m[s] ?? 'medium';
  }
}