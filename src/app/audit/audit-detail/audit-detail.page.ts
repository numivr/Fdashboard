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
import { AuditService } from '../../core/services/audit.service';
import { AuditRunOut, AuditCheckOut } from '../../core/models/models';

interface CheckGroup { category: string; checks: AuditCheckOut[]; passed: number; }

@Component({
  selector: 'app-audit-detail',
  templateUrl: 'audit-detail.page.html',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonContent, IonSpinner, IonNote, IonBadge, IonIcon,
    IonList, IonItem, IonLabel,
    IonAccordion, IonAccordionGroup,
  ],
})
export class AuditDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(AuditService);

  run = signal<AuditRunOut | null>(null);
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

  private groupByCategory(checks: AuditCheckOut[]): CheckGroup[] {
    const map = new Map<string, AuditCheckOut[]>();
    checks.forEach((c) => {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
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

  scoreColor(score: number | null) {
    if (score === null) return 'medium';
    return score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger';
  }
}