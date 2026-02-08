import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {
  products: Product[] = [];
  isLoading = false;

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

  // Para template
  Math = Math;

  constructor(
    private productService: ProductService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;

    const filters: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.currentFilter !== 'all') filters.stockStatus = this.currentFilter;

    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalProducts = response.meta.total;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
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
}
