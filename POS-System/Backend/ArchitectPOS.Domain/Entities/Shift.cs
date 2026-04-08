using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Shift : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string ShiftNumber { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User? User { get; set; }

    [MaxLength(50)]
    public string? TerminalId { get; set; }

    [MaxLength(50)]
    public string? BranchId { get; set; }

    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }

    public decimal OpeningCash { get; set; }
    public decimal ExpectedCash { get; set; }
    public decimal ActualCash { get; set; }
    public decimal CashDifference { get; set; }
    public decimal TotalSales { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRefunds { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Open";

    [MaxLength(500)]
    public string? Notes { get; set; }
}
