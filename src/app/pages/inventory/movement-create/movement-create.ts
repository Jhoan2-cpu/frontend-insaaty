import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InventoryService, TransactionType } from '../../../services/inventory.service';
import { ProductService, Product } from '../../../services/product.service';
import { TitleService } from '../../../services/title.service';
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

    showProductDropdown = false;
    private intervalId: any;
    private returnUrl: string = '/inventory/transactions';

    constructor(
        private fb: FormBuilder,
        private inventoryService: InventoryService,
        private productService: ProductService,
        private toast: ToastService,
        private translate: TranslateService,
        private router: Router,
        private titleService: TitleService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            type: [TransactionType.IN, Validators.required],
            product_id: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            reason: ['', Validators.required]
        });

        // Capture returnUrl
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/inventory/transactions';
    }

    startIncrement() {
        this.increment();
        this.intervalId = setInterval(() => {
            this.increment();
        }, 100);
    }

    startDecrement() {
        this.decrement();
        this.intervalId = setInterval(() => {
            this.decrement();
        }, 100);
    }

    stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    increment() {
        const current = Number(this.form.get('quantity')?.value) || 0;
        this.form.patchValue({ quantity: current + 1 });
        this.cdr.markForCheck();
    }

    decrement() {
        const current = Number(this.form.get('quantity')?.value) || 0;
        if (current > 1) {
            this.form.patchValue({ quantity: current - 1 });
            this.cdr.markForCheck();
        }
    }

    toggleProductDropdown() {
        this.showProductDropdown = !this.showProductDropdown;
    }

    selectProduct(product: Product) {
        this.form.patchValue({ product_id: product.id });
        this.showProductDropdown = false;
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
                this.router.navigate([this.returnUrl]);
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
        const qty = Number(this.form.get('quantity')?.value) || 0;
        const type = this.form.get('type')?.value;

        switch (type) {
            case TransactionType.IN:
                return current + qty;
            case TransactionType.OUT:
                return current - qty;
            case TransactionType.ADJUSTMENT:
                return qty;
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



    cancel() {
        this.router.navigate([this.returnUrl]);
    }
}
