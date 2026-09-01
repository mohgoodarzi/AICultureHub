using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Notification : BaseEntity
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime? ReadDate { get; set; }
    
    public virtual User User { get; set; } = null!;
}

public class Announcement : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Priority { get; set; } = "Normal";
    public string? ImageUrl { get; set; }
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class Glossary : BaseEntity
{
    public string Term { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string? ExtendedDescription { get; set; }
    public string? Category { get; set; }
    public string? RelatedTerms { get; set; }
    public string? Examples { get; set; }
}

public class AuditLog
{
    public long Id { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? Description { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }
}

public class SystemSetting : BaseEntity
{
    public string SettingKey { get; set; } = string.Empty;
    public string? SettingValue { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
}
