using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int DisplayOrder { get; set; } = 0;
    
    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
    public virtual ICollection<Challenge> Challenges { get; set; } = new List<Challenge>();
}

public class Tag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    
    public virtual ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
}

public class ArticleTag
{
    public int Id { get; set; }
    public int ArticleId { get; set; }
    public int TagId { get; set; }
    
    public virtual Article Article { get; set; } = null!;
    public virtual Tag Tag { get; set; } = null!;
}
