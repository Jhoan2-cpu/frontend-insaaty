import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InventoryService, TransactionType } from '../../../services/inventory.service';
import { ProductService, Product } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-movement-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
    templateUrl: './movement-create.html'
})
export class MovementCreate implements OnInit {
    form: FormGroup;
    isSaving = false;
    isLoadingProducts = true;
    products: Product[] = [];
    TransactionType = TransactionType;

    constructor(
        private fb: FormBuilder,
        private inventoryService: InventoryService,
        private productService: ProductService,
        private toast: ToastService,
        private translate: TranslateService,
        private router: Router
    ) {
        this.form = this.fb.group({
            type: [TransactionType.IN, Validators.required],
            product_id: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            reason: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.isLoadingProducts = true;
        // Load all products for the dropdown (pagination might be an issue if too many, but for now load 100)
        // Ideally we should have a search or autocomplete. For this phase, just load first 100.
        this.productService.getProducts({ page: 1, limit: 100 }).subscribe({
            next: (res) => {
                this.products = res.data;
                this.isLoadingProducts = false;
            },
            error: (err) => {
                console.error('Error loading products for movement:', err);
                this.toast.error('Error loading products');
                this.isLoadingProducts = false;
            }
        });
    }

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formValue = this.form.value;

        this.inventoryService.createTransaction({
            product_id: parseInt(formValue.product_id),
            type: formValue.type,
            quantity: formValue.quantity,
            reason: formValue.reason
        }).subscribe({
            next: () => {
                this.toast.success(this.translate.instant('INVENTORY.MOVEMENT_SUCCESS'));
                this.router.navigate(['/inventory/transactions']);
                this.isSaving = false;
            },
            error: (err) => {
                this.toast.error(err.error?.message || this.translate.instant('INVENTORY.MOVEMENT_ERROR'));
                this.isSaving = false;
            }
        });
    }

    cancel() {
        this.router.navigate(['/inventory']);
    }
}
