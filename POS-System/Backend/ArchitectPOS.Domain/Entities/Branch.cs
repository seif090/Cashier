using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Branch : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string BranchCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string NameAr { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; } = "السعودية";

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(50)]
    public string? TaxNumber { get; set; }

    [MaxLength(50)]
    public string? CommercialRegistration { get; set; }

    public bool IsMain { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Terminal> Terminals { get; set; } = new List<Terminal>();
}
