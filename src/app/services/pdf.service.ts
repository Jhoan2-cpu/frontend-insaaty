import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    private apiUrl = '/api/reports';

    constructor(private http: HttpClient) { }

    generateSalesReport(startDate?: string, endDate?: string) {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        this.http.get<{ url: string }>(`${this.apiUrl}/generate/sales`, { params })
            .subscribe({
                next: (res) => this.viewPdf(res.url),
                error: (err) => console.error('Error downloading report', err)
            });
    }

    generateTopProductsReport(startDate?: string, endDate?: string) {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        this.http.get<{ url: string }>(`${this.apiUrl}/generate/top-products`, { params })
            .subscribe({
                next: (res) => this.viewPdf(res.url),
                error: (err) => console.error('Error downloading report', err)
            });
    }

    generateMovementsReport(startDate?: string, endDate?: string) {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        this.http.get<{ url: string }>(`${this.apiUrl}/generate/movements`, { params })
            .subscribe({
                next: (res) => this.viewPdf(res.url),
                error: (err) => console.error('Error downloading report', err)
            });
    }

    viewPdf(url: string) {
        if (!url) return;

        // If the URL is already absolute (contains http), open it directly
        if (url.startsWith('http')) {
            window.open(url, '_blank');
            return;
        }

        // If it's a relative path without leading slash, add it
        const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

        // Prepend /api prefix for proxying (matching backend global prefix)
        const fullUrl = `/api${normalizedUrl}`;
        window.open(fullUrl, '_blank');
    }
}
