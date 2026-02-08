import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

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
    status: OrderStatus;
    total: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

export interface OrdersResponse {
    data: Order[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
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

export interface UpdateOrderStatusDto {
    status: OrderStatus;
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

        console.log('🔄 Fetching orders with params:', params);
        return this.http.get<OrdersResponse>(this.apiUrl, { params: httpParams });
    }

    getOrder(id: number): Observable<Order> {
        console.log(`🔄 Fetching order ${id}`);
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    createOrder(dto: CreateOrderDto): Observable<Order> {
        console.log('🔄 Creating order:', dto);
        return this.http.post<Order>(this.apiUrl, dto);
    }

    updateStatus(id: number, dto: UpdateOrderStatusDto): Observable<Order> {
        console.log(`🔄 Updating order ${id} status to:`, dto.status);
        return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, dto);
    }

    getPendingCount(): Observable<number> {
        console.log('🔄 Fetching pending orders count');
        return this.http.get<number>(`${this.apiUrl}/stats/pending-count`);
    }
}
