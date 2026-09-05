using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class User : AuditableEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PasswordSalt { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public string? Location { get; set; }
    public string? EmployeeId { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int TotalPoints { get; set; } = 0;
    public int? CurrentLevelId { get; set; }
    public int CurrentLevelPoints { get; set; } = 0;
    public int LearningStreak { get; set; } = 0;
    public int? ThemeId { get; set; }
public bool IsEmailVerified { get; set; } = false;
public bool IsActive { get; set; } = true;
public DateTime? LastLoginDate { get; set; }
public string? CreatedFromHost { get; set; }

    public virtual User? CreatedByUser { get; set; }
    public virtual Department? Department { get; set; }
    public virtual Position? Position { get; set; }
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
    public virtual ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public virtual ICollection<UserProgress> Progress { get; set; } = new List<UserProgress>();
    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
    public virtual ICollection<UserChallenge> Challenges { get; set; } = new List<UserChallenge>();
    public virtual ICollection<UserBadge> Badges { get; set; } = new List<UserBadge>();
    public virtual Level? CurrentLevel { get; set; }
    public string FullName => $"{FirstName} {LastName}";
}
