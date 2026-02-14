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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

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
    this.currentPage = 1; // Reset to first page on filter change
    this.loadReports();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.reportsService.getReportHistory(this.currentPage, this.pageSize, this.searchTerm, this.filterType)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response: any) => {
          this.reports = response.data;
          this.totalItems = response.total;
          this.totalPages = response.totalPages;
          // No need for client-side filtering anymore
          this.filteredReports = this.reports;
        },
        error: (err: any) => {
          console.error('Error loading reports', err);
        }
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReports();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReports();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReports();
    }
  }



  viewReport(url: string) {
    this.pdfService.viewPdf(url);
  }
}
