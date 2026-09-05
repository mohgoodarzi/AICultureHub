using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;

namespace AICultureHub.Application.Interfaces;

public interface IAdminService
{
    Task<PaginatedResult<UserDto>> GetUsersAsync(PagedRequest request);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto> CreateUserAsync(RegisterRequest request, string? createdFromHost = null);
    Task<UserDto?> UpdateUserAsync(int id, UpdateProfileRequest request);
    Task<UserDto?> AdminUpdateUserAsync(int id, AdminUpdateUserRequest request);
    Task<bool> DeactivateUserAsync(int id);
    Task DeleteUserAsync(int id);
    Task<bool> ActivateUserAsync(int id);
    Task<bool> AssignRoleAsync(int userId, string roleName);
    Task<bool> RemoveRoleAsync(int userId, string roleName);
    Task<List<string>> GetUserRolesAsync(int userId);
    
    Task<AnnouncementDto> CreateAnnouncementAsync(AnnouncementDto model, int createdBy);
    Task<AnnouncementDto?> UpdateAnnouncementAsync(int id, AnnouncementDto model, int modifiedBy);
    Task<bool> DeleteAnnouncementAsync(int id);
    Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync();
    Task<List<AnnouncementDto>> GetAllAnnouncementsAsync();
    
    Task<AnalyticsDto> GetAnalyticsAsync();
    
    Task<List<LevelDto>> GetLevelsAsync();
    Task<LevelDto> CreateLevelAsync(LevelDto model);
    Task<LevelDto?> UpdateLevelAsync(int id, LevelDto model);
    
    Task<List<BadgeDto>> GetBadgesAsync();
    Task<BadgeDto> CreateBadgeAsync(BadgeDto model);
    Task<BadgeDto?> UpdateBadgeAsync(int id, BadgeDto model);

    Task<List<RoleDto>> GetRolesAsync();
    Task<RoleDto?> GetRoleByIdAsync(int id);
    Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, int createdBy);
    Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleRequest request, int modifiedBy);
    Task<bool> DeleteRoleAsync(int id);

    Task<List<PermissionDto>> GetPermissionsAsync();
    Task<List<ModulePermissionGroup>> GetPermissionsGroupedByModuleAsync();
    Task<bool> SetRolePermissionsAsync(int roleId, List<int> permissionIds, int modifiedBy);

    Task<List<UserRoleDto>> GetUserRoleAssignmentsAsync(int userId);
    Task<bool> AssignRoleToUserAsync(int userId, int roleId, int assignedBy);
    Task<bool> RemoveRoleFromUserAsync(int userId, int roleId);
    Task<UserPermissionsDto> GetUserPermissionsAsync(int userId);

    Task<List<DepartmentDto>> GetDepartmentsAsync();
    Task<DepartmentDto> CreateDepartmentAsync(DepartmentDto model);
    Task<DepartmentDto?> UpdateDepartmentAsync(int id, DepartmentDto model);
    Task<bool> DeleteDepartmentAsync(int id);

    Task<List<PositionDto>> GetPositionsAsync();
    Task<PositionDto> CreatePositionAsync(PositionDto model);
    Task<PositionDto?> UpdatePositionAsync(int id, PositionDto model);
    Task<bool> DeletePositionAsync(int id);
}

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int count = 20);
    Task<int> GetUnreadCountAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
    Task<bool> MarkAllAsReadAsync(int userId);
    Task CreateNotificationAsync(int userId, string title, string message, string notificationType, string? referenceType = null, int? referenceId = null);
}
