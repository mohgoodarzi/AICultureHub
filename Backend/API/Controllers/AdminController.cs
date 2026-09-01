using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;

namespace AICultureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] PagedRequest request)
    {
        var result = await _adminService.GetUsersAsync(request);
        return Ok(result);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _adminService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] RegisterRequest request)
    {
        try
        {
            var user = await _adminService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateProfileRequest request)
    {
        var user = await _adminService.UpdateUserAsync(id, request);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("users/{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        var result = await _adminService.DeactivateUserAsync(id);
        if (!result) return NotFound();
        return Ok(new { message = "User deactivated" });
    }

    [HttpPost("users/{id}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        var result = await _adminService.ActivateUserAsync(id);
        if (!result) return NotFound();
        return Ok(new { message = "User activated" });
    }

    [HttpPost("users/{id}/roles/{roleName}")]
    public async Task<IActionResult> AssignRole(int id, string roleName)
    {
        var result = await _adminService.AssignRoleAsync(id, roleName);
        if (!result) return NotFound();
        return Ok(new { message = "Role assigned" });
    }

    [HttpDelete("users/{id}/roles/{roleName}")]
    public async Task<IActionResult> RemoveRole(int id, string roleName)
    {
        var result = await _adminService.RemoveRoleAsync(id, roleName);
        if (!result) return NotFound();
        return Ok(new { message = "Role removed" });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var analytics = await _adminService.GetAnalyticsAsync();
        return Ok(analytics);
    }

    [HttpGet("announcements")]
    public async Task<IActionResult> GetAnnouncements()
    {
        try
        {
            var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
            var announcements = isAuthenticated 
                ? await _adminService.GetAllAnnouncementsAsync()
                : await _adminService.GetActiveAnnouncementsAsync();
            return Ok(announcements);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetAnnouncements] Error: {ex.Message}");
            Console.WriteLine($"[GetAnnouncements] Inner: {ex.InnerException?.Message}");
            return StatusCode(500, new { message = "Error: " + ex.Message });
        }
    }

    [HttpPost("announcements")]
    public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementDto model)
    {
        var userId = GetCurrentUserId();
        var announcement = await _adminService.CreateAnnouncementAsync(model, userId);
        return CreatedAtAction(nameof(GetAnnouncements), announcement);
    }

    [HttpPut("announcements/{id}")]
    public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] AnnouncementDto model)
    {
        var userId = GetCurrentUserId();
        var announcement = await _adminService.UpdateAnnouncementAsync(id, model, userId);
        if (announcement == null) return NotFound();
        return Ok(announcement);
    }

    [HttpDelete("announcements/{id}")]
    public async Task<IActionResult> DeleteAnnouncement(int id)
    {
        var result = await _adminService.DeleteAnnouncementAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("levels")]
    public async Task<IActionResult> GetLevels()
    {
        var levels = await _adminService.GetLevelsAsync();
        return Ok(levels);
    }

    [HttpPost("levels")]
    public async Task<IActionResult> CreateLevel([FromBody] LevelDto model)
    {
        var level = await _adminService.CreateLevelAsync(model);
        return Ok(level);
    }

    [HttpPut("levels/{id}")]
    public async Task<IActionResult> UpdateLevel(int id, [FromBody] LevelDto model)
    {
        var level = await _adminService.UpdateLevelAsync(id, model);
        if (level == null) return NotFound();
        return Ok(level);
    }

    [HttpGet("badges")]
    public async Task<IActionResult> GetBadges()
    {
        var badges = await _adminService.GetBadgesAsync();
        return Ok(badges);
    }

    [HttpPost("badges")]
    public async Task<IActionResult> CreateBadge([FromBody] BadgeDto model)
    {
        var badge = await _adminService.CreateBadgeAsync(model);
        return Ok(badge);
    }

    [HttpPut("badges/{id}")]
    public async Task<IActionResult> UpdateBadge(int id, [FromBody] BadgeDto model)
    {
        var badge = await _adminService.UpdateBadgeAsync(id, model);
        if (badge == null) return NotFound();
        return Ok(badge);
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _adminService.GetDepartmentsAsync();
        return Ok(departments);
    }

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] DepartmentDto model)
    {
        var department = await _adminService.CreateDepartmentAsync(model);
        return Ok(department);
    }

    [HttpPut("departments/{id}")]
    public async Task<IActionResult> UpdateDepartment(int id, [FromBody] DepartmentDto model)
    {
        var department = await _adminService.UpdateDepartmentAsync(id, model);
        if (department == null) return NotFound();
        return Ok(department);
    }

    [HttpDelete("departments/{id}")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var result = await _adminService.DeleteDepartmentAsync(id);
        if (!result) return BadRequest(new { message = "Cannot delete department that is assigned to users" });
        return NoContent();
    }

    [HttpGet("positions")]
    public async Task<IActionResult> GetPositions()
    {
        var positions = await _adminService.GetPositionsAsync();
        return Ok(positions);
    }

    [HttpPost("positions")]
    public async Task<IActionResult> CreatePosition([FromBody] PositionDto model)
    {
        var position = await _adminService.CreatePositionAsync(model);
        return Ok(position);
    }

    [HttpPut("positions/{id}")]
    public async Task<IActionResult> UpdatePosition(int id, [FromBody] PositionDto model)
    {
        var position = await _adminService.UpdatePositionAsync(id, model);
        if (position == null) return NotFound();
        return Ok(position);
    }

    [HttpDelete("positions/{id}")]
    public async Task<IActionResult> DeletePosition(int id)
    {
        var result = await _adminService.DeletePositionAsync(id);
        if (!result) return BadRequest(new { message = "Cannot delete position that is assigned to users" });
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }
}
