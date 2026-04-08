using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Discount : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameAr { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(20)]
    public string DiscountType { get; set; } = string.Empty; // Percentage, Fixed, BuyXGetY

    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsActive { get; set; } = true;

    [MaxLength(500)]
    public string? ApplicableCategoryIds { get; set; }

    [MaxLength(1000)]
    public string? ApplicableProductIds { get; set; }

    public int CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
}
