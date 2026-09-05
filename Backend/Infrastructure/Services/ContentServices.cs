using Microsoft.EntityFrameworkCore;
using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.Domain.Entities;
using AICultureHub.Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace AICultureHub.Infrastructure.Services;

public static class SlugHelper
{
    public static string GenerateSlug(string text) =>
        text.ToLowerInvariant().Replace(" ", "-").Replace("'", "").Replace("\"", "") + "-" + DateTime.UtcNow.Ticks.ToString()[10..];
}

public class ArticleService : IArticleService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditService _auditService;
    public ArticleService(ApplicationDbContext context, IAuditService auditService) { _context = context; _auditService = auditService; }

    public async Task<PaginatedResult<ArticleListDto>> GetArticlesAsync(PagedRequest request, int? categoryId = null, bool includeUnpublished = false)
    {
        var query = _context.Articles.Include(a => a.Category).Include(a => a.Author).Where(a => a.IsActive);
        if (!includeUnpublished) query = query.Where(a => a.IsPublished);
        if (categoryId.HasValue) query = query.Where(a => a.CategoryId == categoryId.Value);
        if (!string.IsNullOrEmpty(request.Search)) query = query.Where(a => a.Title.Contains(request.Search) || (a.Summary != null && a.Summary.Contains(request.Search)));
        var totalCount = await query.CountAsync();
        var articles = await query.OrderByDescending(a => a.PublishedDate).Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).Select(a => new ArticleListDto { Id = a.Id, Title = a.Title, Slug = a.Slug, Summary = a.Summary, ImageUrl = a.ImageUrl, ReadingTimeMinutes = a.ReadingTimeMinutes, CategoryName = a.Category.Name, Category = new CategoryDto { Id = a.Category.Id, Name = a.Category.Name, Slug = a.Category.Slug }, AuthorName = a.Author.FullName, PublishedDate = a.PublishedDate, Difficulty = a.Difficulty, ViewCount = a.ViewCount, LikeCount = _context.ArticleFeedback.Count(af => af.ArticleId == a.Id && af.IsLike), DislikeCount = _context.ArticleFeedback.Count(af => af.ArticleId == a.Id && !af.IsLike), IsPublished = a.IsPublished, IsFeatured = a.IsFeatured }).ToListAsync();
        return new PaginatedResult<ArticleListDto> { Items = articles, TotalCount = totalCount, PageNumber = request.PageNumber, PageSize = request.PageSize };
    }

    public async Task<ArticleDto?> GetArticleBySlugAsync(string slug, int? userId = null)
    {
        var article = await _context.Articles.Include(a => a.Category).Include(a => a.Author).Include(a => a.ArticleTags).ThenInclude(at => at.Tag).FirstOrDefaultAsync(a => a.Slug == slug && a.IsActive && a.IsPublished);
        if (article == null) return null;
        var likeCount = await _context.ArticleFeedback.CountAsync(af => af.ArticleId == article.Id && af.IsLike);
        var dislikeCount = await _context.ArticleFeedback.CountAsync(af => af.ArticleId == article.Id && !af.IsLike);
        var dto = MapToArticleDto(article, likeCount: likeCount, dislikeCount: dislikeCount);
        if (userId.HasValue) { dto.IsBookmarked = await _context.Bookmarks.AnyAsync(b => b.UserId == userId.Value && b.ArticleId == article.Id); dto.IsRead = await _context.ArticleViews.AnyAsync(av => av.UserId == userId.Value && av.ArticleId == article.Id); dto.UserVote = await _context.ArticleFeedback.Where(af => af.ArticleId == article.Id && af.UserId == userId.Value).Select(af => (bool?)af.IsLike).FirstOrDefaultAsync(); }
        return dto;
    }

    public async Task<ArticleDto?> GetArticleByIdAsync(int id, int? userId = null)
    {
        var article = await _context.Articles.Include(a => a.Category).Include(a => a.Author).Include(a => a.ArticleTags).ThenInclude(at => at.Tag).FirstOrDefaultAsync(a => a.Id == id && a.IsActive);
        if (article == null) return null;
        var likeCount = await _context.ArticleFeedback.CountAsync(af => af.ArticleId == article.Id && af.IsLike);
        var dislikeCount = await _context.ArticleFeedback.CountAsync(af => af.ArticleId == article.Id && !af.IsLike);
        var dto = MapToArticleDto(article, likeCount: likeCount, dislikeCount: dislikeCount);
        if (userId.HasValue) { dto.IsBookmarked = await _context.Bookmarks.AnyAsync(b => b.UserId == userId.Value && b.ArticleId == article.Id); dto.IsRead = await _context.ArticleViews.AnyAsync(av => av.UserId == userId.Value && av.ArticleId == article.Id); dto.UserVote = await _context.ArticleFeedback.Where(af => af.ArticleId == article.Id && af.UserId == userId.Value).Select(af => (bool?)af.IsLike).FirstOrDefaultAsync(); }
        return dto;
    }

    public async Task<ArticleDto> CreateArticleAsync(CreateArticleRequest request, int createdBy)
    {
        Console.WriteLine($"[CreateArticleAsync] Starting. Title={request.Title}, CategoryId={request.CategoryId}, CreatedBy={createdBy}");
        var article = new Article { Title = request.Title, Slug = GenerateSlug(request.Title), Summary = request.Summary, Content = request.Content, CategoryId = request.CategoryId ?? 0, AuthorId = createdBy, ImageUrl = request.ImageUrl, VideoUrl = request.VideoUrl, Difficulty = request.Difficulty, IsPublished = request.IsPublished, IsActive = true, PublishedDate = request.IsPublished ? DateTime.UtcNow : null, CreatedDate = DateTime.UtcNow, CreatedBy = createdBy };
        Console.WriteLine($"[CreateArticleAsync] Article object created. About to SaveChanges.");
        _context.Articles.Add(article);
        await _context.SaveChangesAsync();
        Console.WriteLine($"[CreateArticleAsync] SaveChanges completed. ArticleId={article.Id}");
        if (request.TagIds.Any()) { foreach (var tagId in request.TagIds) _context.ArticleTags.Add(new ArticleTag { ArticleId = article.Id, TagId = tagId }); await _context.SaveChangesAsync(); }
        await _auditService.LogAsync(createdBy, "CREATE", "Article", article.Id, $"Created article: {article.Title}");
        Console.WriteLine($"[CreateArticleAsync] Completed. Returning article with Id={article.Id}");
        return (await GetArticleByIdAsync(article.Id))!;
    }

    public async Task<ArticleDto?> UpdateArticleAsync(int id, UpdateArticleRequest request, int modifiedBy)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) return null;
        if (!string.IsNullOrEmpty(request.Title)) article.Title = request.Title;
        if (!string.IsNullOrEmpty(request.Summary)) article.Summary = request.Summary;
        if (!string.IsNullOrEmpty(request.Content)) article.Content = request.Content;
        if (request.CategoryId.HasValue) article.CategoryId = request.CategoryId.Value;
        if (request.ImageUrl != null) article.ImageUrl = request.ImageUrl;
        if (request.VideoUrl != null) article.VideoUrl = request.VideoUrl;
        if (!string.IsNullOrEmpty(request.Difficulty)) article.Difficulty = request.Difficulty;
        if (request.ReadingTimeMinutes.HasValue) article.ReadingTimeMinutes = request.ReadingTimeMinutes.Value;
        if (request.IsPublished.HasValue) { article.IsPublished = request.IsPublished.Value; if (request.IsPublished.Value && !article.PublishedDate.HasValue) article.PublishedDate = DateTime.UtcNow; }
        if (request.IsFeatured.HasValue) article.IsFeatured = request.IsFeatured.Value;
        article.ModifiedDate = DateTime.UtcNow; article.ModifiedBy = modifiedBy;
        if (request.TagIds != null) { var existingTags = await _context.ArticleTags.Where(at => at.ArticleId == id).ToListAsync(); _context.ArticleTags.RemoveRange(existingTags); foreach (var tagId in request.TagIds) _context.ArticleTags.Add(new ArticleTag { ArticleId = id, TagId = tagId }); }
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(modifiedBy, "UPDATE", "Article", id, $"Updated article: {article.Title}");
        return await GetArticleByIdAsync(id);
    }

    public async Task<bool> DeleteArticleAsync(int id)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) return false;
        article.IsActive = false; article.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "DELETE", "Article", id, $"Deleted article: {article.Title}");
        return true;
    }

    public async Task<bool> ToggleBookmarkAsync(int articleId, int userId)
    {
        var existing = await _context.Bookmarks.FirstOrDefaultAsync(b => b.UserId == userId && b.ArticleId == articleId);
        if (existing != null) { _context.Bookmarks.Remove(existing); await _context.SaveChangesAsync(); return false; }
        _context.Bookmarks.Add(new Bookmark { UserId = userId, ArticleId = articleId, BookmarkedDate = DateTime.UtcNow });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RecordArticleViewAsync(int articleId, int userId)
    {
        var alreadyViewed = await _context.ArticleViews.AnyAsync(av => av.UserId == userId && av.ArticleId == articleId && av.ViewedDate > DateTime.UtcNow.AddHours(-1));
        if (alreadyViewed) return false;
        _context.ArticleViews.Add(new ArticleView { UserId = userId, ArticleId = articleId, ViewedDate = DateTime.UtcNow });
        var article = await _context.Articles.FindAsync(articleId);
        if (article != null) article.ViewCount++;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<VoteResult> VoteAsync(int articleId, bool isLike, int userId)
    {
        var article = await _context.Articles.FindAsync(articleId);
        if (article == null) return new VoteResult { LikeCount = 0, DislikeCount = 0, UserVote = null };

        var existingVote = await _context.ArticleFeedback.FirstOrDefaultAsync(af => af.ArticleId == articleId && af.UserId == userId);

        if (existingVote != null)
        {
            if (existingVote.IsLike == isLike)
            {
                _context.ArticleFeedback.Remove(existingVote);
                await _context.SaveChangesAsync();
                var counts = await GetVoteCountsAsync(articleId);
                return new VoteResult { LikeCount = counts.likeCount, DislikeCount = counts.dislikeCount, UserVote = null };
            }
            else
            {
                existingVote.IsLike = isLike;
                existingVote.CreatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                var counts = await GetVoteCountsAsync(articleId);
                return new VoteResult { LikeCount = counts.likeCount, DislikeCount = counts.dislikeCount, UserVote = isLike };
            }
        }
        else
        {
            var feedback = new ArticleFeedback { ArticleId = articleId, UserId = userId, IsLike = isLike, CreatedDate = DateTime.UtcNow };
            _context.ArticleFeedback.Add(feedback);
            await _context.SaveChangesAsync();
            var counts = await GetVoteCountsAsync(articleId);
            return new VoteResult { LikeCount = counts.likeCount, DislikeCount = counts.dislikeCount, UserVote = isLike };
        }
    }

    public async Task<VoteResult> GetVoteResultAsync(int articleId, int? userId = null)
    {
        var counts = await GetVoteCountsAsync(articleId);
        bool? userVote = null;
        if (userId.HasValue)
        {
            var vote = await _context.ArticleFeedback.FirstOrDefaultAsync(af => af.ArticleId == articleId && af.UserId == userId.Value);
            userVote = vote?.IsLike;
        }
        return new VoteResult { LikeCount = counts.likeCount, DislikeCount = counts.dislikeCount, UserVote = userVote };
    }

    public async Task<List<FeedbackStatsDto>> GetFeedbackStatsAsync()
    {
        var stats = await _context.Articles
            .Include(a => a.Category)
            .Where(a => a.IsActive && a.IsPublished)
            .Select(a => new FeedbackStatsDto
            {
                ArticleTitle = a.Title,
                CategoryName = a.Category != null ? a.Category.Name : "",
                LikeCount = _context.ArticleFeedback.Count(af => af.ArticleId == a.Id && af.IsLike),
                DislikeCount = _context.ArticleFeedback.Count(af => af.ArticleId == a.Id && !af.IsLike)
            })
            .ToListAsync();

        return stats;
    }

    private async Task<(int likeCount, int dislikeCount)> GetVoteCountsAsync(int articleId)
    {
        var likeCount = await _context.ArticleFeedback.CountAsync(af => af.ArticleId == articleId && af.IsLike);
        var dislikeCount = await _context.ArticleFeedback.CountAsync(af => af.ArticleId == articleId && !af.IsLike);
        return (likeCount, dislikeCount);
    }

    private static string GenerateSlug(string title) => title.ToLowerInvariant().Replace(" ", "-").Replace("'", "").Replace("\"", "") + "-" + DateTime.UtcNow.Ticks.ToString()[10..];

    private static ArticleDto MapToArticleDto(Article article, int? userId = null, int? likeCount = null, int? dislikeCount = null) => new ArticleDto { Id = article.Id, Title = article.Title, Slug = article.Slug, Summary = article.Summary, Content = article.Content, Category = new CategoryDto { Id = article.Category.Id, Name = article.Category.Name, Slug = article.Category.Slug, Description = article.Category.Description, Icon = article.Category.Icon, Color = article.Category.Color }, AuthorName = article.Author?.FullName, Author = article.Author != null ? new UserDto { Id = article.Author.Id, Username = article.Author.Username, FullName = article.Author.FullName, AvatarUrl = article.Author.AvatarUrl } : null, ImageUrl = article.ImageUrl, VideoUrl = article.VideoUrl, ReadingTimeMinutes = article.ReadingTimeMinutes, ViewCount = article.ViewCount, LikeCount = likeCount ?? 0, DislikeCount = dislikeCount ?? 0, IsPublished = article.IsPublished, IsFeatured = article.IsFeatured, PublishedDate = article.PublishedDate, Difficulty = article.Difficulty, CreatedDate = article.CreatedDate, Tags = article.ArticleTags?.Select(at => new TagDto { Id = at.Tag.Id, Name = at.Tag.Name, Slug = at.Tag.Slug }).ToList() ?? new List<TagDto>(), UserVote = userId.HasValue ? null : null };
}

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CategoryService> _logger;
    public CategoryService(ApplicationDbContext context, ILogger<CategoryService> logger) { _context = context; _logger = logger; }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync() => await _context.Categories.Where(c => c.IsActive).OrderBy(c => c.DisplayOrder).Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Slug = c.Slug, Description = c.Description, Icon = c.Icon, Color = c.Color, DisplayOrder = c.DisplayOrder, IsActive = c.IsActive }).ToListAsync();

    public async Task<List<CategoryDto>> GetAllCategoriesIncludingInactiveAsync() => await _context.Categories.OrderBy(c => c.DisplayOrder).Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Slug = c.Slug, Description = c.Description, Icon = c.Icon, Color = c.Color, DisplayOrder = c.DisplayOrder, IsActive = c.IsActive }).ToListAsync();

    public async Task<CategoryDto?> GetCategoryBySlugAsync(string slug) { var category = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive); if (category == null) return null; return new CategoryDto { Id = category.Id, Name = category.Name, Slug = category.Slug, Description = category.Description, Icon = category.Icon, Color = category.Color, DisplayOrder = category.DisplayOrder, IsActive = category.IsActive }; }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id) { var category = await _context.Categories.FindAsync(id); if (category == null) return null; return new CategoryDto { Id = category.Id, Name = category.Name, Slug = category.Slug, Description = category.Description, Icon = category.Icon, Color = category.Color, DisplayOrder = category.DisplayOrder, IsActive = category.IsActive }; }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, int createdBy)
    {
        try
        {
            _logger.LogInformation("Creating category: Name={Name}, Description={Description}, DisplayOrder={DisplayOrder}, IsActive={IsActive}, CreatedBy={CreatedBy}",
                request.Name, request.Description, request.DisplayOrder, request.IsActive, createdBy);

            var slug = SlugHelper.GenerateSlug(request.Name);
            _logger.LogInformation("Generated slug: {Slug}", slug);

            var category = new Category { Name = request.Name, Slug = slug, Description = request.Description, DisplayOrder = request.DisplayOrder, IsActive = request.IsActive, CreatedDate = DateTime.UtcNow, CreatedBy = createdBy };
            _logger.LogInformation("Category entity created, attempting to save...");

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Category saved successfully: Id={Id}, Name={Name}", category.Id, category.Name);
            return new CategoryDto { Id = category.Id, Name = category.Name, Slug = category.Slug, Description = category.Description, Icon = category.Icon, Color = category.Color, DisplayOrder = category.DisplayOrder, IsActive = category.IsActive };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category: {Message}", ex.Message);
            _logger.LogError(ex, "Inner Exception: {InnerMessage}", ex.InnerException?.Message);
            _logger.LogError(ex, "Inner Inner Exception: {InnerInnerMessage}", ex.InnerException?.InnerException?.Message);
            _logger.LogError(ex, "SQL Error: {SqlMessage}", ex.InnerException?.InnerException?.Message);
            throw;
        }
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryRequest request, int modifiedBy)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return null;
        if (!string.IsNullOrEmpty(request.Name)) category.Name = request.Name;
        if (request.Description != null) category.Description = request.Description;
        if (request.DisplayOrder.HasValue) category.DisplayOrder = request.DisplayOrder.Value;
        if (request.IsActive.HasValue) category.IsActive = request.IsActive.Value;
        category.ModifiedDate = DateTime.UtcNow;
        category.ModifiedBy = modifiedBy;
        await _context.SaveChangesAsync();
        return new CategoryDto { Id = category.Id, Name = category.Name, Slug = category.Slug, Description = category.Description, Icon = category.Icon, Color = category.Color, DisplayOrder = category.DisplayOrder, IsActive = category.IsActive };
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return false;
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsCategoryInUseAsync(int id) =>
        await _context.Articles.AnyAsync(a => a.CategoryId == id && a.IsActive) ||
        await _context.Courses.AnyAsync(c => c.CategoryId == id && c.IsActive) ||
        await _context.Quizzes.AnyAsync(q => q.CategoryId == id && q.IsActive) ||
        await _context.Challenges.AnyAsync(ch => ch.CategoryId == id && ch.IsActive);
}

