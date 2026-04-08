using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Table : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string TableNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? TableName { get; set; }

    [MaxLength(100)]
    public string? TableNameAr { get; set; }

    public int Capacity { get; set; } = 4;

    [MaxLength(50)]
    public string? Location { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Available";

    public int? CurrentOrderId { get; set; }
    public Order? CurrentOrder { get; set; }

    public int CurrentCustomerCount { get; set; }
    public DateTime? ReservationDateTime { get; set; }
    public bool IsActive { get; set; } = true;
}
