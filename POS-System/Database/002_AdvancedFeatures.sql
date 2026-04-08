-- =====================================================
-- Architect POS - Advanced Features Database Script
-- المميزات المتقدمة
-- =====================================================

USE ArchitectPOS;
GO

-- =====================================================
-- 1. Customers Table (إدارة العملاء)
-- =====================================================
CREATE TABLE Customers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CustomerCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(255),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    Country NVARCHAR(100) DEFAULT 'السعودية',
    LoyaltyPoints DECIMAL(18,2) DEFAULT 0,
    TotalPurchases DECIMAL(18,2) DEFAULT 0,
    TotalOrders INT DEFAULT 0,
    LastPurchaseDate DATETIME2,
    Notes NVARCHAR(1000),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2
);
GO

CREATE INDEX IX_Customers_Phone ON Customers(Phone);
CREATE INDEX IX_Customers_Code ON Customers(CustomerCode);
GO

-- =====================================================
-- 2. HeldOrders Table (الطلبات المعلقة)
-- =====================================================
CREATE TABLE HeldOrders (
    Id INT PRIMARY KEY IDENTITY(1,1),
    HeldOrderNumber NVARCHAR(50) NOT NULL UNIQUE,
    UserId INT NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    CustomerId INT NULL,
    CustomerName NVARCHAR(200),
    Notes NVARCHAR(500),
    TerminalId NVARCHAR(50),
    ItemCount INT NOT NULL,
    HeldAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_HeldOrders_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_HeldOrders_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);
GO

CREATE INDEX IX_HeldOrders_HeldAt ON HeldOrders(HeldAt);
GO

