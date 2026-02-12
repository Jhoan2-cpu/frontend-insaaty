
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService, Order, OrderStatus } from '../../../services/order.service';
import { TitleService } from '../../../services/title.service';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterModule],
    templateUrl: './order-detail.html'
})
export class OrderDetail implements OnInit {
    order?: Order;
    isLoading = true;
    isSaving = false;
    errorMessage: string | null = null;
    OrderStatus = OrderStatus;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private orderService: OrderService,
        private titleService: TitleService
    ) { }

    ngOnInit() {
        this.titleService.setTitle('ORDERS.DETAIL.TITLE');
        const id = this.route.snapshot.paramMap.get('id');
        console.log('OrderDetail initialized with ID:', id);
        if (id) {
            this.loadOrder(Number(id));
        } else {
            console.warn('No ID found in route, redirecting to orders');
            this.router.navigate(['/orders']);
        }
    }

    loadOrder(id: number) {
        this.isLoading = true;
        this.errorMessage = null;
        console.log('Loading order...', id);

        this.orderService.getOrder(id).subscribe({
            next: (order) => {
                console.log('Order loaded:', order);
                this.order = order;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading order:', error);
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Error al cargar el pedido';
            }
        });
    }

    getStatusClass(status: OrderStatus): string {
        switch (status) {
            case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-800 border border-blue-200';
            case OrderStatus.COMPLETED: return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    }

    updateStatus(status: OrderStatus) {
        if (!this.order) return;
        this.isSaving = true;
        this.orderService.updateStatus(this.order.id, { status }).subscribe({
            next: (updatedOrder) => {
                this.order = updatedOrder;
                this.isSaving = false;
            },
            error: (error) => {
                console.error('Error updating status:', error);
                this.isSaving = false;
            }
        });
    }

    deleteOrder() {
        if (!this.order || !confirm('Are you sure you want to delete this order?')) return;
        this.isSaving = true;
        this.orderService.remove(this.order.id).subscribe({
            next: () => {
                this.router.navigate(['/orders']);
            },
            error: (error) => {
                console.error('Error deleting order:', error);
                this.isSaving = false;
            }
        });
    }
}
