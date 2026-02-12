import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
        private titleService: TitleService,
        private translate: TranslateService
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

    // Date Picker State
    showStartDatePicker = false;
    showEndDatePicker = false;
    currentDate = new Date();
    currentMonth = this.currentDate.getMonth();
    currentYear = this.currentDate.getFullYear();
    calendarDays: (number | null)[] = [];
    weekDays = ['COMMON.WEEKDAYS.SU', 'COMMON.WEEKDAYS.MO', 'COMMON.WEEKDAYS.TU', 'COMMON.WEEKDAYS.WE', 'COMMON.WEEKDAYS.TH', 'COMMON.WEEKDAYS.FR', 'COMMON.WEEKDAYS.SA'];

    // New: Date Selection Mode
    pickerView: 'calendar' | 'months' = 'calendar';
    monthIndices = Array.from({ length: 12 }, (_, i) => i);

    toggleStartDatePicker() {
        this.showStartDatePicker = !this.showStartDatePicker;
        this.showEndDatePicker = false;
        this.pickerView = 'calendar';
        if (this.showStartDatePicker) {
            this.generateCalendar();
        }
    }

    toggleEndDatePicker() {
        this.showEndDatePicker = !this.showEndDatePicker;
        this.showStartDatePicker = false;
        this.pickerView = 'calendar';
        if (this.showEndDatePicker) {
            this.generateCalendar();
        }
    }

    togglePickerView() {
        this.pickerView = this.pickerView === 'calendar' ? 'months' : 'calendar';
    }

    selectMonth(month: number) {
        this.currentMonth = month;
        this.pickerView = 'calendar';
        this.generateCalendar();
    }

    changeYear(offset: number) {
        this.currentYear += offset;
        this.generateCalendar();
    }

    getMonthLabel(monthIndex: number): string {
        const date = new Date(this.currentYear, monthIndex, 1);
        const lang = this.translate.currentLang || 'es';
        return date.toLocaleString(lang, { month: 'short' });
    }

    generateCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        this.calendarDays = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            this.calendarDays.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            this.calendarDays.push(i);
        }
    }

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }

    selectStartDate(day: number | null) {
        if (!day) return;
        const date = new Date(this.currentYear, this.currentMonth, day);
        this.filters.startDate = this.formatDate(date);
        this.showStartDatePicker = false;
    }

    selectEndDate(day: number | null) {
        if (!day) return;
        const date = new Date(this.currentYear, this.currentMonth, day);
        this.filters.endDate = this.formatDate(date);
        this.showEndDatePicker = false;
    }

    onDateInput(event: any, type: 'start' | 'end') {
        const value = event.target.value;
        if (value.length === 10) {
            const parts = value.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const date = new Date(year, month, day);

                if (!isNaN(date.getTime())) {
                    this.currentMonth = month;
                    this.currentYear = year;
                    this.generateCalendar();
                }
            }
        }
    }

    isDateSelected(day: number | null, type: 'start' | 'end'): boolean {
        if (!day) return false;
        const targetDate = type === 'start' ? this.filters.startDate : this.filters.endDate;
        if (!targetDate) return false;

        const dateStr = this.formatDate(new Date(this.currentYear, this.currentMonth, day));
        return targetDate === dateStr;
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    getMonthName(): string {
        const date = new Date(this.currentYear, this.currentMonth, 1);
        const lang = this.translate.currentLang || 'es';
        return date.toLocaleString(lang, { month: 'long', year: 'numeric' });
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
