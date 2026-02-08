import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      @for (toast of toasts$ | async; track toast.id) {
        <div 
          [class]="getToastClass(toast.type)"
          class="rounded-lg shadow-lg p-4 flex items-start gap-3 animate__animated animate__fadeInRight">
          <i [class]="getIconClass(toast.type)" class="text-xl"></i>
          <div class="flex-1">
            <p class="text-sm font-medium">{{toast.message}}</p>
          </div>
          <button 
            (click)="remove(toast.id)"
            class="text-current opacity-70 hover:opacity-100 transition-opacity">
            <i class="fas fa-times"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate__fadeInRight {
      animation: fadeInRight 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts$ = this.toastService.toasts;

  getToastClass(type: Toast['type']): string {
    const classes = {
      success: 'bg-green-50 text-green-800 border border-green-200',
      error: 'bg-red-50 text-red-800 border border-red-200',
      warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200'
    };
    return classes[type];
  }

  getIconClass(type: Toast['type']): string {
    const icons = {
      success: 'fas fa-check-circle text-green-600',
      error: 'fas fa-exclamation-circle text-red-600',
      warning: 'fas fa-exclamation-triangle text-yellow-600',
      info: 'fas fa-info-circle text-blue-600'
    };
    return icons[type];
  }

  remove(id: string) {
    this.toastService.remove(id);
  }
}
