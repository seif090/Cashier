using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Refund : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string RefundNumber { get; set; } = string.Empty;

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    [Required]
    [MaxLength(50)]
    public string OrderNumber { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User? User { get; set; }

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    public decimal RefundAmount { get; set; }

    [Required]
    [MaxLength(50)]
    public string RefundMethod { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public int? ApprovedBy { get; set; }
    public User? ApprovedByUser { get; set; }

    public DateTime? ApprovedAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public ICollection<RefundItem> Items { get; set; } = new List<RefundItem>();
}
