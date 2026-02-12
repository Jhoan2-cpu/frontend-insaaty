import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesReportData, TopProduct, LowStockProduct } from './reports.service';
import { InventoryTransaction } from './inventory.service';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    private readonly COMPANY_NAME = 'INSAATY';
    private readonly PRIMARY_COLOR = '#10b981'; // Emerald 500
    private readonly SECONDARY_COLOR = '#374151'; // Gray 700

    constructor() { }

    private addHeader(doc: jsPDF, title: string, subtitle?: string) {
        const pageWidth = doc.internal.pageSize.width;

        // Company Name
        doc.setFontSize(22);
        doc.setTextColor(this.PRIMARY_COLOR);
        doc.text(this.COMPANY_NAME, 14, 20);

        // Title
        doc.setFontSize(16);
        doc.setTextColor(this.SECONDARY_COLOR);
        doc.text(title, pageWidth - 14, 20, { align: 'right' });

        // Subtitle / Date Range
        if (subtitle) {
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(subtitle, pageWidth - 14, 28, { align: 'right' });
        }

        // Line separator
        doc.setDrawColor(200);
        doc.line(14, 32, pageWidth - 14, 32);

        // Generation Date
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);
    }

    private addFooter(doc: jsPDF) {
        const pageCount = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text('© 2024 INSAATY - Sistema de Inventario', 14, pageHeight - 10);
        }
    }

    generateSalesReport(data: SalesReportData[], dateRange: string) {
        const doc = new jsPDF();
        this.addHeader(doc, 'Reporte de Ventas', dateRange);

        const tableData = data.map(item => [
            new Date(item.date).toLocaleDateString(),
            item.orderCount,
            `$${item.totalSales.toLocaleString()}`,
            `$${item.profit.toLocaleString()}`
        ]);

        autoTable(doc, {
            head: [['Fecha', 'Pedidos', 'Ventas Totales', 'Ganancia']],
            body: tableData,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: this.PRIMARY_COLOR, textColor: 255 },
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 30, halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' }
            },
            foot: [['Totales',
                data.reduce((a, b) => a + b.orderCount, 0).toString(),
                `$${data.reduce((a, b) => a + b.totalSales, 0).toLocaleString()}`,
                `$${data.reduce((a, b) => a + b.profit, 0).toLocaleString()}`
            ]],
            footStyles: { fillColor: this.SECONDARY_COLOR, textColor: 255, fontStyle: 'bold' }
        });

        this.addFooter(doc);
        doc.save(`reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    generateTopProductsReport(data: TopProduct[], dateRange: string) {
        const doc = new jsPDF();
        this.addHeader(doc, 'Productos Más Vendidos', dateRange);

        const tableData = data.map((item, index) => [
            index + 1,
            item.productName,
            item.sku,
            item.quantitySold,
            `$${item.revenue.toLocaleString()}`
        ]);

        autoTable(doc, {
            head: [['#', 'Producto', 'SKU', 'Cantidad Vendida', 'Ingresos']],
            body: tableData,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: this.PRIMARY_COLOR },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'right' }
            }
        });

        this.addFooter(doc);
        doc.save(`reporte-productos-top-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    generateMovementsReport(data: InventoryTransaction[], dateRange: string) {
        const doc = new jsPDF();
        this.addHeader(doc, 'Reporte de Movimientos', dateRange);

        const tableData = data.map(item => [
            new Date(item.createdAt).toLocaleDateString() + ' ' + new Date(item.createdAt).toLocaleTimeString(),
            item.product.name,
            item.type.toUpperCase(),
            item.quantity,
            item.user.name,
            item.reason || '-'
        ]);

        autoTable(doc, {
            head: [['Fecha', 'Producto', 'Tipo', 'Cant.', 'Usuario', 'Razón']],
            body: tableData,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: this.PRIMARY_COLOR },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 35 },
                2: { cellWidth: 20 },
                3: { cellWidth: 15, halign: 'center' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    const type = data.cell.raw as string;
                    if (type === 'IN') data.cell.styles.textColor = [16, 185, 129]; // Green
                    if (type === 'OUT') data.cell.styles.textColor = [239, 68, 68]; // Red
                    if (type === 'ADJUSTMENT') data.cell.styles.textColor = [245, 158, 11]; // Orange
                }
            }
        });

        this.addFooter(doc);
        doc.save(`reporte-movimientos-${new Date().toISOString().split('T')[0]}.pdf`);
    }
}
