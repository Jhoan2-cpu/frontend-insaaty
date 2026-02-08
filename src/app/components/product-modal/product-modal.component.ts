import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, Product, CreateProductDto } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-product-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './product-modal.component.html',
    styleUrl: './product-modal.component.css'
})
export class ProductModalComponent implements OnInit {
    @Input() productId?: number;
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<Product>();

    productForm!: FormGroup;
    isLoading = false;
    isEditMode = false;
    margin = 0;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.initForm();

        if (this.productId) {
            this.isEditMode = true;
            this.loadProduct();
        }
    }

    initForm() {
        this.productForm = this.fb.group({
            sku: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-]+$/)]],
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            price_cost: [0, [Validators.required, Validators.min(0)]],
            price_sale: [0, [Validators.required, Validators.min(0)]],
            min_stock: [10, [Validators.required, Validators.min(0)]],
            current_stock: [0, [Validators.required, Validators.min(0)]]
        });

        // Calcular margen automáticamente
        this.productForm.valueChanges.subscribe(values => {
            if (values.price_sale > 0 && values.price_cost > 0) {
                this.margin = ((values.price_sale - values.price_cost) / values.price_cost) * 100;
            } else {
                this.margin = 0;
            }
        });
    }

    loadProduct() {
        if (!this.productId) return;

        this.isLoading = true;
        this.productService.getProduct(this.productId).subscribe({
            next: (product) => {
                this.productForm.patchValue(product);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading product:', error);
                this.toastService.error('Error al cargar el producto');
                this.isLoading = false;
                this.onClose();
            }
        });
    }

    onSubmit() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const productData: CreateProductDto = this.productForm.value;

        const request = this.isEditMode && this.productId
            ? this.productService.updateProduct(this.productId, productData)
            : this.productService.createProduct(productData);

        request.subscribe({
            next: (product) => {
                this.toastService.success(
                    this.isEditMode ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
                );
                this.saved.emit(product);
                this.onClose();
            },
            error: (error) => {
                console.error('Error saving product:', error);
                const message = error.error?.message || 'Error al guardar el producto';
                this.toastService.error(message);
                this.isLoading = false;
            }
        });
    }

    onClose() {
        this.close.emit();
        this.productForm.reset();
        this.isEditMode = false;
        this.productId = undefined;
    }

    get f() {
        return this.productForm.controls;
    }
}
