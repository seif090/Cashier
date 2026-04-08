using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class ProductBundle : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string BundleCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameAr { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public decimal BundlePrice { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal DiscountPercent { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }

    public ICollection<BundleItem> Items { get; set; } = new List<BundleItem>();
}
