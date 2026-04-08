using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class HeldOrderItem : BaseEntity
{
    public int HeldOrderId { get; set; }
    public HeldOrder? HeldOrder { get; set; }

    public int ProductId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ProductNameAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ProductSKU { get; set; } = string.Empty;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }

    [MaxLength(20)]
    public string DiscountType { get; set; } = "None";

    public decimal TotalAmount { get; set; }
}
