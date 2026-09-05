using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Article : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Content { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int AuthorId { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public int ReadingTimeMinutes { get; set; } = 5;
    public int ViewCount { get; set; } = 0;
    public int LikeCount { get; set; } = 0;
    public bool IsPublished { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public DateTime? PublishedDate { get; set; }
    public string? Difficulty { get; set; }
    
    public virtual Category Category { get; set; } = null!;
    public virtual User Author { get; set; } = null!;
    public virtual ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
    public virtual ICollection<ArticleView> ArticleViews { get; set; } = new List<ArticleView>();
    public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
}

public class ArticleView
{
    public int Id { get; set; }
    public int ArticleId { get; set; }
    public int UserId { get; set; }
    public DateTime ViewedDate { get; set; } = DateTime.UtcNow;
    
    public virtual Article Article { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

public class Bookmark
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ArticleId { get; set; }
    public DateTime BookmarkedDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
    public virtual Article Article { get; set; } = null!;
}

public class ArticleFeedback
{
    public int Id { get; set; }
    public int ArticleId { get; set; }
    public int UserId { get; set; }
    public bool IsLike { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    
    public virtual Article Article { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
