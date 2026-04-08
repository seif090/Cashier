import { Component } from '@angular/core';

@Component({
  selector: 'app-customers-management',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>إدارة العملاء</h1>
      <p>Customers Management - Coming Soon</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }
  `]
})
export class CustomersManagementComponent {}
