-- =====================================================
-- Architect POS - Premium Features Database Script
-- المميزات الاحترافية المتقدمة
-- =====================================================

USE ArchitectPOS;
GO

-- =====================================================
-- 1. Branches Table (الفروع)
-- =====================================================
CREATE TABLE Branches (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BranchCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500),
    City NVARCHAR(100),
    Country NVARCHAR(100) DEFAULT 'السعودية',
    Phone NVARCHAR(50),
    Email NVARCHAR(255),
    TaxNumber NVARCHAR(50),
    CommercialRegistration NVARCHAR(50),
    IsMain BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2
);
GO

-- Seed main branch
INSERT INTO Branches (BranchCode, Name, NameAr, Address, City, IsMain, IsActive)
VALUES ('MAIN', 'Main Branch', 'الفرع الرئيسي', 'الرياض', 'الرياض', 1, 1);
GO

-- =====================================================
-- 2. Terminals Table (الأجهزة)
-- =====================================================
CREATE TABLE Terminals (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TerminalCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    BranchId INT NOT NULL,
    IPAddress NVARCHAR(50),
    MACAddress NVARCHAR(50),
    LastActiveAt DATETIME2,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Terminals_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id)
);
GO

-- Seed terminals
INSERT INTO Terminals (TerminalCode, Name, BranchId, IsActive) VALUES
('T001', 'Terminal 01', 1, 1),
('T002', 'Terminal 02', 1, 1);
GO

-- =====================================================
-- 3. ProductBundles Table (حزم المنتجات)
-- =====================================================
CREATE TABLE ProductBundles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BundleCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    BundlePrice DECIMAL(18,2) NOT NULL,
    OriginalPrice DECIMAL(18,2) NOT NULL,
    DiscountPercent DECIMAL(5,2) NOT NULL,
    ImageUrl NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    ValidFrom DATETIME2,
    ValidTo DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- =====================================================
-- 4. BundleItems Table (عناصر الحزمة)
-- =====================================================
CREATE TABLE BundleItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BundleId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_BundleItems_Bundles FOREIGN KEY (BundleId) REFERENCES ProductBundles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_BundleItems_Products FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
GO

-- =====================================================
-- 5. GiftCards Table (بطاقات الهدايا)
-- =====================================================
CREATE TABLE GiftCards (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CardNumber NVARCHAR(20) NOT NULL UNIQUE,
    Pin NVARCHAR(10) NOT NULL,
    InitialAmount DECIMAL(18,2) NOT NULL,
    CurrentBalance DECIMAL(18,2) NOT NULL,
    CustomerId INT NULL,
    CustomerName NVARCHAR(200),
    IssuedBy INT NOT NULL,
    IssuedAt DATETIME2 DEFAULT GETUTCDATE(),
    ActivatedAt DATETIME2 NULL,
    ExpiresAt DATETIME2 NULL,
    Status NVARCHAR(50) DEFAULT 'Inactive', -- Inactive, Active, Used, Expired, Cancelled
    Notes NVARCHAR(500),
    CONSTRAINT FK_GiftCards_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_GiftCards_IssuedBy FOREIGN KEY (IssuedBy) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_GiftCards_CardNumber ON GiftCards(CardNumber);
CREATE INDEX IX_GiftCards_Status ON GiftCards(Status);
GO

-- =====================================================
-- 6. GiftCardTransactions Table (معاملات بطاقات الهدايا)
-- =====================================================
CREATE TABLE GiftCardTransactions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    GiftCardId INT NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- Activate, Redeem, Recharge, Refund
    Amount DECIMAL(18,2) NOT NULL,
    OrderId INT NULL,
    UserId INT NOT NULL,
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_GiftCardTransactions_GiftCards FOREIGN KEY (GiftCardId) REFERENCES GiftCards(Id),
    CONSTRAINT FK_GiftCardTransactions_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    CONSTRAINT FK_GiftCardTransactions_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- =====================================================
-- 7. Favorites Table (المفضلة)
-- =====================================================
CREATE TABLE Favorites (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    ProductId INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Favorites_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Favorites_Products FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Favorites_UserProduct UNIQUE (UserId, ProductId)
);
GO

-- =====================================================
-- 8. RecentProducts Table (المنتجات الأخيرة)
-- =====================================================
CREATE TABLE RecentProducts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    ProductId INT NOT NULL,
    LastAccessedAt DATETIME2 DEFAULT GETUTCDATE(),
    AccessCount INT DEFAULT 1,
    CONSTRAINT FK_RecentProducts_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_RecentProducts_Products FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_RecentProducts_UserProduct UNIQUE (UserId, ProductId)
);
GO

