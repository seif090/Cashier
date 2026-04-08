using System.ComponentModel.DataAnnotations;

namespace ArchitectPOS.Domain.Entities;

public class Terminal : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string TerminalCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    [MaxLength(50)]
    public string? IPAddress { get; set; }

    [MaxLength(50)]
    public string? MACAddress { get; set; }

    public DateTime? LastActiveAt { get; set; }
    public bool IsActive { get; set; } = true;
}
