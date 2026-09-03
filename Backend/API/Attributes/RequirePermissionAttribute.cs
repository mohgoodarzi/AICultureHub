using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using AICultureHub.Application.Interfaces;

namespace AICultureHub.API.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _permission;

    public RequirePermissionAttribute(string permission)
    {
        _permission = permission;
    }

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

        var adminService = context.HttpContext.RequestServices.GetService<IAdminService>();
        if (adminService == null)
        {
            context.Result = new StatusCodeResult(500);
            return;
        }

        try
        {
            var permissions = await adminService.GetUserPermissionsAsync(userId);
            if (!permissions.Permissions.Contains(_permission))
            {
                context.Result = new ForbidResult();
            }
        }
        catch
        {
            context.Result = new StatusCodeResult(500);
        }
    }
}

public static class Permissions
{
    public const string Dashboard_View = "Dashboard.View";
    public const string Dashboard_Manage = "Dashboard.Manage";

    public const string Users_View = "Users.View";
    public const string Users_Create = "Users.Create";
    public const string Users_Edit = "Users.Edit";
    public const string Users_Delete = "Users.Delete";
    public const string Users_Manage = "Users.Manage";

    public const string Roles_View = "Roles.View";
    public const string Roles_Create = "Roles.Create";
    public const string Roles_Edit = "Roles.Edit";
    public const string Roles_Delete = "Roles.Delete";
    public const string Roles_Manage = "Roles.Manage";

    public const string Articles_View = "Articles.View";
    public const string Articles_Create = "Articles.Create";
    public const string Articles_Edit = "Articles.Edit";
    public const string Articles_Delete = "Articles.Delete";
    public const string Articles_Manage = "Articles.Manage";

    public const string Categories_View = "Categories.View";
    public const string Categories_Create = "Categories.Create";
    public const string Categories_Edit = "Categories.Edit";
    public const string Categories_Delete = "Categories.Delete";
    public const string Categories_Manage = "Categories.Manage";

    public const string Courses_View = "Courses.View";
    public const string Courses_Create = "Courses.Create";
    public const string Courses_Edit = "Courses.Edit";
    public const string Courses_Delete = "Courses.Delete";
    public const string Courses_Manage = "Courses.Manage";

    public const string Quizzes_View = "Quizzes.View";
    public const string Quizzes_Create = "Quizzes.Create";
    public const string Quizzes_Edit = "Quizzes.Edit";
    public const string Quizzes_Delete = "Quizzes.Delete";
    public const string Quizzes_Manage = "Quizzes.Manage";

    public const string Challenges_View = "Challenges.View";
    public const string Challenges_Create = "Challenges.Create";
    public const string Challenges_Edit = "Challenges.Edit";
    public const string Challenges_Delete = "Challenges.Delete";
    public const string Challenges_Manage = "Challenges.Manage";

    public const string Announcements_View = "Announcements.View";
    public const string Announcements_Create = "Announcements.Create";
    public const string Announcements_Edit = "Announcements.Edit";
    public const string Announcements_Delete = "Announcements.Delete";
    public const string Announcements_Manage = "Announcements.Manage";

    public const string Reports_View = "Reports.View";
    public const string Reports_Manage = "Reports.Manage";

    public const string Settings_View = "Settings.View";
    public const string Settings_Manage = "Settings.Manage";

    public const string Glossary_View = "Glossary.View";
    public const string Glossary_Create = "Glossary.Create";
    public const string Glossary_Edit = "Glossary.Edit";
    public const string Glossary_Delete = "Glossary.Delete";
    public const string Glossary_Manage = "Glossary.Manage";
}