-- =====================================================
-- 9. SalesGoals Table (أهداف المبيعات)
-- =====================================================
CREATE TABLE SalesGoals (
    Id INT PRIMARY KEY IDENTITY(1,1),
    GoalType NVARCHAR(50) NOT NULL, -- Daily, Weekly, Monthly
    TargetAmount DECIMAL(18,2) NOT NULL,
    TargetOrders INT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    BranchId INT NULL,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_SalesGoals_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id),
    CONSTRAINT FK_SalesGoals_Users FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);
GO

-- =====================================================
-- 10. PriceOverrides Table (تعديل الأسعار)
-- =====================================================
CREATE TABLE PriceOverrides (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderItemId INT NOT NULL,
    OriginalPrice DECIMAL(18,2) NOT NULL,
    OverridePrice DECIMAL(18,2) NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    ApprovedBy INT NOT NULL,
    ApprovedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_PriceOverrides_OrderItems FOREIGN KEY (OrderItemId) REFERENCES OrderItems(Id),
    CONSTRAINT FK_PriceOverrides_Users FOREIGN KEY (ApprovedBy) REFERENCES Users(Id)
);
GO

-- =====================================================
-- 11. OrderTypes (أنواع الطلب)
-- =====================================================
CREATE TABLE OrderTypes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    NameAr NVARCHAR(100) NOT NULL,
    Icon NVARCHAR(50),
    Color NVARCHAR(20),
    SortOrder INT DEFAULT 0,
    IsActive BIT DEFAULT 1
);
GO

-- Seed order types
INSERT INTO OrderTypes (Code, Name, NameAr, Icon, Color, SortOrder, IsActive) VALUES
('DINE_IN', 'Dine In', 'تناول بالمطعم', 'restaurant', '#006c49', 1, 1),
('TAKEAWAY', 'Takeaway', 'جاهز للاستلام', 'takeout', '#00236f', 2, 1),
('DELIVERY', 'Delivery', 'توصيل', 'delivery', '#f59e0b', 3, 1);
GO

-- =====================================================
-- 12. Update Orders Table
-- =====================================================
ALTER TABLE Orders ADD OrderTypeId INT NULL;
ALTER TABLE Orders ADD TableNumber NVARCHAR(20);
ALTER TABLE Orders ADD DeliveryAddress NVARCHAR(500);
ALTER TABLE Orders ADD DeliveryPhone NVARCHAR(50);
ALTER TABLE Orders ADD DeliveryNotes NVARCHAR(500);
ALTER TABLE Orders ADD TipAmount DECIMAL(18,2) DEFAULT 0;
ALTER TABLE Orders ADD IsRounded BIT DEFAULT 0;
ALTER TABLE Orders ADD RoundedAmount DECIMAL(18,2);
GO

ALTER TABLE Orders ADD CONSTRAINT FK_Orders_OrderTypes FOREIGN KEY (OrderTypeId) REFERENCES OrderTypes(Id);
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id);
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Terminals FOREIGN KEY (TerminalId) REFERENCES Terminals(TerminalCode);
GO

-- =====================================================
-- 13. Update OrderItems Table
-- =====================================================
ALTER TABLE OrderItems ADD ItemNotes NVARCHAR(500);
ALTER TABLE OrderItems ADD IsGiftWrap BIT DEFAULT 0;
ALTER TABLE OrderItems ADD GiftWrapFee DECIMAL(18,2) DEFAULT 0;
ALTER TABLE OrderItems ADD IsBundleItem BIT DEFAULT 0;
ALTER TABLE OrderItems ADD BundleId INT NULL;
GO

-- =====================================================
-- 14. PaymentSplits Table (تقسيم الدفع)
-- =====================================================
CREATE TABLE PaymentSplits (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    GiftCardId INT NULL,
    CardLast4 NVARCHAR(4),
    AuthorizationCode NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_PaymentSplits_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PaymentSplits_GiftCards FOREIGN KEY (GiftCardId) REFERENCES GiftCards(Id)
);
GO

-- =====================================================
-- 15. QuickAmounts Table (المبالغ السريعة)
-- =====================================================
CREATE TABLE QuickAmounts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Amount DECIMAL(18,2) NOT NULL,
    Label NVARCHAR(50),
    SortOrder INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Seed quick amounts
