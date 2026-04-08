-- =====================================================
-- Architect POS - Database Schema
-- SQL Server Database Initialization Script
-- =====================================================

USE master;
GO

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ArchitectPOS')
BEGIN
    CREATE DATABASE ArchitectPOS;
    PRINT 'Database ArchitectPOS created successfully.';
END
ELSE
BEGIN
    PRINT 'Database ArchitectPOS already exists.';
END
GO

USE ArchitectPOS;
GO

-- =====================================================
-- 1. Roles Table
-- =====================================================
CREATE TABLE Roles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2
);
GO

-- =====================================================
-- 2. Users Table
-- =====================================================
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    IsActive BIT DEFAULT 1,
    LastLoginAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);
GO

CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);
GO

-- =====================================================
-- 3. Categories Table
-- =====================================================
CREATE TABLE Categories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    NameAr NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Icon NVARCHAR(50),
    Color NVARCHAR(20),
    ParentCategoryId INT NULL,
    SortOrder INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    CONSTRAINT FK_Categories_ParentCategory FOREIGN KEY (ParentCategoryId) REFERENCES Categories(Id)
);
GO

CREATE INDEX IX_Categories_ParentCategory ON Categories(ParentCategoryId);
GO

-- =====================================================
-- 4. Products Table
-- =====================================================
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SKU NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    CategoryId INT NOT NULL,
    Barcode NVARCHAR(100),
    Price DECIMAL(18,2) NOT NULL,
    CostPrice DECIMAL(18,2),
    TaxRate DECIMAL(5,2) DEFAULT 15.00,
    StockQuantity INT DEFAULT 0,
    MinStockLevel INT DEFAULT 0,
    ImageUrl NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);
GO

CREATE INDEX IX_Products_Category ON Products(CategoryId);
CREATE INDEX IX_Products_SKU ON Products(SKU);
CREATE INDEX IX_Products_Barcode ON Products(Barcode);
GO

-- =====================================================
-- 5. Orders Table
-- =====================================================
CREATE TABLE Orders (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderNumber NVARCHAR(50) NOT NULL UNIQUE,
    UserId INT NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL, -- Cash, Card, Mixed
    Status NVARCHAR(50) DEFAULT 'Completed', -- Completed, Voided, Refunded
    Notes NVARCHAR(500),
    TerminalId NVARCHAR(50),
    BranchId NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_Orders_OrderNumber ON Orders(OrderNumber);
CREATE INDEX IX_Orders_UserId ON Orders(UserId);
CREATE INDEX IX_Orders_CreatedAt ON Orders(CreatedAt);
GO

-- =====================================================
-- 6. OrderItems Table
-- =====================================================
CREATE TABLE OrderItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    ProductSKU NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TaxRate DECIMAL(5,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
GO

CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);
GO

-- =====================================================
-- 7. Payments Table
-- =====================================================
CREATE TABLE Payments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL, -- Cash, Card, CreditCard
    Amount DECIMAL(18,2) NOT NULL,
    TransactionReference NVARCHAR(100),
    CardLast4 NVARCHAR(4),
    CardType NVARCHAR(50),
    Status NVARCHAR(50) DEFAULT 'Completed',
    ProcessedAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Payments_OrderId ON Payments(OrderId);
GO

-- =====================================================
-- 8. Customers Table (Optional - for future loyalty program)
-- =====================================================
CREATE TABLE Customers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    NameAr NVARCHAR(200),
    Phone NVARCHAR(50),
    Email NVARCHAR(255),
    LoyaltyPoints INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2
);
GO

-- =====================================================
-- Seed Data - Roles
-- =====================================================
INSERT INTO Roles (Name, Description) VALUES
('Admin', 'System Administrator with full access'),
('Manager', 'Store Manager with management access'),
('Cashier', 'Cashier with POS access only');
GO

