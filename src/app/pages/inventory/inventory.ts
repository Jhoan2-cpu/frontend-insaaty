import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService, Product, CreateProductDto } from '../../services/product.service';
import { SuppliersService, Supplier } from '../../services/suppliers.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterLink
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {
  products: Product[] = [];
  suppliers: Supplier[] = [];

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

  // Formulario Inline (Acordeón)
  showProductForm = false;
  productForm!: FormGroup;
  isEditMode = false;
  editingProductId?: number;
  isSaving = false;
  margin = 0;

  // Menú de acciones
  openMenuId: number | null = null;


  // Para template
  Math = Math;

  constructor(
    private productService: ProductService,
    private suppliersService: SuppliersService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    this.loadProducts();
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.suppliersService.getSuppliers({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        this.suppliers = res.data;
      },
      error: (err) => console.error('Error loading suppliers', err)
    });
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

  // Form methods
  initProductForm() {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price_cost: [0, [Validators.required, Validators.min(0.01)]],
      price_sale: [0, [Validators.required, Validators.min(0.01)]],
      min_stock: [10, [Validators.min(0)]],
      current_stock: [{ value: 0, disabled: this.isEditMode }, [Validators.min(0)]],
      supplier_id: [null]
    });

    // Auto-calculate margin
    this.productForm.get('price_cost')?.valueChanges.subscribe(() => this.calculateMargin());
    this.productForm.get('price_sale')?.valueChanges.subscribe(() => this.calculateMargin());
  }

  calculateMargin() {
    const cost = this.productForm.get('price_cost')?.value || 0;
    const sale = this.productForm.get('price_sale')?.value || 0;
    if (cost > 0) {
      this.margin = ((sale - cost) / cost) * 100;
    } else {
      this.margin = 0;
    }
  }

  toggleProductForm() {
    this.showProductForm = !this.showProductForm;
    if (this.showProductForm) {
      this.isEditMode = false;
      this.editingProductId = undefined;
      this.initProductForm();
    }
  }

  editProduct(productId: number) {
    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.showProductForm = true;
        this.isEditMode = true;
        this.editingProductId = productId;
        this.initProductForm();

        this.productForm.patchValue({
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          price_cost: product.price_cost,
          price_sale: product.price_sale,
          min_stock: product.min_stock,
          current_stock: product.current_stock,
          supplier_id: product.supplier_id
        });
        this.calculateMargin();
        this.openMenuId = null;
      },
      error: (error) => {
        console.error('Error loading product:', error);
      }
    });
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.productForm.getRawValue();
    const dto: CreateProductDto = {
      sku: formValue.sku,
      name: formValue.name,
      description: formValue.description,
      price_cost: formValue.price_cost,
      price_sale: formValue.price_sale,
      min_stock: formValue.min_stock,
      current_stock: formValue.current_stock,
      supplier_id: formValue.supplier_id ? Number(formValue.supplier_id) : undefined
    };

    const request$ = this.isEditMode && this.editingProductId
      ? this.productService.updateProduct(this.editingProductId, dto)
      : this.productService.createProduct(dto);

    request$.subscribe({
      next: () => {
        console.log('✓ Product saved successfully');
        this.isSaving = false;
        this.showProductForm = false;
        this.loadProducts();
      },
      error: (error) => {
        console.error('❌ Error saving product:', error);
        this.isSaving = false;
      }
    });
  }

  deleteProduct(productId: number) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        console.log('✓ Product deleted');
        this.openMenuId = null;
        this.loadProducts();
      },
      error: (error) => {
        console.error('❌ Error deleting product:', error);
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
