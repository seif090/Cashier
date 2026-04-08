import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilterRequest, PagedResult } from '../models/product.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  readonly apiUrl = `${environment.apiUrl}/products`;

  getProducts(request: ProductFilterRequest): Observable<PagedResult<Product>> {
    const params = this.buildQueryParams(request);
    return this.http.get<PagedResult<Product>>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductBySKU(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request, {
      headers: this.authService.authHeaders
    });
  }

  updateProduct(id: number, request: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, request, {
      headers: this.authService.authHeaders
    });
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`, {
      headers: this.authService.authHeaders
    });
  }

  updateStock(id: number, quantity: number): Observable<boolean> {
    return this.http.patch<boolean>(`${this.apiUrl}/${id}/stock`, quantity, {
      headers: this.authService.authHeaders
    });
  }

  private buildQueryParams(request: ProductFilterRequest): any {
    const params: any = {};
    if (request.categoryId !== undefined) params.categoryId = request.categoryId;
    if (request.searchTerm !== undefined) params.searchTerm = request.searchTerm;
    if (request.isActive !== undefined) params.isActive = request.isActive;
    if (request.pageNumber !== undefined) params.pageNumber = request.pageNumber;
    if (request.pageSize !== undefined) params.pageSize = request.pageSize;
    if (request.sortBy !== undefined) params.sortBy = request.sortBy;
    if (request.sortDescending !== undefined) params.sortDescending = request.sortDescending;
    return params;
  }
}
