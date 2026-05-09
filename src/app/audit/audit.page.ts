import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner,
  IonFab, IonFabButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSelect, IonSelectOption, IonButton, IonProgressBar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playOutline, closeOutline } from 'ionicons/icons';
import { AuditService } from '../core/services/audit.service';
import { AssetsService } from '../core/services/assets.service';
import { WebsocketService } from '../core/services/websocket.service';
import { AuditRunSummary, AssetOut } from '../core/models/models';

@Component({
  selector: 'app-audit',
  templateUrl: 'audit.page.html',
  imports: [
    FormsModule, SlicePipe, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner,
    IonFab, IonFabButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSelect, IonSelectOption, IonButton, IonProgressBar,
  ],
})
export class AuditPage implements OnInit, OnDestroy {
  private auditSvc = inject(AuditService);
  private assetsSvc = inject(AssetsService);
  private toastCtrl = inject(ToastController);
  private ws = inject(WebsocketService);

  runs = signal<AuditRunSummary[]>([]);
  assets = signal<AssetOut[]>([]);
  loading = signal(false);
  error = signal('');
  showTrigger = signal(false);
  selectedAssetId: number | null = null;
  triggering = signal(false);

  private wsSub?: Subscription;

  constructor() { addIcons({ playOutline, closeOutline }); }

  ngOnInit() {
    this.load();
    this.wsSub = this.ws.auditUpdates$.subscribe(() => this.load());
  }

  ngOnDestroy() { this.wsSub?.unsubscribe(); }

  load(event?: any) {
    this.loading.set(true);
    this.error.set('');
    this.auditSvc.getRuns().subscribe({
      next: (r) => { this.runs.set(r); this.loading.set(false); event?.target.complete(); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); event?.target.complete(); },
    });
  }

  openTrigger() {
    this.showTrigger.set(true);
    this.assetsSvc.getAll().subscribe((a) => this.assets.set(a));
  }

  async triggerAudit() {
    if (!this.selectedAssetId) return;
    this.triggering.set(true);
    this.auditSvc.runAudit(this.selectedAssetId).subscribe({
      next: async () => {
        this.triggering.set(false);
        this.showTrigger.set(false);
        const t = await this.toastCtrl.create({ message: 'Auditoría iniciada', duration: 2000, color: 'success' });
        await t.present();
        this.load();
      },
      error: async (e) => {
        this.triggering.set(false);
        const t = await this.toastCtrl.create({ message: e.error?.detail ?? 'Error al iniciar', duration: 3000, color: 'danger' });
        await t.present();
      },
    });
  }

  statusColor(s: string) {
    const m: Record<string, string> = { completed: 'success', running: 'warning', error: 'danger', pending: 'medium' };
    return m[s] ?? 'medium';
  }

  scoreColor(score: number | null) {
    if (score === null) return 'medium';
    return score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger';
  }
}