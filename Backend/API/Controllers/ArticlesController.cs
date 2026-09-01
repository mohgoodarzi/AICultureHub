using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.API.Attributes;

namespace AICultureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly IArticleService _articleService;
    private readonly ICategoryService _categoryService;
    private readonly ITagService _tagService;
    private readonly IAdminService _adminService;
    private readonly ILogger<ArticlesController> _logger;

    public ArticlesController(IArticleService articleService, ICategoryService categoryService, ITagService tagService, IAdminService adminService, ILogger<ArticlesController> logger)
    {
        _articleService = articleService;
        _categoryService = categoryService;
        _tagService = tagService;
        _adminService = adminService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetArticles([FromQuery] PagedRequest request, [FromQuery] int? categoryId = null)
    {
        var userId = GetCurrentUserId();
        var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
        var result = await _articleService.GetArticlesAsync(request, categoryId, includeUnpublished: isAuthenticated);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetArticle(string slug)
    {
        var userId = GetCurrentUserId();
        var article = await _articleService.GetArticleBySlugAsync(slug, userId);
        if (article == null) return NotFound();
        return Ok(article);
    }

    [HttpGet("by-id/{id}")]
    public async Task<IActionResult> GetArticleById(int id)
    {
        var userId = GetCurrentUserId();
        var article = await _articleService.GetArticleByIdAsync(id, userId);
        if (article == null) return NotFound();
        return Ok(article);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticleRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (!await HasPermissionAsync(Permissions.Articles_Create))
            return Forbid();

        try
        {
            _logger.LogInformation("CreateArticle called: Title={Title}, CategoryId={CategoryId}, UserId={UserId}",
                request.Title, request.CategoryId, userId);

            var article = await _articleService.CreateArticleAsync(request, userId.Value);
            _logger.LogInformation("Article created successfully: Id={Id}, Title={Title}", article.Id, article.Title);
            return CreatedAtAction(nameof(GetArticle), new { slug = article.Slug }, article);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating article: Title={Title}", request.Title);
            return StatusCode(500, new { message = "Error creating article: " + ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticle(int id, [FromBody] UpdateArticleRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "User not authenticated" });

        if (!await HasPermissionAsync(Permissions.Articles_Edit))
            return Forbid();

        try
        {
            _logger.LogInformation("UpdateArticle called: id={Id}, Title={Title}, CategoryId={CategoryId}, UserId={UserId}",
                id, request.Title, request.CategoryId, userId);

            var article = await _articleService.UpdateArticleAsync(id, request, userId.Value);
            if (article == null)
            {
                _logger.LogWarning("Article not found: id={Id}", id);
                return NotFound(new { message = $"Article with id {id} not found" });
            }

            _logger.LogInformation("Article updated successfully: id={Id}", id);
            return Ok(article);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating article: id={Id}", id);
            return StatusCode(500, new { message = "Error updating article: " + ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (!await HasPermissionAsync(Permissions.Articles_Delete))
            return Forbid();

        var result = await _articleService.DeleteArticleAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id}/bookmark")]
    public async Task<IActionResult> ToggleBookmark(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var isBookmarked = await _articleService.ToggleBookmarkAsync(id, userId.Value);
        return Ok(new { isBookmarked });
    }

    [Authorize]
    [HttpPost("{id}/view")]
    public async Task<IActionResult> RecordView(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        await _articleService.RecordArticleViewAsync(id, userId.Value);
        return Ok();
    }

    [Authorize]
    [HttpPost("{id}/vote")]
    public async Task<IActionResult> Vote(int id, [FromBody] CreateVoteRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var result = await _articleService.VoteAsync(id, request.IsLike, userId.Value);
        return Ok(result);
    }

    [HttpGet("{id}/vote-status")]
    public async Task<IActionResult> GetVoteStatus(int id)
    {
        var userId = GetCurrentUserId();
        var result = await _articleService.GetVoteResultAsync(id, userId);
        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("categories/{slug}")]
    public async Task<IActionResult> GetCategoryBySlug(string slug)
    {
        var category = await _categoryService.GetCategoryBySlugAsync(slug);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpGet("tags")]
    public async Task<IActionResult> GetTags()
    {
        var tags = await _tagService.GetAllTagsAsync();
        return Ok(tags);
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
        var userPerms = await _adminService.GetUserPermissionsAsync(userId.Value);
        return userPerms.Permissions.Contains(permission);
    }
}
