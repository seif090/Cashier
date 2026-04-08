import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { DailyReport } from '../../models/order.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container" dir="rtl">
      <header class="dashboard-header">
        <h1 class="headline-sm text-primary">لوحة التحكم</h1>
        <p class="body-md text-on-surface-variant">نظرة عامة على المبيعات والأداء</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M11.8 10.9C9.53 10.9 7.7 9.07 7.7 6.8S9.53 2.7 11.8 2.7 15.9 4.53 15.9 6.8 14.07 10.9 11.8 10.9ZM12 14.9C15.87 14.9 19.3 17.36 19.3 20.9V21.9H4.7V20.9C4.7 17.36 8.13 14.9 12 14.9Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="label-sm text-on-surface-variant">إجمالي الطلبات</p>
            <p class="display-sm text-primary">{{ report()?.totalOrders || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M11.8 10.9C9.53 10.9 7.7 9.07 7.7 6.8S9.53 2.7 11.8 2.7 15.9 4.53 15.9 6.8 14.07 10.9 11.8 10.9ZM12 14.9C15.87 14.9 19.3 17.36 19.3 20.9V21.9H4.7V20.9C4.7 17.36 8.13 14.9 12 14.9Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="label-sm text-on-surface-variant">إجمالي الإيرادات</p>
            <p class="display-sm text-secondary">{{ report()?.totalRevenue || 0 | number:'1.2-2' }} ر.س</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: var(--success-container);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--secondary)">
              <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="label-sm text-on-surface-variant">صافي الأرباح</p>
            <p class="display-sm" style="color: var(--success);">{{ (report()?.totalRevenue || 0) - (report()?.totalTax || 0) | number:'1.2-2' }} ر.س</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background-color: var(--error-container);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--error)">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
          </div>
          <div class="stat-content">
            <p class="label-sm text-on-surface-variant">إجمالي الخصومات</p>
            <p class="display-sm text-error">{{ report()?.totalDiscount || 0 | number:'1.2-2' }} ر.س</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h2 class="title-md text-primary">المبيعات اليومية</h2>
        <div class="chart-placeholder">
          <p class="body-md text-on-surface-variant">رسم بياني للمبيعات اليومية</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: var(--spacing-2xl);
      background-color: var(--surface);
      min-height: 100vh;
    }

    .dashboard-header {
      margin-bottom: var(--spacing-2xl);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-2xl);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background-color: var(--surface-container-lowest);
      border-radius: var(--radius-xl);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content {
      flex: 1;
    }

    .chart-section {
      background-color: var(--surface-container-lowest);
      padding: var(--spacing-xl);
      border-radius: var(--radius-xl);
    }

    .chart-placeholder {
      height: 300px;
      background-color: var(--surface-container-low);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: var(--spacing-lg);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  report = signal<DailyReport | null>(null);

  ngOnInit(): void {
    this.loadDailyReport();
  }

  loadDailyReport(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    this.orderService.getDailyReport(startDate, endDate).subscribe({
      next: (report) => {
        this.report.set(report);
      },
      error: (error) => console.error('Failed to load daily report', error)
    });
  }
}
