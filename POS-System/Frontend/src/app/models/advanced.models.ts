// =====================================================
// Architect POS - Advanced TypeScript Models
// =====================================================

export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  nameAr: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  loyaltyPoints: number;
  totalPurchases: number;
  totalOrders: number;
  lastPurchaseDate?: Date;
  isVip: boolean;
  birthday?: Date;
  gender?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  tierLevel?: string;
}

export interface CreateCustomerRequest {
  name: string;
  nameAr: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface HeldOrder {
  id: number;
  heldOrderNumber: string;
  userId: number;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerId?: number;
  customerName?: string;
  notes?: string;
  terminalId?: string;
  itemCount: number;
  heldAt: Date;
  items: HeldOrderItem[];
}

export interface HeldOrderItem {
  id: number;
  productId: number;
  productName: string;
  productNameAr: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subTotal: number;
  discountAmount: number;
  discountType: string;
  totalAmount: number;
}

export interface Shift {
  id: number;
  shiftNumber: string;
  userId: number;
  terminalId?: string;
  branchId?: string;
  openedAt: Date;
  closedAt?: Date;
  openingCash: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  totalSales: number;
  totalOrders: number;
  totalRefunds: number;
  status: string;
  notes?: string;
}

export interface Refund {
  id: number;
  refundNumber: string;
  orderId: number;
  orderNumber: string;
  userId: number;
  reason: string;
  refundAmount: number;
  refundMethod: string;
  status: string;
  approvedBy?: number;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  items: RefundItem[];
}

export interface RefundItem {
  id: number;
  refundId: number;
  orderItemId: number;
  productId: number;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Discount {
  id: number;
  code: string;
  name: string;
  nameAr: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableCategoryIds?: string;
  applicableProductIds?: string;
  createdBy: number;
  createdAt: Date;
}

export interface Notification {
  id: number;
  userId?: number;
  title: string;
  titleAr: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: number;
  relatedType?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface LowStockProduct {
  id: number;
  sku: string;
  name: string;
  nameAr: string;
  stockQuantity: number;
  minStockLevel: number;
  lowStockThreshold: number;
  stockStatus: string;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}
