import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { TitleService } from '../../services/title.service';
import { ToastComponent } from '../toast/toast.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ToastComponent,
    BreadcrumbsComponent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, OnDestroy {
  isSidebarOpen = true;
  isInventoryOpen = false;
  isReportsOpen = false;
  showLogoutModal = false;
  currentLang = 'es';
  pendingOrdersCount = 0;

  user: any = null;
  private pollSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private orderService: OrderService,
    public titleService: TitleService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    const savedLang = this.translate.currentLang || 'es';
    this.translate.use(savedLang);
    this.currentLang = savedLang;

    // Cargar perfil de usuario
    this.authService.getProfile().subscribe({
      next: (user) => this.user = user,
      error: (err) => console.error('Error loading profile', err)
    });

    // Cargar contador de pedidos pendientes (reactivo)
    this.orderService.pendingCount$.subscribe(count => {
      this.pendingOrdersCount = count;
    });
    this.orderService.refreshPendingCount();

    // Polling cada 30 segundos
    this.pollSub = interval(30000).subscribe(() => {
      this.orderService.refreshPendingCount();
    });

    // Check if inventory is active (basic check)
    // A better way would be using Router events, but for now this is simple
    if (window.location.pathname.includes('/inventory')) {
      this.isInventoryOpen = true;
    }
    if (window.location.pathname.includes('/reports')) {
      this.isReportsOpen = true;
    }

    // Subscribe to router events to update title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      if (data['title']) {
        this.titleService.setTitle(data['title']);
      }
    });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  loadPendingCount() {
    this.orderService.refreshPendingCount();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleInventory() {
    this.isInventoryOpen = !this.isInventoryOpen;
  }

  toggleReports() {
    this.isReportsOpen = !this.isReportsOpen;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  confirmLogout() {
    this.showLogoutModal = true;
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  logout() {
    this.showLogoutModal = false;
    this.authService.logout();
  }
}
