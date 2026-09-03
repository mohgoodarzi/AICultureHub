namespace AICultureHub.Application.DTOs;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; }
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? PositionId { get; set; }
    public string? PositionName { get; set; }
    public string? Location { get; set; }
    public string? EmployeeId { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool IsActive { get; set; } = true;
    public int TotalPoints { get; set; }
    public int CurrentLevelPoints { get; set; }
    public int LearningStreak { get; set; }
    public LevelDto? CurrentLevel { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<BadgeDto> Badges { get; set; } = new();
}

public class LevelDto
{
    public int Id { get; set; }
    public int LevelNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int PointsRequired { get; set; }
    public string? Color { get; set; }
    public int NextLevelPoints { get; set; }
}

public class BadgeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string? Color { get; set; }
    public DateTime? EarnedDate { get; set; }
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public string? EmployeeId { get; set; }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public string? Location { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}

/// <summary>
/// Admin-only user update. Distinct from self-service profile updates so that
/// sensitive fields (email, employeeId, isActive, password) require admin context.
/// </summary>
public class AdminUpdateUserRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? EmployeeId { get; set; }
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public bool? IsActive { get; set; }
    public string? Password { get; set; }
}
