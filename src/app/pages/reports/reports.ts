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

    // InventoryService expects DD/MM/YYYY format
    // params come as ISO strings from getDateParams
    let formattedStartDate = '';
    let formattedEndDate = '';

    if (params?.startDate) {
      formattedStartDate = this.formatDate(new Date(params.startDate));
    }
    if (params?.endDate) {
      formattedEndDate = this.formatDate(new Date(params.endDate));
    }

    this.inventoryService.getTransactions({
      page: 1,
      limit: 50, // Limit to 50 for the report view
      startDate: formattedStartDate,
      endDate: formattedEndDate,
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
    const now = new Date();
    let startDate: Date | undefined;
    let endDate = new Date(now);

    // Ensure endDate covers the full day
    endDate.setHours(23, 59, 59, 999);

    switch (this.dateFilter) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          // Custom dates from picker are YYYY-MM-DD
          const sDate = new Date(this.customStartDate);
          sDate.setHours(0, 0, 0, 0); // Start of start date

          const eDate = new Date(this.customEndDate);
          eDate.setHours(23, 59, 59, 999); // End of end date

          return {
            startDate: sDate.toISOString(),
            endDate: eDate.toISOString()
          };
        }
        return {};
    }

    if (startDate) {
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
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
