import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, CreateProductRequest } from '../../models/product.models';
import { Category } from '../../models/category.models';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="management-container" dir="rtl">
      <header class="management-header">
        <h1 class="headline-sm text-primary">إدارة المنتجات</h1>
        <button class="btn btn-primary" (click)="showAddForm = !showAddForm">
          <span>{{ showAddForm ? 'إلغاء' : 'إضافة منتج جديد' }}</span>
        </button>
      </header>

      <div class="add-form card" *ngIf="showAddForm">
        <h2 class="title-md text-primary mb-lg">إضافة منتج جديد</h2>
        <form [formGroup]="productForm" (ngSubmit)="addProduct()" class="form-grid">
          <div class="form-group">
            <label class="label-sm">SKU</label>
            <input formControlName="sku" class="input" placeholder="SKU" />
          </div>
          <div class="form-group">
            <label class="label-sm">الاسم (عربي)</label>
            <input formControlName="nameAr" class="input" placeholder="الاسم بالعربية" />
          </div>
          <div class="form-group">
            <label class="label-sm">الاسم (إنجليزي)</label>
            <input formControlName="name" class="input" placeholder="Name in English" />
          </div>
          <div class="form-group">
            <label class="label-sm">التصنيف</label>
            <select formControlName="categoryId" class="input">
              <option value="">اختر التصنيف</option>
              <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.nameAr }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label-sm">السعر</label>
            <input formControlName="price" type="number" class="input" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label class="label-sm">الكمية</label>
            <input formControlName="stockQuantity" type="number" class="input" placeholder="0" />
          </div>
          <button type="submit" class="btn btn-primary col-span-2">حفظ المنتج</button>
        </form>
      </div>

      <div class="products-table">
        <div class="table-header">
          <span>SKU</span>
          <span>الاسم</span>
          <span>التصنيف</span>
          <span>السعر</span>
          <span>المخزون</span>
          <span>الإجراءات</span>
        </div>
        <div *ngFor="let product of products()" class="table-row">
          <span>{{ product.sku }}</span>
          <span>{{ product.nameAr }}</span>
          <span>{{ product.categoryNameAr }}</span>
          <span>{{ product.price | number:'1.2-2' }} ر.س</span>
          <span>{{ product.stockQuantity }}</span>
          <span>
            <button class="btn-icon" (click)="deleteProduct(product.id)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--error)">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/>
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .management-container { padding: var(--spacing-2xl); background: var(--surface); min-height: 100vh; }
    .management-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl); }
    .add-form { margin-bottom: var(--spacing-xl); }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md); }
    .form-group { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .col-span-2 { grid-column: span 2; }
    .mb-lg { margin-bottom: var(--spacing-lg); }
    .products-table { background: var(--surface-container-lowest); border-radius: var(--radius-xl); overflow: hidden; }
    .table-header, .table-row { display: grid; grid-template-columns: 100px 2fr 1fr 100px 100px 80px; padding: var(--spacing-md); align-items: center; }
    .table-header { background: var(--surface-container-high); font-weight: 600; }
    .table-row { border-bottom: 8px solid var(--surface); }
    .table-row:last-child { border-bottom: none; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: var(--spacing-sm); }
  `]
})
export class ProductsManagementComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  showAddForm = false;
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      sku: [''],
      nameAr: [''],
      name: [''],
      categoryId: [''],
      price: [0],
      stockQuantity: [0]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getProducts({ pageNumber: 1, pageSize: 100, sortBy: 'name', sortDescending: false })
      .subscribe(res => this.products.set(res.items));
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(res => this.categories.set(res));
  }

  addProduct(): void {
    if (this.productForm.invalid) return;
    
    const request: CreateProductRequest = {
      ...this.productForm.value,
      isActive: true,
      sortOrder: 0,
      taxRate: 15,
      minStockLevel: 0
    };

    this.productService.createProduct(request).subscribe({
      next: () => {
        this.showAddForm = false;
        this.loadProducts();
      },
      error: (error) => console.error('Failed to create product', error)
    });
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
  }
}
