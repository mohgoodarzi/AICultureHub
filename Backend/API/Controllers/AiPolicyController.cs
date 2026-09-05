using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AICultureHub.Infrastructure.Data;
using AICultureHub.Domain.Entities;
using AICultureHub.API.Attributes;

namespace AICultureHub.API.Controllers;

public class AiPolicyItemDto
{
    public int Id { get; set; }
    public int DisplayOrder { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}

public class SaveAiPolicyRequest
{
    public List<AiPolicyItemDto> Items { get; set; } = new();
}

[ApiController]
[Route("api/[controller]")]
[RequireActiveUser]
public class AiPolicyController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AiPolicyController> _logger;

    public AiPolicyController(ApplicationDbContext context, ILogger<AiPolicyController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>Ordered active policy items (any authenticated user).</summary>
    [HttpGet]
    public async Task<IActionResult> GetPolicy()
    {
        var items = await _context.AiPolicyItems
            .Where(p => p.IsActive)
            .OrderBy(p => p.DisplayOrder)
            .Select(p => new AiPolicyItemDto { Id = p.Id, DisplayOrder = p.DisplayOrder, Title = p.Title, Text = p.Text })
            .ToListAsync();
        return Ok(items);
    }

    /// <summary>Replace the whole policy list (Administrator only). Simple save-all semantics.</summary>
    [HttpPut]
    [RequireAdministrator]
    public async Task<IActionResult> SavePolicy([FromBody] SaveAiPolicyRequest request)
    {
        if (request.Items == null) return BadRequest(new { message = "فهرست اقلام ارسال نشده است" });

        var incoming = request.Items
            .Where(i => !string.IsNullOrWhiteSpace(i.Title))
            .Select((i, idx) => new AiPolicyItemDto
            {
                DisplayOrder = i.DisplayOrder > 0 ? i.DisplayOrder : idx + 1,
                Title = i.Title.Trim(),
                Text = (i.Text ?? string.Empty).Trim()
            })
            .ToList();

        if (incoming.Count == 0) return BadRequest(new { message = "حداقل یک مورد با عنوان معتبر الزامی است" });

        // Replace-all strategy: wipe and re-insert. This table is small and admin-managed.
        var existing = await _context.AiPolicyItems.ToListAsync();
        _context.AiPolicyItems.RemoveRange(existing);
        _context.AiPolicyItems.AddRange(incoming.Select(i => new AiPolicyItem
        {
            DisplayOrder = i.DisplayOrder,
            Title = i.Title,
            Text = i.Text,
            IsActive = true,
            CreatedDate = DateTime.UtcNow
        }));
        await _context.SaveChangesAsync();

        _logger.LogInformation("AI policy updated: {Count} items", incoming.Count);
        return Ok(new { message = "خط‌مشی با موفقیت ذخیره شد", count = incoming.Count });
    }
}
