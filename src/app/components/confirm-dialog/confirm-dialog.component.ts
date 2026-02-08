import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    <div *ngIf="isOpen" 
         (click)="onCancel()"
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full"
           (click)="$event.stopPropagation()">
        
        <!-- Icon -->
        <div class="p-6 text-center">
          <div class="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <i class="fas fa-exclamation-triangle text-3xl text-red-600"></i>
          </div>
          
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ title }}
          </h3>
          <p class="text-gray-600">
            {{ message }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 px-6 pb-6">
          <button 
            (click)="onCancel()"
            [disabled]="isLoading"
            class="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50">
            {{ cancelText || ('CONFIRM_DIALOG.CANCEL' | translate) }}
          </button>
          <button 
            (click)="onConfirm()"
            [disabled]="isLoading"
            class="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            <i *ngIf="isLoading" class="fas fa-spinner fa-spin"></i>
            <span>{{ confirmText || ('CONFIRM_DIALOG.CONFIRM' | translate) }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate__fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
  `]
})
export class ConfirmDialogComponent {
    @Input() isOpen = false;
    @Input() title = '';
    @Input() message = '';
    @Input() confirmText = '';
    @Input() cancelText = '';
    @Input() isLoading = false;

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
