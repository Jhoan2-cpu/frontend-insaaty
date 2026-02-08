import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Product {
    id: number;
    sku: string;
    name: string;
    description?: string;
    price_cost: number;
    price_sale: number;
    min_stock: number;
    current_stock: number;
    created_at: string;
    updated_at: string;
}

export interface ProductsResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    price_cost: number;
    price_sale: number;
    min_stock?: number;
    current_stock?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = 'http://localhost:3000/products';

    constructor(private http: HttpClient) { }

    getProducts(filters?: {
        search?: string;
        stockStatus?: string;
        page?: number;
        limit?: number;
    }): Observable<ProductsResponse> {
        let params = new HttpParams();

        if (filters) {
            if (filters.search) params = params.set('search', filters.search);
            if (filters.stockStatus) params = params.set('stockStatus', filters.stockStatus);
            if (filters.page) params = params.set('page', filters.page.toString());
            if (filters.limit) params = params.set('limit', filters.limit.toString());
        }

        const url = `${this.apiUrl}?${params.toString()}`;
        console.log('🌐 ProductService - Making HTTP GET request to:', url);
        console.log('📋 Params:', params.toString());

        return this.http.get<ProductsResponse>(this.apiUrl, { params }).pipe(
            tap({
                next: (response) => console.log('✅ ProductService - HTTP Response received:', response),
                error: (error) => console.error('❌ ProductService - HTTP Error:', error)
            })
        );
    }

    getProduct(id: number): Observable<Product> {
        console.log(`🔍 ProductService - Getting product ${id}`);
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    createProduct(dto: CreateProductDto): Observable<Product> {
        console.log('➕ ProductService - Creating product:', dto);
        return this.http.post<Product>(this.apiUrl, dto);
    }

    updateProduct(id: number, dto: Partial<CreateProductDto>): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/${id}`, dto);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
