import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import { PdfService } from '../../../services/pdf.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-report-history',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './report-history.html',
  styleUrl: './report-history.css'
})
// Component to display and manage report history
export class ReportHistoryComponent implements OnInit {
  reports: any[] = [];
  filteredReports: any[] = [];
  isLoading = false;
  searchTerm: string = '';
  filterType: string = 'ALL';
  isFilterDropdownOpen = false;

  constructor(
    private reportsService: ReportsService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadReports();
  }

  toggleFilterDropdown() {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  selectFilter(type: string) {
    this.filterType = type;
    this.isFilterDropdownOpen = false;
    this.applyFilters();
  }

  loadReports() {
    this.isLoading = true;
    this.reportsService.getReportHistory()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data: any[]) => {
          // Sort by ID descending by default
          this.reports = data.sort((a, b) => b.id - a.id);
          this.applyFilters();
        },
        error: (err: any) => {
          console.error('Error loading reports', err);
        }
      });
  }

  applyFilters() {
    this.filteredReports = this.reports.filter(report => {
      const matchesSearch = report.id.toString().includes(this.searchTerm) ||
        report.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (report.user?.full_name || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = this.filterType === 'ALL' || report.type === this.filterType;

      return matchesSearch && matchesType;
    });
  }

  viewReport(url: string) {
    this.pdfService.viewPdf(url);
  }
}
