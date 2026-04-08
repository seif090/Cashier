using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class KitchenOrderItem : BaseEntity
{
    public int KitchenOrderId { get; set; }
    public KitchenOrder? KitchenOrder { get; set; }

    public int OrderItemId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ProductNameAr { get; set; } = string.Empty;

    public int Quantity { get; set; }

    [MaxLength(500)]
    public string? SpecialInstructions { get; set; }

    public bool IsPrepared { get; set; }
    public DateTime? PreparedAt { get; set; }
}
