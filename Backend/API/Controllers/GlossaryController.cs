using Microsoft.AspNetCore.Mvc;
using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;

namespace AICultureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GlossaryController : ControllerBase
{
    private readonly IGlossaryService _glossaryService;

    public GlossaryController(IGlossaryService glossaryService)
    {
        _glossaryService = glossaryService;
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
    public async Task<IActionResult> CreateTerm([FromBody] GlossaryDto model)
    {
        var term = await _glossaryService.CreateTermAsync(model, 1);
        return CreatedAtAction(nameof(GetTerm), new { slug = term.Slug }, term);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTerm(int id, [FromBody] GlossaryDto model)
    {
        var term = await _glossaryService.UpdateTermAsync(id, model, 1);
        if (term == null) return NotFound();
        return Ok(term);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTerm(int id)
    {
        var result = await _glossaryService.DeleteTermAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
