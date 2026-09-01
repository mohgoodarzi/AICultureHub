using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Level : BaseEntity
{
    public int LevelNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int PointsRequired { get; set; }
    public string? IconUrl { get; set; }
    public string? Color { get; set; }
    
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<UserLevel> UserLevels { get; set; } = new List<UserLevel>();
}

public class UserLevel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int LevelId { get; set; }
    public DateTime AchievedDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
    public virtual Level Level { get; set; } = null!;
}

public class Badge : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string? Color { get; set; }
    public string? Criteria { get; set; }
    public string? CriteriaType { get; set; }
    public int CriteriaValue { get; set; } = 0;
    public int Points { get; set; } = 50;
    
    public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}

public class UserBadge
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BadgeId { get; set; }
    public DateTime EarnedDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
    public virtual Badge Badge { get; set; } = null!;
}

public class PointTransaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Points { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
}
