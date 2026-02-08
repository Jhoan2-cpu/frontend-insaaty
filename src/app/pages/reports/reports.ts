import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService, SalesReportData, TopProduct, LowStockProduct, KPIs } from '../../services/reports.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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

  // Chart instance
  salesChart: Chart | null = null;

  // Loading states
  isLoadingKPIs = false;
  isLoadingSales = false;
  isLoadingProducts = false;
  isLoadingLowStock = false;

  constructor(private reportsService: ReportsService) { }

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
  }

  loadKPIs(params?: { startDate?: string; endDate?: string }) {
    this.isLoadingKPIs = true;
    this.reportsService.getKPIs(params).subscribe({
      next: (data) => {
        this.kpis = data;
        this.isLoadingKPIs = false;
        console.log('✓ KPIs loaded:', data);
      },
      error: (err) => {
        console.error('Error loading KPIs:', err);
        this.isLoadingKPIs = false;
      }
    });
  }

  loadSalesReport(params?: { startDate?: string; endDate?: string }) {
    this.isLoadingSales = true;
    this.reportsService.getSalesReport(params).subscribe({
      next: (data) => {
        this.salesData = data;
        this.isLoadingSales = false;
        console.log('✓ Sales report loaded:', data);

        // Crear o actualizar gráfico
        if (this.activeTab === 'sales') {
          setTimeout(() => this.createSalesChart(), 100);
        }
      },
      error: (err) => {
        console.error('Error loading sales report:', err);
        this.isLoadingSales = false;
      }
    });
  }

  loadTopProducts(params?: { limit?: number; startDate?: string; endDate?: string }) {
    this.isLoadingProducts = true;
    this.reportsService.getTopProducts({ ...params, limit: 10 }).subscribe({
      next: (data) => {
        this.topProducts = data;
        this.isLoadingProducts = false;
        console.log('✓ Top products loaded:', data);
      },
      error: (err) => {
        console.error('Error loading top products:', err);
        this.isLoadingProducts = false;
      }
    });
  }

  loadLowStockProducts() {
    this.isLoadingLowStock = true;
    this.reportsService.getLowStockProducts().subscribe({
      next: (data) => {
        this.lowStockProducts = data;
        this.isLoadingLowStock = false;
        console.log('✓ Low stock products loaded:', data);
      },
      error: (err) => {
        console.error('Error loading low stock products:', err);
        this.isLoadingLowStock = false;
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
          return {
            startDate: new Date(this.customStartDate).toISOString(),
            endDate: new Date(this.customEndDate).toISOString()
          };
        }
        return {};
    }

    return startDate ? {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    } : {};
  }

  changeTab(tab: 'sales' | 'products' | 'movements') {
    this.activeTab = tab;

    // Crear gráfico si cambiamos a tab de ventas
    if (tab === 'sales' && this.salesData.length) {
      setTimeout(() => this.createSalesChart(), 100);
    }
  }
}
