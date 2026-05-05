import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner,
  IonFab, IonFabButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonInput, IonButton,
  IonItemSliding, IonItemOptions, IonItemOption,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, closeOutline, checkmarkOutline } from 'ionicons/icons';
import { AssetsService } from '../core/services/assets.service';
import { AssetCreate, AssetOut } from '../core/models/models';

@Component({
  selector: 'app-assets-list',
  templateUrl: 'assets-list.page.html',
  imports: [
    FormsModule, SlicePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonContent, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonLabel, IonBadge, IonNote, IonSpinner,
    IonFab, IonFabButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonInput, IonButton,
    IonItemSliding, IonItemOptions, IonItemOption,
  ],
})
export class AssetsListPage implements OnInit {
  private svc = inject(AssetsService);
  private alertCtrl = inject(AlertController);

  assets = signal<AssetOut[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  saving = signal(false);

  form: AssetCreate = { name: '', ip_address: '', os_type: '' };

  constructor() {
    addIcons({ addOutline, trashOutline, closeOutline, checkmarkOutline });
  }

  ngOnInit() { this.load(); }

  load(event?: any) {
    this.loading.set(true);
    this.error.set('');
    this.svc.getAll().subscribe({
      next: (a) => { this.assets.set(a); this.loading.set(false); event?.target.complete(); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); event?.target.complete(); },
    });
  }

  toggleForm() {
    this.showForm.update((v) => !v);
    if (!this.showForm()) this.resetForm();
  }

  saveAsset() {
    if (!this.form.name.trim()) return;
    this.saving.set(true);
    this.svc.create(this.form).subscribe({
      next: () => { this.saving.set(false); this.toggleForm(); this.load(); },
      error: () => { this.saving.set(false); },
    });
  }

  async deleteAsset(asset: AssetOut) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar asset',
      message: `¿Eliminar "${asset.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'confirm', handler: () => {
          this.svc.delete(asset.id).subscribe(() => this.load());
        }},
      ],
    });
    await alert.present();
  }

  statusColor(s: string) {
    const m: Record<string, string> = { online: 'success', offline: 'danger', unknown: 'medium' };
    return m[s] ?? 'medium';
  }

  private resetForm() { this.form = { name: '', ip_address: '', os_type: '' }; }
}