import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner,
  IonFab, IonFabButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonInput, IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playOutline, closeOutline } from 'ionicons/icons';
import { PipelineService } from '../core/services/pipeline.service';
import { PipelineRunSummary } from '../core/models/models';

@Component({
  selector: 'app-pipeline',
  templateUrl: 'pipeline.page.html',
  imports: [
    FormsModule, SlicePipe, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner,
    IonFab, IonFabButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonInput, IonButton,
  ],
})
export class PipelinePage implements OnInit {
  private svc = inject(PipelineService);
  private toastCtrl = inject(ToastController);

  runs = signal<PipelineRunSummary[]>([]);
  loading = signal(false);
  error = signal('');
  showTrigger = signal(false);
  triggering = signal(false);

  form = { project_name: '', commit_ref: 'HEAD', triggered_by: 'manual' };

  constructor() { addIcons({ playOutline, closeOutline }); }

  ngOnInit() { this.load(); }

  load(event?: any) {
    this.loading.set(true);
    this.error.set('');
    this.svc.getRuns().subscribe({
      next: (r) => { this.runs.set(r); this.loading.set(false); event?.target.complete(); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); event?.target.complete(); },
    });
  }

  async triggerRun() {
    if (!this.form.project_name.trim()) return;
    this.triggering.set(true);
    this.svc.triggerRun(this.form).subscribe({
      next: async () => {
        this.triggering.set(false);
        this.showTrigger.set(false);
        const t = await this.toastCtrl.create({ message: 'Pipeline iniciado', duration: 2000, color: 'success' });
        await t.present();
        setTimeout(() => this.load(), 2000);
      },
      error: async (e) => {
        this.triggering.set(false);
        const t = await this.toastCtrl.create({ message: e.error?.detail ?? 'Error', duration: 3000, color: 'danger' });
        await t.present();
      },
    });
  }

  resultColor(r: string) {
    const m: Record<string, string> = { SECURE: 'success', UNSAFE: 'danger', RUNNING: 'warning', ERROR: 'medium' };
    return m[r] ?? 'medium';
  }
}