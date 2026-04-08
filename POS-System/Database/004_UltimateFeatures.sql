-- =====================================================
-- Architect POS - Ultimate Features Database Script
-- المميزات الاحترافية النهائية
-- =====================================================

USE ArchitectPOS;
GO

-- =====================================================
-- 1. Tables Table (إدارة الطاولات - للمطاعم)
-- =====================================================
CREATE TABLE Tables (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TableNumber NVARCHAR(20) NOT NULL UNIQUE,
    TableName NVARCHAR(100),
    TableNameAr NVARCHAR(100),
    Capacity INT NOT NULL DEFAULT 4,
    Location NVARCHAR(50), -- Indoor, Outdoor, Patio
    Status NVARCHAR(50) DEFAULT 'Available', -- Available, Occupied, Reserved, Cleaning
    CurrentOrderId INT NULL,
    CurrentCustomerCount INT DEFAULT 0,
    ReservationDateTime DATETIME2 NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Tables_Order FOREIGN KEY (CurrentOrderId) REFERENCES Orders(Id)
);
GO

CREATE INDEX IX_Tables_Status ON Tables(Status);
GO

-- Seed sample tables
INSERT INTO Tables (TableNumber, TableNameAr, Capacity, Location, Status) VALUES
('T01', 'طاولة 1', 4, 'Indoor', 'Available'),
('T02', 'طاولة 2', 6, 'Indoor', 'Available'),
('T03', 'طاولة 3', 2, 'Outdoor', 'Available'),
('T04', 'طاولة 4', 8, 'Patio', 'Available'),
('T05', 'طاولة 5', 4, 'Indoor', 'Available');
GO

-- =====================================================
-- 2. KitchenOrders Table (طلبات المطبخ - KDS)
-- =====================================================
CREATE TABLE KitchenOrders (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    OrderNumber NVARCHAR(50) NOT NULL,
    Station NVARCHAR(50) NOT NULL, -- Kitchen, Bar, Dessert, Grill
    Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Preparing, Ready, Served, Cancelled
    Priority NVARCHAR(20) DEFAULT 'Normal', -- Normal, Urgent, VIP
    EstimatedTime INT, -- دقائق
    StartedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_KitchenOrders_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id)
);
GO

CREATE INDEX IX_KitchenOrders_Status ON KitchenOrders(Status);
CREATE INDEX IX_KitchenOrders_Station ON KitchenOrders(Station);
GO

