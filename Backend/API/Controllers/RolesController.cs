using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.API.Attributes;

namespace AICultureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequireActiveUser]
public class RolesController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ILogger<RolesController> _logger;

    public RolesController(IAdminService adminService, ILogger<RolesController> logger)
    {
        _adminService = adminService;
        _logger = logger;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }

    private async Task<bool> HasPermissionAsync(string permission)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return false;
        var perms = await _adminService.GetUserPermissionsAsync(userId.Value);
        return perms.Permissions.Contains(permission);
    }

    [HttpGet]
    [RequirePermission(Permissions.Roles_View)]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _adminService.GetRolesAsync();
        return Ok(roles);
    }

    [HttpGet("{id}")]
    [RequirePermission(Permissions.Roles_View)]
    public async Task<IActionResult> GetRole(int id)
    {
        var role = await _adminService.GetRoleByIdAsync(id);
        if (role == null) return NotFound(new { message = "Role not found" });
        return Ok(role);
    }

    [HttpPost]
    [RequirePermission(Permissions.Roles_Create)]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();
            var role = await _adminService.CreateRoleAsync(request, userId.Value);
            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.Roles_Edit)]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();
            var role = await _adminService.UpdateRoleAsync(id, request, userId.Value);
            if (role == null) return NotFound(new { message = "Role not found" });
            return Ok(role);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.Roles_Delete)]
    public async Task<IActionResult> DeleteRole(int id)
    {
        try
        {
            var result = await _adminService.DeleteRoleAsync(id);
            if (!result) return NotFound(new { message = "Role not found" });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("permissions")]
    [RequirePermission(Permissions.Roles_View)]
    public async Task<IActionResult> GetPermissions()
    {
        var permissions = await _adminService.GetPermissionsAsync();
        return Ok(permissions);
    }

    [HttpGet("permissions/grouped")]
    [RequirePermission(Permissions.Roles_View)]
    public async Task<IActionResult> GetPermissionsGrouped()
    {
        var permissions = await _adminService.GetPermissionsGroupedByModuleAsync();
        return Ok(permissions);
    }

    [HttpGet("user/{userId}/permissions")]
    public async Task<IActionResult> GetUserPermissions(int userId)
    {
        // Users may always read their own permissions (needed by the SPA at login).
        // Reading another user's permissions requires Roles.View.
        var currentUserId = GetCurrentUserId();
        if (currentUserId != userId && !await HasPermissionAsync(Permissions.Roles_View))
        {
            return Forbid();
        }
        var permissions = await _adminService.GetUserPermissionsAsync(userId);
        return Ok(permissions);
    }

    [HttpGet("user/{userId}/roles")]
    public async Task<IActionResult> GetUserRoles(int userId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId != userId && !await HasPermissionAsync(Permissions.Roles_View))
        {
            return Forbid();
        }
        var roles = await _adminService.GetUserRoleAssignmentsAsync(userId);
        return Ok(roles);
    }

    [HttpPost("assign")]
    [RequirePermission(Permissions.Users_Manage)]
    public async Task<IActionResult> AssignRoleToUser([FromBody] AssignRoleRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var result = await _adminService.AssignRoleToUserAsync(request.UserId, request.RoleId, userId.Value);
        if (!result) return BadRequest(new { message = "Failed to assign role" });
        return Ok(new { message = "Role assigned successfully" });
    }

    [HttpDelete("user/{userId}/role/{roleId}")]
    [RequirePermission(Permissions.Users_Manage)]
    public async Task<IActionResult> RemoveRoleFromUser(int userId, int roleId)
    {
        var result = await _adminService.RemoveRoleFromUserAsync(userId, roleId);
        if (!result) return NotFound(new { message = "User role not found" });
        return NoContent();
    }
}
