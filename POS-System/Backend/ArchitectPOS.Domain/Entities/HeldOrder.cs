using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class HeldOrder : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string HeldOrderNumber { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User? User { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    [MaxLength(200)]
    public string? CustomerName { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    [MaxLength(50)]
    public string? TerminalId { get; set; }

    public int ItemCount { get; set; }
    public DateTime HeldAt { get; set; }

    public ICollection<HeldOrderItem> Items { get; set; } = new List<HeldOrderItem>();
}