INSERT INTO QuickAmounts (Amount, Label, SortOrder, IsActive) VALUES
(10, '10 ر.س', 1, 1),
(20, '20 ر.س', 2, 1),
(50, '50 ر.س', 3, 1),
(100, '100 ر.س', 4, 1),
(200, '200 ر.س', 5, 1),
(500, '500 ر.س', 6, 1);
GO

-- =====================================================
-- 16. SystemSettings Table (إعدادات النظام)
-- =====================================================
CREATE TABLE SystemSettings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX),
    SettingType NVARCHAR(50) DEFAULT 'String', -- String, Number, Boolean, JSON
    Description NVARCHAR(500),
    UpdatedBy INT,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Seed settings
INSERT INTO SystemSettings (SettingKey, SettingValue, SettingType, Description) VALUES
('Currency', 'ر.س', 'String', 'عملة النظام'),
('TaxRate', '15', 'Number', 'نسبة الضريبة الافتراضية'),
('LoyaltyPointsRate', '1', 'Number', 'نقاط الولاء لكل ريال'),
('EnableGiftWrap', 'true', 'Boolean', 'تفعيل التغليف'),
('GiftWrapFee', '5', 'Number', 'رسوم التغليف'),
('EnableTips', 'true', 'Boolean', 'تفعيل الإكراميات'),
('RoundingEnabled', 'true', 'Boolean', 'تفعيل التقريب'),
('PrintReceipt', 'true', 'Boolean', 'طباعة الإيصال تلقائياً'),
('SoundEnabled', 'true', 'Boolean', 'تفعيل الأصوات'),
('LowStockAlert', 'true', 'Boolean', 'تنبيه المخزون المنخفض'),
('DefaultBranch', '1', 'Number', 'الفرع الافتراضي'),
('DefaultTerminal', 'T001', 'String', 'الجهاز الافتراضي');
GO

-- =====================================================
-- 17. View: Dashboard Summary
-- =====================================================
CREATE VIEW vw_DashboardSummary AS
SELECT 
    CAST(o.CreatedAt AS DATE) as SaleDate,
    COUNT(DISTINCT o.Id) as TotalOrders,
    SUM(o.TotalAmount) as TotalRevenue,
    SUM(o.TaxAmount) as TotalTax,
    SUM(o.TipAmount) as TotalTips,
    SUM(o.DiscountAmount) as TotalDiscounts,
    AVG(o.TotalAmount) as AvgOrderValue,
    COUNT(DISTINCT o.UserId) as ActiveCashiers,
    COUNT(DISTINCT o.CustomerId) as UniqueCustomers
FROM Orders o
WHERE o.Status = 'Completed'
    AND o.CreatedAt >= DATEADD(DAY, -30, GETUTCDATE())
GROUP BY CAST(o.CreatedAt AS DATE);
GO

-- =====================================================
-- 18. View: Branch Performance
-- =====================================================
CREATE VIEW vw_BranchPerformance AS
SELECT 
    b.Id as BranchId,
    b.NameAr as BranchName,
    COUNT(DISTINCT o.Id) as TotalOrders,
    SUM(o.TotalAmount) as TotalRevenue,
    AVG(o.TotalAmount) as AvgOrderValue,
    COUNT(DISTINCT o.UserId) as ActiveCashiers
FROM Branches b
LEFT JOIN Orders o ON o.BranchId = CAST(b.Id AS NVARCHAR) AND o.Status = 'Completed'
WHERE b.IsActive = 1
GROUP BY b.Id, b.NameAr;
GO

-- =====================================================
-- 19. Seed Sample Bundles
-- =====================================================
INSERT INTO ProductBundles (BundleCode, Name, NameAr, Description, BundlePrice, OriginalPrice, DiscountPercent, IsActive)
VALUES 
('BUNDLE001', 'Tech Starter Pack', 'باقة التقنية المبتدئة', 'سماعات + ماوس', 350, 424, 17.45, 1),
('BUNDLE002', 'Fashion Bundle', 'باقة الأزياء', 'ساعة + نظارة', 2100, 2340, 10.26, 1);
GO

-- =====================================================
-- 20. Seed Sample Gift Card
-- =====================================================
INSERT INTO GiftCards (CardNumber, Pin, InitialAmount, CurrentBalance, Status, IssuedBy, IssuedAt)
VALUES ('GC-2026-001', '1234', 500, 500, 'Active', 1, GETUTCDATE());
GO

PRINT 'Premium features database schema created successfully!';
GO
