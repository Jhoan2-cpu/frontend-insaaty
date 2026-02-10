import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { SuppliersService, Supplier, SuppliersResponse } from '../../services/suppliers.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.css']
})
export class Suppliers implements OnInit {
  suppliers: Supplier[] = [];
  showForm = false;
  isEditing = false;
  currentSupplier: Partial<Supplier> = {};
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Loading states
  isLoading = false;
  isSubmitting = false;

  constructor(
    private suppliersService: SuppliersService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.loadSuppliers();

    // Check for query params
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        this.openCreateForm();
      }
    });
  }

  loadSuppliers() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.suppliersService.getSuppliers({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }).subscribe({
      next: (response: SuppliersResponse) => {
        this.suppliers = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading suppliers:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadSuppliers();
  }

  openCreateForm() {
    this.isEditing = false;
    this.showForm = true;
    this.currentSupplier = {};
  }

  openEditForm(supplier: Supplier) {
    this.isEditing = true;
    this.showForm = true;
    this.currentSupplier = { ...supplier };
  }

  closeForm() {
    this.showForm = false;
    this.currentSupplier = {};
    this.isEditing = false;
  }

  onSubmit() {
    if (!this.currentSupplier.name) {
      alert('Name is required');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    if (this.isEditing && this.currentSupplier.id) {
      this.suppliersService.updateSupplier(this.currentSupplier.id, this.currentSupplier).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeForm();
          this.loadSuppliers();
        },
        error: (err: any) => {
          console.error('Error updating supplier:', err);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.suppliersService.createSupplier(this.currentSupplier).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeForm();
          this.loadSuppliers();
        },
        error: (err: any) => {
          console.error('Error creating supplier:', err);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteSupplier(supplier: Supplier) {
    if (confirm(`¿Estás seguro de eliminar ${supplier.name}?`)) {
      this.suppliersService.deleteSupplier(supplier.id).subscribe({
        next: () => {
          this.loadSuppliers();
        },
        error: (err: any) => {
          console.error('Error deleting supplier:', err);
        }
      });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSuppliers();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSuppliers();
    }
  }

  get formTitle(): string {
    return this.isEditing ? 'SUPPLIERS.EDIT_SUPPLIER' : 'SUPPLIERS.NEW_SUPPLIER';
  }
}
