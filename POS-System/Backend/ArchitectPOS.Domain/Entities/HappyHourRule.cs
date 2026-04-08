using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class HappyHourRule : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameAr { get; set; } = string.Empty;

    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }

    [MaxLength(100)]
    public string? DaysOfWeek { get; set; }

    public decimal DiscountPercent { get; set; }

    [MaxLength(500)]
    public string? ApplicableCategoryIds { get; set; }

    [MaxLength(1000)]
    public string? ApplicableProductIds { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
}
