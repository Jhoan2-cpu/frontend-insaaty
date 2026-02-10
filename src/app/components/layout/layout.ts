import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { TitleService } from '../../services/title.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ToastComponent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  isSidebarOpen = true;
  isInventoryOpen = false;
  currentLang = 'es';
  pendingOrdersCount = 0;

  user: any = null;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private orderService: OrderService,
    public titleService: TitleService
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

    // Cargar contador de pedidos pendientes
    this.loadPendingCount();

    // Check if inventory is active (basic check)
    // A better way would be using Router events, but for now this is simple
    if (window.location.pathname.includes('/inventory')) {
      this.isInventoryOpen = true;
    }
  }

  loadPendingCount() {
    this.orderService.getPendingCount().subscribe({
      next: (count) => {
        this.pendingOrdersCount = count;
      },
      error: (error) => console.error('Error loading pending orders count:', error)
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleInventory() {
    this.isInventoryOpen = !this.isInventoryOpen;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  logout() {
    this.authService.logout();
  }
}