-- =====================================================
-- 3. KitchenOrderItems Table (عناصر المطبخ)
-- =====================================================
CREATE TABLE KitchenOrderItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    KitchenOrderId INT NOT NULL,
    OrderItemId INT NOT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    ProductNameAr NVARCHAR(200) NOT NULL,
    Quantity INT NOT NULL,
    SpecialInstructions NVARCHAR(500),
    IsPrepared BIT DEFAULT 0,
    PreparedAt DATETIME2 NULL,
    CONSTRAINT FK_KitchenOrderItems_KitchenOrders FOREIGN KEY (KitchenOrderId) REFERENCES KitchenOrders(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- 4. Drivers Table (السائقين)
-- =====================================================
CREATE TABLE Drivers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DriverCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(50) NOT NULL,
    Email NVARCHAR(255),
    LicenseNumber NVARCHAR(50),
    VehicleType NVARCHAR(50), -- Motorcycle, Car, Van
    VehicleNumber NVARCHAR(50),
    IsAvailable BIT DEFAULT 1,
    Rating DECIMAL(3,2) DEFAULT 5.00,
    TotalDeliveries INT DEFAULT 0,
    CommissionRate DECIMAL(5,2) DEFAULT 10,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

CREATE INDEX IX_Drivers_Availability ON Drivers(IsAvailable);
GO

-- =====================================================
-- 5. Deliveries Table (التوصيل)
-- =====================================================
CREATE TABLE Deliveries (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DeliveryNumber NVARCHAR(50) NOT NULL UNIQUE,
    OrderId INT NOT NULL,
    OrderNumber NVARCHAR(50) NOT NULL,
    CustomerId INT NOT NULL,
    CustomerName NVARCHAR(200) NOT NULL,
    CustomerPhone NVARCHAR(50) NOT NULL,
    DeliveryAddress NVARCHAR(500) NOT NULL,
    City NVARCHAR(100),
    DriverId INT NULL,
    DriverName NVARCHAR(200),
    DeliveryFee DECIMAL(18,2) DEFAULT 0,
    EstimatedTime INT, -- دقائق
    Distance DECIMAL(10,2), -- كم
    Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Assigned, PickedUp, InTransit, Delivered, Cancelled
    DispatchedAt DATETIME2 NULL,
    PickedUpAt DATETIME2 NULL,
    DeliveredAt DATETIME2 NULL,
    CustomerRating INT NULL, -- 1-5
    CustomerFeedback NVARCHAR(500),
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Deliveries_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    CONSTRAINT FK_Deliveries_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_Deliveries_Drivers FOREIGN KEY (DriverId) REFERENCES Drivers(Id)
);
GO

CREATE INDEX IX_Deliveries_Status ON Deliveries(Status);
CREATE INDEX IX_Deliveries_Driver ON Deliveries(DriverId);
GO

-- =====================================================
-- 6. Suppliers Table (الموردين)
-- =====================================================
CREATE TABLE Suppliers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SupplierCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(200),
    Phone NVARCHAR(50),
    Email NVARCHAR(255),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    Country NVARCHAR(100) DEFAULT 'السعودية',
    TaxNumber NVARCHAR(50),
    PaymentTerms NVARCHAR(100), -- Net30, Net60, COD
    CreditLimit DECIMAL(18,2),
    Rating DECIMAL(3,2) DEFAULT 5.00,
    Notes NVARCHAR(1000),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- =====================================================
-- 7. PurchaseOrders Table (أوامر الشراء)
-- =====================================================
CREATE TABLE PurchaseOrders (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PONumber NVARCHAR(50) NOT NULL UNIQUE,
    SupplierId INT NOT NULL,
    OrderDate DATE NOT NULL,
    ExpectedDeliveryDate DATE,
    Status NVARCHAR(50) DEFAULT 'Draft', -- Draft, Sent, Confirmed, Received, Cancelled
    SubTotal DECIMAL(18,2) DEFAULT 0,
    TaxAmount DECIMAL(18,2) DEFAULT 0,
    TotalAmount DECIMAL(18,2) DEFAULT 0,
    Notes NVARCHAR(500),
    CreatedBy INT NOT NULL,
    ApprovedBy INT NULL,
    ApprovedAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_PurchaseOrders_Suppliers FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id),
    CONSTRAINT FK_PurchaseOrders_Users FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);
GO

-- =====================================================
-- 8. PurchaseOrderItems Table (عناصر أمر الشراء)
-- =====================================================
CREATE TABLE PurchaseOrderItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PurchaseOrderId INT NOT NULL,
    ProductId INT NOT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    SKU NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    UnitCost DECIMAL(18,2) NOT NULL,
    TotalCost DECIMAL(18,2) NOT NULL,
    ReceivedQuantity INT DEFAULT 0,
    CONSTRAINT FK_POItems_PurchaseOrders FOREIGN KEY (PurchaseOrderId) REFERENCES PurchaseOrders(Id) ON DELETE CASCADE
);
GO

-- =====================================================
-- 9. Currencies Table (العملات)
-- =====================================================
CREATE TABLE Currencies (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(10) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    NameAr NVARCHAR(100) NOT NULL,
    Symbol NVARCHAR(10) NOT NULL,
    ExchangeRate DECIMAL(18,6) NOT NULL DEFAULT 1,
    IsDefault BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Seed currencies
INSERT INTO Currencies (Code, Name, NameAr, Symbol, ExchangeRate, IsDefault, IsActive) VALUES
('SAR', 'Saudi Riyal', 'ريال سعودي', 'ر.س', 1.000000, 1, 1),
('USD', 'US Dollar', 'دولار أمريكي', '$', 3.750000, 0, 1),
('EUR', 'Euro', 'يورو', '€', 4.100000, 0, 1),
('AED', 'UAE Dirham', 'درهم إماراتي', 'د.إ', 1.020000, 0, 1);
GO

-- =====================================================
-- 10. ExchangeRateHistory Table (سجل أسعار الصرف)
-- =====================================================
CREATE TABLE ExchangeRateHistory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CurrencyId INT NOT NULL,
    Rate DECIMAL(18,6) NOT NULL,
    EffectiveDate DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedBy INT,
    CONSTRAINT FK_ExchangeRateHistory_Currencies FOREIGN KEY (CurrencyId) REFERENCES Currencies(Id)
);
GO

