import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { ReportsService, KPIs, LowStockProduct, SalesReportData } from '../../services/reports.service';
import { InventoryService, InventoryTransaction } from '../../services/inventory.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('volumeChart') volumeChart!: ElementRef;

  chart: any;
  loading = true;

  // Real data
  kpis: KPIs = {
    totalSales: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalProfit: 0,
    productsCount: 0,
    lowStockCount: 0
  };

  lowStockItems: LowStockProduct[] = [];
  recentTransactions: any[] = []; // Using any to map fields easily for display
  salesData: SalesReportData[] = [];

  constructor(
    private translate: TranslateService,
    private reportsService: ReportsService,
    private inventoryService: InventoryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    const savedLang = this.translate.currentLang || 'es';
    this.translate.use(savedLang);

    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Chart initialization moved to fetch success to ensure data exists
  }

  loadDashboardData() {
    this.loading = true;

    forkJoin({
      kpis: this.reportsService.getKPIs().pipe(
        catchError(err => {
          console.error('Failed to load KPIs', err);
          return of({
            totalSales: 0, totalOrders: 0, completedOrders: 0,
            pendingOrders: 0, totalProfit: 0, productsCount: 0, lowStockCount: 0
          } as KPIs);
        })
      ),
      lowStock: this.reportsService.getLowStockProducts().pipe(
        catchError(err => {
          console.error('Failed to load Low Stock', err);
          return of([] as LowStockProduct[]);
        })
      ),
      transactions: this.inventoryService.getTransactions({ page: 1, limit: 10 }).pipe(
        catchError(err => {
          console.error('Failed to load Transactions', err);
          return of({ data: [], meta: {} });
        })
      ),
      sales: this.reportsService.getSalesReport().pipe(
        catchError(err => {
          console.error('Failed to load Sales', err);
          return of([] as SalesReportData[]);
        })
      )
    }).subscribe({
      next: (res) => {
        this.kpis = res.kpis;
        this.lowStockItems = res.lowStock;
        this.salesData = res.sales;

        // Map transactions to display format
        if (res.transactions && res.transactions.data) {
          this.recentTransactions = res.transactions.data.map(t => ({
            id: `#TRX-${t.id}`,
            type: t.type,
            date: new Date(t.created_at).toLocaleDateString() + ' ' + new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: `${t.quantity} Units`,
            status: 'COMPLETED', // Inventory transactions are instant/completed
            productName: t.product?.name
          }));
        }

        this.loading = false;

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initChart(), 0);
        }
      },
      error: (err) => {
        console.error('Critical error loading dashboard data', err);
        this.loading = false;
      }
    });
  }

  initChart() {
    if (!this.volumeChart) return;

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.volumeChart.nativeElement.getContext('2d');

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)'); // Blue with opacity
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    // Prepare data
    const labels = this.salesData.length > 0
      ? this.salesData.map(d => new Date(d.date).toLocaleDateString(this.translate.currentLang, { day: 'numeric', month: 'short' }))
      : ['No Data'];

    const data = this.salesData.length > 0
      ? this.salesData.map(d => d.totalSales)
      : [0];

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales Volume',
          data: data,
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
            displayColors: false,
            callbacks: {
              label: (context) => `Sales: $${context.raw}`
            }
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
      case 'ADJUSTMENT': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'IN': return 'fa-arrow-down text-green-500';
      case 'OUT': return 'fa-arrow-up text-blue-500';
      case 'ADJUSTMENT': return 'fa-exchange-alt text-purple-500';
      default: return 'fa-circle';
    }
  }
}

