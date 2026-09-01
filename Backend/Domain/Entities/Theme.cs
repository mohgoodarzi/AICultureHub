using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Theme : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public string? BackgroundColor { get; set; }
    public string? TextColor { get; set; }
    public bool IsDark { get; set; } = false;
    public bool IsDefault { get; set; } = false;
    public string? Description { get; set; }
    
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}

public class UserTheme
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ThemeId { get; set; }
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
    public virtual Theme Theme { get; set; } = null!;
}
