import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { ReportsService, KPIs, LowStockProduct, SalesReportData } from '../../services/reports.service';
import { InventoryService, InventoryTransaction } from '../../services/inventory.service';
import { TitleService } from '../../services/title.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule], // Add RouterModule here
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('volumeChart') volumeChart!: ElementRef;

  chart: any;
  loading = true;
  chartPeriod: '30' | '90' = '30'; // Track active period

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
    private titleService: TitleService,
    private cdr: ChangeDetectorRef,
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
          this.allTransactions = res.transactions.data.map(t => ({
            id: t.id, // Just the ID number
            type: t.type,
            // Map to INVENTORY.MOVEMENT.TYPES keys
            typeKey: `INVENTORY.MOVEMENT.TYPES.${t.type}`,
            date: new Date(t.created_at).toLocaleDateString() + ' ' + new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: `${t.quantity} Units`,
            status: 'COMPLETED', // Inventory transactions are instant/completed
            productName: t.product?.name
          }));
          this.filterTransactions();
        }

        this.loading = false;
        this.cdr.detectChanges();

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initChart(), 0);
        }
      },
      error: (err) => {
        console.error('Critical error loading dashboard data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter Logic
  allTransactions: any[] = [];
  showFilterMenu = false;
  currentFilter: 'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT' = 'ALL';

  toggleFilterMenu() {
    this.showFilterMenu = !this.showFilterMenu;
  }

  refreshChartData() {
    const now = new Date();
    // End date is today at 00:00 UTC for the request
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Start date is X days ago
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - (parseInt(this.chartPeriod) - 1));

    // Format dates as YYYY-MM-DD (UTC)
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    console.log(`Refreshing chart: ${this.chartPeriod} days`, {
      start: formatDate(startDate),
      end: formatDate(endDate)
    });

    this.reportsService.getSalesReport({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    }).subscribe({
      next: (data) => {
        console.log(`Received ${data.length} data points`);
        this.salesData = data;
        this.initChart();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching sales data', err)
    });
  }

  setChartPeriod(period: '30' | '90') {
    this.chartPeriod = period;
    this.refreshChartData();
  }

  filterTransactions() {
    if (this.currentFilter === 'ALL') {
      this.recentTransactions = [...this.allTransactions].slice(0, 5);
    } else {
      this.recentTransactions = this.allTransactions
        .filter(t => t.type === this.currentFilter)
        .slice(0, 5);
    }
  }

  setFilter(filter: 'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT') {
    this.currentFilter = filter;
    this.filterTransactions();
    this.showFilterMenu = false;
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
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)'); // Emerald-500 with opacity
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    // Generate all dates for the selected period
    const labels: string[] = [];
    const data: number[] = [];
    const periodDays = parseInt(this.chartPeriod);

    // Use UTC today to avoid timezone shifts
    const now = new Date();
    const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Create map for O(1) lookup
    const salesMap = new Map<string, number>();
    this.salesData.forEach(d => {
      // Backend returns dates in ISO format, we extract the YYYY-MM-DD part
      const dateStr = new Date(d.date).toISOString().split('T')[0];
      // Use totalVolume (count of both sales and movements)
      salesMap.set(dateStr, d.totalVolume || 0);
    });

    // Loop backwards from today to (today - period) using UTC methods
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(utcToday);
      d.setUTCDate(utcToday.getUTCDate() - i);

      const dateStr = d.toISOString().split('T')[0];

      // Label remains local for the user's view, but based on the UTC day
      labels.push(d.toLocaleDateString(this.translate.currentLang || 'es', { day: 'numeric', month: 'short', timeZone: 'UTC' }));

      // Data lookup
      data.push(salesMap.get(dateStr) || 0);
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales Volume',
          data: data,
          borderColor: '#10b981', // Emerald-500
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4, // Smooth curves
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
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
              },
              maxTicksLimit: periodDays === 90 ? 12 : 8,
              padding: 10
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

