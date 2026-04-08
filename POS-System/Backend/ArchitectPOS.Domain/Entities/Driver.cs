using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Driver : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string DriverCode { get; set; } = string.Empty;

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
    public string? Email { get; set; }

    [MaxLength(50)]
    public string? LicenseNumber { get; set; }

    [MaxLength(50)]
    public string? VehicleType { get; set; }

    [MaxLength(50)]
    public string? VehicleNumber { get; set; }

    public bool IsAvailable { get; set; } = true;
    public decimal Rating { get; set; } = 5.00m;
    public int TotalDeliveries { get; set; }
    public decimal CommissionRate { get; set; } = 10;
    public bool IsActive { get; set; } = true;

    public ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();
}
