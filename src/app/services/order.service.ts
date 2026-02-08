import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface OrderItem {
    id: number;
    product_id: number;
    product: {
        id: number;
        name: string;
        sku: string;
        price_sale: number;
    };
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface Order {
    id: number;
    order_number: string;
    tenant_id: number;
    user_id: number;
    status: OrderStatus;
    total: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
    user?: {
        id: number;
        full_name: string;
        email: string;
    };
}

export interface OrdersResponse {
    data: Order[];
    meta: {
        total: number;
        page: number;
        limit: number;
        last_page: number;
    };
}

export interface CreateOrderItemDto {
    product_id: number;
    quantity: number;
}

export interface CreateOrderDto {
    items: CreateOrderItemDto[];
    notes?: string;
}

export interface UpdateOrderDto {
    status?: OrderStatus;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:3000/orders';

    constructor(private http: HttpClient) { }

    getOrders(params?: {
        page?: number;
        limit?: number;
        status?: OrderStatus;
    }): Observable<OrdersResponse> {
        let httpParams = new HttpParams();
        if (params?.page) httpParams = httpParams.set('page', params.page.toString());
        if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);

        return this.http.get<OrdersResponse>(this.apiUrl, { params: httpParams });
    }

    getOrder(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    createOrder(dto: CreateOrderDto): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, dto);
    }

    updateStatus(id: number, dto: UpdateOrderDto): Observable<Order> {
        return this.http.patch<Order>(`${this.apiUrl}/${id}`, dto);
    }

    getPendingCount(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/stats/pending-count`);
    }
}
