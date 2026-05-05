import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'app',
    loadComponent: () => import('./shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'assets',    loadComponent: () => import('./assets-list/assets-list.page').then((m) => m.AssetsListPage) },
      { path: 'audit',     loadComponent: () => import('./audit/audit.page').then((m) => m.AuditPage) },
      { path: 'audit/:id', loadComponent: () => import('./audit/audit-detail/audit-detail.page').then((m) => m.AuditDetailPage) },
      { path: 'pipeline',     loadComponent: () => import('./pipeline/pipeline.page').then((m) => m.PipelinePage) },
      { path: 'pipeline/:id', loadComponent: () => import('./pipeline/pipeline-detail/pipeline-detail.page').then((m) => m.PipelineDetailPage) },
      { path: 'incidents', loadComponent: () => import('./incidents/incidents.page').then((m) => m.IncidentsPage) },
      { path: 'alerts',    loadComponent: () => import('./alerts/alerts.page').then((m) => m.AlertsPage) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'app/dashboard' },
];