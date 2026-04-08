export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName?: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  terminalId?: string;
  branchId?: string;
  createdAt: Date;
  items: OrderItem[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  productNameAr: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subTotal: number;
  totalAmount: number;
}

export interface CreateOrderRequest {
  userId: number;
  discountAmount: number;
  paymentMethod: string;
  notes?: string;
  terminalId?: string;
  branchId?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderFilterRequest {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  paymentMethod?: string;
  userId?: number;
  pageNumber: number;
  pageSize: number;
}

export interface DailyReport {
  startDate: Date;
  endDate: Date;
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  uniqueCashiers: number;
  dailyBreakdown: DailyBreakdown[];
}

export interface DailyBreakdown {
  date: Date;
  orders: number;
  revenue: number;
  paymentMethod: string;
}
