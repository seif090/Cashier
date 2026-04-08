using ArchitectPOS.Application.DTOs;
using ArchitectPOS.Application.Interfaces;
using ArchitectPOS.Domain.Entities;
using ArchitectPOS.Infrastructure.Repositories;

namespace ArchitectPOS.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.GetActiveAsync(cancellationToken);
        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        return category != null ? MapToDto(category) : null;
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = new Category
        {
            Name = request.Name,
            NameAr = request.NameAr,
            Description = request.Description,
            Icon = request.Icon,
            Color = request.Color,
            ParentCategoryId = request.ParentCategoryId,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        var createdCategory = await _categoryRepository.AddAsync(category, cancellationToken);
        return MapToDto(createdCategory);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            throw new KeyNotFoundException($"Category with ID {id} not found");
        }

        if (!string.IsNullOrEmpty(request.Name)) category.Name = request.Name;
        if (!string.IsNullOrEmpty(request.NameAr)) category.NameAr = request.NameAr;
        if (request.Description != null) category.Description = request.Description;
        if (request.Icon != null) category.Icon = request.Icon;
        if (request.Color != null) category.Color = request.Color;
        if (request.ParentCategoryId.HasValue) category.ParentCategoryId = request.ParentCategoryId.Value;
        if (request.SortOrder.HasValue) category.SortOrder = request.SortOrder.Value;
        if (request.IsActive.HasValue) category.IsActive = request.IsActive.Value;

        category.UpdatedAt = DateTime.UtcNow;

        await _categoryRepository.UpdateAsync(category, cancellationToken);
        return MapToDto(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null) return false;

        // Soft delete
        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;
        await _categoryRepository.UpdateAsync(category, cancellationToken);
        
        return true;
    }

    private static CategoryDto MapToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            NameAr = category.NameAr,
            Description = category.Description,
            Icon = category.Icon,
            Color = category.Color,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = category.ParentCategory?.Name,
            SortOrder = category.SortOrder,
            IsActive = category.IsActive,
            ProductCount = category.Products?.Count(p => p.IsActive) ?? 0,
            CreatedAt = category.CreatedAt
        };
    }
}
