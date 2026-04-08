import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { LoginComponent } from './pages/login/login.component';
import { POSComponent } from './pages/pos/pos.component';
import { POSEnhancedComponent } from './pages/pos-enhanced/pos-enhanced.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsManagementComponent } from './pages/products-management/products-management.component';
import { CategoriesManagementComponent } from './pages/categories-management/categories-management.component';
import { OrdersHistoryComponent } from './pages/orders-history/orders-history.component';
import { CustomersManagementComponent } from './pages/customers-management/customers-management.component';
import { ShiftsManagementComponent } from './pages/shifts-management/shifts-management.component';
import { RefundsManagementComponent } from './pages/refunds-management/refunds-management.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'pos', component: POSComponent, canActivate: [AuthGuard] },
  { path: 'pos-enhanced', component: POSEnhancedComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductsManagementComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesManagementComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomersManagementComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrdersHistoryComponent, canActivate: [AuthGuard] },
  { path: 'shifts', component: ShiftsManagementComponent, canActivate: [AuthGuard] },
  { path: 'refunds', component: RefundsManagementComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom()
  ]
};
