using ArchitectPOS.Domain.Entities;

namespace ArchitectPOS.Infrastructure.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}

public interface IProductRepository : IRepository<Product>
{
    Task<List<Product>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<Product?> GetBySKUAsync(string sku, CancellationToken cancellationToken = default);
    Task<Product?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);
    Task<(List<Product> Products, int TotalCount)> SearchAsync(string? searchTerm, int? categoryId, bool? isActive, int pageNumber, int pageSize, string? sortBy, bool sortDescending, CancellationToken cancellationToken = default);
    Task<bool> UpdateStockAsync(int productId, int quantityChange, CancellationToken cancellationToken = default);
}

public interface ICategoryRepository : IRepository<Category>
{
    Task<List<Category>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<List<Category>> GetSubCategoriesAsync(int parentCategoryId, CancellationToken cancellationToken = default);
}

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<(List<Order> Orders, int TotalCount)> GetOrdersWithItemsAsync(DateTime? startDate, DateTime? endDate, string? status, string? paymentMethod, int? userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Order> GetWithItemsAsync(int orderId, CancellationToken cancellationToken = default);
}

public interface IPaymentRepository : IRepository<Payment>
{
    Task<List<Payment>> GetByOrderIdAsync(int orderId, CancellationToken cancellationToken = default);
}
