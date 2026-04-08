import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order, OrderFilterRequest } from '../../models/order.models';

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-container" dir="rtl">
      <header class="orders-header">
        <h1 class="headline-sm text-primary">سجل الطلبات</h1>
      </header>

      <div class="orders-list">
        <div *ngIf="orders().length === 0" class="empty-state">
          <p class="body-md text-on-surface-variant">لا توجد طلبات</p>
        </div>

        <div *ngFor="let order of orders()" class="order-card">
          <div class="order-header">
            <div>
              <p class="title-sm text-primary">{{ order.orderNumber }}</p>
              <p class="label-sm text-on-surface-variant">{{ order.createdAt | date:'yyyy-MM-dd HH:mm' }}</p>
            </div>
            <span class="status-badge" [class.status-completed]="order.status === 'Completed'">
              {{ order.status === 'Completed' ? 'مكتمل' : order.status }}
            </span>
          </div>

          <div class="order-items">
            <div *ngFor="let item of order.items" class="order-item">
              <span>{{ item.productName }}</span>
              <span>x{{ item.quantity }}</span>
              <span>{{ item.totalAmount | number:'1.2-2' }} ر.س</span>
            </div>
          </div>

          <div class="order-footer">
            <span class="label-sm">الدفع: {{ order.paymentMethod === 'Cash' ? 'نقدي' : 'بطاقة' }}</span>
            <span class="title-sm text-secondary">{{ order.totalAmount | number:'1.2-2' }} ر.س</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { padding: var(--spacing-2xl); background: var(--surface); min-height: 100vh; }
    .orders-header { margin-bottom: var(--spacing-xl); }
    .orders-list { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .empty-state { text-align: center; padding: var(--spacing-3xl); }
    .order-card { background: var(--surface-container-lowest); padding: var(--spacing-xl); border-radius: var(--radius-xl); }
    .order-header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-md); }
    .status-badge { padding: var(--spacing-xs) var(--spacing-md); border-radius: var(--radius-md); background: var(--surface-container-low); }
    .status-completed { background: var(--success-container); color: var(--secondary); }
    .order-items { margin-bottom: var(--spacing-md); }
    .order-item { display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; }
    .order-footer { display: flex; justify-content: space-between; padding-top: var(--spacing-md); border-top: 2px solid var(--surface-variant); }
  `]
})
export class OrdersHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const request: OrderFilterRequest = {
      pageNumber: 1,
      pageSize: 50,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    };

    this.orderService.getOrders(request).subscribe(res => {
      this.orders.set(res.items);
    });
  }
}
