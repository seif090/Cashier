import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category, CreateCategoryRequest } from '../../models/category.models';

@Component({
  selector: 'app-categories-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="management-container" dir="rtl">
      <header class="management-header">
        <h1 class="headline-sm text-primary">إدارة التصنيفات</h1>
        <button class="btn btn-primary" (click)="showAddForm = !showAddForm">إضافة تصنيف</button>
      </header>

      <div class="add-form card" *ngIf="showAddForm">
        <form [formGroup]="categoryForm" (ngSubmit)="addCategory()" class="form-grid">
          <div class="form-group">
            <label class="label-sm">الاسم (عربي)</label>
            <input formControlName="nameAr" class="input" />
          </div>
          <div class="form-group">
            <label class="label-sm">الاسم (إنجليزي)</label>
            <input formControlName="name" class="input" />
          </div>
          <div class="form-group">
            <label class="label-sm">اللون</label>
            <input formControlName="color" type="color" class="input" />
          </div>
          <button type="submit" class="btn btn-primary">حفظ</button>
        </form>
      </div>

      <div class="categories-grid">
        <div *ngFor="let category of categories()" class="category-card" [style.border-right]="'4px solid ' + category.color">
          <h3 class="title-md">{{ category.nameAr }}</h3>
          <p class="body-md text-on-surface-variant">{{ category.name }}</p>
          <p class="label-sm">{{ category.productCount }} منتج</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .management-container { padding: var(--spacing-2xl); background: var(--surface); min-height: 100vh; }
    .management-header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-xl); }
    .add-form { margin-bottom: var(--spacing-xl); }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md); }
    .form-group { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--spacing-lg); }
    .category-card { background: var(--surface-container-lowest); padding: var(--spacing-xl); border-radius: var(--radius-xl); }
  `]
})
export class CategoriesManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  showAddForm = false;
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      nameAr: [''],
      name: [''],
      color: ['#00236f']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(res => this.categories.set(res));
  }

  addCategory(): void {
    if (this.categoryForm.invalid) return;
    
    const request: CreateCategoryRequest = {
      ...this.categoryForm.value,
      isActive: true,
      sortOrder: 0
    };

    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.showAddForm = false;
        this.loadCategories();
      }
    });
  }
}
