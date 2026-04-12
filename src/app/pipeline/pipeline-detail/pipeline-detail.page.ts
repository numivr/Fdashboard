import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonSpinner, IonNote, IonBadge, IonIcon,
  IonList, IonItem, IonLabel,
  IonAccordion, IonAccordionGroup,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { PipelineService } from '../../core/services/pipeline.service';
import { PipelineRunOut, PipelineCheckOut } from '../../core/models/models';

interface CheckGroup { category: string; checks: PipelineCheckOut[]; passed: number; }

@Component({
  selector: 'app-pipeline-detail',
  templateUrl: 'pipeline-detail.page.html',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonContent, IonSpinner, IonNote, IonBadge, IonIcon,
    IonList, IonItem, IonLabel,
    IonAccordion, IonAccordionGroup,
  ],
})
export class PipelineDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(PipelineService);

  run = signal<PipelineRunOut | null>(null);
  groups = signal<CheckGroup[]>([]);
  loading = signal(false);
  error = signal('');

  constructor() { addIcons({ checkmarkCircleOutline, closeCircleOutline }); }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.svc.getRunById(id).subscribe({
      next: (r) => {
        this.run.set(r);
        this.groups.set(this.groupByCategory(r.checks));
        this.loading.set(false);
      },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }

  private groupByCategory(checks: PipelineCheckOut[]): CheckGroup[] {
    const map = new Map<string, PipelineCheckOut[]>();
    checks.forEach((c) => {
      const key = c.category ?? 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries()).map(([category, list]) => ({
      category,
      checks: list,
      passed: list.filter((c) => c.passed).length,
    }));
  }

  severityColor(s: string) {
    const m: Record<string, string> = { critical: 'danger', high: 'warning', medium: 'tertiary', low: 'success', info: 'medium' };
    return m[s] ?? 'medium';
  }

  resultColor(r: string) {
    const m: Record<string, string> = { SECURE: 'success', UNSAFE: 'danger', RUNNING: 'warning', ERROR: 'medium' };
    return m[r] ?? 'medium';
  }
}