-- =====================================================
-- Seed Data - Users (Default password: Admin@123)
-- Note: In production, use proper password hashing (BCrypt)
-- =====================================================
INSERT INTO Users (Username, Email, PasswordHash, FullName, RoleId) VALUES
('admin', 'admin@architectpos.com', '$2a$11$WqF5vK8jXzYpN2mO3rP4tOeJx5vK8jXzYpN2mO3rP4tOeJx5vK8jX', 'System Administrator', 1),
('cashier01', 'cashier@architectpos.com', '$2a$11$WqF5vK8jXzYpN2mO3rP4tOeJx5vK8jXzYpN2mO3rP4tOeJx5vK8jX', 'Cashier User 01', 3);
GO

-- =====================================================
-- Seed Data - Categories
-- =====================================================
INSERT INTO Categories (Name, NameAr, Description, Icon, Color, SortOrder) VALUES
('All', 'الكل', 'All Products', 'apps', '#00236f', 0),
('Electronics', 'الإلكترونيات', 'Electronic Devices', 'devices', '#00236f', 1),
('Groceries', 'البقالة', 'Grocery Items', 'grocery', '#006c49', 2),
('Beverages', 'المشروبات', 'Drinks & Beverages', 'local_drink', '#006c49', 3),
('Bakery', 'المخبوزات', 'Bakery Products', 'bakery_dining', '#f59e0b', 4);
GO

-- =====================================================
-- Seed Data - Products
-- =====================================================
INSERT INTO Products (SKU, Name, NameAr, CategoryId, Price, TaxRate, StockQuantity, ImageUrl) VALUES
('EP-902', 'Wireless Headphones', 'سماعات رأس لاسلكية', 2, 299.00, 15, 50, '/images/products/headphones.jpg'),
('T-001', 'Classic Watch', 'ساعة يد كلاسيكية', 2, 1450.00, 15, 30, '/images/products/watch.jpg'),
('CM-109', 'Instant Camera', 'كاميرا فورية ذكية', 2, 420.00, 15, 25, '/images/products/camera.jpg'),
('SH-882', 'Sports Shoes', 'حذاء رياضي عصري', 2, 550.00, 15, 100, '/images/products/shoes.jpg'),
('MS-112', 'Professional Mouse', 'فأرة لاسلكية احترافية', 2, 125.00, 15, 200, '/images/products/mouse.jpg'),
('SG-552', 'Luxury Sunglasses', 'نظارات شمسية فاخرة', 2, 890.00, 15, 75, '/images/products/sunglasses.jpg');
GO

-- =====================================================
-- Views
-- =====================================================

-- Daily Sales View
CREATE VIEW vw_DailySales AS
SELECT 
    CAST(o.CreatedAt AS DATE) as SaleDate,
    COUNT(o.Id) as TotalOrders,
    SUM(o.TotalAmount) as TotalRevenue,
    SUM(o.TaxAmount) as TotalTax,
    o.PaymentMethod
FROM Orders o
WHERE o.Status = 'Completed'
GROUP BY CAST(o.CreatedAt AS DATE), o.PaymentMethod;
GO

-- Product Sales Summary View
CREATE VIEW vw_ProductSalesSummary AS
SELECT 
    p.Id as ProductId,
    p.SKU,
    p.Name,
    p.NameAr,
    p.Price,
    p.StockQuantity,
    ISNULL(SUM(oi.Quantity), 0) as TotalSold,
    ISNULL(SUM(oi.TotalAmount), 0) as TotalRevenue
FROM Products p
LEFT JOIN OrderItems oi ON p.Id = oi.ProductId
LEFT JOIN Orders o ON oi.OrderId = o.Id AND o.Status = 'Completed'
GROUP BY p.Id, p.SKU, p.Name, p.NameAr, p.Price, p.StockQuantity;
GO

-- =====================================================
-- Stored Procedures
-- =====================================================

