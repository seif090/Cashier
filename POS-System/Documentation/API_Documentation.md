# Architect POS - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
جميع الـ Endpoints تتطلب مصادقة JWT Token ما لم يُذكر خلاف ذلك.

### Headers المطلوبة
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 1. Authentication Endpoints

### 1.1 Login
**POST** `/auth/login`

تسجيل دخول المستخدم والحصول على JWT Token.

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
  "expiresAt": "2026-04-09T08:00:00Z",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@architectpos.com",
    "fullName": "System Administrator",
    "role": "Admin"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid username or password"
}
```

---

### 1.2 Register
**POST** `/auth/register`

تسجيل مستخدم جديد (يتطلب صلاحيات Admin).

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePass@123",
  "fullName": "New User",
  "roleId": 3
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "expiresAt": "2026-04-09T08:00:00Z",
  "user": {
    "id": 5,
    "username": "newuser",
    "email": "newuser@example.com",
    "fullName": "New User",
    "role": "Cashier"
  }
}
```

---

## 2. Products Endpoints

### 2.1 Get All Products
**GET** `/products`

الحصول على قائمة المنتجات مع إمكانية التصفية والترتيب.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| pageNumber | int | 1 | رقم الصفحة |
| pageSize | int | 20 | عدد العناصر |
| categoryId | int | - | تصفية حسب التصنيف |
| searchTerm | string | - | البحث في المنتجات |
| isActive | bool | - | تصفية حسب الحالة |
| sortBy | string | sortOrder | الترتيب حسب (name, price, stock, createdAt) |
| sortDescending | bool | false | ترتيب تنازلي |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "sku": "EP-902",
      "name": "Wireless Headphones",
      "nameAr": "سماعات رأس لاسلكية",
      "description": "High-quality wireless headphones",
      "categoryId": 2,
      "categoryName": "Electronics",
      "categoryNameAr": "الإلكترونيات",
      "barcode": "123456789",
      "price": 299.00,
      "costPrice": 150.00,
      "taxRate": 15,
      "stockQuantity": 50,
      "minStockLevel": 10,
      "imageUrl": "/images/products/headphones.jpg",
      "isActive": true,
      "sortOrder": 0,
      "createdAt": "2026-04-01T10:00:00Z"
    }
  ],
  "totalCount": 150,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

### 2.2 Get Product by ID
**GET** `/products/{id}`

الحصول على تفاصيل منتج محدد.

**Response (200 OK):**
```json
{
  "id": 1,
  "sku": "EP-902",
  "name": "Wireless Headphones",
  "nameAr": "سماعات رأس لاسلكية",
  "price": 299.00,
  "stockQuantity": 50,
  ...
}
```

**Response (404 Not Found):**
```json
{
  "message": "Product with ID 999 not found"
}
```

---

### 2.3 Get Product by SKU
**GET** `/products/sku/{sku}`

البحث عن منتج باستخدام SKU.

**Response (200 OK):**
```json
{
  "id": 1,
  "sku": "EP-902",
  "name": "Wireless Headphones",
  ...
}
```

---

### 2.4 Create Product
**POST** `/products`

إضافة منتج جديد (يتطلب صلاحيات Admin/Manager).

**Request:**
```json
{
  "sku": "NEW-001",
  "name": "New Product",
  "nameAr": "منتج جديد",
  "description": "Product description",
  "categoryId": 2,
  "barcode": "987654321",
  "price": 199.99,
  "costPrice": 100.00,
  "taxRate": 15,
  "stockQuantity": 100,
  "minStockLevel": 10,
  "imageUrl": "/images/products/new.jpg",
  "isActive": true,
  "sortOrder": 0
}
```

**Response (201 Created):**
```json
{
  "id": 7,
  "sku": "NEW-001",
  "name": "New Product",
  "nameAr": "منتج جديد",
  ...
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Product with SKU 'NEW-001' already exists"
}
```

---

### 2.5 Update Product
**PUT** `/products/{id}`

تحديث بيانات منتج (يتطلب صلاحيات Admin/Manager).

**Request:**
```json
{
  "name": "Updated Product Name",
  "nameAr": "اسم المنتج المحدث",
  "price": 249.99,
  "stockQuantity": 75
}
```

