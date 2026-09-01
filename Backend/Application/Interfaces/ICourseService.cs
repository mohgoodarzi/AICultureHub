using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;

namespace AICultureHub.Application.Interfaces;

public interface ICourseService
{
    Task<PaginatedResult<CourseListDto>> GetCoursesAsync(PagedRequest request, bool includeUnpublished = false);
    Task<CourseDto?> GetCourseBySlugAsync(string slug, int? userId = null);
    Task<CourseDto?> GetCourseByIdAsync(int id, int? userId = null);
    Task<CourseDto> CreateCourseAsync(CreateCourseRequest request, int createdBy);
    Task<CourseDto?> UpdateCourseAsync(int id, CreateCourseRequest request, int modifiedBy);
    Task<bool> DeleteCourseAsync(int id);
    Task<bool> EnrollInCourseAsync(int courseId, int userId);
    Task<bool> CompleteLessonAsync(int lessonId, int userId);
    Task<LessonDto?> GetLessonAsync(int lessonId, int userId);
}

public interface IQuizService
{
    Task<PaginatedResult<QuizDto>> GetQuizzesAsync(PagedRequest request);
    Task<QuizDto?> GetQuizByIdAsync(int id);
    Task<QuizAttemptResultDto?> SubmitQuizAsync(int quizId, SubmitQuizRequest request, int userId);
    Task<List<QuizAttemptResultDto>> GetUserQuizHistoryAsync(int userId, int count = 10);
}

public interface IChallengeService
{
    Task<ChallengeDto?> GetDailyChallengeAsync(int userId);
    Task<ChallengeResultDto> SubmitChallengeAnswerAsync(int challengeId, string answer, int userId);
    Task<List<ChallengeDto>> GetChallengeHistoryAsync(int userId, int count = 10);
}

public interface IGamificationService
{
    Task<DashboardDto?> GetDashboardAsync(int userId);
    Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(string period = "all", int page = 1, int pageSize = 20);
    Task<int?> GetUserRankAsync(int userId);
    Task<int> CalculateAndAwardPointsAsync(int userId, string transactionType, int basePoints, string? reason = null, string? referenceType = null, int? referenceId = null);
}
