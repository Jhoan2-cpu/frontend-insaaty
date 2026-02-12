import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TransactionType {
    IN = 'IN',
    OUT = 'OUT',
    ADJUSTMENT = 'ADJUSTMENT'
}

export interface InventoryTransaction {
    id: number;
    tenant_id: number;
    product_id: number;
    user_id: number;
    type: TransactionType;
    quantity: number;
    reason?: string;
    created_at: string;
    product?: {
        id: number;
        name: string;
        sku: string;
    };
    user?: {
        id: number;
        full_name: string;
        email?: string;
    };
    supplier?: {
        id: number;
        name: string;
    };
    supplier_id?: number;
}

export interface InventorySummary {
    totalProducts: number;
    totalTransactions: number;
    lowStockCount: number;
    totalUnits: number;
}

export interface CreateTransactionDto {
    product_id: number;
    type: TransactionType;
    quantity: number;
    reason?: string;
    supplier_id?: number;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private apiUrl = 'http://localhost:3000/inventory';

    constructor(private http: HttpClient) { }

    createTransaction(dto: CreateTransactionDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/transaction`, dto);
    }

    createEntry(productId: number, quantity: number, reason?: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/in`, { product_id: productId, quantity, reason });
    }

    createExit(productId: number, quantity: number, reason?: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/out`, { product_id: productId, quantity, reason });
    }

    createAdjustment(productId: number, quantity: number, reason: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/adjustment`, { product_id: productId, quantity, reason });
    }

    getTransactions(params?: {
        page?: number;
        limit?: number;
        type?: string;
        startDate?: string;
        endDate?: string;
        userId?: number;
        search?: string;
    }): Observable<{ data: InventoryTransaction[], meta: any }> {
        let httpParams = new HttpParams();
        if (params?.page) httpParams = httpParams.set('page', params.page.toString());
        if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params?.type && params.type !== 'ALL' && params.type !== 'all') httpParams = httpParams.set('type', params.type);
        if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
        if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
        if (params?.userId) httpParams = httpParams.set('userId', params.userId.toString());
        if (params?.search) httpParams = httpParams.set('search', params.search);

        console.log('Frontend Service Params:', httpParams.toString());

        return this.http.get<{ data: InventoryTransaction[], meta: any }>(`${this.apiUrl}/transactions`, { params: httpParams });
    }

    getProductTransactions(productId: number, params?: {
        page?: number;
        limit?: number;
    }): Observable<{ data: InventoryTransaction[], meta: any }> {
        let httpParams = new HttpParams();
        if (params?.page) httpParams = httpParams.set('page', params.page.toString());
        if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

        return this.http.get<{ data: InventoryTransaction[], meta: any }>(`${this.apiUrl}/transactions/product/${productId}`, { params: httpParams });
    }

    getSummary(): Observable<InventorySummary> {
        return this.http.get<InventorySummary>(`${this.apiUrl}/summary`);
    }
}
