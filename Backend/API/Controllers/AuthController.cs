using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.Infrastructure.Data;

namespace AICultureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "An error occurred during login." });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "An error occurred during registration." });
        }
    }

    /// <summary>
    /// Public lookup lists for the anonymous registration form (units/departments and positions).
    /// Read-only master data; only active entries are returned.
    /// </summary>
    /// <summary>
    /// Upload profile photo for the CURRENTLY AUTHENTICATED user (used right after
    /// public registration, and available for self-service profile updates).
    /// </summary>
    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadMyAvatar(IFormFile file, [FromServices] IWebHostEnvironment env, [FromServices] ApplicationDbContext dbContext)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized();

        var user = await dbContext.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "کاربر یافت نشد" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "فایلی انتخاب نشده است" });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { message = "فقط تصاویر JPG، PNG یا WebP مجاز هستند" });

        var (maxImageMB, _) = UploadController.GetLimits(dbContext);
        var maxBytes = maxImageMB * 1024L * 1024L;
        if (file.Length > maxBytes)
            return BadRequest(new { message = $"حجم تصویر نباید بیشتر از {maxImageMB} مگابایت باشد" });

        var avatarsFolder = Path.Combine(env.ContentRootPath, "wwwroot", "uploads", "avatars");
        Directory.CreateDirectory(avatarsFolder);

        // Remove old avatar file if it belongs to uploads/avatars
        if (!string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/uploads/avatars/"))
        {
            var oldPath = Path.Combine(env.ContentRootPath, "wwwroot", user.AvatarUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        }

        var fileName = $"{userId}-{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(avatarsFolder, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.AvatarUrl = $"/uploads/avatars/{fileName}";
        user.ModifiedDate = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        return Ok(new { avatarUrl = user.AvatarUrl, message = "تصویر پروفایل ذخیره شد" });
    }

    /// <summary>
    /// The currently active notification (single-active rule) shown as a popup after login.
    /// Returns 204 when no active notification exists.
    /// </summary>
    [Authorize]
    [HttpGet("active-notification")]
    public async Task<IActionResult> GetActiveNotification([FromServices] ApplicationDbContext dbContext)
    {
        var now = DateTime.UtcNow;
        var notification = await dbContext.Announcements
            .Where(a => a.IsActive && a.IsPublished && a.StartDate <= now && (!a.EndDate.HasValue || a.EndDate >= now))
            .OrderByDescending(a => a.CreatedDate)
            .Select(a => new { a.Id, a.Title, a.Content, a.Summary, a.Priority, a.ImageUrl, a.CreatedDate })
            .FirstOrDefaultAsync();

        if (notification == null) return NoContent();
        return Ok(notification);
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetPublicDepartments([FromServices] IAdminService adminService)
    {
        var departments = await adminService.GetDepartmentsAsync();
        return Ok(departments.Where(d => d.IsActive).OrderBy(d => d.DisplayOrder).ThenBy(d => d.Name));
    }

    [HttpGet("positions")]
    public async Task<IActionResult> GetPublicPositions([FromServices] IAdminService adminService)
    {
        var positions = await adminService.GetPositionsAsync();
        return Ok(positions.Where(p => p.IsActive).OrderBy(p => p.DisplayOrder).ThenBy(p => p.Name));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _authService.UpdateProfileAsync(userId, request);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            if (!result) return NotFound();
            return Ok(new { message = "Password changed successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
