using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class BundleItem : BaseEntity
{
    public int BundleId { get; set; }
    public ProductBundle? Bundle { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; } = 1;
}
