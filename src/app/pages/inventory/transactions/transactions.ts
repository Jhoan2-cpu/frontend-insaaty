import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryService, InventoryTransaction } from '../../../services/inventory.service';
import { TitleService } from '../../../services/title.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-inventory-transactions',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterLink],
    templateUrl: './transactions.html'
})
export class Transactions implements OnInit {
    historyData: InventoryTransaction[] = [];
    historyTotal = 0;
    historyPage = 1;
    historyPageSize = 10;
    historyLoading = false;

    constructor(
        private inventoryService: InventoryService,
        private cdr: ChangeDetectorRef,
        private titleService: TitleService
    ) { }

    ngOnInit() {
        this.titleService.setTitle('INVENTORY.HISTORY');
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