-- =====================================================
-- 11. EmployeeCommissions Table (عمولات الموظفين)
-- =====================================================
CREATE TABLE EmployeeCommissions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    OrderId INT NOT NULL,
    OrderAmount DECIMAL(18,2) NOT NULL,
    CommissionRate DECIMAL(5,2) NOT NULL,
    CommissionAmount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Paid
    PaidAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_EmployeeCommissions_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_EmployeeCommissions_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id)
);
GO

-- =====================================================
-- 12. HappyHourRules Table (قواعد الساعات السعيدة)
-- =====================================================
CREATE TABLE HappyHourRules (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    DaysOfWeek NVARCHAR(100), -- Comma-separated: Mon,Tue,Wed
    DiscountPercent DECIMAL(5,2) NOT NULL,
    ApplicableCategoryIds NVARCHAR(500),
    ApplicableProductIds NVARCHAR(1000),
    IsActive BIT DEFAULT 1,
    ValidFrom DATE NOT NULL,
    ValidTo DATE NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

CREATE INDEX IX_HappyHourRules_Time ON HappyHourRules(StartTime, EndTime);
GO

-- =====================================================
-- 13. CustomerFeedback Table (آراء العملاء)
-- =====================================================
CREATE TABLE CustomerFeedback (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    CustomerId INT NOT NULL,
    OverallRating INT NOT NULL, -- 1-5
    FoodRating INT NULL,
    ServiceRating INT NULL,
    DeliveryRating INT NULL,
    Comment NVARCHAR(1000),
    IsAnonymous BIT DEFAULT 0,
    IsResolved BIT DEFAULT 0,
    ResolvedAt DATETIME2 NULL,
    Response NVARCHAR(1000),
    RespondedBy INT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_CustomerFeedback_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    CONSTRAINT FK_CustomerFeedback_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);
GO

-- =====================================================
-- 14. InventoryAlerts Table (تنبيهات المخزون)
-- =====================================================
CREATE TABLE InventoryAlerts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT NOT NULL,
    AlertType NVARCHAR(50) NOT NULL, -- LowStock, OutOfStock, Expiring, OverStock
    AlertMessage NVARCHAR(500) NOT NULL,
    CurrentStock INT NOT NULL,
    Threshold INT NOT NULL,
    IsRead BIT DEFAULT 0,
    IsResolved BIT DEFAULT 0,
    ResolvedAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_InventoryAlerts_Products FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
GO

-- =====================================================
-- 15. Recommendations Table (التوصيات الذكية)
-- =====================================================
CREATE TABLE Recommendations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NULL, -- NULL for general recommendations
    ProductId INT NOT NULL,
    Reason NVARCHAR(200), -- Popular, Trending, Seasonal, SimilarToPurchase, FrequentlyBoughtTogether
    Score DECIMAL(5,2) DEFAULT 0,
    ValidFrom DATETIME2 DEFAULT GETUTCDATE(),
    ValidTo DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Recommendations_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_Recommendations_Products FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
GO

-- =====================================================
-- 16. VoiceCommands Table (سجل الأوامر الصوتية)
-- =====================================================
CREATE TABLE VoiceCommands (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Command NVARCHAR(200) NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    IsSuccessful BIT DEFAULT 0,
    Error NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_VoiceCommands_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- =====================================================
-- 17. OfflineTransactions Table (المعاملات غير المتصلة)
-- =====================================================
CREATE TABLE OfflineTransactions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TransactionType NVARCHAR(50) NOT NULL, -- Order, Refund, Payment
    TransactionData NVARCHAR(MAX) NOT NULL,
    SyncStatus NVARCHAR(50) DEFAULT 'Pending', -- Pending, Synced, Failed
    SyncedAt DATETIME2 NULL,
    Error NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

CREATE INDEX IX_OfflineTransactions_SyncStatus ON OfflineTransactions(SyncStatus);
GO

-- =====================================================
-- 18. Update Products Table
-- =====================================================
ALTER TABLE Products ADD SupplierId INT NULL;
ALTER TABLE Products ADD ReorderLevel INT DEFAULT 10;
ALTER TABLE Products ADD ReorderQuantity INT DEFAULT 50;
ALTER TABLE Products ADD ExpiryDate DATE NULL;
ALTER TABLE Products ADD Weight DECIMAL(10,2);
ALTER TABLE Products ADD Unit NVARCHAR(20) DEFAULT 'piece'; -- piece, kg, liter
ALTER TABLE Products ADD IsTrackable BIT DEFAULT 1;
ALTER TABLE Products ADD AverageCost DECIMAL(18,2);
ALTER TABLE Products ADD LastPurchaseCost DECIMAL(18,2);
GO

ALTER TABLE Products ADD CONSTRAINT FK_Products_Suppliers FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id);
GO

-- =====================================================
-- 19. Update Orders Table
-- =====================================================
ALTER TABLE Orders ADD CurrencyId INT DEFAULT 1;
ALTER TABLE Orders ADD ExchangeRate DECIMAL(18,6) DEFAULT 1;
ALTER TABLE Orders ADD LocalAmount DECIMAL(18,2);
ALTER TABLE Orders ADD TableId INT NULL;
ALTER TABLE Orders ADD CustomerCount INT DEFAULT 1;
ALTER TABLE Orders ADD HappyHourDiscount DECIMAL(18,2) DEFAULT 0;
GO

ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Currencies FOREIGN KEY (CurrencyId) REFERENCES Currencies(Id);
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Tables FOREIGN KEY (TableId) REFERENCES Tables(Id);
GO

-- =====================================================
-- 20. Views
-- =====================================================

-- Table Status View
CREATE VIEW vw_TableStatus AS
SELECT 
    t.Id,
    t.TableNumber,
    t.TableNameAr,
    t.Capacity,
    t.Location,
    t.Status,
    t.CurrentCustomerCount,
    t.ReservationDateTime,
    o.OrderNumber,
    o.TotalAmount as CurrentOrderTotal,
    o.CreatedAt as OrderStartedAt,
    DATEDIFF(MINUTE, o.CreatedAt, GETUTCDATE()) as MinutesOccupied
FROM Tables t
LEFT JOIN Orders o ON t.CurrentOrderId = o.Id
WHERE t.IsActive = 1;
GO

-- Kitchen Display View
CREATE VIEW vw_KitchenDisplay AS
SELECT 
    ko.Id,
    ko.OrderNumber,
    ko.Station,
    ko.Status,
    ko.Priority,
    ko.EstimatedTime,
    ko.CreatedAt,
    DATEDIFF(MINUTE, ko.CreatedAt, GETUTCDATE()) as ElapsedMinutes,
    COUNT(koi.Id) as TotalItems,
    SUM(CASE WHEN koi.IsPrepared = 1 THEN 1 ELSE 0 END) as PreparedItems,
    o.TableNumber,
    o.CustomerName
FROM KitchenOrders ko
INNER JOIN KitchenOrderItems koi ON ko.Id = koi.KitchenOrderId
LEFT JOIN Orders o ON ko.OrderId = o.Id
WHERE ko.Status NOT IN ('Served', 'Cancelled')
GROUP BY ko.Id, ko.OrderNumber, ko.Station, ko.Status, ko.Priority, ko.EstimatedTime, 
         ko.CreatedAt, o.TableNumber, o.CustomerName;
GO

-- Delivery Tracking View
CREATE VIEW vw_DeliveryTracking AS
SELECT 
    d.Id,
    d.DeliveryNumber,
    d.OrderNumber,
    d.CustomerName,
    d.CustomerPhone,
    d.DeliveryAddress,
    d.DriverName,
    dr.Phone as DriverPhone,
    d.Status,
    d.EstimatedTime,
    d.Distance,
    d.DeliveryFee,
    d.DispatchedAt,
    d.PickedUpAt,
    d.DeliveredAt,
    DATEDIFF(MINUTE, d.CreatedAt, GETUTCDATE()) as TotalElapsedMinutes,
    CASE 
        WHEN d.Status = 'Delivered' THEN DATEDIFF(MINUTE, d.CreatedAt, d.DeliveredAt)
        ELSE NULL
    END as DeliveryDurationMinutes
FROM Deliveries d
LEFT JOIN Drivers dr ON d.DriverId = dr.Id;
GO

-- Employee Performance View
CREATE VIEW vw_EmployeePerformance AS
SELECT 
    u.Id as UserId,
    u.FullName,
    u.Username,
    COUNT(DISTINCT o.Id) as TotalOrders,
    SUM(o.TotalAmount) as TotalSales,
    AVG(o.TotalAmount) as AvgOrderValue,
    SUM(ec.CommissionAmount) as TotalCommission,
    SUM(CASE WHEN ec.Status = 'Paid' THEN ec.CommissionAmount ELSE 0 END) as PaidCommission,
    MAX(o.CreatedAt) as LastSaleDate,
    DATEDIFF(DAY, MIN(o.CreatedAt), MAX(o.CreatedAt)) as WorkingDays,
    CASE 
        WHEN DATEDIFF(DAY, MIN(o.CreatedAt), MAX(o.CreatedAt)) > 0 
        THEN SUM(o.TotalAmount) / DATEDIFF(DAY, MIN(o.CreatedAt), MAX(o.CreatedAt))
        ELSE 0 
    END as DailyAverageSales
FROM Users u
LEFT JOIN Orders o ON u.Id = o.UserId AND o.Status = 'Completed'
LEFT JOIN EmployeeCommissions ec ON u.Id = ec.UserId
WHERE u.IsActive = 1
GROUP BY u.Id, u.FullName, u.Username;
GO

-- =====================================================
-- 21. Seed Sample Suppliers
-- =====================================================
INSERT INTO Suppliers (SupplierCode, Name, NameAr, ContactPerson, Phone, Email, City, PaymentTerms, IsActive) VALUES
('SUP001', 'Tech Supplies Co', 'شركة التقنية للتوريدات', 'Ahmed Hassan', '0501234567', 'ahmed@techsupplies.com', 'الرياض', 'Net30', 1),
('SUP002', 'Fashion World', 'عالم الأزياء', 'Sara Mohammed', '0559876543', 'sara@fashionworld.com', 'جدة', 'Net60', 1);
GO

-- =====================================================
-- 22. Seed Sample Drivers
-- =====================================================
INSERT INTO Drivers (DriverCode, Name, NameAr, Phone, VehicleType, VehicleNumber, IsAvailable, IsActive) VALUES
('DRV001', 'Mohammed Ali', 'محمد علي', '0541112233', 'Motorcycle', 'ABC-1234', 1, 1),
('DRV002', 'Omar Khalid', 'عمر خالد', '0542223344', 'Car', 'XYZ-5678', 1, 1);
GO

-- =====================================================
-- 23. Seed Sample Happy Hour Rules
-- =====================================================
INSERT INTO HappyHourRules (Name, NameAr, StartTime, EndTime, DaysOfWeek, DiscountPercent, IsActive, ValidFrom, ValidTo) VALUES
('Morning Happy Hour', 'ساعات الصباح السعيدة', '07:00', '10:00', 'Mon,Tue,Wed,Thu,Fri', 15, 1, '2026-01-01', '2026-12-31'),
('Weekend Special', 'عرض عطلة نهاية الأسبوع', '18:00', '22:00', 'Fri,Sat', 20, 1, '2026-01-01', '2026-12-31');
GO

PRINT 'Ultimate features database schema created successfully!';
GO
