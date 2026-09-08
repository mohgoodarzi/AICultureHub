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
[Authorize]
[RequireActiveUser]
[RequirePermission(Permissions.Courses_View)]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuizzesController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuizzes([FromQuery] PagedRequest request)
    {
        var result = await _quizService.GetQuizzesAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuiz(int id)
    {
        var quiz = await _quizService.GetQuizByIdAsync(id);
        if (quiz == null) return NotFound();
        return Ok(quiz);
    }

    [Authorize]
    [HttpPost("{id}/submit")]
    public async Task<IActionResult> SubmitQuiz(int id, [FromBody] SubmitQuizRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var result = await _quizService.SubmitQuizAsync(id, request, userId.Value);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var history = await _quizService.GetUserQuizHistoryAsync(userId.Value);
        return Ok(history);
    }

    [Authorize]
    [HttpGet("{id}/attempt-status")]
    public async Task<IActionResult> GetAttemptStatus(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var attempted = await _quizService.HasUserAttemptedAsync(id, userId.Value);
        return Ok(new { attempted });
    }

    [Authorize]
    [HttpGet("{id}/my-attempt")]
    public async Task<IActionResult> GetMyAttempt(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var review = await _quizService.GetAttemptReviewAsync(id, userId.Value);
        if (review == null) return NotFound();
        return Ok(review);
    }

    // ===== Admin quiz management =====

    [HttpGet("admin/all")]
    [RequirePermission(Permissions.Courses_View)]
    public async Task<IActionResult> GetQuizzesForAdmin()
    {
        var quizzes = await _quizService.GetQuizzesForAdminAsync();
        return Ok(quizzes);
    }

    [HttpGet("admin/{id}")]
    [RequirePermission(Permissions.Courses_View)]
    public async Task<IActionResult> GetQuizForAdmin(int id)
    {
        var quiz = await _quizService.GetQuizForAdminAsync(id);
        if (quiz == null) return NotFound();
        return Ok(quiz);
    }

    [HttpPost("admin")]
    [RequirePermission(Permissions.Courses_View)]
    public async Task<IActionResult> CreateQuiz([FromBody] SaveQuizRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var quiz = await _quizService.CreateQuizAsync(request, userId.Value);
            return Ok(quiz);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("admin/{id}")]
    [RequirePermission(Permissions.Courses_View)]
    public async Task<IActionResult> UpdateQuiz(int id, [FromBody] SaveQuizRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var quiz = await _quizService.UpdateQuizAsync(id, request, userId.Value);
            if (quiz == null) return NotFound();
            return Ok(quiz);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("admin/{id}")]
    [RequirePermission(Permissions.Courses_View)]
    public async Task<IActionResult> DeleteQuiz(int id)
    {
        var result = await _quizService.DeleteQuizAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }
}
