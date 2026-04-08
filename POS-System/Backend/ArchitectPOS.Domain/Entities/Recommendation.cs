using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Recommendation : BaseEntity
{
    public int? UserId { get; set; }
    public User? User { get; set; }

    [Required]
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    [MaxLength(200)]
    public string? Reason { get; set; }

    public decimal Score { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
}
