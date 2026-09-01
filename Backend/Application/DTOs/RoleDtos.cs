namespace AICultureHub.Application.DTOs;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
    public int UserCount { get; set; }
}

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<int> PermissionIds { get; set; } = new();
}

public class UpdateRoleRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public List<int>? PermissionIds { get; set; }
}

public class PermissionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ModulePermissionGroup
{
    public string Module { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public List<PermissionDto> Permissions { get; set; } = new();
}

public class UserRoleDto
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime AssignedDate { get; set; }
}

public class AssignRoleRequest
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
}

public class UserPermissionsDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public List<string> Modules { get; set; } = new();
}

public class DepartmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public int? ParentId { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class PositionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
