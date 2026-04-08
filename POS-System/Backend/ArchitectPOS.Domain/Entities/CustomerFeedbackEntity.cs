using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class CustomerFeedbackEntity : BaseEntity
{
    [Required]
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    [Required]
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    [Required]
    [Range(1, 5)]
    public int OverallRating { get; set; }

    [Range(1, 5)]
    public int? FoodRating { get; set; }

    [Range(1, 5)]
    public int? ServiceRating { get; set; }

    [Range(1, 5)]
    public int? DeliveryRating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public bool IsAnonymous { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }

    [MaxLength(1000)]
    public string? Response { get; set; }

    public int? RespondedBy { get; set; }
}
