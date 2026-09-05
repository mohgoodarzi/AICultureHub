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
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly IAdminService _adminService;

    public CoursesController(ICourseService courseService, IAdminService adminService)
    {
        _courseService = courseService;
        _adminService = adminService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCourses([FromQuery] PagedRequest request)
    {
        var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
        var result = await _courseService.GetCoursesAsync(request, includeUnpublished: isAuthenticated);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetCourse(string slug)
    {
        var userId = GetCurrentUserId();
        var course = await _courseService.GetCourseBySlugAsync(slug, userId);
        if (course == null) return NotFound();
        return Ok(course);
    }

    [HttpGet("by-id/{id}")]
    public async Task<IActionResult> GetCourseById(int id)
    {
        var userId = GetCurrentUserId();
        var course = await _courseService.GetCourseByIdAsync(id, userId);
        if (course == null) return NotFound();
        return Ok(course);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (!await HasPermissionAsync(Permissions.Courses_Create))
            return Forbid();

        try
        {
            var course = await _courseService.CreateCourseAsync(request, userId.Value);
            return CreatedAtAction(nameof(GetCourse), new { slug = course.Slug }, course);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CreateCourse] Error: {ex.Message}");
            return StatusCode(500, new { message = "Error creating course: " + ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(int id, [FromBody] CreateCourseRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (!await HasPermissionAsync(Permissions.Courses_Edit))
            return Forbid();

        var course = await _courseService.UpdateCourseAsync(id, request, userId.Value);
        if (course == null) return NotFound();
        return Ok(course);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (!await HasPermissionAsync(Permissions.Courses_Delete))
            return Forbid();

        var result = await _courseService.DeleteCourseAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id}/enroll")]
    public async Task<IActionResult> Enroll(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _courseService.EnrollInCourseAsync(id, userId.Value);
        if (!result) return BadRequest(new { message = "Already enrolled or course not found" });
        return Ok(new { message = "Enrolled successfully" });
    }

    [Authorize]
    [HttpPost("lessons/{lessonId}/complete")]
    public async Task<IActionResult> CompleteLesson(int lessonId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _courseService.CompleteLessonAsync(lessonId, userId.Value);
        if (!result) return NotFound();
        return Ok(new { message = "Lesson completed" });
    }

    [Authorize]
    [HttpGet("lessons/{lessonId}")]
    public async Task<IActionResult> GetLesson(int lessonId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var lesson = await _courseService.GetLessonAsync(lessonId, userId.Value);
        if (lesson == null) return NotFound();
        return Ok(lesson);
    }

    [Authorize]
    [HttpPost("{id}/vote")]
    public async Task<IActionResult> Vote(int id, [FromBody] CreateVoteRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var result = await _courseService.VoteAsync(id, request.IsLike, userId.Value);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("{id}/vote-status")]
    public async Task<IActionResult> GetVoteStatus(int id)
    {
        var userId = GetCurrentUserId();
        var result = await _courseService.GetVoteResultAsync(id, userId);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("feedback-stats")]
    public async Task<IActionResult> GetFeedbackStats()
    {
        var stats = await _courseService.GetFeedbackStatsAsync();
        return Ok(stats);
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
