using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Payment : BaseEntity
{
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [Required]
    [Range(0, double.MaxValue)]
    public decimal Amount { get; set; }

    [MaxLength(100)]
    public string? TransactionReference { get; set; }

    [MaxLength(4)]
    public string? CardLast4 { get; set; }

    [MaxLength(50)]
    public string? CardType { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Completed";

    public DateTime? ProcessedAt { get; set; }
}
