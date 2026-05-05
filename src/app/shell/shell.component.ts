import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonMenu, IonMenuToggle, IonRouterOutlet, IonHeader, IonToolbar,
  IonTitle, IonContent, IonFooter, IonList, IonItem, IonLabel,
  IonIcon, IonBadge, IonButton, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline, serverOutline, shieldCheckmarkOutline, gitBranchOutline,
  warningOutline, notificationsOutline, logOutOutline, personCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../core/services/auth.service';
import { WebsocketService } from '../core/services/websocket.service';
import { AlertStateService } from '../core/services/alert-state.service';
import { DashboardService } from '../core/services/dashboard.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive,
    IonMenu, IonMenuToggle, IonRouterOutlet, IonHeader, IonToolbar,
    IonTitle, IonContent, IonFooter, IonList, IonItem, IonLabel,
    IonIcon, IonBadge, IonButton, IonNote,
  ],
})
export class ShellComponent implements OnDestroy {
  protected auth = inject(AuthService);
  protected alertState = inject(AlertStateService);
  private ws = inject(WebsocketService);
  private dashboardSvc = inject(DashboardService);
  private router = inject(Router);

  private wsSub?: Subscription;

  readonly navItems = [
    { label: 'Dashboard',  path: '/app/dashboard',  icon: 'grid-outline' },
    { label: 'Assets',     path: '/app/assets',     icon: 'server-outline' },
    { label: 'Bastionado', path: '/app/audit',      icon: 'shield-checkmark-outline' },
    { label: 'Pipeline',   path: '/app/pipeline',   icon: 'git-branch-outline' },
    { label: 'Incidentes', path: '/app/incidents',  icon: 'warning-outline' },
    { label: 'Alertas',    path: '/app/alerts',     icon: 'notifications-outline' },
  ];

  constructor() {
    addIcons({
      gridOutline, serverOutline, shieldCheckmarkOutline, gitBranchOutline,
      warningOutline, notificationsOutline, logOutOutline, personCircleOutline,
    });

    this.auth.initSession();

    // Load initial unread count
    this.dashboardSvc.getStats().subscribe((s) => this.alertState.set(s.unread_alerts));

    // Subscribe to real-time alerts
    const token = this.auth.getToken();
    if (token) {
      this.ws.connect(token);
      this.wsSub = this.ws.alerts$.subscribe(() => this.alertState.increment());
    }
  }

  logout() {
    this.ws.disconnect();
    this.wsSub?.unsubscribe();
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() { return this.auth.currentUser(); }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
    this.ws.disconnect();
  }
}