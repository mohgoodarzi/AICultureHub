using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using AICultureHub.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AICultureHub.API.Attributes;

/// <summary>
/// Validates on every request that the authenticated user still exists and is active.
/// Ensures deactivated users or role changes take effect immediately, not at token expiry.
/// </summary>
public class RequireActiveUserAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (context.HttpContext.User.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var dbContext = context.HttpContext.RequestServices.GetService<AICultureHub.Infrastructure.Data.ApplicationDbContext>();
        if (dbContext == null)
        {
            context.Result = new StatusCodeResult(500);
            return;
        }

        var isActive = await dbContext.Users
            .Where(u => u.Id == userId)
            .Select(u => u.IsActive)
            .FirstOrDefaultAsync();

        if (!isActive)
        {
            context.Result = new UnauthorizedResult();
        }
    }
}
