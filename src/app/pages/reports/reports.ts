import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService, SalesReportData, TopProduct, LowStockProduct, KPIs } from '../../services/reports.service';
import { InventoryService, InventoryTransaction } from '../../services/inventory.service';
import { TitleService } from '../../services/title.service';
import { Chart } from 'chart.js/auto';
import { finalize } from 'rxjs/operators';
import { DatePicker } from '../../components/date-picker/date-picker';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, DatePicker],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;

  activeTab: 'sales' | 'products' | 'movements' = 'sales';
  dateFilter: 'today' | 'week' | 'month' | 'year' | 'custom' = 'month';
  customStartDate: string = '';
  customEndDate: string = '';

  // Data
  kpis: KPIs | null = null;
  salesData: SalesReportData[] = [];
  topProducts: TopProduct[] = [];
  lowStockProducts: LowStockProduct[] = [];
  movementsData: InventoryTransaction[] = [];

  // Chart instance
  salesChart: Chart | null = null;

  // Loading states
  isLoadingKPIs = false;
  isLoadingSales = false;
  isLoadingProducts = false;
  isLoadingLowStock = false;
  isLoadingMovements = false;

  constructor(
    private reportsService: ReportsService,
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef,
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.loadAllData();
  }

  ngAfterViewInit() {
    // Chart se crea después de que hay datos
  }

  loadAllData() {
    const dateParams = this.getDateParams();
    this.loadKPIs(dateParams);
    this.loadSalesReport(dateParams);
    this.loadTopProducts(dateParams);
    this.loadLowStockProducts();
    this.loadMovements(dateParams);
  }

  loadKPIs(params?: { startDate?: string; endDate?: string }) {
    this.isLoadingKPIs = true;
    this.cdr.detectChanges();
    console.log('📊 Loading KPIs with params:', params);

    this.reportsService.getKPIs(params)
      .pipe(finalize(() => {
        this.isLoadingKPIs = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.kpis = data;
          console.log('✅ KPIs loaded');
        },
        error: (err) => {
          console.error('❌ Error loading KPIs:', err);
          // Establecer KPIs vacíos en caso de error
          this.kpis = {
            totalSales: 0,
            totalOrders: 0,
            completedOrders: 0,
            pendingOrders: 0,
            totalProfit: 0,
            productsCount: 0,
            lowStockCount: 0
          };
        }
      });
  }

  loadSalesReport(params?: { startDate?: string; endDate?: string }) {
    this.isLoadingSales = true;

    this.reportsService.getSalesReport(params)
      .pipe(finalize(() => {
        this.isLoadingSales = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.salesData = data;
          console.log('✓ Sales report loaded:', data);
          // Crear o actualizar gráfico
          if (this.activeTab === 'sales') {
            setTimeout(() => this.createSalesChart(), 100);
          }
        },
        error: (err) => {
          console.error('Error loading sales report:', err);
        }
      });
  }

  loadTopProducts(params?: { limit?: number; startDate?: string; endDate?: string }) {
    this.isLoadingProducts = true;

    this.reportsService.getTopProducts({ ...params, limit: 10 })
      .pipe(finalize(() => {
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.topProducts = data;
          console.log('✓ Top products loaded:', data);
        },
        error: (err) => {
          console.error('Error loading top products:', err);
        }
      });
  }

  loadLowStockProducts() {
    this.isLoadingLowStock = true;

    this.reportsService.getLowStockProducts()
      .pipe(finalize(() => {
        this.isLoadingLowStock = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.lowStockProducts = data;
          console.log('✓ Low stock products loaded:', data);
        },
        error: (err) => {
          console.error('Error loading low stock products:', err);
        }
      });
  }

  loadMovements(params?: { startDate?: string; endDate?: string }) {
    this.isLoadingMovements = true;

    // Convert ISO/Date string params to format expected by API if needed
    // Assuming API takes YYYY-MM-DD or ISO strings. 
    // InventoryService.getTransactions expects specific format? 
    // In transactions.ts it passed filters.startDate which was formatted 'DD/MM/YYYY'.
    // Here getDateParams returns ISO strings (YYYY-MM-DDTHH:mm:ss.sssZ). 
    // I might need to format them if the backend strictly expects DD/MM/YYYY, 
    // but usually ISO is safer for APIs. Let's try passing provided params first, 
    // but seeing transactions.ts implementation, it uses formatDate() to DD/MM/YYYY.
    // Let's check if we need to format.

    // Actually, let's look at `reports.ts`: `getDateParams` returns objects with `startDate` and `endDate` as ISO strings.
    // In `transactions.ts`, `filters.startDate` is bound to the date picker which returns DD/MM/YYYY.
    // If the backend handles both, great. If not, I might need to format.
    // For now, I will pass the params as is, assuming the generic `InventoryService` can handle it 
    // or the backend is flexible. If it fails, I'll fix the format.

    // However, `InventoryService.getTransactions` signature in `transactions.ts` call takes an object.

    this.inventoryService.getTransactions({
      page: 1,
      limit: 50, // Limit to 50 for the report view
      startDate: params?.startDate,
      endDate: params?.endDate,
      type: 'all'
    })
      .pipe(finalize(() => {
        this.isLoadingMovements = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.movementsData = res.data;
          console.log('✓ Movements loaded:', res.data);
        },
        error: (err) => {
          console.error('Error loading movements:', err);
        }
      });
  }

  createSalesChart() {
    if (!this.salesChartRef || !this.salesData.length) return;

    // Destruir gráfico anterior si existe
    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.salesData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Ventas',
            data: this.salesData.map(d => d.totalSales),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Ganancia',
            data: this.salesData.map(d => d.profit),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value.toLocaleString()
            }
          }
        }
      }
    });
  }

  setDateFilter(filter: 'today' | 'week' | 'month' | 'year' | 'custom') {
    this.dateFilter = filter;
    if (filter !== 'custom') {
      this.loadAllData();
    }
  }

  applyCustomDateFilter() {
    if (this.customStartDate && this.customEndDate) {
      this.dateFilter = 'custom';
      this.loadAllData();
    }
  }

  getDateParams(): { startDate?: string; endDate?: string } {
    const today = new Date();
    let startDate: Date | undefined;
    let endDate = today;

    switch (this.dateFilter) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          // Custom dates from picker are YYYY-MM-DD
          // Convert to DD/MM/YYYY
          const [startYear, startMonth, startDay] = this.customStartDate.split('-');
          const [endYear, endMonth, endDay] = this.customEndDate.split('-');

          return {
            startDate: `${startDay}/${startMonth}/${startYear}`,
            endDate: `${endDay}/${endMonth}/${endYear}`
          };
        }
        return {};
    }

    if (startDate) {
      return {
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate)
      };
    }
    return {};
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  changeTab(tab: 'sales' | 'products' | 'movements') {
    this.activeTab = tab;

    // Crear gráfico si cambiamos a tab de ventas
    if (tab === 'sales' && this.salesData.length) {
      setTimeout(() => this.createSalesChart(), 100);
    }
  }
}
