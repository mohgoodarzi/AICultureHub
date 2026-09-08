using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AICultureHub.Infrastructure.Data;
using AICultureHub.Domain.Entities;
using AICultureHub.API.Attributes;

namespace AICultureHub.API.Controllers;

public class FeedbackDto
{
    public int Id { get; set; }
    public int? ArticleId { get; set; }
    public string? ArticleTitle { get; set; }
    public int? CourseId { get; set; }
    public string? CourseTitle { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string CommentText { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

public class SubmitFeedbackRequest
{
    public int? ArticleId { get; set; }
    public int? CourseId { get; set; }
    public string CommentText { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequireActiveUser]
public class FeedbacksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FeedbacksController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }

    /// <summary>Submit text feedback for an article or course.</summary>
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitFeedbackRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.CommentText) || request.CommentText.Trim().Length < 3)
            return BadRequest(new { message = "متن بازخورد باید حداقل ۳ کاراکتر باشد" });
        if (request.CommentText.Length > 2000)
            return BadRequest(new { message = "متن بازخورد نباید بیشتر از ۲۰۰۰ کاراکتر باشد" });
        if (!request.ArticleId.HasValue && !request.CourseId.HasValue)
            return BadRequest(new { message = "بازخورد باید به یک مقاله یا دوره مرتبط باشد" });

        var feedback = new Feedback
        {
            ArticleId = request.ArticleId,
            CourseId = request.CourseId,
            UserId = userId.Value,
            CommentText = request.CommentText.Trim(),
            IsActive = true,
            CreatedDate = DateTime.UtcNow
        };
        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        return Ok(new { message = "بازخورد شما ثبت شد. با تشکر!", id = feedback.Id });
    }

    /// <summary>Feedback list for one article.</summary>
    [HttpGet("article/{articleId}")]
    public async Task<IActionResult> GetForArticle(int articleId)
    {
        var list = await _context.Feedbacks
            .Include(f => f.User)
            .Where(f => f.IsActive && f.ArticleId == articleId)
            .OrderByDescending(f => f.CreatedDate)
            .Select(f => new FeedbackDto
            {
                Id = f.Id, ArticleId = f.ArticleId, UserId = f.UserId,
                UserName = f.User != null ? f.User.FullName : "کاربر",
                CommentText = f.CommentText, CreatedDate = f.CreatedDate
            })
            .ToListAsync();
        return Ok(list);
    }

    /// <summary>Feedback list for one course.</summary>
    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetForCourse(int courseId)
    {
        var list = await _context.Feedbacks
            .Include(f => f.User)
            .Where(f => f.IsActive && f.CourseId == courseId)
            .OrderByDescending(f => f.CreatedDate)
            .Select(f => new FeedbackDto
            {
                Id = f.Id, CourseId = f.CourseId, UserId = f.UserId,
                UserName = f.User != null ? f.User.FullName : "کاربر",
                CommentText = f.CommentText, CreatedDate = f.CreatedDate
            })
            .ToListAsync();
        return Ok(list);
    }

    /// <summary>All feedback for the Admin Panel (admins and content managers).</summary>
    [HttpGet("admin/all")]
    [RequirePermission(Permissions.Management_View)]
    public async Task<IActionResult> GetAllForAdmin()
    {
        var list = await _context.Feedbacks
            .Include(f => f.User)
            .Include(f => f.Article)
            .Include(f => f.Course)
            .Where(f => f.IsActive)
            .OrderByDescending(f => f.CreatedDate)
            .Select(f => new FeedbackDto
            {
                Id = f.Id,
                ArticleId = f.ArticleId,
                ArticleTitle = f.Article != null ? f.Article.Title : null,
                CourseId = f.CourseId,
                CourseTitle = f.Course != null ? f.Course.Title : null,
                UserId = f.UserId,
                UserName = f.User != null ? f.User.FullName : "کاربر",
                CommentText = f.CommentText,
                CreatedDate = f.CreatedDate
            })
            .ToListAsync();
        return Ok(list);
    }

    /// <summary>Remove inappropriate feedback (admins and content managers).</summary>
    [HttpDelete("admin/{id}")]
    [RequireAdministrator]
    public async Task<IActionResult> Remove(int id)
    {
        var feedback = await _context.Feedbacks.FirstOrDefaultAsync(f => f.Id == id && f.IsActive);
        if (feedback == null) return NotFound();
        feedback.IsActive = false;
        feedback.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
