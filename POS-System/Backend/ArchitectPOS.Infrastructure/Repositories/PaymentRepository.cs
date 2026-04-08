using Microsoft.EntityFrameworkCore;
using ArchitectPOS.Domain.Entities;
using ArchitectPOS.Infrastructure.Data;

namespace ArchitectPOS.Infrastructure.Repositories;

public class PaymentRepository : Repository<Payment>, IPaymentRepository
{
    public PaymentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<List<Payment>> GetByOrderIdAsync(int orderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.OrderId == orderId)
            .ToListAsync(cancellationToken);
    }
}
