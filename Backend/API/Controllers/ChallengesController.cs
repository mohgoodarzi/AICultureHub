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
public class ChallengesController : ControllerBase
{
    private readonly IChallengeService _challengeService;

    public ChallengesController(IChallengeService challengeService)
    {
        _challengeService = challengeService;
    }

    [Authorize]
    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyChallenge()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        var challenge = await _challengeService.GetDailyChallengeAsync(userId.Value);
        if (challenge == null) return NotFound();
        return Ok(challenge);
    }

    [Authorize]
    [HttpPost("{id}/submit")]
    public async Task<IActionResult> SubmitAnswer(int id, [FromBody] ChallengeAnswerRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        try
        {
            var result = await _challengeService.SubmitChallengeAnswerAsync(id, request.Answer, userId.Value);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int count = 10)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        
        var history = await _challengeService.GetChallengeHistoryAsync(userId.Value, count);
        return Ok(history);
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }
}

public class ChallengeAnswerRequest
{
    public string Answer { get; set; } = string.Empty;
}
