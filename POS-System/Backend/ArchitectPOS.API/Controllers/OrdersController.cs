using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ArchitectPOS.Application.DTOs;
using ArchitectPOS.Application.Interfaces;

namespace ArchitectPOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetOrders([FromQuery] OrderFilterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var orders = await _orderService.GetOrdersAsync(request, cancellationToken);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving orders");
            return StatusCode(500, new { message = "An error occurred while retrieving orders" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id, CancellationToken cancellationToken)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(id, cancellationToken);
            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} not found" });
            }
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Order not found");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving order {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the order" });
        }
    }

    [HttpGet("number/{orderNumber}")]
    public async Task<ActionResult<OrderDto>> GetOrderByNumber(string orderNumber, CancellationToken cancellationToken)
    {
        try
        {
            var order = await _orderService.GetOrderByNumberAsync(orderNumber, cancellationToken);
            if (order == null)
            {
                return NotFound(new { message = $"Order with number '{orderNumber}' not found" });
            }
            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving order by number {OrderNumber}", orderNumber);
            return StatusCode(500, new { message = "An error occurred while retrieving the order" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var order = await _orderService.CreateOrderAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Product not found during order creation");
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Order creation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return StatusCode(500, new { message = "An error occurred while creating the order" });
        }
    }

    [HttpPatch("{id}/void")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<bool>> VoidOrder(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _orderService.VoidOrderAsync(id, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Void order failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error voiding order {Id}", id);
            return StatusCode(500, new { message = "An error occurred while voiding the order" });
        }
    }

    [HttpGet("report/daily")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<DailyReportDto>> GetDailyReport(
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate, 
        CancellationToken cancellationToken)
    {
        try
        {
            var report = await _orderService.GetDailyReportAsync(startDate, endDate, cancellationToken);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating daily report");
            return StatusCode(500, new { message = "An error occurred while generating the report" });
        }
    }
}
