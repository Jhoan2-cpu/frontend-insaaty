import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
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
  currentLang = 'es';
  pendingOrdersCount = 0;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    const savedLang = this.translate.currentLang || 'es';
    this.translate.use(savedLang);
    this.currentLang = savedLang;

    // Cargar contador de pedidos pendientes
    this.loadPendingCount();
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

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  logout() {
    this.authService.logout();
  }
}
