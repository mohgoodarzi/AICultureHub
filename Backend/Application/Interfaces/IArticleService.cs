using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;

namespace AICultureHub.Application.Interfaces;

public interface IArticleService
{
    Task<PaginatedResult<ArticleListDto>> GetArticlesAsync(PagedRequest request, int? categoryId = null, bool includeUnpublished = false);
    Task<ArticleDto?> GetArticleBySlugAsync(string slug, int? userId = null);
    Task<ArticleDto?> GetArticleByIdAsync(int id, int? userId = null);
    Task<ArticleDto> CreateArticleAsync(CreateArticleRequest request, int createdBy);
    Task<ArticleDto?> UpdateArticleAsync(int id, UpdateArticleRequest request, int modifiedBy);
    Task<bool> DeleteArticleAsync(int id);
    Task<bool> ToggleBookmarkAsync(int articleId, int userId);
    Task<bool> RecordArticleViewAsync(int articleId, int userId);
    Task<VoteResult> VoteAsync(int articleId, bool isLike, int userId);
    Task<VoteResult> GetVoteResultAsync(int articleId, int? userId = null);
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllCategoriesAsync();
    Task<List<CategoryDto>> GetAllCategoriesIncludingInactiveAsync();
    Task<CategoryDto?> GetCategoryBySlugAsync(string slug);
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, int createdBy);
    Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryRequest request, int modifiedBy);
    Task<bool> DeleteCategoryAsync(int id);
    Task<bool> IsCategoryInUseAsync(int id);
}

public interface ITagService
{
    Task<List<TagDto>> GetAllTagsAsync();
}

public interface IGlossaryService
{
    Task<PaginatedResult<GlossaryDto>> GetTermsAsync(PagedRequest request);
    Task<GlossaryDto?> GetTermBySlugAsync(string slug);
    Task<GlossaryDto> CreateTermAsync(GlossaryDto model, int createdBy);
    Task<GlossaryDto?> UpdateTermAsync(int id, GlossaryDto model, int modifiedBy);
    Task<bool> DeleteTermAsync(int id);
}
