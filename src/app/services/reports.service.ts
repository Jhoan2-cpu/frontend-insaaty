import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalesReportData {
    date: string;
    totalSales: number;
    orderCount: number;
    profit: number;
}

export interface TopProduct {
    productId: number;
    productName: string;
    sku: string;
    quantitySold: number;
    revenue: number;
}

export interface LowStockProduct {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    min_stock: number;
    difference: number;
}

export interface KPIs {
    totalSales?: number;
    totalOrders?: number;
    completedOrders?: number;
    pendingOrders?: number;
    totalProfit?: number;
    productsCount?: number;
    lowStockCount?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    private apiUrl = 'http://localhost:3000/reports';

    constructor(private http: HttpClient) { }

    getSalesReport(params?: {
        startDate?: string;
        endDate?: string;
    }): Observable<SalesReportData[]> {
        let httpParams = new HttpParams();
        if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
        if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

        console.log('🔄 Fetching sales report with params:', params);
        return this.http.get<SalesReportData[]>(`${this.apiUrl}/sales`, { params: httpParams });
    }

    getTopProducts(params?: {
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Observable<TopProduct[]> {
        let httpParams = new HttpParams();
        if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
        if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

        console.log('🔄 Fetching top products with params:', params);
        return this.http.get<TopProduct[]>(`${this.apiUrl}/top-products`, { params: httpParams });
    }

    getLowStockProducts(): Observable<LowStockProduct[]> {
        console.log('🔄 Fetching low stock products');
        return this.http.get<LowStockProduct[]>(`${this.apiUrl}/low-stock`);
    }

    getKPIs(params?: {
        startDate?: string;
        endDate?: string;
    }): Observable<KPIs> {
        let httpParams = new HttpParams();
        if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
        if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

        console.log('🔄 Fetching KPIs with params:', params);
        return this.http.get<KPIs>(`${this.apiUrl}/kpis`, { params: httpParams });
    }

    getReportHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/history`);
    }
}
