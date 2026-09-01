using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AICultureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private readonly string[] _allowedVideoExtensions = { ".mp4", ".webm", ".ogg" };
    private readonly long _maxFileSize = 50 * 1024 * 1024; // 50MB

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [Authorize]
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        return await UploadFile(file, "images", _allowedImageExtensions);
    }

    [Authorize]
    [HttpPost("video")]
    public async Task<IActionResult> UploadVideo(IFormFile file)
    {
        return await UploadFile(file, "videos", _allowedVideoExtensions);
    }

    [Authorize]
    [HttpPost("file")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowed = _allowedImageExtensions.Concat(_allowedVideoExtensions).ToArray();
        return await UploadFile(file, "files", allowed);
    }

    private async Task<IActionResult> UploadFile(IFormFile file, string folder, string[] allowedExtensions)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided" });

        if (file.Length > _maxFileSize)
            return BadRequest(new { message = "File size exceeds 50MB limit" });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { message = $"File type not allowed. Allowed: {string.Join(", ", allowedExtensions)}" });

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
