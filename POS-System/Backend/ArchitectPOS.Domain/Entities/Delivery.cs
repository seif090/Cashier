using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Delivery : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string DeliveryNumber { get; set; } = string.Empty;

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    [Required]
    [MaxLength(50)]
    public string OrderNumber { get; set; } = string.Empty;

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    [Required]
    [MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string CustomerPhone { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string DeliveryAddress { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? City { get; set; }

    public int? DriverId { get; set; }
    public Driver? Driver { get; set; }

    [MaxLength(200)]
    public string? DriverName { get; set; }

    public decimal DeliveryFee { get; set; }
    public int? EstimatedTime { get; set; }
    public decimal? Distance { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public DateTime? DispatchedAt { get; set; }
    public DateTime? PickedUpAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    public int? CustomerRating { get; set; }

    [MaxLength(500)]
    public string? CustomerFeedback { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
