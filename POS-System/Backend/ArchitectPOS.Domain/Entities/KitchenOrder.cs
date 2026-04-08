using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class KitchenOrder : BaseEntity
{
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    [Required]
    [MaxLength(50)]
    public string OrderNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Station { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    [MaxLength(20)]
    public string Priority { get; set; } = "Normal";

    public int? EstimatedTime { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public ICollection<KitchenOrderItem> Items { get; set; } = new List<KitchenOrderItem>();
}
