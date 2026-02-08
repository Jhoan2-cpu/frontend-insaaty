import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Supplier {
    id: number;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    _count?: {
        products: number;
    };
}

export interface SuppliersResponse {
    data: Supplier[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class SuppliersService {
    private apiUrl = 'http://localhost:3000/suppliers';

    constructor(private http: HttpClient) { }

    getSuppliers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Observable<SuppliersResponse> {
        let httpParams = new HttpParams();
        if (params?.page) httpParams = httpParams.set('page', params.page.toString());
        if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params?.search) httpParams = httpParams.set('search', params.search);
        if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

        return this.http.get<SuppliersResponse>(this.apiUrl, { params: httpParams });
    }

    getSupplier(id: number): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
    }

    createSupplier(data: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<Supplier>(this.apiUrl, data);
    }

    updateSupplier(id: number, data: Partial<Supplier>): Observable<Supplier> {
        return this.http.patch<Supplier>(`${this.apiUrl}/${id}`, data);
    }

    deleteSupplier(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getProductsBySupplier(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${id}/products`);
    }
}