-- =====================================================
-- 3. HeldOrderItems Table (عناصر الطلبات المعلقة)
-- =====================================================
CREATE TABLE HeldOrderItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    HeldOrderId INT NOT NULL,
    ProductId INT NOT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    ProductNameAr NVARCHAR(200) NOT NULL,
    ProductSKU NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TaxRate DECIMAL(5,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) DEFAULT 0,
    DiscountType NVARCHAR(20) DEFAULT 'None', -- None, Percentage, Fixed
    TotalAmount DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_HeldOrderItems_HeldOrders FOREIGN KEY (HeldOrderId) REFERENCES HeldOrders(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- 4. Shifts Table (إدارة الوردية)
-- =====================================================
CREATE TABLE Shifts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ShiftNumber NVARCHAR(50) NOT NULL UNIQUE,
    UserId INT NOT NULL,
    TerminalId NVARCHAR(50),
    BranchId NVARCHAR(50),
    OpenedAt DATETIME2 DEFAULT GETUTCDATE(),
    ClosedAt DATETIME2 NULL,
    OpeningCash DECIMAL(18,2) NOT NULL DEFAULT 0,
    ExpectedCash DECIMAL(18,2) DEFAULT 0,
    ActualCash DECIMAL(18,2) DEFAULT 0,
    CashDifference DECIMAL(18,2) DEFAULT 0,
    TotalSales DECIMAL(18,2) DEFAULT 0,
    TotalOrders INT DEFAULT 0,
    TotalRefunds DECIMAL(18,2) DEFAULT 0,
    Status NVARCHAR(50) DEFAULT 'Open', -- Open, Closed
    Notes NVARCHAR(500),
    CONSTRAINT FK_Shifts_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_Shifts_UserId ON Shifts(UserId);
CREATE INDEX IX_Shifts_Status ON Shifts(Status);
GO

-- =====================================================
-- 5. Refunds Table (المرتجعات)
-- =====================================================
CREATE TABLE Refunds (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RefundNumber NVARCHAR(50) NOT NULL UNIQUE,
    OrderId INT NOT NULL,
    OrderNumber NVARCHAR(50) NOT NULL,
    UserId INT NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    RefundAmount DECIMAL(18,2) NOT NULL,
    RefundMethod NVARCHAR(50) NOT NULL, -- Cash, Card, StoreCredit
    Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Completed
    ApprovedBy INT NULL,
    ApprovedAt DATETIME2 NULL,
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Refunds_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    CONSTRAINT FK_Refunds_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_Refunds_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_Refunds_OrderId ON Refunds(OrderId);
CREATE INDEX IX_Refunds_Status ON Refunds(Status);
GO

-- =====================================================
-- 6. RefundItems Table (عناصر المرتجع)
-- =====================================================
CREATE TABLE RefundItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RefundId INT NOT NULL,
    OrderItemId INT NOT NULL,
    ProductId INT NOT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    ProductSKU NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_RefundItems_Refunds FOREIGN KEY (RefundId) REFERENCES Refunds(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- 7. Discounts Table (الخصومات)
-- =====================================================
CREATE TABLE Discounts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    DiscountType NVARCHAR(20) NOT NULL, -- Percentage, Fixed, BuyXGetY
    DiscountValue DECIMAL(18,2) NOT NULL,
    MinOrderAmount DECIMAL(18,2) DEFAULT 0,
    MaxDiscountAmount DECIMAL(18,2),
    UsageLimit INT NULL,
    UsedCount INT DEFAULT 0,
    ValidFrom DATETIME2 NOT NULL,
    ValidTo DATETIME2 NOT NULL,
    IsActive BIT DEFAULT 1,
    ApplicableCategoryIds NVARCHAR(500), -- Comma-separated category IDs
    ApplicableProductIds NVARCHAR(1000), -- Comma-separated product IDs
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Discounts_Users FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_Discounts_Code ON Discounts(Code);
CREATE INDEX IX_Discounts_ValidDates ON Discounts(ValidFrom, ValidTo);
GO

-- =====================================================
-- 8. Notifications Table (الإشعارات)
-- =====================================================
CREATE TABLE Notifications (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NULL, -- NULL = جميع المستخدمين
    Title NVARCHAR(200) NOT NULL,
    TitleAr NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- Info, Warning, Error, Success, LowStock, ExpiringDiscount
    IsRead BIT DEFAULT 0,
    RelatedId INT NULL, -- مرتبط بطلب أو منتج
    RelatedType NVARCHAR(50), -- Order, Product, Discount
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ReadAt DATETIME2 NULL,
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_Notifications_UserId_IsRead ON Notifications(UserId, IsRead);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(CreatedAt DESC);
GO

-- =====================================================
-- 9. AuditLogs Table (سجل التدقيق)
-- =====================================================
CREATE TABLE AuditLogs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NULL,
    Action NVARCHAR(100) NOT NULL, -- Create, Update, Delete, Login, Logout, Void, Refund
    EntityType NVARCHAR(50) NOT NULL, -- Product, Order, Customer, User
    EntityId INT NULL,
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    IpAddress NVARCHAR(50),
    TerminalId NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs(CreatedAt DESC);
CREATE INDEX IX_AuditLogs_Action ON AuditLogs(Action);
GO

-- =====================================================
-- 10. ProductImages Table (صور المنتجات)
-- =====================================================
CREATE TABLE ProductImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    ThumbnailUrl NVARCHAR(500),
    IsPrimary BIT DEFAULT 0,
    SortOrder INT DEFAULT 0,
    AltText NVARCHAR(200),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ProductImages_ProductId ON ProductImages(ProductId);
GO

-- =====================================================
-- 11. DailyCashSummary Table (ملخص الخزنة اليومي)
-- =====================================================
CREATE TABLE DailyCashSummary (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Date DATE NOT NULL,
    UserId INT NOT NULL,
    TerminalId NVARCHAR(50),
    OpeningBalance DECIMAL(18,2) DEFAULT 0,
    CashSales DECIMAL(18,2) DEFAULT 0,
    CardSales DECIMAL(18,2) DEFAULT 0,
    Refunds DECIMAL(18,2) DEFAULT 0,
    PaidOut DECIMAL(18,2) DEFAULT 0,
    ExpectedBalance DECIMAL(18,2) DEFAULT 0,
    ActualBalance DECIMAL(18,2) DEFAULT 0,
    Difference DECIMAL(18,2) DEFAULT 0,
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_DailyCashSummary_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

CREATE UNIQUE INDEX IX_DailyCashSummary_Date_Terminal ON DailyCashSummary(Date, TerminalId);
GO

-- =====================================================
-- 12. TaxSettings Table (إعدادات الضريبة)
-- =====================================================
CREATE TABLE TaxSettings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TaxName NVARCHAR(100) NOT NULL,
    TaxNameAr NVARCHAR(100) NOT NULL,
    TaxRate DECIMAL(5,2) NOT NULL,
    IsDefault BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Seed default tax
INSERT INTO TaxSettings (TaxName, TaxNameAr, TaxRate, IsDefault, IsActive)
VALUES ('VAT', 'ضريبة القيمة المضافة', 15, 1, 1);
GO

-- =====================================================
-- Add new columns to existing tables
-- =====================================================

-- Add loyalty points earning rate to settings
ALTER TABLE Customers ADD IsVip BIT DEFAULT 0;
ALTER TABLE Customers ADD Birthday DATETIME2 NULL;
ALTER TABLE Customers ADD Gender NVARCHAR(10) NULL;
GO

-- Add discount to products table
ALTER TABLE Products ADD DiscountPercent DECIMAL(5,2) DEFAULT 0;
ALTER TABLE Products ADD DiscountedPrice DECIMAL(18,2);
ALTER TABLE Products ADD LowStockThreshold INT DEFAULT 10;
GO

-- Add customer reference to orders
ALTER TABLE Orders ADD CustomerId INT NULL;
ALTER TABLE Orders ADD CustomerName NVARCHAR(200);
ALTER TABLE Orders ADD CustomerPhone NVARCHAR(50);
ALTER TABLE Orders ADD IsPaid BIT DEFAULT 1;
ALTER TABLE Orders ADD ChangeAmount DECIMAL(18,2) DEFAULT 0;
ALTER TABLE Orders ADD PaymentReceived DECIMAL(18,2) DEFAULT 0;
GO

ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id);
GO

-- =====================================================
-- Views
-- =====================================================

-- Low Stock Products View
CREATE VIEW vw_LowStockProducts AS
SELECT 
    p.Id,
    p.SKU,
    p.Name,
    p.NameAr,
    p.StockQuantity,
    p.MinStockLevel,
    p.LowStockThreshold,
    CASE 
        WHEN p.StockQuantity <= 0 THEN 'Out of Stock'
        WHEN p.StockQuantity <= p.MinStockLevel THEN 'Critical'
        WHEN p.StockQuantity <= p.LowStockThreshold THEN 'Low'
        ELSE 'OK'
    END as StockStatus
FROM Products p
WHERE p.IsActive = 1 
    AND p.StockQuantity <= p.LowStockThreshold;
GO

-- Customer Summary View
CREATE VIEW vw_CustomerSummary AS
SELECT 
    c.Id,
    c.CustomerCode,
    c.Name,
    c.NameAr,
    c.Phone,
    c.Email,
    c.LoyaltyPoints,
    c.TotalPurchases,
    c.TotalOrders,
    c.LastPurchaseDate,
    c.IsVip,
    CASE 
        WHEN c.LoyaltyPoints >= 1000 THEN 'Platinum'
        WHEN c.LoyaltyPoints >= 500 THEN 'Gold'
        WHEN c.LoyaltyPoints >= 100 THEN 'Silver'
        ELSE 'Bronze'
    END as TierLevel
FROM Customers c
WHERE c.IsActive = 1;
GO

-- =====================================================
-- Seed Data - Customers
-- =====================================================
INSERT INTO Customers (CustomerCode, Name, NameAr, Phone, Email, LoyaltyPoints, TotalPurchases, TotalOrders) VALUES
('CUST-001', 'Ahmed Mohammed', 'أحمد محمد', '0501234567', 'ahmed@email.com', 250, 5000, 15),
('CUST-002', 'Sara Ali', 'سارة علي', '0559876543', 'sara@email.com', 750, 12000, 28),
('CUST-003', 'Khalid Omar', 'خالد عمر', '0541112233', 'khalid@email.com', 1200, 25000, 45);
GO

-- =====================================================
-- Seed Data - Discounts
-- =====================================================
INSERT INTO Discounts (Code, Name, NameAr, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscountAmount, UsageLimit, ValidFrom, ValidTo, IsActive, CreatedBy) VALUES
('WELCOME10', 'Welcome Discount', 'خصم ترحيبي', 'خصم 10% للعملاء الجدد', 'Percentage', 10, 100, 50, 100, '2026-01-01', '2026-12-31', 1, 1),
('SUMMER20', 'Summer Sale', 'تخفيضات الصيف', 'خصم 20 ر.س على المشتريات فوق 200 ر.س', 'Fixed', 20, 200, NULL, 50, '2026-06-01', '2026-08-31', 1, 1),
('VIP15', 'VIP Discount', 'خصم العملاء المميزين', 'خصم 15% للعملاء المميزين', 'Percentage', 15, 0, 100, NULL, '2026-01-01', '2026-12-31', 1, 1);
GO

-- =====================================================
-- Seed Data - Notifications
-- =====================================================
INSERT INTO Notifications (Title, TitleAr, Message, Type, CreatedAt) VALUES
('System Update', 'تحديث النظام', 'تم تحديث النظام بنجاح - الإصدار 1.0', 'Info', GETUTCDATE()),
('Low Stock Alert', 'تنبيه مخزون منخفض', 'بعض المنتجات وصلت للحد الأدنى من المخزون', 'Warning', GETUTCDATE());
GO

PRINT 'Advanced features database schema created successfully!';
GO
