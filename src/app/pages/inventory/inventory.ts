import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService, Product } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ProductModalComponent,
    ConfirmDialogComponent,],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {
  products: Product[] = [];

  // Filtros
  currentFilter = 'all';
  filters = [
    { label: 'INVENTORY.ALL_PRODUCTS', value: 'all' },
    { label: 'INVENTORY.LOW_STOCK', value: 'low_stock' },
    { label: 'INVENTORY.OUT_OF_STOCK', value: 'out_of_stock' },
    { label: 'INVENTORY.IN_STOCK', value: 'in_stock' }
  ];

  // Búsqueda
  searchTerm = '';
  searchTimeout: any;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;
  isLoading = true;

  // Modales
  isProductModalOpen = false;
  selectedProductId?: number;
  isConfirmDialogOpen = false;
  productToDelete?: number;
  isDeletingProduct = false;

  // Menú de acciones
  openMenuId: number | null = null;

  // Para template
  Math = Math;

  constructor(
    private productService: ProductService,
    private translate: TranslateService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    this.loadProducts();
  }

  loadProducts() {
    console.log('🔄 loadProducts() called with filters:', {
      currentFilter: this.currentFilter,
      searchTerm: this.searchTerm,
      currentPage: this.currentPage,
      pageSize: this.pageSize
    });

    this.isLoading = true;

    const filters: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.currentFilter !== 'all') filters.stockStatus = this.currentFilter;

    console.log('📡 Calling API with filters:', filters);

    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        console.log('✅ API Response received:', response);

        // Convertir price_cost y price_sale de string a number (Prisma Decimal issue)
        this.products = response.data.map(product => ({
          ...product,
          price_cost: Number(product.price_cost),
          price_sale: Number(product.price_sale)
        }));

        this.totalProducts = response.meta.total;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;

        console.log('Products loaded:', this.products.length);
        console.log('isLoading set to:', this.isLoading);
        console.log('Products array:', this.products);

        // Forzar detección de cambios
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.loadProducts();
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 500);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  getPaginationPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }

      pages.push(this.totalPages);
    }

    return pages;
  }

  // Modal methods
  openNewProductModal() {
    this.selectedProductId = undefined;
    this.isProductModalOpen = true;
  }

  openEditProductModal(productId: number) {
    this.selectedProductId = productId;
    this.isProductModalOpen = true;
    this.openMenuId = null;
  }

  closeProductModal() {
    this.isProductModalOpen = false;
    this.selectedProductId = undefined;
  }

  onProductSaved(product: Product) {
    this.closeProductModal();
    this.loadProducts(); // Refrescar tabla
  }

  // Delete methods
  confirmDelete(productId: number) {
    this.productToDelete = productId;
    this.isConfirmDialogOpen = true;
    this.openMenuId = null;
  }

  cancelDelete() {
    this.isConfirmDialogOpen = false;
    this.productToDelete = undefined;
  }

  executeDelete() {
    if (!this.productToDelete) return;

    this.isDeletingProduct = true;
    this.productService.deleteProduct(this.productToDelete).subscribe({
      next: () => {
        this.toastService.success('Producto eliminado correctamente');
        this.isConfirmDialogOpen = false;
        this.productToDelete = undefined;
        this.isDeletingProduct = false;
        this.loadProducts(); // Refrescar tabla
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.toastService.error('Error al eliminar el producto');
        this.isDeletingProduct = false;
      }
    });
  }

  // Actions menu
  toggleMenu(productId: number, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === productId ? null : productId;
  }

  closeMenu() {
    this.openMenuId = null;
  }
}
