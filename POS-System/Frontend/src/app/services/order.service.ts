import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Order, CartItem, CreateOrderRequest, OrderFilterRequest, PagedResult, DailyReport } from '../models/order.models';
import { Product } from '../models/product.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  readonly apiUrl = `${environment.apiUrl}/orders`;
  
  // Cart state using signals
  private cartItems = signal<CartItem[]>([]);
  private discountAmount = signal<number>(0);
  
  readonly cartTotal = computed(() => {
    const items = this.cartItems();
    const subTotal = items.reduce((sum, item) => sum + item.subTotal, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const discount = this.discountAmount();
    return {
      subTotal,
      taxAmount,
      discount,
      total: subTotal + taxAmount - discount
    };
  });

  // Cart Management
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingIndex = currentItems.findIndex(item => item.productId === product.id);
    
    const taxAmount = product.price * quantity * (product.taxRate / 100);
    const subTotal = product.price * quantity;
    
    if (existingIndex >= 0) {
      const newItems = [...currentItems];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + quantity,
        subTotal: newItems[existingIndex].subTotal + subTotal,
        taxAmount: newItems[existingIndex].taxAmount + taxAmount,
        totalAmount: newItems[existingIndex].totalAmount + subTotal + taxAmount
      };
      this.cartItems.set(newItems);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr,
        imageUrl: product.imageUrl,
        quantity,
        unitPrice: product.price,
        taxRate: product.taxRate,
        taxAmount,
        subTotal,
        totalAmount: subTotal + taxAmount
      };
      this.cartItems.set([...currentItems, newItem]);
    }
  }

  removeFromCart(productId: number): void {
    this.cartItems.set(this.cartItems().filter(item => item.productId !== productId));
  }

  updateCartItemQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const currentItems = this.cartItems();
    const newItems = currentItems.map(item => {
      if (item.productId === productId) {
        const subTotal = item.unitPrice * quantity;
        const taxAmount = subTotal * (item.taxRate / 100);
        return {
          ...item,
          quantity,
          subTotal,
          taxAmount,
          totalAmount: subTotal + taxAmount
        };
      }
      return item;
    });
    this.cartItems.set(newItems);
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.discountAmount.set(0);
  }

  setDiscount(amount: number): void {
    this.discountAmount.set(amount);
  }

  getCartItems(): CartItem[] {
    return this.cartItems();
  }

  getCartItemCount(): number {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  // Order API Methods
  getOrders(request: OrderFilterRequest): Observable<PagedResult<Order>> {
    const params = this.buildQueryParams(request);
    return this.http.get<PagedResult<Order>>(this.apiUrl, { 
      params,
      headers: this.authService.authHeaders 
    });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, {
      headers: this.authService.authHeaders
    });
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`, {
      headers: this.authService.authHeaders
    });
  }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request, {
      headers: this.authService.authHeaders
    });
  }

  voidOrder(id: number): Observable<boolean> {
    return this.http.patch<boolean>(`${this.apiUrl}/${id}/void`, {}, {
      headers: this.authService.authHeaders
    });
  }

  getDailyReport(startDate: Date, endDate: Date): Observable<DailyReport> {
    return this.http.get<DailyReport>(`${this.apiUrl}/report/daily`, {
      params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      headers: this.authService.authHeaders
    });
  }

  submitOrder(paymentMethod: string, notes?: string, terminalId?: string, branchId?: string): Observable<Order> {
    const user = this.authService.currentUserData;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const cart = this.cartItems();
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const request: CreateOrderRequest = {
      userId: user.id,
      discountAmount: this.discountAmount(),
      paymentMethod,
      notes,
      terminalId,
      branchId,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    return this.createOrder(request).pipe(
      tap(() => this.clearCart())
    );
  }

  private buildQueryParams(request: OrderFilterRequest): any {
    const params: any = {};
    if (request.startDate) params.startDate = request.startDate.toISOString();
    if (request.endDate) params.endDate = request.endDate.toISOString();
    if (request.status) params.status = request.status;
    if (request.paymentMethod) params.paymentMethod = request.paymentMethod;
    if (request.userId) params.userId = request.userId;
    if (request.pageNumber) params.pageNumber = request.pageNumber;
    if (request.pageSize) params.pageSize = request.pageSize;
    return params;
  }
}
