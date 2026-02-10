import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService, Order, OrderStatus, CreateOrderDto, UpdateOrderDto } from '../../services/order.service';
import { ProductService, Product } from '../../services/product.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];

  // Filtros
  currentFilter: OrderStatus | 'all' = 'all';
  filters = [
    { label: 'ORDERS.ALL', value: 'all' },
    { label: 'ORDERS.STATUSES.PENDING', value: 'PENDING' },
    { label: 'ORDERS.STATUSES.PROCESSING', value: 'PROCESSING' },
    { label: 'ORDERS.STATUSES.COMPLETED', value: 'COMPLETED' },
    { label: 'ORDERS.STATUSES.CANCELLED', value: 'CANCELLED' },
  ];

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalOrders = 0;
  totalPages = 0;
  isLoading = true;

  // Formulario inline
  showOrderForm = false;
  orderForm!: FormGroup;
  isSaving = false;

  // Items temporales del pedido
  temporaryItems: Array<{ product: Product, quantity: number, subtotal: number }> = [];
  totalAmount = 0;

  // Ver detalle
  selectedOrder?: Order;
  showDetailModal = false;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.loadOrders();
    this.initOrderForm();
  }

  initOrderForm() {
    this.orderForm = this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  loadOrders() {
    this.isLoading = true;
    const status = this.currentFilter === 'all' ? undefined : this.currentFilter as OrderStatus;

    this.orderService.getOrders({
      page: this.currentPage,
      limit: this.pageSize,
      status: status
    }).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.totalOrders = response.meta.total;
        this.totalPages = response.meta.last_page;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleOrderForm() {
    this.showOrderForm = !this.showOrderForm;
    if (this.showOrderForm) {
      this.temporaryItems = [];
      this.totalAmount = 0;
      this.initOrderForm();
      this.loadProducts();
    }
  }

  loadProducts() {
    this.productService.getProducts({ page: 1, limit: 100 }).subscribe({
      next: (response) => {
        this.products = response.data.filter(p => p.current_stock > 0);
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  addItem() {
    const productId = this.orderForm.get('product_id')?.value;
    const quantity = this.orderForm.get('quantity')?.value;

    if (!productId || !quantity) return;

    const product = this.products.find(p => p.id === parseInt(productId));
    if (!product) return;

    if (quantity > product.current_stock) {
      alert(`Stock insuficiente. Disponible: ${product.current_stock}`);
      return;
    }

    const existingItem = this.temporaryItems.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * Number(product.price_sale);
    } else {
      this.temporaryItems.push({
        product: product,
        quantity: quantity,
        subtotal: quantity * Number(product.price_sale)
      });
    }

    this.calculateTotal();
    this.orderForm.patchValue({ product_id: '', quantity: 1 });
  }

  removeItem(index: number) {
    this.temporaryItems.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.temporaryItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  saveOrder() {
    if (this.temporaryItems.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    this.isSaving = true;
    const dto: CreateOrderDto = {
      items: this.temporaryItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      })),
      notes: this.orderForm.get('notes')?.value || undefined
    };

    this.orderService.createOrder(dto).subscribe({
      next: () => {
        console.log('✓ Order created');
        this.isSaving = false;
        this.showOrderForm = false;
        this.temporaryItems = [];
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert(error.error?.message || 'Error al crear el pedido');
        this.isSaving = false;
      }
    });
  }

  viewDetail(order: Order) {
    this.selectedOrder = order;
    this.showDetailModal = true;
  }

  closeDetail() {
    this.showDetailModal = false;
    this.selectedOrder = undefined;
  }

  processOrder() {
    if (!this.selectedOrder) return;
    this.changeStatus(this.selectedOrder.id, OrderStatus.PROCESSING);
  }

  completeOrder() {
    if (!this.selectedOrder) return;
    this.changeStatus(this.selectedOrder.id, OrderStatus.COMPLETED);
  }

  cancelOrder() {
    if (!this.selectedOrder) return;
    this.changeStatus(this.selectedOrder.id, OrderStatus.CANCELLED);
  }

  changeStatus(orderId: number, newStatus: OrderStatus) {
    if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;

    this.orderService.updateStatus(orderId, { status: newStatus }).subscribe({
      next: () => {
        console.log('✓ Status updated');
        this.loadOrders();
        if (this.selectedOrder?.id === orderId) {
          this.closeDetail();
        }
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert(error.error?.message || 'Error al cambiar el estado');
      }
    });
  }

  applyFilter(filter: string) {
    this.currentFilter = filter as OrderStatus | 'all';
    this.currentPage = 1;
    this.loadOrders();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  getStatusClass(status: OrderStatus): string {
    const classes = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return classes[status];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
