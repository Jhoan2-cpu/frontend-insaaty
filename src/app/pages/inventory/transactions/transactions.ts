import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryService, InventoryTransaction } from '../../../services/inventory.service';
import { TitleService } from '../../../services/title.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-inventory-transactions',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterLink, FormsModule],
    templateUrl: './transactions.html'
})
export class Transactions implements OnInit {
    historyData: InventoryTransaction[] = [];
    historyTotal = 0;
    historyPage = 1;
    historyPageSize = 10;
    historyLoading = false;

    // Filters
    filters = {
        keyword: '',
        user: 'all',
        startDate: '',
        endDate: '',
        type: 'all'
    };

    constructor(
        private inventoryService: InventoryService,
        private cdr: ChangeDetectorRef,
        private titleService: TitleService
    ) { }

    clearFilters() {
        this.filters = {
            keyword: '',
            user: 'all',
            startDate: '',
            endDate: '',
            type: 'all'
        };
        this.loadHistory();
    }

    ngOnInit() {
        this.loadHistory();
    }

    loadHistory() {
        this.historyLoading = true;
        this.inventoryService.getTransactions({
            page: this.historyPage,
            limit: this.historyPageSize
        }).subscribe({
            next: (res) => {
                this.historyData = res.data;
                this.historyTotal = res.meta.total;
                this.historyLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading history:', err);
                this.historyLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    goToHistoryPage(page: number) {
        this.historyPage = page;
        this.loadHistory();
    }
}
