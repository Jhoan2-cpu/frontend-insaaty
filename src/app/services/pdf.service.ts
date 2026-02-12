import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    private apiUrl = 'http://localhost:3000/reports';

    constructor(private http: HttpClient) { }

    generateSalesReport(startDate?: string, endDate?: string) {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        this.http.get<{ url: string }>(`${this.apiUrl}/generate/sales`, { params })
            .subscribe({
                next: (res) => this.downloadFile(res.url),
                error: (err) => console.error('Error downloading report', err)
            });
    }

    generateTopProductsReport(startDate?: string, endDate?: string) {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        this.http.get<{ url: string }>(`${this.apiUrl}/generate/top-products`, { params })
            .subscribe({
                next: (res) => this.downloadFile(res.url),
                error: (err) => console.error('Error downloading report', err)
            });
    }

    generateMovementsReport(startDate?: string, endDate?: string) {
        let params = new HttpParams();
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        this.http.get<{ url: string }>(`${this.apiUrl}/generate/movements`, { params })
            .subscribe({
                next: (res) => this.downloadFile(res.url),
                error: (err) => console.error('Error downloading report', err)
            });
    }

    private downloadFile(url: string) {
        // The url returned is relative (/uploads/reports/...)
        // Prepend backend url
        const fullUrl = `http://localhost:3000${url}`;
        window.open(fullUrl, '_blank');
    }
}
