import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CreateCustomerRequest, HeldOrder, Shift, Refund, Discount, Notification, LowStockProduct } from '../models/advanced.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly apiUrl = `${environment.apiUrl}/customers`;

  getCustomers(search?: string): Observable<Customer[]> {
    const params: any = {};
    if (search) params.search = search;
    return this.http.get<Customer[]>(this.apiUrl, { params, headers: this.authService.authHeaders });
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`, { headers: this.authService.authHeaders });
  }

  getCustomerByPhone(phone: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/phone/${phone}`, { headers: this.authService.authHeaders });
  }

  createCustomer(request: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, request, { headers: this.authService.authHeaders });
  }

  updateCustomer(id: number, request: Partial<CreateCustomerRequest>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, request, { headers: this.authService.authHeaders });
  }

  addLoyaltyPoints(customerId: number, points: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${customerId}/loyalty`, { points }, { headers: this.authService.authHeaders });
  }
}

@Injectable({ providedIn: 'root' })
export class HeldOrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly apiUrl = `${environment.apiUrl}/held-orders`;

  getHeldOrders(): Observable<HeldOrder[]> {
    return this.http.get<HeldOrder[]>(this.apiUrl, { headers: this.authService.authHeaders });
  }

  holdOrder(orderData: any): Observable<HeldOrder> {
    return this.http.post<HeldOrder>(this.apiUrl, orderData, { headers: this.authService.authHeaders });
  }

  recallOrder(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/recall`, {}, { headers: this.authService.authHeaders });
  }

  deleteHeldOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authService.authHeaders });
  }
}

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly apiUrl = `${environment.apiUrl}/shifts`;

  getCurrentShift(): Observable<Shift | null> {
    return this.http.get<Shift | null>(`${this.apiUrl}/current`, { headers: this.authService.authHeaders });
  }

  openShift(openingCash: number, notes?: string): Observable<Shift> {
    return this.http.post<Shift>(this.apiUrl, { openingCash, notes }, { headers: this.authService.authHeaders });
  }

  closeShift(actualCash: number, notes?: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/close`, { actualCash, notes }, { headers: this.authService.authHeaders });
  }

  getShiftHistory(): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.apiUrl, { headers: this.authService.authHeaders });
  }
}

@Injectable({ providedIn: 'root' })
export class RefundService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly apiUrl = `${environment.apiUrl}/refunds`;

  createRefund(refundData: any): Observable<Refund> {
    return this.http.post<Refund>(this.apiUrl, refundData, { headers: this.authService.authHeaders });
  }

  getRefundById(id: number): Observable<Refund> {
    return this.http.get<Refund>(`${this.apiUrl}/${id}`, { headers: this.authService.authHeaders });
  }

  getRefunds(orderId?: number): Observable<Refund[]> {
    const params: any = {};
    if (orderId) params.orderId = orderId;
    return this.http.get<Refund[]>(this.apiUrl, { params, headers: this.authService.authHeaders });
  }

  approveRefund(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, {}, { headers: this.authService.authHeaders });
  }

  rejectRefund(id: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reject`, { reason }, { headers: this.authService.authHeaders });
  }
}

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly apiUrl = `${environment.apiUrl}/discounts`;

  validateDiscount(code: string, orderTotal: number): Observable<{ isValid: boolean; discount: Discount | null; message?: string }> {
    return this.http.post<{ isValid: boolean; discount: Discount | null; message?: string }>(
      `${this.apiUrl}/validate`,
      { code, orderTotal },
      { headers: this.authService.authHeaders }
    );
  }

  getActiveDiscounts(): Observable<Discount[]> {
    return this.http.get<Discount[]>(this.apiUrl, { headers: this.authService.authHeaders });
  }

  createDiscount(discountData: any): Observable<Discount> {
    return this.http.post<Discount>(this.apiUrl, discountData, { headers: this.authService.authHeaders });
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly apiUrl = `${environment.apiUrl}/notifications`;

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`, { headers: this.authService.authHeaders });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl, { headers: this.authService.authHeaders });
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {}, { headers: this.authService.authHeaders });
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}, { headers: this.authService.authHeaders });
  }

  getLowStockAlerts(): Observable<LowStockProduct[]> {
    return this.http.get<LowStockProduct[]>(`${this.apiUrl}/low-stock`, { headers: this.authService.authHeaders });
  }
}
