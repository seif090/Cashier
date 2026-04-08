import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.models';
import { Category } from '../../models/category.models';
import { CartItem } from '../../models/order.models';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="pos-container" dir="rtl">
      <!-- Right Sidebar - Navigation -->
      <aside class="nav-sidebar">
        <div class="nav-header">
          <h2 class="title-md text-primary">Architect POS</h2>
        </div>

        <div class="branch-info">
          <div class="branch-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 21V8L12 3L21 8V21H15V13H9V21H3Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p class="title-sm text-primary">Main Branch</p>
            <p class="label-sm text-on-surface-variant">Terminal 01</p>
          </div>
        </div>

        <nav class="nav-menu">
          <button class="nav-item active">
            <span>المبيعات</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18H5V6H7V18ZM13 18H11V6H13V18ZM19 18H17V6H19V18Z"/>
            </svg>
          </button>
          <button class="nav-item" (click)="navigateTo('/dashboard')">
            <span>لوحة التحكم</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"/>
            </svg>
          </button>
          <button class="nav-item" (click)="navigateTo('/products')">
            <span>المخزون</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 13H4V6L12 2L20 6V13ZM20 15V20H4V15H20Z"/>
            </svg>
          </button>
          <button class="nav-item" (click)="navigateTo('/orders')">
            <span>التقارير</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 9.2H3V19H19V9.2H17V17H5V9.2ZM21 7V5H3V7H21Z"/>
            </svg>
          </button>
        </nav>

        <div class="nav-footer">
          <button class="btn-new-transaction" (click)="newTransaction()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"/>
            </svg>
            <span>New Transaction</span>
          </button>

          <button class="btn-logout" (click)="logout()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content - Product Grid -->
      <main class="main-content">
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="search-container">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              placeholder="ابحث عن منتج أو باركود..."
              [formGroup]="searchForm"
              formControlName="search"
            />
          </div>

          <nav class="top-nav">
            <a class="nav-link" (click)="navigateTo('/dashboard')">Dashboard</a>
            <a class="nav-link" (click)="navigateTo('/products')">Inventory</a>
            <a class="nav-link" (click)="navigateTo('/orders')">Reports</a>
          </nav>
        </header>

        <!-- Category Filter -->
        <div class="category-filter">
          <button 
            *ngFor="let category of categories()" 
            class="category-btn"
            [class.active]="selectedCategory() === category.id"
            (click)="selectCategory(category.id)"
          >
            {{ category.nameAr }}
          </button>
        </div>

        <!-- Products Grid -->
        <div class="products-grid">
          <div 
            *ngFor="let product of filteredProducts()" 
            class="product-card"
            (click)="addToCart(product)"
          >
            <div class="product-image" [style.background-image]="'url(' + (product.imageUrl || '/assets/images/placeholder.jpg') + ')'">
            </div>
            <div class="product-info">
              <h3 class="title-md">{{ product.nameAr }}</h3>
              <div class="product-meta">
                <span class="label-sm text-on-surface-variant">SKU: {{ product.sku }}</span>
                <div class="product-price">
                  <span class="title-sm text-secondary">{{ product.price | number:'1.2-2' }}</span>
                  <span class="label-sm text-secondary">ر.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Left Sidebar - Cart & Checkout -->
      <aside class="cart-sidebar">
        <div class="cart-header">
          <h2 class="headline-sm text-primary">الطلبات الحالية</h2>
          <button class="btn-clear-cart" (click)="clearCart()" *ngIf="cartItems().length > 0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/>
            </svg>
            <span>مسح الكل</span>
          </button>
        </div>

        <div class="cart-items" *ngIf="cartItems().length > 0; else emptyCart">
          <div *ngFor="let item of cartItems()" class="cart-item">
            <div class="cart-item-image" [style.background-image]="'url(' + (item.imageUrl || '/assets/images/placeholder.jpg') + ')'">
            </div>
            <div class="cart-item-details">
              <h4 class="title-sm">{{ item.productNameAr }}</h4>
              <p class="label-sm text-on-surface-variant">{{ item.unitPrice | number:'1.2-2' }} ر.س</p>
            </div>
            <div class="cart-item-actions">
              <button class="qty-btn" (click)="updateQuantity(item.productId, item.quantity - 1)">-</button>
              <span class="qty-display">{{ item.quantity }}</span>
              <button class="qty-btn" (click)="updateQuantity(item.productId, item.quantity + 1)">+</button>
            </div>
          </div>
        </div>

        <ng-template #emptyCart>
          <div class="empty-cart">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--outline-variant)">
              <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22S8.99 21.1 8.99 20C8.99 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.29 15 7.19 14.9 7.19 14.78L7.38 14.43L16.79 4H9.5L8.15 7.17L6.11 2H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22S18.99 21.1 18.99 20C18.99 18.9 18.1 18 17 18Z"/>
            </svg>
            <p class="body-md text-on-surface-variant">لا توجد منتجات في السلة</p>
          </div>
        </ng-template>

        <!-- Cart Totals -->
        <div class="cart-totals" *ngIf="cartItems().length > 0">
          <div class="total-row">
            <span class="body-md text-on-surface-variant">المجموع الفرعي</span>
            <span class="body-md">{{ cartTotal().subTotal | number:'1.2-2' }} ر.س</span>
          </div>
          <div class="total-row">
            <span class="body-md text-on-surface-variant">الضريبة (15%)</span>
            <span class="body-md">{{ cartTotal().taxAmount | number:'1.2-2' }} ر.س</span>
          </div>
          <div class="total-row grand-total">
            <span class="headline-sm text-primary">الإجمالي</span>
            <span class="display-sm text-primary">{{ cartTotal().total | number:'1.2-2' }} ر.س</span>
          </div>
        </div>

        <!-- Numeric Keypad -->
        <div class="keypad" *ngIf="cartItems().length > 0">
          <div class="keypad-row">
            <button class="key" (click)="keypadPress('1')">1</button>
            <button class="key" (click)="keypadPress('2')">2</button>
            <button class="key" (click)="keypadPress('3')">3</button>
          </div>
          <div class="keypad-row">
            <button class="key" (click)="keypadPress('4')">4</button>
            <button class="key" (click)="keypadPress('5')">5</button>
            <button class="key" (click)="keypadPress('6')">6</button>
          </div>
          <div class="keypad-row">
            <button class="key" (click)="keypadPress('7')">7</button>
            <button class="key" (click)="keypadPress('8')">8</button>
            <button class="key" (click)="keypadPress('9')">9</button>
          </div>
          <div class="keypad-row">
            <button class="key key-discount" (click)="applyDiscount()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7.5L16.5 10L18 11.5L20.5 9L19 7.5ZM15 5L13.5 6.5L17.5 10.5L19 9L15 5ZM11.5 8L10 9.5L14 13.5L15.5 12L11.5 8ZM3 17.5L1.5 19L5.5 23L7 21.5L3 17.5ZM7 5L3 9L4.5 10.5L8.5 6.5L7 5ZM11 13L9.5 14.5L13.5 18.5L15 17L11 13Z"/>
              </svg>
            </button>
            <button class="key" (click)="keypadPress('0')">0</button>
            <button class="key key-clear" (click)="clearKeypad()">C</button>
          </div>
        </div>

        <!-- Payment Buttons -->
        <div class="payment-buttons" *ngIf="cartItems().length > 0">
          <button class="btn btn-secondary btn-hold" (click)="holdOrder()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8H5C3.9 8 3 8.9 3 10V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16V10C21 8.9 20.1 8 19 8ZM19 16H5V10H19V16ZM17 12H7V14H17V12Z"/>
            </svg>
            <span>تعليق</span>
          </button>
          <button class="btn btn-primary btn-pay" (click)="processPayment()">
            <span>ادفع الآن</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/>
            </svg>
          </button>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .pos-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      background-color: var(--surface);
      overflow: hidden;
    }

    /* Right Sidebar - Navigation */
    .nav-sidebar {
      width: 240px;
      min-width: 240px;
      background-color: var(--surface);
      display: flex;
      flex-direction: column;
      padding: var(--spacing-xl);
      gap: var(--spacing-xl);
    }

    .nav-header h2 {
      font-weight: 700;
      margin-bottom: var(--spacing-md);
    }

    .branch-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background-color: var(--primary);
      border-radius: var(--radius-lg);
      color: white;
    }

    .branch-icon {
      width: 40px;
      height: 40px;
      background-color: var(--primary-container);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-menu {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-lg);
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-arabic);
      font-size: var(--body-md);
      color: var(--on-surface);
      transition: all var(--transition-fast);
    }

    .nav-item:hover {
      background-color: var(--surface-container-low);
    }

    .nav-item.active {
      background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-container) 100%);
      color: var(--on-primary);
    }

    .nav-footer {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .btn-new-transaction {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background-color: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-family: var(--font-arabic);
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .btn-new-transaction:hover {
      background-color: var(--primary-container);
    }

    .btn-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-arabic);
      color: var(--error);
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .btn-logout:hover {
      background-color: var(--error-container);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg) var(--spacing-xl);
      background-color: var(--surface);
    }

    .search-container {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      right: var(--spacing-md);
      top: 50%;
      transform: translateY(-50%);
      color: var(--on-surface-variant);
    }

    .search-input {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-xl) var(--spacing-md) var(--spacing-md);
      border: none;
      border-radius: var(--radius-xl);
      background-color: var(--surface-container-low);
      font-family: var(--font-arabic);
      font-size: var(--body-md);
    }

    .search-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--primary);
    }

    .top-nav {
      display: flex;
      gap: var(--spacing-lg);
    }

    .nav-link {
      cursor: pointer;
      font-size: var(--body-md);
      color: var(--on-surface-variant);
      transition: color var(--transition-fast);
    }

    .nav-link:hover {
      color: var(--primary);
    }

    /* Category Filter */
    .category-filter {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      overflow-x: auto;
    }

    .category-btn {
      padding: var(--spacing-sm) var(--spacing-lg);
      border: none;
      border-radius: var(--radius-xl);
      background-color: var(--surface-container-low);
      font-family: var(--font-arabic);
      font-size: var(--body-md);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }

    .category-btn:hover {
      background-color: var(--surface-container);
    }

    .category-btn.active {
      background-color: var(--primary);
      color: white;
    }

    /* Products Grid */
    .products-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      overflow-y: auto;
      background-color: var(--surface-container-low);
    }

    .product-card {
      background-color: var(--surface-container-lowest);
      border-radius: var(--radius-xl);
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .product-card:hover {
      background-color: var(--primary-container);
      color: var(--on-primary);
    }

    .product-image {
      width: 100%;
      height: 140px;
      background-size: cover;
      background-position: center;
      background-color: var(--surface-container);
    }

    .product-info {
      padding: var(--spacing-md);
    }

    .product-info h3 {
      margin-bottom: var(--spacing-sm);
      font-size: var(--title-md);
    }

    .product-meta {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-xs);
    }

    /* Left Sidebar - Cart */
    .cart-sidebar {
      width: 380px;
      min-width: 380px;
      background-color: var(--surface-dim);
      display: flex;
      flex-direction: column;
      padding: var(--spacing-xl);
      gap: var(--spacing-lg);
      overflow-y: auto;
    }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-clear-cart {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-arabic);
      color: var(--error);
      font-size: var(--body-md);
    }

    .cart-items {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      overflow-y: auto;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background-color: var(--surface-container-lowest);
      border-radius: var(--radius-lg);
    }

    .cart-item-image {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-md);
      background-size: cover;
      background-position: center;
      background-color: var(--surface-container);
    }

    .cart-item-details {
      flex: 1;
    }

    .cart-item-details h4 {
      margin-bottom: var(--spacing-xs);
    }

    .cart-item-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--radius-md);
      background-color: var(--surface-container-low);
      cursor: pointer;
      font-size: var(--title-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qty-display {
      min-width: 24px;
      text-align: center;
      font-weight: 600;
    }

    .empty-cart {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
    }

    .cart-totals {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      background-color: var(--surface-container-lowest);
      border-radius: var(--radius-lg);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .grand-total {
      padding-top: var(--spacing-md);
      margin-top: var(--spacing-sm);
      border-top: 2px solid var(--surface-variant);
    }

    /* Numeric Keypad */
    .keypad {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      background-color: var(--surface-container-lowest);
      border-radius: var(--radius-xl);
    }

    .keypad-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
    }

    .key {
      padding: var(--spacing-md);
      border: none;
      border-radius: var(--radius-xl);
      background-color: var(--surface-container-highest);
      cursor: pointer;
      font-family: var(--font-numeric);
      font-size: var(--display-sm);
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .key:hover {
      background-color: var(--surface-container-high);
    }

    .key-discount {
      background-color: var(--secondary-container);
      color: var(--secondary);
    }

    .key-clear {
      background-color: var(--error-container);
      color: var(--error);
    }

    /* Payment Buttons */
    .payment-buttons {
      display: flex;
      gap: var(--spacing-md);
    }

    .btn-hold {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }

    .btn-pay {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }
  `]
})
export class POSComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // State
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  selectedCategory = signal<number | null>(null);
  searchForm: FormGroup;
  filteredProducts = signal<Product[]>([]);

  // Cart
  cartItems = this.orderService.getCartItems;
  cartTotal = this.orderService.cartTotal;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    // Subscribe to search
    this.searchForm.get('search')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.filterProducts(term);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => console.error('Failed to load categories', error)
    });
  }

  loadProducts(): void {
    this.productService.getProducts({
      pageNumber: 1,
      pageSize: 100,
      sortBy: 'sortOrder',
      sortDescending: false
    }).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.filteredProducts.set(response.items);
      },
      error: (error) => console.error('Failed to load products', error)
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.filterProducts(this.searchForm.get('search')?.value);
  }

  filterProducts(searchTerm?: string): void {
    let filtered = this.products();
    
    if (this.selectedCategory()) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategory());
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.nameAr.includes(term) ||
        p.sku.toLowerCase().includes(term)
      );
    }
    
    this.filteredProducts.set(filtered);
  }

  addToCart(product: Product): void {
    this.orderService.addToCart(product, 1);
  }

  updateQuantity(productId: number, quantity: number): void {
    this.orderService.updateCartItemQuantity(productId, quantity);
  }

  clearCart(): void {
    this.orderService.clearCart();
  }

  keypadPress(key: string): void {
    // Implement keypad functionality for discounts
    console.log('Keypad pressed:', key);
  }

  applyDiscount(): void {
    // Implement discount logic
    console.log('Apply discount');
  }

  clearKeypad(): void {
    // Clear keypad input
    console.log('Clear keypad');
  }

  holdOrder(): void {
    // Implement hold order logic
    console.log('Hold order');
  }

  processPayment(): void {
    // Process payment
    const cart = this.orderService.getCartItems();
    if (cart.length === 0) return;

    this.orderService.submitOrder('Cash', '', '01', 'main').subscribe({
      next: (order) => {
        console.log('Order created:', order);
        // Show success message and navigate to receipt
        alert('تم الدفع بنجاح!');
      },
      error: (error) => {
        console.error('Payment failed:', error);
        alert('فشل الدفع. حاول مرة أخرى.');
      }
    });
  }

  newTransaction(): void {
    this.orderService.clearCart();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.orderService.clearCart();
    // Inject AuthService properly
    const authService = inject<any>(null as any);
    // For now, just navigate to login
    this.router.navigate(['/login']);
  }
}