**Response (200 OK):**
```json
{
  "id": 7,
  "sku": "NEW-001",
  "name": "Updated Product Name",
  "nameAr": "اسم المنتج المحدث",
  "price": 249.99,
  ...
}
```

---

### 2.6 Delete Product
**DELETE** `/products/{id}`

حذف منتج (Soft Delete - يتم تعيين IsActive = false) (يتطلب صلاحيات Admin/Manager).

**Response (200 OK):**
```json
true
```

---

### 2.7 Update Stock
**PATCH** `/products/{id}/stock`

تحديث مخزون منتج (يتطلب صلاحيات Admin/Manager).

**Request Body:**
```
-5  (قيمة سالبة للتنقيص، موجبة للإضافة)
```

**Response (200 OK):**
```json
true
```

---

## 3. Categories Endpoints

### 3.1 Get All Categories
**GET** `/categories`

الحصول على قائمة التصنيفات النشطة.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "All",
    "nameAr": "الكل",
    "description": "All Products",
    "icon": "apps",
    "color": "#00236f",
    "parentCategoryId": null,
    "parentCategoryName": null,
    "sortOrder": 0,
    "isActive": true,
    "productCount": 150,
    "createdAt": "2026-04-01T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Electronics",
    "nameAr": "الإلكترونيات",
    "description": "Electronic Devices",
    "icon": "devices",
    "color": "#00236f",
    "parentCategoryId": null,
    "sortOrder": 1,
    "isActive": true,
    "productCount": 45,
    "createdAt": "2026-04-01T10:00:00Z"
  }
]
```

---

### 3.2 Get Category by ID
**GET** `/categories/{id}`

الحصول على تفاصيل تصنيف محدد.

**Response (200 OK):**
```json
{
  "id": 2,
  "name": "Electronics",
  "nameAr": "الإلكترونيات",
  ...
}
```

---

### 3.3 Create Category
**POST** `/categories`

إضافة تصنيف جديد (يتطلب صلاحيات Admin/Manager).

**Request:**
```json
{
  "name": "New Category",
  "nameAr": "تصنيف جديد",
  "description": "Category description",
  "icon": "category",
  "color": "#006c49",
  "parentCategoryId": null,
  "sortOrder": 10,
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "id": 6,
  "name": "New Category",
  "nameAr": "تصنيف جديد",
  ...
}
```

---

### 3.4 Update Category
**PUT** `/categories/{id}`

تحديث بيانات تصنيف (يتطلب صلاحيات Admin/Manager).

**Request:**
```json
{
  "name": "Updated Category",
  "nameAr": "تصنيف محدث",
  "color": "#f59e0b"
}
```

**Response (200 OK):**
```json
{
  "id": 6,
  "name": "Updated Category",
  "nameAr": "تصنيف محدث",
  "color": "#f59e0b",
  ...
}
```

---

### 3.5 Delete Category
**DELETE** `/categories/{id}`

حذف تصنيف (Soft Delete) (يتطلب صلاحيات Admin/Manager).

**Response (200 OK):**
```json
true
```

---

## 4. Orders Endpoints

### 4.1 Get All Orders
**GET** `/orders`

الحصول على سجل الطلبات مع إمكانية التصفية.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | datetime | تاريخ البداية |
| endDate | datetime | تاريخ النهاية |
| status | string | الحالة (Completed, Voided, Refunded) |
| paymentMethod | string | طريقة الدفع (Cash, Card) |
| userId | int | تصفية حسب المستخدم |
| pageNumber | int | رقم الصفحة |
| pageSize | int | عدد العناصر |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "orderNumber": "ORD-20260408-A1B2C3",
      "userId": 1,
      "userName": "System Administrator",
      "subTotal": 1749.00,
      "taxAmount": 262.35,
      "discountAmount": 0,
      "totalAmount": 2011.35,
      "paymentMethod": "Cash",
      "status": "Completed",
      "notes": "",
      "terminalId": "01",
      "branchId": "main",
      "createdAt": "2026-04-08T14:30:00Z",
      "items": [
        {
          "id": 1,
          "productId": 1,
          "productName": "سماعات رأس لاسلكية",
          "productSKU": "EP-902",
          "imageUrl": "/images/products/headphones.jpg",
          "quantity": 1,
          "unitPrice": 299.00,
          "taxRate": 15,
          "taxAmount": 44.85,
          "subTotal": 299.00,
          "discountAmount": 0,
          "totalAmount": 343.85
        },
        {
          "id": 2,
          "productId": 2,
          "productName": "ساعة يد كلاسيكية",
          "productSKU": "T-001",
          "quantity": 1,
          "unitPrice": 1450.00,
          "taxRate": 15,
          "taxAmount": 217.50,
          "subTotal": 1450.00,
          "discountAmount": 0,
          "totalAmount": 1667.50
        }
      ]
    }
  ],
  "totalCount": 45,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

### 4.2 Get Order by ID
**GET** `/orders/{id}`

الحصول على تفاصيل طلب محدد.

**Response (200 OK):**
```json
{
  "id": 1,
  "orderNumber": "ORD-20260408-A1B2C3",
  ...
}
```

---

### 4.3 Get Order by Number
**GET** `/orders/number/{orderNumber}`

البحث عن طلب باستخدام رقم الطلب.

**Response (200 OK):**
```json
{
  "id": 1,
  "orderNumber": "ORD-20260408-A1B2C3",
  ...
}
```

---

### 4.4 Create Order
**POST** `/orders`

إنشاء طلب جديد (عملية بيع).

**Request:**
```json
{
  "userId": 1,
  "discountAmount": 50.00,
  "paymentMethod": "Cash",
  "notes": "Customer requested gift wrap",
  "terminalId": "01",
  "branchId": "main",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "orderNumber": "ORD-20260408-D4E5F6",
  "userId": 1,
  "subTotal": 2049.00,
  "taxAmount": 307.35,
  "discountAmount": 50.00,
  "totalAmount": 2306.35,
  "paymentMethod": "Cash",
  "status": "Completed",
  "createdAt": "2026-04-08T15:00:00Z",
  "items": [...]
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Insufficient stock for product 'سماعات رأس لاسلكية'. Available: 1"
}
```

---

### 4.5 Void Order
**PATCH** `/orders/{id}/void`

إلغاء طلب (يتطلب صلاحيات Admin/Manager).

**Response (200 OK):**
```json
true
```

**Response (400 Bad Request):**
```json
{
  "message": "Order is already voided"
}
```

---

### 4.6 Get Daily Report
**GET** `/orders/report/daily`

الحصول على تقرير يومي للمبيعات (يتطلب صلاحيات Admin/Manager).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | datetime | تاريخ البداية |
| endDate | datetime | تاريخ النهاية |

**Response (200 OK):**
```json
{
  "startDate": "2026-04-01T00:00:00Z",
  "endDate": "2026-04-08T23:59:59Z",
  "totalOrders": 125,
  "totalRevenue": 45678.50,
  "totalTax": 6851.78,
  "totalDiscount": 500.00,
  "uniqueCashiers": 5,
  "dailyBreakdown": [
    {
      "date": "2026-04-08T00:00:00Z",
      "orders": 18,
      "revenue": 6789.00,
      "paymentMethod": "Cash"
    },
    {
      "date": "2026-04-08T00:00:00Z",
      "orders": 12,
      "revenue": 4567.50,
      "paymentMethod": "Card"
    }
  ]
}
```

---

## 5. Error Responses

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - طلب غير صالح |
| 401 | Unauthorized - غير مصرح (توكن غير صالح أو منتهي) |
| 403 | Forbidden - ممنوع (لا توجد صلاحيات) |
| 404 | Not Found - المورد غير موجود |
| 500 | Internal Server Error - خطأ في الخادم |

### Error Response Format
```json
{
  "message": "Error description",
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1"
}
```

---

## 6. Rate Limiting

حالياً لا يوجد Rate Limiting مطبق. يُنصح بتطبيقه في بيئة الإنتاج.

---

## 7. Versioning

الـ API يستخدم Versioning عبر URL:
```
/api/v1/products
/api/v2/products
```

الإصدار الحالي: **v1**

---

## 8. Postman Collection

يمكن استيراد الـ Collection التالية في Postman:

```json
{
  "info": {
    "name": "Architect POS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"Admin@123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

## 9. Swagger/OpenAPI

يمكن الوصول إلى Swagger UI على:
```
http://localhost:5000/swagger
```

Swagger JSON:
```
http://localhost:5000/swagger/v1/swagger.json
```

---

**Last Updated:** April 8, 2026
**API Version:** v1.0.0
