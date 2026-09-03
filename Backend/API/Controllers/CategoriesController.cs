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
[RequireAdministrator]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories = await _categoryService.GetAllCategoriesIncludingInactiveAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        _logger.LogInformation("=== CreateCategory START ===");
        _logger.LogInformation("Request received: Name={Name}, Description={Description}, DisplayOrder={DisplayOrder}, IsActive={IsActive}",
            request.Name, request.Description, request.DisplayOrder, request.IsActive);

        try
        {
            var userId = GetCurrentUserId();
            _logger.LogInformation("UserId from token: {UserId}", userId);

            if (userId == null)
            {
                _logger.LogWarning("User is not authorized - userId is null");
                return Unauthorized();
            }

            _logger.LogInformation("Calling CategoryService.CreateCategoryAsync...");
            var category = await _categoryService.CreateCategoryAsync(request, userId.Value);
            _logger.LogInformation("Category created successfully: Id={Id}, Name={Name}", category.Id, category.Name);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "=== CreateCategory ERROR ===");
            _logger.LogError(ex, "Exception Message: {Message}", ex.Message);
            _logger.LogError(ex, "Inner Exception: {InnerMessage}", ex.InnerException?.Message);
            _logger.LogError(ex, "Inner Inner Exception: {InnerInnerMessage}", ex.InnerException?.InnerException?.Message);
            _logger.LogError(ex, "Stack Trace: {StackTrace}", ex.StackTrace);

            var errorMessage = $"Error creating category: {ex.Message}";
            if (ex.InnerException != null)
            {
                errorMessage += $" | Inner: {ex.InnerException.Message}";
                if (ex.InnerException.InnerException != null)
                {
                    errorMessage += $" | {ex.InnerException.InnerException.Message}";
                }
            }
            return StatusCode(500, new { message = errorMessage });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var category = await _categoryService.UpdateCategoryAsync(id, request, userId.Value);
            if (category == null) return NotFound();
            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category: Id={Id}", id);
            return StatusCode(500, new { message = "Error updating category: " + ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            var inUse = await _categoryService.IsCategoryInUseAsync(id);
            if (inUse)
            {
                return Conflict(new { message = "این دسته‌بندی به یک یا چند آیتم متصل است و قابل حذف نیست. لطفاً ابتدا آیتم‌های مرتبط را حذف یا ویرایش کنید." });
            }

            var result = await _categoryService.DeleteCategoryAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category: Id={Id}", id);
            return StatusCode(500, new { message = "Error deleting category: " + ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }
}