-- Create New Order
CREATE PROCEDURE sp_CreateOrder
    @UserId INT,
    @SubTotal DECIMAL(18,2),
    @TaxAmount DECIMAL(18,2),
    @DiscountAmount DECIMAL(18,2),
    @TotalAmount DECIMAL(18,2),
    @PaymentMethod NVARCHAR(50),
    @TerminalId NVARCHAR(50),
    @BranchId NVARCHAR(50),
    @OrderItems OrderItemType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @OrderId INT;
    DECLARE @OrderNumber NVARCHAR(50);
    
    -- Generate Order Number
    SET @OrderNumber = 'ORD-' + FORMAT(GETUTCDATE(), 'yyyyMMdd') + '-' + RIGHT('0000' + CAST(ISNULL((SELECT MAX(CAST(SUBSTRING(OrderNumber, LEN(OrderNumber)-3, 4) AS INT)) FROM Orders WHERE OrderNumber LIKE 'ORD-' + FORMAT(GETUTCDATE(), 'yyyyMMdd') + '%'), 0) + 1 AS NVARCHAR), 4);
    
    BEGIN TRANSACTION;
    
    -- Insert Order
    INSERT INTO Orders (OrderNumber, UserId, SubTotal, TaxAmount, DiscountAmount, TotalAmount, PaymentMethod, TerminalId, BranchId)
    VALUES (@OrderNumber, @UserId, @SubTotal, @TaxAmount, @DiscountAmount, @TotalAmount, @PaymentMethod, @TerminalId, @BranchId);
    
    SET @OrderId = SCOPE_IDENTITY();
    
    -- Insert Order Items
    INSERT INTO OrderItems (OrderId, ProductId, ProductName, ProductSKU, Quantity, UnitPrice, TaxRate, TaxAmount, SubTotal, DiscountAmount, TotalAmount)
    SELECT 
        @OrderId,
        oi.ProductId,
        p.Name,
        p.SKU,
        oi.Quantity,
        p.Price,
        p.TaxRate,
        (p.Price * oi.Quantity * p.TaxRate / 100),
        (p.Price * oi.Quantity),
        0,
        (p.Price * oi.Quantity * (1 + p.TaxRate / 100))
    FROM @OrderItems oi
    INNER JOIN Products p ON oi.ProductId = p.Id;
    
    -- Update Stock
    UPDATE p
    SET p.StockQuantity = p.StockQuantity - oi.Quantity
    FROM Products p
    INNER JOIN @OrderItems oi ON p.Id = oi.ProductId;
    
    -- Insert Payment
    INSERT INTO Payments (OrderId, PaymentMethod, Amount, Status, ProcessedAt)
    VALUES (@OrderId, @PaymentMethod, @TotalAmount, 'Completed', GETUTCDATE());
    
    COMMIT TRANSACTION;
    
    SELECT @OrderId as OrderId, @OrderNumber as OrderNumber;
END
GO

-- Define Table Type for Order Items
CREATE TYPE OrderItemType AS TABLE
(
    ProductId INT,
    Quantity INT
);
GO

-- Get Daily Report
CREATE PROCEDURE sp_GetDailyReport
    @StartDate DATETIME2,
    @EndDate DATETIME2
AS
BEGIN
    SELECT 
        CAST(o.CreatedAt AS DATE) as SaleDate,
        COUNT(DISTINCT o.Id) as TotalOrders,
        SUM(o.TotalAmount) as TotalRevenue,
        SUM(o.TaxAmount) as TotalTax,
        SUM(o.DiscountAmount) as TotalDiscount,
        o.PaymentMethod,
        COUNT(DISTINCT o.UserId) as UniqueCashiers
    FROM Orders o
    WHERE o.CreatedAt >= @StartDate 
        AND o.CreatedAt <= @EndDate
        AND o.Status = 'Completed'
    GROUP BY CAST(o.CreatedAt AS DATE), o.PaymentMethod
    ORDER BY SaleDate DESC, PaymentMethod;
END
GO

PRINT 'Database schema created successfully!';
GO
