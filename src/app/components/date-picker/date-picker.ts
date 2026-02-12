import { Component, EventEmitter, Input, OnInit, Output, ElementRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './date-picker.html',
  styleUrls: ['./date-picker.css']
})
export class DatePicker implements OnInit, OnChanges {
  @Input() date: string = '';
  @Input() placeholder: string = 'Select date';
  @Output() dateChange = new EventEmitter<string>();

  isOpen = false;
  currentDate = new Date();
  currentMonth = 0;
  currentYear = 0;
  calendarDays: (number | null)[] = [];
  weekDays = ['COMMON.WEEKDAYS.SU', 'COMMON.WEEKDAYS.MO', 'COMMON.WEEKDAYS.TU', 'COMMON.WEEKDAYS.WE', 'COMMON.WEEKDAYS.TH', 'COMMON.WEEKDAYS.FR', 'COMMON.WEEKDAYS.SA'];

  pickerView: 'calendar' | 'months' = 'calendar';
  monthIndices = Array.from({ length: 12 }, (_, i) => i);

  constructor(
    private elementRef: ElementRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.initializeDate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['date'] && !changes['date'].firstChange) {
      this.initializeDate();
    }
  }

  initializeDate() {
    if (this.date) {
      // Parse date string (YYYY-MM-DD)
      const [year, month, day] = this.date.split('-').map(Number);
      this.currentDate = new Date(year, month - 1, day);
    } else {
      this.currentDate = new Date();
    }
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleCalendar() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.pickerView = 'calendar'; // Reset to calendar view on open
      this.initializeDate();
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

  selectDate(day: number | null) {
    if (!day) return;

    // Create date object (Middle of day to avoid timezone shifts)
    const selectedDate = new Date(this.currentYear, this.currentMonth, day, 12, 0, 0);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');

    this.date = `${year}-${month}-${d}`;
    this.dateChange.emit(this.date);
    this.isOpen = false;
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

  isSelected(day: number | null): boolean {
    if (!day || !this.date) return false;
    const [year, month, d] = this.date.split('-').map(Number);
    return year === this.currentYear && (month - 1) === this.currentMonth && d === day;
  }

  getMonthName(): string {
    const date = new Date(this.currentYear, this.currentMonth, 1);
    const lang = this.translate.currentLang || 'es';
    return date.toLocaleString(lang, { month: 'long', year: 'numeric' });
  }

  getMonthLabel(monthIndex: number): string {
    const date = new Date(this.currentYear, monthIndex, 1);
    const lang = this.translate.currentLang || 'es';
    return date.toLocaleString(lang, { month: 'short' });
  }

  // Helper for input display
  get formattedDate(): string {
    if (!this.date) return '';
    const [year, month, day] = this.date.split('-');
    return `${day}/${month}/${year}`;
  }
}
