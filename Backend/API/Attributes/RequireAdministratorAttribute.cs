using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using AICultureHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AICultureHub.API.Attributes;

/// <summary>
/// Checks Administrator role membership live in the database on every request.
/// Unlike [Authorize(Roles = "Administrator")] which relies on stale JWT claims,
/// this enforces role changes immediately.
/// </summary>
public class RequireAdministratorAttribute : Attribute, IAsyncAuthorizationFilter
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

        var dbContext = context.HttpContext.RequestServices.GetService<ApplicationDbContext>();
        if (dbContext == null)
        {
            context.Result = new StatusCodeResult(500);
            return;
        }

        var isAdmin = await dbContext.UserRoles
            .Include(ur => ur.Role)
            .AnyAsync(ur => ur.UserId == userId && ur.Role.Name == "Administrator");

        if (!isAdmin)
        {
            context.Result = new ForbidResult();
        }
    }
}
