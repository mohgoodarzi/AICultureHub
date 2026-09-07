using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

/// <summary>
/// User-submitted text feedback/comments for an article or course.
/// Displayed on the page itself and in the Admin Panel.
/// </summary>
public class Feedback : BaseEntity
{
    public int? ArticleId { get; set; }
    public int? CourseId { get; set; }
    public int UserId { get; set; }
    public string CommentText { get; set; } = string.Empty;

    public virtual Article? Article { get; set; }
    public virtual Course? Course { get; set; }
    public virtual User User { get; set; } = null!;
}
