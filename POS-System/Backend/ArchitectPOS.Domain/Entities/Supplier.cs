using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Supplier : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string SupplierCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameAr { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ContactPerson { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; } = "السعودية";

    [MaxLength(50)]
    public string? TaxNumber { get; set; }

    [MaxLength(100)]
    public string? PaymentTerms { get; set; }

    public decimal? CreditLimit { get; set; }
    public decimal Rating { get; set; } = 5.00m;

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}
