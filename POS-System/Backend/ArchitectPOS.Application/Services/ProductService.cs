using ArchitectPOS.Application.DTOs;
using ArchitectPOS.Application.Interfaces;
using ArchitectPOS.Domain.Entities;
using ArchitectPOS.Infrastructure.Repositories;

namespace ArchitectPOS.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;

    public ProductService(IProductRepository productRepository, ICategoryRepository categoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterRequest request, CancellationToken cancellationToken = default)
    {
        var (products, totalCount) = await _productRepository.SearchAsync(
            request.SearchTerm,
            request.CategoryId,
            request.IsActive,
            request.PageNumber,
            request.PageSize,
            request.SortBy,
            request.SortDescending,
            cancellationToken);

        var categories = await _categoryRepository.GetAllAsync(cancellationToken);

        var dtos = products.Select(p => MapToDto(p, categories)).ToList();

        return new PagedResult<ProductDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product == null) return null;

        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        return MapToDto(product, categories);
    }

    public async Task<ProductDto?> GetProductBySKUAsync(string sku, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetBySKUAsync(sku, cancellationToken);
        if (product == null) return null;

        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        return MapToDto(product, categories);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        var existingProduct = await _productRepository.GetBySKUAsync(request.SKU, cancellationToken);
        if (existingProduct != null)
        {
            throw new InvalidOperationException($"Product with SKU '{request.SKU}' already exists");
        }

        var product = new Product
        {
            SKU = request.SKU,
            Name = request.Name,
            NameAr = request.NameAr,
            Description = request.Description,
            CategoryId = request.CategoryId,
            Barcode = request.Barcode,
            Price = request.Price,
            CostPrice = request.CostPrice,
            TaxRate = request.TaxRate,
            StockQuantity = request.StockQuantity,
            MinStockLevel = request.MinStockLevel,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            SortOrder = request.SortOrder
        };

        var createdProduct = await _productRepository.AddAsync(product, cancellationToken);
        
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        return MapToDto(createdProduct, categories);
    }

    public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID {id} not found");
        }

        if (!string.IsNullOrEmpty(request.Name)) product.Name = request.Name;
        if (!string.IsNullOrEmpty(request.NameAr)) product.NameAr = request.NameAr;
        if (request.Description != null) product.Description = request.Description;
        if (request.CategoryId.HasValue) product.CategoryId = request.CategoryId.Value;
        if (request.Barcode != null) product.Barcode = request.Barcode;
        if (request.Price.HasValue) product.Price = request.Price.Value;
        if (request.CostPrice.HasValue) product.CostPrice = request.CostPrice.Value;
        if (request.TaxRate.HasValue) product.TaxRate = request.TaxRate.Value;
        if (request.StockQuantity.HasValue) product.StockQuantity = request.StockQuantity.Value;
        if (request.MinStockLevel.HasValue) product.MinStockLevel = request.MinStockLevel.Value;
        if (request.ImageUrl != null) product.ImageUrl = request.ImageUrl;
        if (request.IsActive.HasValue) product.IsActive = request.IsActive.Value;
        if (request.SortOrder.HasValue) product.SortOrder = request.SortOrder.Value;

        product.UpdatedAt = DateTime.UtcNow;

        await _productRepository.UpdateAsync(product, cancellationToken);
        
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        return MapToDto(product, categories);
    }

    public async Task<bool> DeleteProductAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        if (product == null) return false;

        // Soft delete by setting IsActive to false
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _productRepository.UpdateAsync(product, cancellationToken);
        
        return true;
    }

    public async Task<bool> UpdateStockAsync(int id, int quantity, CancellationToken cancellationToken = default)
    {
        return await _productRepository.UpdateStockAsync(id, quantity, cancellationToken);
    }

    private static ProductDto MapToDto(Product product, List<Category> categories)
    {
        var category = categories.FirstOrDefault(c => c.Id == product.CategoryId);
        
        return new ProductDto
        {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            NameAr = product.NameAr,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name,
            CategoryNameAr = category?.NameAr,
            Barcode = product.Barcode,
            Price = product.Price,
            CostPrice = product.CostPrice,
            TaxRate = product.TaxRate,
            StockQuantity = product.StockQuantity,
            MinStockLevel = product.MinStockLevel,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            SortOrder = product.SortOrder,
            CreatedAt = product.CreatedAt
        };
    }
}
