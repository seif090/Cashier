using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class RefundItem : BaseEntity
{
    public int RefundId { get; set; }
    public Refund? Refund { get; set; }

    public int OrderItemId { get; set; }
    public int ProductId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ProductSKU { get; set; } = string.Empty;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
}
