using Microsoft.EntityFrameworkCore;
using ArchitectPOS.Application.DTOs;
using ArchitectPOS.Application.Interfaces;
using ArchitectPOS.Domain.Entities;
using ArchitectPOS.Infrastructure.Repositories;

namespace ArchitectPOS.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUserRepository _userRepository;

    public OrderService(IOrderRepository orderRepository, IProductRepository productRepository, IUserRepository userRepository)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
    }

    public async Task<PagedResult<OrderDto>> GetOrdersAsync(OrderFilterRequest request, CancellationToken cancellationToken = default)
    {
        var (orders, totalCount) = await _orderRepository.GetOrdersWithItemsAsync(
            request.StartDate,
            request.EndDate,
            request.Status,
            request.PaymentMethod,
            request.UserId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var products = await _productRepository.GetAllAsync(cancellationToken);
        var dtos = orders.Select(o => MapToDto(o, products)).ToList();

        return new PagedResult<OrderDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await _orderRepository.GetWithItemsAsync(id, cancellationToken);
        if (order == null) return null;

        var products = await _productRepository.GetAllAsync(cancellationToken);
        return MapToDto(order, products);
    }

    public async Task<OrderDto?> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        var order = await _orderRepository.GetByOrderNumberAsync(orderNumber, cancellationToken);
        if (order == null) return null;

        var products = await _productRepository.GetAllAsync(cancellationToken);
        return MapToDto(order, products);
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        // Validate products and calculate totals
        var products = await _productRepository.GetAllAsync(cancellationToken);
        decimal subTotal = 0;
        decimal taxAmount = 0;
        var orderItems = new List<OrderItem>();

        foreach (var itemRequest in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == itemRequest.ProductId);
            if (product == null)
            {
                throw new KeyNotFoundException($"Product with ID {itemRequest.ProductId} not found");
            }

            if (product.StockQuantity < itemRequest.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}");
            }

            var itemSubTotal = product.Price * itemRequest.Quantity;
            var itemTax = itemSubTotal * (product.TaxRate / 100);
            var itemTotal = itemSubTotal + itemTax;

            subTotal += itemSubTotal;
            taxAmount += itemTax;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSKU = product.SKU,
                Quantity = itemRequest.Quantity,
                UnitPrice = product.Price,
                TaxRate = product.TaxRate,
                TaxAmount = itemTax,
                SubTotal = itemSubTotal,
                DiscountAmount = 0,
                TotalAmount = itemTotal
            });

            // Update stock
            await _productRepository.UpdateStockAsync(product.Id, -itemRequest.Quantity, cancellationToken);
        }

        var totalAmount = subTotal + taxAmount - request.DiscountAmount;

        // Generate order number
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = request.UserId,
            SubTotal = subTotal,
            TaxAmount = taxAmount,
            DiscountAmount = request.DiscountAmount,
            TotalAmount = totalAmount,
            PaymentMethod = request.PaymentMethod,
            Status = "Completed",
            Notes = request.Notes,
            TerminalId = request.TerminalId,
            BranchId = request.BranchId,
            OrderItems = orderItems
        };

        var createdOrder = await _orderRepository.AddAsync(order, cancellationToken);

        // Create payment record
        var payment = new Payment
        {
            OrderId = createdOrder.Id,
            PaymentMethod = request.PaymentMethod,
            Amount = totalAmount,
            Status = "Completed",
            ProcessedAt = DateTime.UtcNow
        };

        // Add payment through order repository
        createdOrder.Payments.Add(payment);
        await _orderRepository.UpdateAsync(createdOrder, cancellationToken);

        return MapToDto(createdOrder, products);
    }

    public async Task<bool> VoidOrderAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await _orderRepository.GetByIdAsync(id, cancellationToken);
        if (order == null) return false;

        if (order.Status == "Voided")
        {
            throw new InvalidOperationException("Order is already voided");
        }

        order.Status = "Voided";
        order.UpdatedAt = DateTime.UtcNow;

        // Restore stock
        var orderItems = await _orderRepository.GetWithItemsAsync(id, cancellationToken);
        foreach (var item in orderItems.OrderItems)
        {
            await _productRepository.UpdateStockAsync(item.ProductId, item.Quantity, cancellationToken);
        }

        await _orderRepository.UpdateAsync(order, cancellationToken);
        return true;
    }

    public async Task<DailyReportDto> GetDailyReportAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var orders = await _orderRepository.GetOrdersWithItemsAsync(
            startDate,
            endDate,
            "Completed",
            null,
            null,
            1,
            10000,
            cancellationToken);

        var report = new DailyReportDto
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalOrders = orders.TotalCount,
            TotalRevenue = orders.Orders.Where(o => o.Status == "Completed").Sum(o => o.TotalAmount),
            TotalTax = orders.Orders.Where(o => o.Status == "Completed").Sum(o => o.TaxAmount),
            TotalDiscount = orders.Orders.Where(o => o.Status == "Completed").Sum(o => o.DiscountAmount),
            UniqueCashiers = orders.Orders.Select(o => o.UserId).Distinct().Count(),
            DailyBreakdown = orders.Orders
                .Where(o => o.Status == "Completed")
                .GroupBy(o => new { Date = o.CreatedAt.Date, o.PaymentMethod })
                .Select(g => new DailyBreakdownDto
                {
                    Date = g.Key.Date,
                    Orders = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount),
                    PaymentMethod = g.Key.PaymentMethod
                })
                .ToList()
        };

        return report;
    }

    private static OrderDto MapToDto(Order order, List<Product> products)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            UserName = order.User?.FullName,
            SubTotal = order.SubTotal,
            TaxAmount = order.TaxAmount,
            DiscountAmount = order.DiscountAmount,
            TotalAmount = order.TotalAmount,
            PaymentMethod = order.PaymentMethod,
            Status = order.Status,
            Notes = order.Notes,
            TerminalId = order.TerminalId,
            BranchId = order.BranchId,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi =>
            {
                var product = products.FirstOrDefault(p => p.Id == oi.ProductId);
                return new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    ProductSKU = oi.ProductSKU,
                    ImageUrl = product?.ImageUrl,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TaxRate = oi.TaxRate,
                    TaxAmount = oi.TaxAmount,
                    SubTotal = oi.SubTotal,
                    DiscountAmount = oi.DiscountAmount,
                    TotalAmount = oi.TotalAmount
                };
            }).ToList()
        };
    }
}
