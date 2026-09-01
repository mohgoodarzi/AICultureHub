using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;

namespace AICultureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IGamificationService _gamificationService;
    private readonly INotificationService _notificationService;

    public DashboardController(IGamificationService gamificationService, INotificationService notificationService)
    {
        _gamificationService = gamificationService;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        var dashboard = await _gamificationService.GetDashboardAsync(userId.Value);
        if (dashboard == null) return NotFound();
        return Ok(dashboard);
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] string period = "all", [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var leaderboard = await _gamificationService.GetLeaderboardAsync(period, page, pageSize);
        return Ok(leaderboard);
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] int count = 20)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        var notifications = await _notificationService.GetUserNotificationsAsync(userId.Value, count);
        return Ok(notifications);
    }

    [HttpGet("notifications/unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        var count = await _notificationService.GetUnreadCountAsync(userId.Value);
        return Ok(new { count });
    }

    [HttpPost("notifications/{id}/read")]
    public async Task<IActionResult> MarkNotificationAsRead(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        var result = await _notificationService.MarkAsReadAsync(id, userId.Value);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpPost("notifications/read-all")]
    public async Task<IActionResult> MarkAllNotificationsAsRead()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        await _notificationService.MarkAllAsReadAsync(userId.Value);
        return Ok();
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }
}
