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
public class GlossaryController : ControllerBase
{
    private readonly IGlossaryService _glossaryService;

    public GlossaryController(IGlossaryService glossaryService)
    {
        _glossaryService = glossaryService;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetTerms([FromQuery] PagedRequest request)
    {
        var result = await _glossaryService.GetTermsAsync(request);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetTerm(string slug)
    {
        var term = await _glossaryService.GetTermBySlugAsync(slug);
        if (term == null) return NotFound();
        return Ok(term);
    }

    [HttpPost]
    [RequirePermission(Permissions.Glossary_Create)]
    public async Task<IActionResult> CreateTerm([FromBody] GlossaryDto model)
    {
        var userId = GetCurrentUserId() ?? 0;
        var term = await _glossaryService.CreateTermAsync(model, userId);
        return CreatedAtAction(nameof(GetTerm), new { slug = term.Slug }, term);
    }

    [HttpPut("{id}")]
    [RequirePermission(Permissions.Glossary_Edit)]
    public async Task<IActionResult> UpdateTerm(int id, [FromBody] GlossaryDto model)
    {
        var userId = GetCurrentUserId() ?? 0;
        var term = await _glossaryService.UpdateTermAsync(id, model, userId);
        if (term == null) return NotFound();
        return Ok(term);
    }

    [HttpDelete("{id}")]
    [RequirePermission(Permissions.Glossary_Delete)]
    public async Task<IActionResult> DeleteTerm(int id)
    {
        var result = await _glossaryService.DeleteTermAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
