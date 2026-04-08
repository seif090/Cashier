using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class PurchaseOrder : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string PONumber { get; set; } = string.Empty;

    public int SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Draft";

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public int CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }

    public int? ApprovedBy { get; set; }
    public User? ApprovedByUser { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}
