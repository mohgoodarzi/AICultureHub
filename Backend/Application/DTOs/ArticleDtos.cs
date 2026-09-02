namespace AICultureHub.Application.DTOs;

public class ArticleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Content { get; set; } = string.Empty;
    public CategoryDto Category { get; set; } = null!;
    public UserDto? Author { get; set; }
    public string? AuthorName { get; set; }
    public string? ImageUrl { get; set; }
    public int ReadingTimeMinutes { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime? PublishedDate { get; set; }
    public string? Difficulty { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<TagDto> Tags { get; set; } = new();
    public bool IsBookmarked { get; set; }
    public bool IsRead { get; set; }
    public bool? UserVote { get; set; }
}

public class ArticleListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? ImageUrl { get; set; }
    public int ReadingTimeMinutes { get; set; }
    public string? CategoryName { get; set; }
    public CategoryDto? Category { get; set; }
    public string? AuthorName { get; set; }
    public DateTime? PublishedDate { get; set; }
    public string? Difficulty { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
}

public class CreateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Content { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public string? Difficulty { get; set; }
    public bool IsPublished { get; set; }
    public int ReadingTimeMinutes { get; set; } = 5;
    public List<int> TagIds { get; set; } = new();
}

public class UpdateArticleRequest
{
    public string? Title { get; set; }
    public string? Summary { get; set; }
    public string? Content { get; set; }
    public int? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public string? Difficulty { get; set; }
    public int? ReadingTimeMinutes { get; set; }
    public bool? IsPublished { get; set; }
    public bool? IsFeatured { get; set; }
    public List<int>? TagIds { get; set; }
}

public class CreateVoteRequest
{
    public bool IsLike { get; set; }
}

public class VoteResult
{
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public bool? UserVote { get; set; }
}

public class FeedbackStatsDto
{
    public string ArticleTitle { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public int TotalVotes => LikeCount + DislikeCount;
    public int SatisfactionPercentage => TotalVotes > 0 ? (int)Math.Round((double)LikeCount / TotalVotes * 100) : 0;
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCategoryRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? DisplayOrder { get; set; }
    public bool? IsActive { get; set; }
}

public class TagDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}

public class GlossaryDto
{
    public int Id { get; set; }
    public string Term { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string? ExtendedDescription { get; set; }
    public string? Category { get; set; }
    public string? RelatedTerms { get; set; }
    public string? Examples { get; set; }
}
