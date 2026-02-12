
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-report-history',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './report-history.html',
  styleUrl: './report-history.css'
})
export class ReportHistory implements OnInit {
  reports: any[] = [];
  isLoading = false;

  constructor(private reportsService: ReportsService) { }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.reportsService.getReportHistory().subscribe({
      next: (data: any[]) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading reports', err);
        this.isLoading = false;
      }
    });
  }

  viewReport(url: string) {
    // Determine the base URL dynamically or use environment variable
    const baseUrl = 'http://localhost:3000'; // Or generic window.location if served from same origin in prod
    window.open(`${baseUrl}${url}`, '_blank');
  }
}
