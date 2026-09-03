using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.Domain.Entities;
using AICultureHub.Infrastructure.Data;

namespace AICultureHub.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditService _auditService;
    public AdminService(ApplicationDbContext context, IAuditService auditService) { _context = context; _auditService = auditService; }

    public async Task<PaginatedResult<UserDto>> GetUsersAsync(PagedRequest request)
    {
        var query = _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).Include(u => u.CurrentLevel).Include(u => u.Department).Include(u => u.Position).Where(u => u.IsActive);
        if (!string.IsNullOrEmpty(request.Search)) query = query.Where(u => u.Username.Contains(request.Search) || u.Email.Contains(request.Search) || u.FullName.Contains(request.Search));
        var totalCount = await query.CountAsync();
        var users = await query.OrderBy(u => u.Username).Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).Select(u => new UserDto { Id = u.Id, Username = u.Username, Email = u.Email, FirstName = u.FirstName, LastName = u.LastName, FullName = u.FullName, DepartmentId = u.DepartmentId, DepartmentName = u.Department != null ? u.Department.Name : null, PositionId = u.PositionId, PositionName = u.Position != null ? u.Position.Name : null, Location = u.Location, AvatarUrl = u.AvatarUrl, IsActive = u.IsActive, TotalPoints = u.TotalPoints, LearningStreak = u.LearningStreak, CurrentLevel = u.CurrentLevel != null ? new LevelDto { Id = u.CurrentLevel.Id, LevelNumber = u.CurrentLevel.LevelNumber, Name = u.CurrentLevel.Name, Color = u.CurrentLevel.Color } : null, Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList() }).ToListAsync();
        return new PaginatedResult<UserDto> { Items = users, TotalCount = totalCount, PageNumber = request.PageNumber, PageSize = request.PageSize };
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).Include(u => u.CurrentLevel).Include(u => u.Badges).ThenInclude(ub => ub.Badge).Include(u => u.Department).Include(u => u.Position).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return null;
        return new UserDto { Id = user.Id, Username = user.Username, Email = user.Email, FirstName = user.FirstName, LastName = user.LastName, FullName = user.FullName, DepartmentId = user.DepartmentId, DepartmentName = user.Department?.Name, PositionId = user.PositionId, PositionName = user.Position?.Name, Location = user.Location, EmployeeId = user.EmployeeId, AvatarUrl = user.AvatarUrl, Bio = user.Bio, IsActive = user.IsActive, TotalPoints = user.TotalPoints, CurrentLevelPoints = user.CurrentLevelPoints, LearningStreak = user.LearningStreak, CurrentLevel = user.CurrentLevel != null ? new LevelDto { Id = user.CurrentLevel.Id, LevelNumber = user.CurrentLevel.LevelNumber, Name = user.CurrentLevel.Name, Description = user.CurrentLevel.Description, PointsRequired = user.CurrentLevel.PointsRequired, Color = user.CurrentLevel.Color } : null, Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(), Badges = user.Badges.Select(ub => new BadgeDto { Id = ub.Badge.Id, Name = ub.Badge.Name, Description = ub.Badge.Description, Color = ub.Badge.Color, EarnedDate = ub.EarnedDate }).ToList() };
    }

    public async Task<UserDto> CreateUserAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username)) throw new InvalidOperationException("Username already exists");
        if (await _context.Users.AnyAsync(u => u.Email == request.Email)) throw new InvalidOperationException("Email already exists");
        var salt = GenerateSalt();
        var user = new User { Username = request.Username, Email = request.Email, PasswordHash = HashPassword(request.Password, salt), PasswordSalt = salt, FirstName = request.FirstName, LastName = request.LastName, DepartmentId = request.DepartmentId, PositionId = request.PositionId, EmployeeId = request.EmployeeId, CurrentLevelId = 1, IsActive = true, IsEmailVerified = true, CreatedDate = DateTime.UtcNow };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        var employeeRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Employee");
        if (employeeRole != null) { _context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = employeeRole.Id, AssignedDate = DateTime.UtcNow }); await _context.SaveChangesAsync(); }
        await _auditService.LogAsync(null, "CREATE_USER", "User", user.Id, $"Created user: {user.Username}");
        return (await GetUserByIdAsync(user.Id))!;
    }

    public async Task<UserDto?> UpdateUserAsync(int id, UpdateProfileRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;
        if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;
        if (request.DepartmentId.HasValue) user.DepartmentId = request.DepartmentId;
        if (request.PositionId.HasValue) user.PositionId = request.PositionId;
        if (!string.IsNullOrEmpty(request.Location)) user.Location = request.Location;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        user.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "UPDATE_USER", "User", id, $"Updated user: {user.Username}");
        return await GetUserByIdAsync(id);
    }

    public async Task<UserDto?> AdminUpdateUserAsync(int id, AdminUpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var email = request.Email.Trim();
            if (await _context.Users.AnyAsync(u => u.Email == email && u.Id != id))
                throw new InvalidOperationException("Email is already in use by another user");
            user.Email = email;
        }

        if (request.EmployeeId != null) user.EmployeeId = string.IsNullOrWhiteSpace(request.EmployeeId) ? null : request.EmployeeId.Trim();

        // Nullable FKs: explicit null clears the assignment; omitted field leaves it unchanged.
        if (request.DepartmentId.HasValue) user.DepartmentId = request.DepartmentId.Value == 0 ? null : request.DepartmentId;
        if (request.PositionId.HasValue) user.PositionId = request.PositionId.Value == 0 ? null : request.PositionId;

        if (request.IsActive.HasValue)
        {
            user.IsActive = request.IsActive.Value;
        }

        if (!string.IsNullOrEmpty(request.Password))
        {
            var salt = GenerateSalt();
            user.PasswordSalt = salt;
            user.PasswordHash = HashPassword(request.Password, salt);
        }

        user.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "ADMIN_UPDATE_USER", "User", id, $"Admin updated user: {user.Username}");
        return await GetUserByIdAsync(id);
    }

    public async Task<bool> DeactivateUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;
        user.IsActive = false; user.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "DEACTIVATE_USER", "User", id, $"Deactivated user");
        return true;
    }

    public async Task<bool> ActivateUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;
        user.IsActive = true; user.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "ACTIVATE_USER", "User", id, $"Activated user");
        return true;
    }

    public async Task<bool> AssignRoleAsync(int userId, string roleName)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (role == null) return false;
        if (await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == role.Id)) return true;
        _context.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id, AssignedDate = DateTime.UtcNow });
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "ASSIGN_ROLE", "User", userId, $"Assigned role {roleName}");
        return true;
    }

    public async Task<bool> RemoveRoleAsync(int userId, string roleName)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (role == null) return false;
        var userRole = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == role.Id);
        if (userRole == null) return false;
        _context.UserRoles.Remove(userRole);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "REMOVE_ROLE", "User", userId, $"Removed role {roleName}");
        return true;
    }

    public async Task<List<string>> GetUserRolesAsync(int userId) => await _context.UserRoles.Where(ur => ur.UserId == userId).Include(ur => ur.Role).Select(ur => ur.Role.Name).ToListAsync();

    public async Task<AnnouncementDto> CreateAnnouncementAsync(AnnouncementDto model, int createdBy)
    {
        var announcement = new Announcement { Title = model.Title, Content = model.Content, Summary = model.Summary, Priority = model.Priority, ImageUrl = model.ImageUrl, StartDate = model.StartDate, EndDate = model.EndDate, IsPublished = model.IsPublished, CreatedBy = createdBy, IsActive = true, CreatedDate = DateTime.UtcNow };
        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(createdBy, "CREATE", "Announcement", announcement.Id, $"Created announcement: {announcement.Title}");
        return new AnnouncementDto { Id = announcement.Id, Title = announcement.Title, Content = announcement.Content, Summary = announcement.Summary, Priority = announcement.Priority, ImageUrl = announcement.ImageUrl, StartDate = announcement.StartDate, EndDate = announcement.EndDate, IsPublished = announcement.IsPublished, CreatedDate = announcement.CreatedDate };
    }

    public async Task<AnnouncementDto?> UpdateAnnouncementAsync(int id, AnnouncementDto model, int modifiedBy)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null) return null;
        announcement.Title = model.Title; announcement.Content = model.Content; announcement.Summary = model.Summary; announcement.Priority = model.Priority; announcement.ImageUrl = model.ImageUrl; announcement.StartDate = model.StartDate; announcement.EndDate = model.EndDate; announcement.IsPublished = model.IsPublished; announcement.ModifiedDate = DateTime.UtcNow; announcement.ModifiedBy = modifiedBy;
        await _context.SaveChangesAsync();
        return new AnnouncementDto { Id = announcement.Id, Title = announcement.Title, Content = announcement.Content, Summary = announcement.Summary, Priority = announcement.Priority, ImageUrl = announcement.ImageUrl, StartDate = announcement.StartDate, EndDate = announcement.EndDate, IsPublished = announcement.IsPublished, CreatedDate = announcement.CreatedDate };
    }

    public async Task<bool> DeleteAnnouncementAsync(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null) return false;
        announcement.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync() => await _context.Announcements.Where(a => a.IsActive && a.IsPublished && a.StartDate <= DateTime.UtcNow && (!a.EndDate.HasValue || a.EndDate >= DateTime.UtcNow)).OrderByDescending(a => a.CreatedDate).Select(a => new AnnouncementDto { Id = a.Id, Title = a.Title, Content = a.Content, Summary = a.Summary, Priority = a.Priority, ImageUrl = a.ImageUrl, StartDate = a.StartDate, EndDate = a.EndDate, IsPublished = a.IsPublished, CreatedDate = a.CreatedDate }).ToListAsync();
    public async Task<List<AnnouncementDto>> GetAllAnnouncementsAsync() => await _context.Announcements.Where(a => a.IsActive).OrderByDescending(a => a.CreatedDate).Select(a => new AnnouncementDto { Id = a.Id, Title = a.Title, Content = a.Content, Summary = a.Summary, Priority = a.Priority, ImageUrl = a.ImageUrl, StartDate = a.StartDate, EndDate = a.EndDate, IsPublished = a.IsPublished, CreatedDate = a.CreatedDate }).ToListAsync();

    public async Task<AnalyticsDto> GetAnalyticsAsync()
    {
        var totalUsers = await _context.Users.CountAsync();
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
        var newUsersThisMonth = await _context.Users.CountAsync(u => u.CreatedDate >= DateTime.UtcNow.AddDays(-30));
        var totalArticles = await _context.Articles.CountAsync(a => a.IsActive);
        var totalCourses = await _context.Courses.CountAsync(c => c.IsActive);
        var courseCompletions = await _context.CourseEnrollments.CountAsync(ce => ce.Status == "Completed");
        var totalQuizzes = await _context.Quizzes.CountAsync(q => q.IsActive);
        var quizAttempts = await _context.QuizAttempts.CountAsync();
        var averageQuizScore = quizAttempts > 0 ? await _context.QuizAttempts.AverageAsync(qa => qa.Percentage) : 0;
        var challengesCompleted = await _context.UserChallenges.CountAsync(uc => uc.IsCorrect);
        var totalPointsAwarded = await _context.PointTransactions.SumAsync(pt => pt.Points);
        var popularArticles = await _context.Articles.Where(a => a.IsActive && a.IsPublished).OrderByDescending(a => a.ViewCount).Take(5).Select(a => new PopularItemDto { Id = a.Id, Title = a.Title, Count = a.ViewCount }).ToListAsync();
        var popularCourses = await _context.Courses.Where(c => c.IsActive && c.IsPublished).OrderByDescending(c => c.EnrolledCount).Take(5).Select(c => new PopularItemDto { Id = c.Id, Title = c.Title, Count = c.EnrolledCount }).ToListAsync();
        var topUsers = await _context.Users.Include(u => u.Department).Where(u => u.IsActive).OrderByDescending(u => u.TotalPoints).Take(10).Select(u => new ActiveUserDto { UserId = u.Id, DisplayName = u.FullName, Department = u.Department != null ? u.Department.Name : null, Points = u.TotalPoints }).ToListAsync();
        return new AnalyticsDto { TotalUsers = totalUsers, ActiveUsers = activeUsers, NewUsersThisMonth = newUsersThisMonth, TotalArticles = totalArticles, TotalCourses = totalCourses, CourseCompletions = courseCompletions, TotalQuizzes = totalQuizzes, QuizAttempts = quizAttempts, AverageQuizScore = averageQuizScore, ChallengesCompleted = challengesCompleted, TotalPointsAwarded = totalPointsAwarded, PopularArticles = popularArticles, PopularCourses = popularCourses, TopUsers = topUsers };
    }

    public async Task<List<LevelDto>> GetLevelsAsync() => await _context.Levels.Where(l => l.IsActive).OrderBy(l => l.LevelNumber).Select(l => new LevelDto { Id = l.Id, LevelNumber = l.LevelNumber, Name = l.Name, Description = l.Description, PointsRequired = l.PointsRequired, Color = l.Color }).ToListAsync();
    public async Task<LevelDto> CreateLevelAsync(LevelDto model) { var level = new Level { LevelNumber = model.LevelNumber, Name = model.Name, Description = model.Description, PointsRequired = model.PointsRequired, Color = model.Color, IsActive = true, CreatedDate = DateTime.UtcNow }; _context.Levels.Add(level); await _context.SaveChangesAsync(); return new LevelDto { Id = level.Id, LevelNumber = level.LevelNumber, Name = level.Name, Description = level.Description, PointsRequired = level.PointsRequired, Color = level.Color }; }
    public async Task<LevelDto?> UpdateLevelAsync(int id, LevelDto model) { var level = await _context.Levels.FindAsync(id); if (level == null) return null; level.Name = model.Name; level.Description = model.Description; level.PointsRequired = model.PointsRequired; level.Color = model.Color; level.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); return new LevelDto { Id = level.Id, LevelNumber = level.LevelNumber, Name = level.Name, Description = level.Description, PointsRequired = level.PointsRequired, Color = level.Color }; }
    public async Task<List<BadgeDto>> GetBadgesAsync() => await _context.Badges.Where(b => b.IsActive).Select(b => new BadgeDto { Id = b.Id, Name = b.Name, Description = b.Description, IconUrl = b.IconUrl, Color = b.Color }).ToListAsync();
    public async Task<BadgeDto> CreateBadgeAsync(BadgeDto model) { var badge = new Badge { Name = model.Name, Description = model.Description, IconUrl = model.IconUrl, Color = model.Color, Criteria = model.Description, CriteriaType = "TotalPoints", CriteriaValue = 100, Points = 50, IsActive = true, CreatedDate = DateTime.UtcNow }; _context.Badges.Add(badge); await _context.SaveChangesAsync(); return new BadgeDto { Id = badge.Id, Name = badge.Name, Description = badge.Description, IconUrl = badge.IconUrl, Color = badge.Color }; }
    public async Task<BadgeDto?> UpdateBadgeAsync(int id, BadgeDto model) { var badge = await _context.Badges.FindAsync(id); if (badge == null) return null; badge.Name = model.Name; badge.Description = model.Description; badge.IconUrl = model.IconUrl; badge.Color = model.Color; badge.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); return new BadgeDto { Id = badge.Id, Name = badge.Name, Description = badge.Description, IconUrl = badge.IconUrl, Color = badge.Color }; }

    public async Task<List<DepartmentDto>> GetDepartmentsAsync() => await _context.Departments.OrderBy(d => d.IsActive == false).ThenBy(d => d.DisplayOrder).ThenBy(d => d.Name).Select(d => new DepartmentDto { Id = d.Id, Name = d.Name, Description = d.Description, Code = d.Code, ParentId = d.ParentId, DisplayOrder = d.DisplayOrder, IsActive = d.IsActive }).ToListAsync();
    public async Task<DepartmentDto> CreateDepartmentAsync(DepartmentDto model) { var dept = new Department { Name = model.Name, Description = model.Description, Code = model.Code, ParentId = model.ParentId, DisplayOrder = model.DisplayOrder, IsActive = true, CreatedDate = DateTime.UtcNow }; _context.Departments.Add(dept); await _context.SaveChangesAsync(); return new DepartmentDto { Id = dept.Id, Name = dept.Name, Description = dept.Description, Code = dept.Code, ParentId = dept.ParentId, DisplayOrder = dept.DisplayOrder, IsActive = dept.IsActive }; }
    public async Task<DepartmentDto?> UpdateDepartmentAsync(int id, DepartmentDto model) { var dept = await _context.Departments.FindAsync(id); if (dept == null) return null; dept.Name = model.Name; dept.Description = model.Description; dept.Code = model.Code; dept.ParentId = model.ParentId; dept.DisplayOrder = model.DisplayOrder; dept.IsActive = model.IsActive; dept.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); return new DepartmentDto { Id = dept.Id, Name = dept.Name, Description = dept.Description, Code = dept.Code, ParentId = dept.ParentId, DisplayOrder = dept.DisplayOrder, IsActive = dept.IsActive }; }
    public async Task<bool> DeleteDepartmentAsync(int id) { var dept = await _context.Departments.FindAsync(id); if (dept == null) return false; if (await _context.Users.AnyAsync(u => u.DepartmentId == id)) return false; dept.IsActive = false; dept.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); return true; }

    public async Task<List<PositionDto>> GetPositionsAsync() => await _context.Positions.Include(p => p.Department).OrderBy(p => p.IsActive == false).ThenBy(p => p.DisplayOrder).ThenBy(p => p.Name).Select(p => new PositionDto { Id = p.Id, Name = p.Name, Description = p.Description, Code = p.Code, DepartmentId = p.DepartmentId, DepartmentName = p.Department != null ? p.Department.Name : null, DisplayOrder = p.DisplayOrder, IsActive = p.IsActive }).ToListAsync();
    public async Task<PositionDto> CreatePositionAsync(PositionDto model) { var pos = new Position { Name = model.Name, Description = model.Description, Code = model.Code, DepartmentId = model.DepartmentId, DisplayOrder = model.DisplayOrder, IsActive = true, CreatedDate = DateTime.UtcNow }; _context.Positions.Add(pos); await _context.SaveChangesAsync(); var dept = model.DepartmentId.HasValue ? await _context.Departments.FindAsync(model.DepartmentId) : null; return new PositionDto { Id = pos.Id, Name = pos.Name, Description = pos.Description, Code = pos.Code, DepartmentId = pos.DepartmentId, DepartmentName = dept?.Name, DisplayOrder = pos.DisplayOrder, IsActive = pos.IsActive }; }
    public async Task<PositionDto?> UpdatePositionAsync(int id, PositionDto model) { var pos = await _context.Positions.FindAsync(id); if (pos == null) return null; pos.Name = model.Name; pos.Description = model.Description; pos.Code = model.Code; pos.DepartmentId = model.DepartmentId; pos.DisplayOrder = model.DisplayOrder; pos.IsActive = model.IsActive; pos.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); var dept = model.DepartmentId.HasValue ? await _context.Departments.FindAsync(model.DepartmentId) : null; return new PositionDto { Id = pos.Id, Name = pos.Name, Description = pos.Description, Code = pos.Code, DepartmentId = pos.DepartmentId, DepartmentName = dept?.Name, DisplayOrder = pos.DisplayOrder, IsActive = pos.IsActive }; }
    public async Task<bool> DeletePositionAsync(int id) { var pos = await _context.Positions.FindAsync(id); if (pos == null) return false; if (await _context.Users.AnyAsync(u => u.PositionId == id)) return false; pos.IsActive = false; pos.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); return true; }

    public async Task<List<RoleDto>> GetRolesAsync() => await _context.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).Where(r => r.IsActive).OrderBy(r => r.Name).Select(r => new RoleDto { Id = r.Id, Name = r.Name, Description = r.Description, IsActive = r.IsActive, CreatedDate = r.CreatedDate, Permissions = r.RolePermissions.Where(rp => rp.Permission.IsActive).Select(rp => new PermissionDto { Id = rp.Permission.Id, Name = rp.Permission.Name, Code = rp.Permission.Code, Module = rp.Permission.Module, Description = rp.Permission.Description, IsActive = rp.Permission.IsActive }).ToList(), UserCount = r.UserRoles.Count }).ToListAsync();
    public async Task<RoleDto?> GetRoleByIdAsync(int id) { var role = await _context.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).FirstOrDefaultAsync(r => r.Id == id); if (role == null) return null; return new RoleDto { Id = role.Id, Name = role.Name, Description = role.Description, IsActive = role.IsActive, CreatedDate = role.CreatedDate, Permissions = role.RolePermissions.Where(rp => rp.Permission.IsActive).Select(rp => new PermissionDto { Id = rp.Permission.Id, Name = rp.Permission.Name, Code = rp.Permission.Code, Module = rp.Permission.Module, Description = rp.Permission.Description, IsActive = rp.Permission.IsActive }).ToList(), UserCount = role.UserRoles.Count }; }
    public async Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, int createdBy) { var role = new Role { Name = request.Name, Description = request.Description, IsActive = request.IsActive, CreatedDate = DateTime.UtcNow }; _context.Roles.Add(role); await _context.SaveChangesAsync(); if (request.PermissionIds.Any()) { _context.RolePermissions.AddRange(request.PermissionIds.Select(pid => new RolePermission { RoleId = role.Id, PermissionId = pid })); await _context.SaveChangesAsync(); } await _auditService.LogAsync(createdBy, "CREATE_ROLE", "Role", role.Id, $"Created role: {role.Name}"); return (await GetRoleByIdAsync(role.Id))!; }
    public async Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleRequest request, int modifiedBy) { var role = await _context.Roles.FindAsync(id); if (role == null) return null; if (request.Name != null) role.Name = request.Name; if (request.Description != null) role.Description = request.Description; if (request.IsActive.HasValue) role.IsActive = request.IsActive.Value; role.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); if (request.PermissionIds != null) { var existingPerms = await _context.RolePermissions.Where(rp => rp.RoleId == id).ToListAsync(); _context.RolePermissions.RemoveRange(existingPerms); _context.RolePermissions.AddRange(request.PermissionIds.Select(pid => new RolePermission { RoleId = id, PermissionId = pid })); await _context.SaveChangesAsync(); } await _auditService.LogAsync(modifiedBy, "UPDATE_ROLE", "Role", id, $"Updated role: {role.Name}"); return await GetRoleByIdAsync(id); }
    public async Task<bool> DeleteRoleAsync(int id) { var role = await _context.Roles.FindAsync(id); if (role == null) return false; if (await _context.UserRoles.AnyAsync(ur => ur.RoleId == id)) return false; role.IsActive = false; role.ModifiedDate = DateTime.UtcNow; await _context.SaveChangesAsync(); return true; }

    public async Task<List<PermissionDto>> GetPermissionsAsync() => await _context.Permissions.Where(p => p.IsActive).OrderBy(p => p.Module).ThenBy(p => p.Name).Select(p => new PermissionDto { Id = p.Id, Name = p.Name, Code = p.Code, Module = p.Module, Description = p.Description, IsActive = p.IsActive }).ToListAsync();
    public async Task<List<ModulePermissionGroup>> GetPermissionsGroupedByModuleAsync() { var permissions = await GetPermissionsAsync(); return permissions.GroupBy(p => p.Module).Select(g => new ModulePermissionGroup { Module = g.Key, ModuleName = GetModuleDisplayName(g.Key), Permissions = g.ToList() }).ToList(); }
    private static string GetModuleDisplayName(string module) => module switch { "Dashboard" => "داشبورد", "Users" => "کاربران", "Roles" => "نقش‌ها", "Articles" => "مقالات", "Categories" => "دسته‌بندی", "Courses" => "دوره‌ها", "Quizzes" => "آزمون‌ها", "Challenges" => "چالش‌ها", "Announcements" => "اطلاعیه‌ها", "Reports" => "گزارشات", "Settings" => "تنظیمات", "Glossary" => "واژگان", _ => module };
    public async Task<bool> SetRolePermissionsAsync(int roleId, List<int> permissionIds, int modifiedBy) { var role = await _context.Roles.FindAsync(roleId); if (role == null) return false; var existingPerms = await _context.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync(); _context.RolePermissions.RemoveRange(existingPerms); _context.RolePermissions.AddRange(permissionIds.Select(pid => new RolePermission { RoleId = roleId, PermissionId = pid })); await _context.SaveChangesAsync(); await _auditService.LogAsync(modifiedBy, "SET_PERMISSIONS", "Role", roleId, $"Updated permissions for role: {role.Name}"); return true; }

    public async Task<List<UserRoleDto>> GetUserRoleAssignmentsAsync(int userId) => await _context.UserRoles.Where(ur => ur.UserId == userId).Include(ur => ur.Role).Select(ur => new UserRoleDto { UserId = ur.UserId, RoleId = ur.RoleId, RoleName = ur.Role.Name, AssignedDate = ur.AssignedDate }).ToListAsync();
    public async Task<bool> AssignRoleToUserAsync(int userId, int roleId, int assignedBy) { var user = await _context.Users.FindAsync(userId); if (user == null) return false; var role = await _context.Roles.FindAsync(roleId); if (role == null) return false; if (await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId)) return true; _context.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId, AssignedDate = DateTime.UtcNow, AssignedBy = assignedBy }); await _context.SaveChangesAsync(); await _auditService.LogAsync(assignedBy, "ASSIGN_ROLE_TO_USER", "User", userId, $"Assigned role {role.Name} to user {user.Username}"); return true; }
    public async Task<bool> RemoveRoleFromUserAsync(int userId, int roleId) { var userRole = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId); if (userRole == null) return false; _context.UserRoles.Remove(userRole); await _context.SaveChangesAsync(); return true; }
    public async Task<UserPermissionsDto> GetUserPermissionsAsync(int userId) { var user = await _context.Users.FindAsync(userId); if (user == null) return new UserPermissionsDto { UserId = userId, Username = "", Permissions = new List<string>(), Modules = new List<string>() }; var permissions = await _context.UserRoles.Where(ur => ur.UserId == userId).Include(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission).SelectMany(ur => ur.Role.RolePermissions).Where(rp => rp.Permission.IsActive).Select(rp => rp.Permission.Code).Distinct().ToListAsync(); var modules = await _context.UserRoles.Where(ur => ur.UserId == userId).Include(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission).SelectMany(ur => ur.Role.RolePermissions).Where(rp => rp.Permission.IsActive).Select(rp => rp.Permission.Module).Distinct().ToListAsync(); return new UserPermissionsDto { UserId = userId, Username = user.Username, Permissions = permissions, Modules = modules }; }

    private static string GenerateSalt() { var salt = new byte[32]; using var rng = RandomNumberGenerator.Create(); rng.GetBytes(salt); return Convert.ToBase64String(salt); }
    private static string HashPassword(string password, string salt) { using var sha256 = SHA256.Create(); var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + salt)); return Convert.ToBase64String(hashedBytes); }
}
