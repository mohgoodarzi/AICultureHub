using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AICultureHub.API.Attributes;
using AICultureHub.Infrastructure.Data;

namespace AICultureHub.API.Controllers;

public class UploadLimitsDto
{
    public int MaxImageSizeMB { get; set; }
    public int MaxVideoSizeMB { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequireActiveUser]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly IServiceScopeFactory _scopeFactory;
    private static readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private static readonly string[] _allowedVideoExtensions = { ".mp4", ".webm", ".ogg" };

    public const string MaxImageKey = "Upload_MaxImageSizeMB";
    public const string MaxVideoKey = "Upload_MaxVideoSizeMB";
    public const int DefaultMaxImageMB = 10;
    public const int DefaultMaxVideoMB = 50;
    /// <summary>Hard upper cap regardless of admin settings, keeps server safe.</summary>
    public const long AbsoluteMaxBytes = 200L * 1024 * 1024;

    public UploadController(IWebHostEnvironment env, IServiceScopeFactory scopeFactory)
    {
        _env = env;
        _scopeFactory = scopeFactory;
    }

    /// <summary>Read configured limits (admin-editable via Admin Panel; DB-backed).</summary>
    public static (int maxImageMB, int maxVideoMB) GetLimits(ApplicationDbContext context)
    {
        var settings = context.SystemSettings
            .Where(s => s.SettingKey == MaxImageKey || s.SettingKey == MaxVideoKey)
            .ToDictionary(s => s.SettingKey, s => s.SettingValue);

        int maxImage = DefaultMaxImageMB;
        int maxVideo = DefaultMaxVideoMB;
        if (settings.TryGetValue(MaxImageKey, out var imgVal) && int.TryParse(imgVal, out var i) && i > 0) maxImage = i;
        if (settings.TryGetValue(MaxVideoKey, out var vidVal) && int.TryParse(vidVal, out var v) && v > 0) maxVideo = v;
        return (maxImage, maxVideo);
    }

    /// <summary>Current limits for the upload UI (any authenticated user).</summary>
    [HttpGet("limits")]
    public async Task<IActionResult> GetLimits()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var (maxImage, maxVideo) = await Task.Run(() => GetLimits(context));
        return Ok(new UploadLimitsDto { MaxImageSizeMB = maxImage, MaxVideoSizeMB = maxVideo });
    }

    /// <summary>Update limits (Administrator only).</summary>
    [HttpPut("limits")]
    [RequireAdministrator]
    public async Task<IActionResult> UpdateLimits([FromBody] UploadLimitsDto request)
    {
        if (request.MaxImageSizeMB < 1 || request.MaxVideoSizeMB < 1)
            return BadRequest(new { message = "حداقل حجم مجاز ۱ مگابایت است" });
        if (request.MaxImageSizeMB > AbsoluteMaxBytes / (1024 * 1024) || request.MaxVideoSizeMB > AbsoluteMaxBytes / (1024 * 1024))
            return BadRequest(new { message = $"حداکثر مقدار مجاز {AbsoluteMaxBytes / (1024 * 1024)} مگابایت است" });

        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await UpsertSetting(context, MaxImageKey, request.MaxImageSizeMB.ToString(), "حداکثر حجم تصویر (مگابایت)");
        await UpsertSetting(context, MaxVideoKey, request.MaxVideoSizeMB.ToString(), "حداکثر حجم ویدیو (مگابایت)");
        return Ok(new { message = "تنظیمات آپلود ذخیره شد", maxImageSizeMB = request.MaxImageSizeMB, maxVideoSizeMB = request.MaxVideoSizeMB });
    }

    private static async Task UpsertSetting(ApplicationDbContext context, string key, string value, string description)
    {
        var setting = await context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == key);
        if (setting == null)
        {
            context.SystemSettings.Add(new Domain.Entities.SystemSetting
            {
                SettingKey = key,
                SettingValue = value,
                Description = description,
                Category = "Upload",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            });
        }
        else
        {
            setting.SettingValue = value;
            setting.ModifiedDate = DateTime.UtcNow;
        }
        await context.SaveChangesAsync();
    }

    [RequirePermission(Permissions.Articles_Edit)]
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var (maxImage, _) = GetLimits(context);
        return await UploadFile(file, "images", _allowedImageExtensions, maxImage * 1024L * 1024L, "تصویر");
    }

    [RequirePermission(Permissions.Articles_Edit)]
    [HttpPost("video")]
    public async Task<IActionResult> UploadVideo(IFormFile file)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var (_, maxVideo) = GetLimits(context);
        return await UploadFile(file, "videos", _allowedVideoExtensions, maxVideo * 1024L * 1024L, "ویدیو");
    }

    [RequirePermission(Permissions.Articles_Edit)]
    [HttpPost("file")]
    public async Task<IActionResult> UploadAnyFile(IFormFile file)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var (maxImage, maxVideo) = GetLimits(context);
        var max = Math.Max(maxImage, maxVideo) * 1024L * 1024L;
        var ext = Path.GetExtension(file?.FileName ?? "").ToLowerInvariant();
        var allowed = _allowedImageExtensions.Concat(_allowedVideoExtensions).ToArray();
        return await UploadFile(file, "files", allowed, max, "فایل");
    }

    private async Task<IActionResult> UploadFile(IFormFile file, string folder, string[] allowedExtensions, long maxBytes, string labelFa)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "فایلی انتخاب نشده است" });

        if (file.Length > maxBytes)
        {
            var limitMB = maxBytes / (1024 * 1024);
            return BadRequest(new { message = $"حجم {labelFa} نباید بیشتر از {limitMB} مگابایت باشد" });
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { message = $"نوع فایل مجاز نیست. انواع مجاز: {string.Join("، ", allowedExtensions)}" });

        var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", folder);
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"/uploads/{folder}/{fileName}";
        return Ok(new { url, fileName, originalName = file.FileName, size = file.Length });
    }

    [HttpGet("uploads/{folder}/{fileName}")]
    public IActionResult GetFile(string folder, string fileName)
    {
        // Path traversal guard
        if (folder.Contains("..") || fileName.Contains("..") || Path.IsPathRooted(fileName))
            return BadRequest();

        var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", folder, fileName);
        if (!System.IO.File.Exists(filePath))
            return NotFound();

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".ogg" => "video/ogg",
            _ => "application/octet-stream"
        };

        return PhysicalFile(filePath, contentType);
    }
}
