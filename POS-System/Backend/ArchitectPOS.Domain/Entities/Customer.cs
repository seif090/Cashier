using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Customer : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string CustomerCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(255)]
    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; } = "السعودية";

    public decimal LoyaltyPoints { get; set; }
    public decimal TotalPurchases { get; set; }
    public int TotalOrders { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public bool IsVip { get; set; }
    public DateTime? Birthday { get; set; }
    public string? Gender { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
