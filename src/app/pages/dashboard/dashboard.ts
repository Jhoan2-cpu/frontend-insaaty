import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('volumeChart') volumeChart!: ElementRef;

  chart: any;

  // Mock data for low stock
  lowStockItems = [
    { nameKey: 'Wireless Mouse', qty: 2, status: 'CRITICAL', icon: 'fa-mouse' },
    { nameKey: 'HDMI Cable 6ft', qty: 5, status: 'LOW', icon: 'fa-plug' },
    { nameKey: 'Keycaps Set', qty: 8, status: 'LOW', icon: 'fa-keyboard' },
    { nameKey: 'USB-C Hub', qty: 3, status: 'CRITICAL', icon: 'fa-usb' }
  ];

  // Mock data for recent transactions
  recentTransactions = [
    { id: '#TRX-4402', type: 'STOCK_IN', date: 'Oct 24, 2023 - 10:42 AM', items: '240 Units', status: 'PENDING' },
    { id: '#TRX-4401', type: 'STOCK_OUT', date: 'Oct 24, 2023 - 09:15 AM', items: '12 Units', status: 'COMPLETED' },
    { id: '#TRX-4399', type: 'STOCK_OUT', date: 'Oct 23, 2023 - 04:30 PM', items: '50 Units', status: 'COMPLETED' },
    { id: '#TRX-4398', type: 'TRANSFER', date: 'Oct 23, 2023 - 02:15 PM', items: '100 Units', status: 'COMPLETED' }
  ];

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    const savedLang = this.translate.currentLang || 'es';
    this.translate.use(savedLang);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initChart();
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  initChart() {
    const ctx = this.volumeChart.nativeElement.getContext('2d');

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)'); // Blue with opacity
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Aug 1', 'Aug 5', 'Aug 10', 'Aug 15', 'Aug 20', 'Aug 25', 'Aug 30'],
        datasets: [{
          label: 'Transaction Volume',
          data: [65, 59, 80, 55, 95, 45, 85],
          borderColor: '#3b82f6', // Blue-500
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4, // Smooth curves
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11
              }
            },
            border: {
              display: false
            }
          },
          y: {
            display: false, // Hide Y axis as in design
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        }
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'STOCK_IN': return 'fa-arrow-down text-green-500';
      case 'STOCK_OUT': return 'fa-arrow-up text-blue-500';
      case 'TRANSFER': return 'fa-exchange-alt text-purple-500';
      default: return 'fa-circle';
    }
  }

  logout() {
    this.authService.logout();
  }
}
