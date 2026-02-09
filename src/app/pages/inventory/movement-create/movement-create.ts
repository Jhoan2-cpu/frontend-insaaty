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
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
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

    get selectedProduct(): Product | undefined {
        const id = this.form.get('product_id')?.value;
        const product = this.products.find(p => p.id == id);
        // Ensure current_stock is a number
        if (product) {
            product.current_stock = Number(product.current_stock);
        }
        return product;
    }

    get projectedStock(): number {
        const product = this.selectedProduct;
        if (!product) return 0;

        const current = Number(product.current_stock) || 0;
        const qty = this.form.get('quantity')?.value || 0;
        const type = this.form.get('type')?.value;

        switch (type) {
            case TransactionType.IN:
                return current + qty;
            case TransactionType.OUT:
                return current - qty;
            case TransactionType.ADJUSTMENT:
                // Assuming adjustment adds for visualization if positive input
                return current + qty;
        }
        return current;
    }

    get maxStock(): number {
        const current = this.selectedProduct?.current_stock || 0;
        const projected = this.projectedStock;
        return Math.max(Number(current), projected);
    }

    getBarHeight(value: number): number {
        const max = this.maxStock;
        if (max === 0) return 0;
        // Scale to 80% max height + 10% base
        return (value / max) * 80 + 10;
    }

    incrementQty() {
        const current = this.form.get('quantity')?.value || 0;
        this.form.patchValue({ quantity: current + 1 });
    }

    decrementQty() {
        const current = this.form.get('quantity')?.value || 0;
        if (current > 1) {
            this.form.patchValue({ quantity: current - 1 });
        }
    }

    cancel() {
        this.router.navigate(['/inventory']);
    }
}