public class TagService : ITagService
{
    private readonly ApplicationDbContext _context;
    public TagService(ApplicationDbContext context) { _context = context; }
    public async Task<List<TagDto>> GetAllTagsAsync() => await _context.Tags.Where(t => t.IsActive).Select(t => new TagDto { Id = t.Id, Name = t.Name, Slug = t.Slug }).ToListAsync();
}

public class GlossaryService : IGlossaryService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditService _auditService;
    public GlossaryService(ApplicationDbContext context, IAuditService auditService) { _context = context; _auditService = auditService; }

    public async Task<PaginatedResult<GlossaryDto>> GetTermsAsync(PagedRequest request)
    {
        var query = _context.Glossary.Where(g => g.IsActive);
        if (!string.IsNullOrEmpty(request.Search)) query = query.Where(g => g.Term.Contains(request.Search) || g.Definition.Contains(request.Search));
        var totalCount = await query.CountAsync();
        var terms = await query.OrderBy(g => g.Term).Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).Select(g => new GlossaryDto { Id = g.Id, Term = g.Term, Slug = g.Slug, Definition = g.Definition, ExtendedDescription = g.ExtendedDescription, Category = g.Category, RelatedTerms = g.RelatedTerms, Examples = g.Examples }).ToListAsync();
        return new PaginatedResult<GlossaryDto> { Items = terms, TotalCount = totalCount, PageNumber = request.PageNumber, PageSize = request.PageSize };
    }

    public async Task<GlossaryDto?> GetTermBySlugAsync(string slug) { var term = await _context.Glossary.FirstOrDefaultAsync(g => g.Slug == slug && g.IsActive); if (term == null) return null; return new GlossaryDto { Id = term.Id, Term = term.Term, Slug = term.Slug, Definition = term.Definition, ExtendedDescription = term.ExtendedDescription, Category = term.Category, RelatedTerms = term.RelatedTerms, Examples = term.Examples }; }

    public async Task<GlossaryDto> CreateTermAsync(GlossaryDto model, int createdBy)
    {
        var term = new Domain.Entities.Glossary { Term = model.Term, Slug = GenerateSlug(model.Term), Definition = model.Definition, ExtendedDescription = model.ExtendedDescription, Category = model.Category, RelatedTerms = model.RelatedTerms, Examples = model.Examples, IsActive = true, CreatedDate = DateTime.UtcNow, CreatedBy = createdBy };
        _context.Glossary.Add(term);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(createdBy, "CREATE", "Glossary", term.Id, $"Created glossary term: {term.Term}");
        return new GlossaryDto { Id = term.Id, Term = term.Term, Slug = term.Slug, Definition = term.Definition, ExtendedDescription = term.ExtendedDescription, Category = term.Category, RelatedTerms = term.RelatedTerms, Examples = term.Examples };
    }

    public async Task<GlossaryDto?> UpdateTermAsync(int id, GlossaryDto model, int modifiedBy)
    {
        var term = await _context.Glossary.FindAsync(id);
        if (term == null) return null;
        term.Term = model.Term; term.Definition = model.Definition; term.ExtendedDescription = model.ExtendedDescription; term.Category = model.Category; term.RelatedTerms = model.RelatedTerms; term.Examples = model.Examples; term.ModifiedDate = DateTime.UtcNow; term.ModifiedBy = modifiedBy;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(modifiedBy, "UPDATE", "Glossary", id, $"Updated glossary term: {term.Term}");
        return new GlossaryDto { Id = term.Id, Term = term.Term, Slug = term.Slug, Definition = term.Definition, ExtendedDescription = term.ExtendedDescription, Category = term.Category, RelatedTerms = term.RelatedTerms, Examples = term.Examples };
    }

    public async Task<bool> DeleteTermAsync(int id)
    {
        var term = await _context.Glossary.FindAsync(id);
        if (term == null) return false;
        term.IsActive = false; term.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "DELETE", "Glossary", id, $"Deleted glossary term: {term.Term}");
        return true;
    }

    private static string GenerateSlug(string term) => term.ToLowerInvariant().Replace(" ", "-").Replace("'", "").Replace("\"", "");
}
