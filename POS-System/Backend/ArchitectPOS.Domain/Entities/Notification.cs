using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Notification : BaseEntity
{
    public int? UserId { get; set; }
    public User? User { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TitleAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // Info, Warning, Error, Success, LowStock

    public bool IsRead { get; set; }
    public int? RelatedId { get; set; }

    [MaxLength(50)]
    public string? RelatedType { get; set; } // Order, Product, Discount

    public DateTime? ReadAt { get; set; }
}
