import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { OrderService } from '../../services/order.service';
import { CustomerService, HeldOrderService, ShiftService, DiscountService, NotificationService } from '../../services/advanced.services';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { ThemeService } from '../../services/theme.service';
import { Product } from '../../models/product.models';
import { Category } from '../../models/category.models';
import { Customer, HeldOrder, Discount } from '../../models/advanced.models';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pos-enhanced',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="pos-container" dir="rtl" [class.dark-theme]="themeService.isDark()">
      <!-- Right Sidebar - Navigation -->
      <aside class="nav-sidebar">
        <div class="nav-header">
          <h2 class="title-md text-primary">Architect POS</h2>
          <button class="theme-toggle" (click)="themeService.toggleTheme()" title="تبديل الوضع">
            {{ themeService.isDark() ? '☀️' : '🌙' }}
          </button>
        </div>

        <div class="branch-info">
          <div class="branch-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21V8L12 3L21 8V21H15V13H9V21H3Z"/></svg>
          </div>
          <div>
            <p class="title-sm text-primary">Main Branch</p>
            <p class="label-sm text-on-surface-variant">Terminal 01</p>
          </div>
        </div>

        <nav class="nav-menu">
          <button class="nav-item active">
            <span>المبيعات</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18H5V6H7V18ZM13 18H11V6H13V18ZM19 18H17V6H19V18Z"/></svg>
          </button>
          <button class="nav-item" (click)="navigateTo('/dashboard')"><span>لوحة التحكم</span>📊</button>
          <button class="nav-item" (click)="navigateTo('/products')"><span>المخزون</span>📦</button>
          <button class="nav-item" (click)="navigateTo('/customers')"><span>العملاء</span>👥</button>
          <button class="nav-item" (click)="navigateTo('/orders')"><span>التقارير</span>📈</button>
        </nav>

        <!-- Notifications Bell -->
        <div class="notifications-bell" (click)="toggleNotifications()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          <span class="notification-badge" *ngIf="unreadCount() > 0">{{ unreadCount() }}</span>
        </div>

        <div class="nav-footer">
          <button class="btn-new-transaction" (click)="newTransaction()">
            <span>➕ New Transaction</span>
          </button>
          <button class="btn-logout" (click)="logout()"><span>🚪 Logout</span></button>
        </div>
      </aside>

      <!-- Main Content - Product Grid -->
      <main class="main-content">
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="search-container">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/></svg>
            <input 
              type="text" 
              class="search-input" 
              placeholder="ابحث عن منتج أو باركود... (F2)"
              [formGroup]="searchForm"
              formControlName="search"
              #searchInput
            />
          </div>

          <!-- Customer Selector -->
          <div class="customer-selector" (click)="showCustomerModal = true">
            <span class="customer-icon">👤</span>
            <span>{{ selectedCustomer() ? selectedCustomer()!.nameAr : 'اختر عميل' }}</span>
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
            [class.low-stock]="product.stockQuantity <= product.minStockLevel"
          >
            <div class="product-image" [style.background-image]="'url(' + (product.imageUrl || '/assets/images/placeholder.jpg') + ')'"></div>
            <div class="product-info">
              <h3 class="title-md">{{ product.nameAr }}</h3>
              <div class="product-meta">
                <span class="label-sm text-on-surface-variant">SKU: {{ product.sku }}</span>
                <span class="stock-badge" [class.stock-low]="product.stockQuantity <= product.minStockLevel">
                  {{ product.stockQuantity }} متوفر
                </span>
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
          <div class="cart-actions">
            <button class="btn-icon" (click)="showHeldOrders()" title="الطلبات المعلقة (F4)">⏸️</button>
            <button class="btn-clear-cart" (click)="clearCart()" *ngIf="cartItems().length > 0">🗑️ مسح الكل</button>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="cart-items" *ngIf="cartItems().length > 0; else emptyCart">
          <div *ngFor="let item of cartItems()" class="cart-item">
            <div class="cart-item-image" [style.background-image]="'url(' + (item.imageUrl || '/assets/images/placeholder.jpg') + ')'"></div>
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
            <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--outline-variant)"><path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22S8.99 21.1 8.99 20C8.99 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.29 15 7.19 14.9 7.19 14.78L7.38 14.43L16.79 4H9.5L8.15 7.17L6.11 2H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22S18.99 21.1 18.99 20C18.99 18.9 18.1 18 17 18Z"/></svg>
            <p class="body-md text-on-surface-variant">لا توجد منتجات في السلة</p>
          </div>
        </ng-template>

        <!-- Cart Totals -->
        <div class="cart-totals" *ngIf="cartItems().length > 0">
          <div class="total-row">
            <span class="body-md text-on-surface-variant">المجموع الفرعي</span>
            <span class="body-md">{{ cartTotal().subTotal | number:'1.2-2' }} ر.س</span>
          </div>
          <div class="total-row" *ngIf="appliedDiscount">
            <span class="body-md text-success">الخصم ({{ appliedDiscount.code }})</span>
            <span class="body-md text-success">-{{ discountAmount | number:'1.2-2' }} ر.س</span>
          </div>
          <div class="total-row">
            <span class="body-md text-on-surface-variant">الضريبة (15%)</span>
            <span class="body-md">{{ cartTotal().taxAmount | number:'1.2-2' }} ر.س</span>
          </div>
          <div class="total-row grand-total">
            <span class="headline-sm text-primary">الإجمالي</span>
            <span class="display-sm text-primary">{{ finalTotal | number:'1.2-2' }} ر.س</span>
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
            <button class="key key-discount" (click)="showDiscountModal = true" title="خصم (F6)">%</button>
            <button class="key" (click)="keypadPress('0')">0</button>
            <button class="key key-clear" (click)="clearKeypad()">C</button>
          </div>
        </div>

        <!-- Payment Buttons -->
        <div class="payment-buttons" *ngIf="cartItems().length > 0">
          <button class="btn btn-secondary btn-hold" (click)="holdOrder()" title="تعليق (F3)">
            <span>⏸️ تعليق</span>
          </button>
          <button class="btn btn-primary btn-pay" (click)="showPaymentModal = true" title="دفع (F5)">
            <span>💳 ادفع الآن</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/></svg>
          </button>
        </div>
      </aside>

      <!-- Customer Modal -->
      <div class="modal-overlay" *ngIf="showCustomerModal" (click)="showCustomerModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2 class="headline-sm text-primary mb-lg">اختيار العميل</h2>
          <input type="text" class="input mb-md" placeholder="ابحث بالاسم أو رقم الهاتف..." [formGroup]="customerSearchForm" formControlName="search" />
          <div class="customer-list">
            <div *ngFor="let customer of filteredCustomers()" class="customer-item" (click)="selectCustomer(customer)">
              <div>
                <p class="title-sm">{{ customer.nameAr }}</p>
                <p class="label-sm text-on-surface-variant">{{ customer.phone }}</p>
              </div>
              <span class="badge badge-secondary">{{ customer.loyaltyPoints }} نقطة</span>
            </div>
            <button class="btn btn-primary w-full mt-md" (click)="showNewCustomerForm = true">➕ إضافة عميل جديد</button>
          </div>
          <button class="btn btn-outline w-full mt-md" (click)="showCustomerModal = false">إغلاق</button>
        </div>
      </div>

      <!-- Payment Modal -->
      <div class="modal-overlay" *ngIf="showPaymentModal" (click)="showPaymentModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2 class="headline-sm text-primary mb-lg">الدفع</h2>
          <div class="payment-total display-lg text-secondary mb-lg">{{ finalTotal | number:'1.2-2' }} ر.س</div>
          
          <div class="payment-methods mb-lg">
            <button class="payment-method-btn" [class.active]="paymentMethod === 'Cash'" (click)="paymentMethod = 'Cash'">
              💵 نقدي
            </button>
            <button class="payment-method-btn" [class.active]="paymentMethod === 'Card'" (click)="paymentMethod = 'Card'">
              💳 بطاقة
            </button>
            <button class="payment-method-btn" [class.active]="paymentMethod === 'Mixed'" (click)="paymentMethod = 'Mixed'">
              🔄 مختلط
            </button>
          </div>

          <div class="form-group mb-md" *ngIf="paymentMethod === 'Cash'">
            <label class="label-sm">المبلغ المستلم</label>
            <input type="number" class="input" [formGroup]="paymentForm" formControlName="receivedAmount" placeholder="0.00" />
            <div *ngIf="changeAmount > 0" class="change-amount text-success display-sm mt-sm">
              الباقي: {{ changeAmount | number:'1.2-2' }} ر.س
            </div>
          </div>

          <div class="form-group mb-md">
            <label class="label-sm">ملاحظات</label>
            <input type="text" class="input" [formGroup]="paymentForm" formControlName="notes" placeholder="ملاحظات إضافية..." />
          </div>

          <div class="payment-actions">
            <button class="btn btn-outline w-full mb-md" (click)="showPaymentModal = false">إلغاء</button>
            <button class="btn btn-primary w-full" (click)="processPayment()">✅ تأكيد الدفع</button>
          </div>
        </div>
      </div>

      <!-- Discount Modal -->
      <div class="modal-overlay" *ngIf="showDiscountModal" (click)="showDiscountModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2 class="headline-sm text-primary mb-lg">تطبيق خصم</h2>
          <input type="text" class="input mb-md" placeholder="أدخل كود الخصم..." [formGroup]="discountForm" formControlName="code" />
          <div *ngIf="discountError" class="error-banner mb-md">
            <span class="label-sm">{{ discountError }}</span>
          </div>
          <div class="discount-actions">
            <button class="btn btn-outline w-full mb-md" (click)="showDiscountModal = false">إلغاء</button>
            <button class="btn btn-primary w-full" (click)="applyDiscountCode()">تطبيق</button>
          </div>
        </div>
      </div>

      <!-- Receipt/Invoice Modal -->
      <div class="modal-overlay" *ngIf="showReceiptModal" (click)="showReceiptModal = false">
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="receipt-header mb-lg">
            <h2 class="headline-sm text-primary">الفاتورة</h2>
            <div class="receipt-actions">
              <button class="btn btn-outline" (click)="printReceipt()">🖨️ طباعة</button>
              <button class="btn btn-outline" (click)="downloadPDF()">📄 PDF</button>
              <button class="btn btn-outline" (click)="sendEmail()">📧 بريد</button>
            </div>
          </div>
          
          <div class="receipt-content" id="receipt-content">
            <div class="receipt-title text-center mb-md">
              <h3 class="headline-sm">Architect POS</h3>
              <p class="label-sm">Main Branch - Terminal 01</p>
            </div>
            
            <div class="receipt-info mb-md">
              <p>رقم الفاتورة: {{ lastOrder?.orderNumber }}</p>
              <p>التاريخ: {{ lastOrder?.createdAt | date:'yyyy-MM-dd HH:mm' }}</p>
              <p *ngIf="selectedCustomer()">العميل: {{ selectedCustomer()?.nameAr }}</p>
            </div>
            
            <div class="receipt-items mb-md">
              <div *ngFor="let item of lastOrder?.items" class="receipt-item">
                <span>{{ item.productNameAr }} x{{ item.quantity }}</span>
                <span>{{ item.totalAmount | number:'1.2-2' }} ر.س</span>
              </div>
            </div>
            
            <div class="receipt-totals">
              <div class="total-row">
                <span>المجموع الفرعي</span>
                <span>{{ lastOrder?.subTotal | number:'1.2-2' }} ر.س</span>
              </div>
              <div class="total-row">
                <span>الضريبة (15%)</span>
                <span>{{ lastOrder?.taxAmount | number:'1.2-2' }} ر.س</span>
              </div>
              <div class="total-row grand-total">
                <span class="headline-sm">الإجمالي</span>
                <span class="display-sm">{{ lastOrder?.totalAmount | number:'1.2-2' }} ر.س</span>
              </div>
            </div>
            
            <div class="receipt-footer text-center mt-lg">
              <p class="body-md">شكراً لتسوقكم معنا!</p>
              <p class="label-sm text-on-surface-variant">سياسة الإرجاع خلال 7 أيام</p>
            </div>
          </div>
          
          <button class="btn btn-primary w-full mt-lg" (click)="showReceiptModal = false; newTransaction()">عملية جديدة</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pos-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      background-color: var(--surface);
      overflow: hidden;
      transition: background-color var(--transition-normal);
    }

    .nav-sidebar {
      width: 240px;
      min-width: 240px;
      background-color: var(--surface);
      display: flex;
      flex-direction: column;
      padding: var(--spacing-xl);
      gap: var(--spacing-xl);
    }

    .nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .theme-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: var(--spacing-sm);
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

    .nav-item:hover { background-color: var(--surface-container-low); }
    .nav-item.active {
      background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-container) 100%);
      color: var(--on-primary);
    }

    .notifications-bell {
      position: relative;
      padding: var(--spacing-md);
      background: var(--surface-container-low);
      border-radius: var(--radius-lg);
      cursor: pointer;
      text-align: center;
    }

    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: var(--error);
      color: white;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 50%;
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

    .btn-new-transaction:hover { background-color: var(--primary-container); }

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
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-bar {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
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

    .search-input:focus { outline: none; box-shadow: 0 0 0 2px var(--primary); }

    .customer-selector {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--surface-container-low);
      border-radius: var(--radius-lg);
      cursor: pointer;
    }

    .top-nav {
      display: flex;
      gap: var(--spacing-lg);
    }

    .nav-link {
      cursor: pointer;
      font-size: var(--body-md);
      color: var(--on-surface-variant);
    }

    .nav-link:hover { color: var(--primary); }

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

    .category-btn:hover { background-color: var(--surface-container); }
    .category-btn.active { background-color: var(--primary); color: white; }

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
      position: relative;
    }

    .product-card:hover {
      background-color: var(--primary-container);
      color: var(--on-primary);
    }

    .product-card.low-stock {
      border: 2px solid var(--error);
    }

    .stock-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: var(--radius-md);
      font-size: var(--label-sm);
      background: var(--success-container);
      color: var(--success);
    }

    .stock-badge.stock-low {
      background: var(--error-container);
      color: var(--error);
    }

    .product-image {
      width: 100%;
      height: 140px;
      background-size: cover;
      background-position: center;
      background-color: var(--surface-container);
    }

    .product-info { padding: var(--spacing-md); }
    .product-info h3 { margin-bottom: var(--spacing-sm); font-size: var(--title-md); }
    .product-meta { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .product-price { display: flex; align-items: baseline; gap: var(--spacing-xs); }

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

    .cart-actions { display: flex; gap: var(--spacing-sm); }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; }

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

    .cart-item-details { flex: 1; }
    .cart-item-details h4 { margin-bottom: var(--spacing-xs); }

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

    .qty-display { min-width: 24px; text-align: center; font-weight: 600; }

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

    .total-row { display: flex; justify-content: space-between; align-items: center; }
    .grand-total {
      padding-top: var(--spacing-md);
      margin-top: var(--spacing-sm);
      border-top: 2px solid var(--surface-variant);
    }

    .keypad {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      background-color: var(--surface-container-lowest);
      border-radius: var(--radius-xl);
    }

    .keypad-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-sm); }

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

    .key:hover { background-color: var(--surface-container-high); }
    .key-discount { background-color: var(--secondary-container); color: var(--secondary); }
    .key-clear { background-color: var(--error-container); color: var(--error); }

    .payment-buttons { display: flex; gap: var(--spacing-md); }
    .btn-hold { flex: 1; }
    .btn-pay { flex: 2; }

    /* Modal Styles */
    .customer-list { max-height: 300px; overflow-y: auto; }
    .customer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .customer-item:hover { background: var(--surface-container-low); }

    .payment-methods { display: flex; gap: var(--spacing-md); }
    .payment-method-btn {
      flex: 1;
      padding: var(--spacing-lg);
      border: 2px solid var(--surface-container-high);
      border-radius: var(--radius-lg);
      background: var(--surface-container-lowest);
      cursor: pointer;
      font-family: var(--font-arabic);
      font-size: var(--body-md);
      transition: all var(--transition-fast);
    }
    .payment-method-btn.active {
      border-color: var(--secondary);
      background: var(--secondary-container);
      color: var(--secondary);
    }

    .change-amount {
      text-align: center;
      padding: var(--spacing-md);
      background: var(--success-container);
      border-radius: var(--radius-lg);
    }

    .receipt-header { display: flex; justify-content: space-between; align-items: center; }
    .receipt-actions { display: flex; gap: var(--spacing-sm); }
    .receipt-info p { margin-bottom: var(--spacing-xs); }
    .receipt-item { display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; }
    .receipt-totals { border-top: 2px dashed var(--surface-variant); padding-top: var(--spacing-md); }

    .mb-lg { margin-bottom: var(--spacing-lg); }
    .mb-md { margin-bottom: var(--spacing-md); }
    .mt-md { margin-top: var(--spacing-md); }
    .mt-lg { margin-top: var(--spacing-lg); }
    .mt-sm { margin-top: var(--spacing-sm); }
    .w-full { width: 100%; }
    .text-center { text-align: center; }
    .error-banner { background: var(--error-container); padding: var(--spacing-md); border-radius: var(--radius-lg); text-align: center; }
    .modal-large { max-width: 600px; }
  `]
})
export class POSEnhancedComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private heldOrderService = inject(HeldOrderService);
  private discountService = inject(DiscountService);
  private notificationService = inject(NotificationService);
  private keyboardService = inject(KeyboardShortcutsService);
  readonly themeService = inject(ThemeService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // State
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  selectedCategory = signal<number | null>(null);
  selectedCustomer = signal<Customer | null>(null);
  customers = signal<Customer[]>([]);
  filteredCustomers = signal<Customer[]>([]);
  searchForm: FormGroup;
  customerSearchForm: FormGroup;
  paymentForm: FormGroup;
  discountForm: FormGroup;
  filteredProducts = signal<Product[]>([]);

  // Cart
  cartItems = this.orderService.getCartItems;
  cartTotal = this.orderService.cartTotal;

  // Payment
  paymentMethod = signal<string>('Cash');
  changeAmount = computed(() => {
    const received = this.paymentForm.get('receivedAmount')?.value || 0;
    return Math.max(0, received - this.finalTotal);
  });

  // Discount
  appliedDiscount = signal<Discount | null>(null);
  discountAmount = signal<number>(0);
  discountError = signal<string>('');
  finalTotal = computed(() => {
    return this.cartTotal().total - this.discountAmount();
  });

  // Modals
  showCustomerModal = false;
  showPaymentModal = false;
  showDiscountModal = false;
  showReceiptModal = false;
  showHeldOrdersModal = false;
  showNewCustomerForm = false;

  // Last order for receipt
  lastOrder = signal<any>(null);
  unreadCount = signal<number>(0);

  constructor() {
    this.searchForm = this.fb.group({ search: [''] });
    this.customerSearchForm = this.fb.group({ search: [''] });
    this.paymentForm = this.fb.group({ receivedAmount: [0], notes: [''] });
    this.discountForm = this.fb.group({ code: [''] });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadCustomers();
    this.loadNotifications();

    // Search subscription
    this.searchForm.get('search')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(term => this.filterProducts(term));
    this.customerSearchForm.get('search')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(term => this.filterCustomers(term));

    // Register keyboard shortcuts
    this.registerShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.keyboardService.clear();
  }

  registerShortcuts(): void {
    this.keyboardService.register({ key: 'F2', description: 'بحث بالباركود', action: () => document.querySelector('.search-input')?.focus() });
    this.keyboardService.register({ key: 'F3', description: 'تعليق الطلب', action: () => this.holdOrder() });
    this.keyboardService.register({ key: 'F5', description: 'دفع', action: () => this.showPaymentModal = true });
    this.keyboardService.register({ key: 'F6', description: 'خصم', action: () => this.showDiscountModal = true });
    this.keyboardService.register({ key: 'F7', description: 'بحث عميل', action: () => this.showCustomerModal = true });
    this.keyboardService.register({ key: 'Escape', description: 'إغلاق', action: () => {
      this.showCustomerModal = false;
      this.showPaymentModal = false;
      this.showDiscountModal = false;
      this.showReceiptModal = false;
    }});
    this.keyboardService.register({ key: 'ctrl+d', description: 'تبديل الوضع', action: () => this.themeService.toggleTheme() });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts({ pageNumber: 1, pageSize: 100, sortBy: 'sortOrder', sortDescending: false })
      .subscribe({
        next: (response) => {
          this.products.set(response.items);
          this.filteredProducts.set(response.items);
        }
      });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.filteredCustomers.set(customers);
      }
    });
  }

  loadNotifications(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count)
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.filterProducts(this.searchForm.get('search')?.value);
  }

  filterProducts(searchTerm?: string): void {
    let filtered = this.products();
    if (this.selectedCategory()) filtered = filtered.filter(p => p.categoryId === this.selectedCategory());
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.nameAr.includes(term) || p.sku.toLowerCase().includes(term));
    }
    this.filteredProducts.set(filtered);
  }

  filterCustomers(searchTerm?: string): void {
    if (!searchTerm) {
      this.filteredCustomers.set(this.customers());
      return;
    }
    const term = searchTerm.toLowerCase();
    this.filteredCustomers.set(this.customers().filter(c => c.nameAr.includes(term) || c.phone.includes(term)));
  }

  addToCart(product: Product): void {
    this.orderService.addToCart(product, 1);
  }

  updateQuantity(productId: number, quantity: number): void {
    this.orderService.updateCartItemQuantity(productId, quantity);
  }

  clearCart(): void {
    this.orderService.clearCart();
    this.appliedDiscount.set(null);
    this.discountAmount.set(0);
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.showCustomerModal = false;
  }

  keypadPress(key: string): void {
    console.log('Keypad:', key);
  }

  clearKeypad(): void {
    this.discountForm.reset({ code: '' });
    this.discountError.set('');
  }

  holdOrder(): void {
    if (this.cartItems().length === 0) return;
    
    const orderData = {
      userId: 1,
      items: this.cartItems().map(item => ({
        productId: item.productId,
        productName: item.productName,
        productNameAr: item.productNameAr,
        productSKU: item.productSKU || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        subTotal: item.subTotal,
        discountAmount: 0,
        discountType: 'None',
        totalAmount: item.totalAmount
      })),
      subTotal: this.cartTotal().subTotal,
      taxAmount: this.cartTotal().taxAmount,
      discountAmount: this.discountAmount(),
      totalAmount: this.finalTotal,
      customerId: this.selectedCustomer()?.id,
      customerName: this.selectedCustomer()?.nameAr,
      terminalId: '01'
    };

    this.heldOrderService.holdOrder(orderData).subscribe({
      next: () => {
        this.clearCart();
        alert('تم تعليق الطلب بنجاح');
      }
    });
  }

  showHeldOrders(): void {
    // Implement held orders modal
    console.log('Show held orders');
  }

  applyDiscountCode(): void {
    const code = this.discountForm.get('code')?.value;
    if (!code) return;

    this.discountService.validateDiscount(code, this.cartTotal().total).subscribe({
      next: (result) => {
        if (result.isValid && result.discount) {
          this.appliedDiscount.set(result.discount);
          if (result.discount.discountType === 'Percentage') {
            this.discountAmount.set(this.cartTotal().total * (result.discount.discountValue / 100));
          } else {
            this.discountAmount.set(result.discount.discountValue);
          }
          this.showDiscountModal = false;
          this.discountError.set('');
        } else {
          this.discountError.set(result.message || 'كود الخصم غير صالح');
        }
      },
      error: () => this.discountError.set('حدث خطأ في التحقق من الخصم')
    });
  }

  processPayment(): void {
    const cart = this.cartItems();
    if (cart.length === 0) return;

    const receivedAmount = this.paymentForm.get('receivedAmount')?.value || this.finalTotal;

    this.orderService.submitOrder(
      this.paymentMethod(),
      this.paymentForm.get('notes')?.value,
      '01',
      'main'
    ).subscribe({
      next: (order) => {
        this.lastOrder.set(order);
        this.showPaymentModal = false;
        this.showReceiptModal = true;
        
        // Add loyalty points if customer selected
        if (this.selectedCustomer()) {
          const points = Math.floor(this.finalTotal);
          this.customerService.addLoyaltyPoints(this.selectedCustomer()!.id, points).subscribe();
        }
      },
      error: (error) => alert('فشل الدفع. حاول مرة أخرى.')
    });
  }

  printReceipt(): void {
    window.print();
  }

  downloadPDF(): void {
    // Implement PDF download
    alert('سيتم تحميل الفاتورة بصيغة PDF');
  }

  sendEmail(): void {
    alert('سيتم إرسال الفاتورة بالبريد الإلكتروني');
  }

  toggleNotifications(): void {
    // Implement notifications panel
    console.log('Toggle notifications');
  }

  newTransaction(): void {
    this.orderService.clearCart();
    this.selectedCustomer.set(null);
    this.appliedDiscount.set(null);
    this.discountAmount.set(0);
    this.paymentForm.reset({ receivedAmount: 0, notes: '' });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.orderService.clearCart();
    this.router.navigate(['/login']);
  }
}
