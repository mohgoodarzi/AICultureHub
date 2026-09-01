using Microsoft.EntityFrameworkCore;
using AICultureHub.Application.Common.Models;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.Domain.Entities;
using AICultureHub.Infrastructure.Data;

namespace AICultureHub.Infrastructure.Services;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _context;
    private readonly IGamificationService _gamificationService;
    private readonly IAuditService _auditService;

    public CourseService(ApplicationDbContext context, IGamificationService gamificationService, IAuditService auditService)
    {
        _context = context;
        _gamificationService = gamificationService;
        _auditService = auditService;
    }

    public async Task<PaginatedResult<CourseListDto>> GetCoursesAsync(PagedRequest request, bool includeUnpublished = false)
    {
        var query = _context.Courses.Include(c => c.Category).Where(c => c.IsActive);

        if (!includeUnpublished)
            query = query.Where(c => c.IsPublished);

        if (!string.IsNullOrEmpty(request.Search))
            query = query.Where(c => c.Title.Contains(request.Search));

        var totalCount = await query.CountAsync();

        var courses = await query
            .OrderByDescending(c => c.IsFeatured)
            .ThenBy(c => c.DisplayOrder)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CourseListDto
            {
                Id = c.Id, Title = c.Title, Slug = c.Slug,
                ShortDescription = c.ShortDescription, ThumbnailUrl = c.ThumbnailUrl,
                Difficulty = c.Difficulty, EstimatedDurationMinutes = c.EstimatedDurationMinutes,
                Points = c.Points, CategoryName = c.Category != null ? c.Category.Name : "",
                LessonCount = c.Lessons.Count(l => l.IsActive),
                EnrolledCount = c.EnrolledCount, AverageRating = c.AverageRating, IsFeatured = c.IsFeatured
            })
            .ToListAsync();

        return new PaginatedResult<CourseListDto> { Items = courses, TotalCount = totalCount, PageNumber = request.PageNumber, PageSize = request.PageSize };
    }

    public async Task<CourseDto?> GetCourseBySlugAsync(string slug, int? userId = null)
    {
        var course = await _context.Courses.Include(c => c.Category).Include(c => c.Lessons).ThenInclude(l => l)
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive && c.IsPublished);
        if (course == null) return null;
        return await MapToCourseDto(course, userId);
    }

    public async Task<CourseDto?> GetCourseByIdAsync(int id, int? userId = null)
    {
        var course = await _context.Courses.Include(c => c.Category).Include(c => c.Lessons)
            .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        if (course == null) return null;
        return await MapToCourseDto(course, userId);
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseRequest request, int createdBy)
    {
        var course = new Course { Title = request.Title, Slug = GenerateSlug(request.Title),
            Description = request.Description, ShortDescription = request.ShortDescription,
            ThumbnailUrl = request.ThumbnailUrl, Difficulty = request.Difficulty,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes, CategoryId = request.CategoryId,
            CreatedBy = createdBy, IsPublished = request.IsPublished, IsActive = true, CreatedDate = DateTime.UtcNow };
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(createdBy, "CREATE", "Course", course.Id, $"Created course: {course.Title}");
        return (await GetCourseByIdAsync(course.Id))!;
    }

    public async Task<CourseDto?> UpdateCourseAsync(int id, CreateCourseRequest request, int modifiedBy)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return null;
        course.Title = request.Title; course.Slug = GenerateSlug(request.Title);
        course.Description = request.Description; course.ShortDescription = request.ShortDescription;
        course.ThumbnailUrl = request.ThumbnailUrl; course.Difficulty = request.Difficulty;
        course.EstimatedDurationMinutes = request.EstimatedDurationMinutes; course.CategoryId = request.CategoryId;
        course.IsPublished = request.IsPublished; course.ModifiedDate = DateTime.UtcNow; course.ModifiedBy = modifiedBy;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(modifiedBy, "UPDATE", "Course", id, $"Updated course: {course.Title}");
        return await GetCourseByIdAsync(id);
    }

    public async Task<bool> DeleteCourseAsync(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return false;
        course.IsActive = false; course.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(null, "DELETE", "Course", id, $"Deleted course: {course.Title}");
        return true;
    }

    public async Task<bool> EnrollInCourseAsync(int courseId, int userId)
    {
        var existing = await _context.CourseEnrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (existing != null) return false;
        var enrollment = new CourseEnrollment { UserId = userId, CourseId = courseId, EnrolledDate = DateTime.UtcNow, Status = "Enrolled", IsActive = true, CreatedDate = DateTime.UtcNow };
        _context.CourseEnrollments.Add(enrollment);
        var course = await _context.Courses.FindAsync(courseId);
        if (course != null) course.EnrolledCount++;
        await _context.SaveChangesAsync();
        await _gamificationService.CalculateAndAwardPointsAsync(userId, "Enrollment", 10, "Enrolled in course", "Course", courseId);
        return true;
    }

    public async Task<bool> CompleteLessonAsync(int lessonId, int userId)
    {
        var lesson = await _context.Lessons.FindAsync(lessonId);
        if (lesson == null) return false;
        var enrollment = await _context.CourseEnrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == lesson.CourseId);
        if (enrollment == null) { await EnrollInCourseAsync(lesson.CourseId, userId); enrollment = await _context.CourseEnrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == lesson.CourseId); }
        var existingProgress = await _context.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);
        if (existingProgress?.IsCompleted == true) return true;
        if (existingProgress == null) { existingProgress = new UserProgress { UserId = userId, LessonId = lessonId, EnrollmentId = enrollment!.Id, IsActive = true, CreatedDate = DateTime.UtcNow }; _context.UserProgress.Add(existingProgress); }
        existingProgress.IsCompleted = true; existingProgress.CompletionDate = DateTime.UtcNow; existingProgress.ModifiedDate = DateTime.UtcNow;
        enrollment!.LastAccessedDate = DateTime.UtcNow;
        var courseLessons = await _context.Lessons.CountAsync(l => l.CourseId == lesson.CourseId && l.IsActive);
        var completedLessons = await _context.UserProgress.CountAsync(p => p.EnrollmentId == enrollment.Id && p.IsCompleted);
        enrollment.ProgressPercentage = (decimal)completedLessons / courseLessons * 100;
        if (enrollment.ProgressPercentage >= 100 && enrollment.Status != "Completed")
        {
            enrollment.Status = "Completed"; enrollment.CompletedDate = DateTime.UtcNow;
            var course = await _context.Courses.FindAsync(lesson.CourseId);
            if (course != null) { course.CompletionCount++; await _gamificationService.CalculateAndAwardPointsAsync(userId, "CourseCompletion", course.Points, "Completed course", "Course", course.Id); }
        }
        else await _gamificationService.CalculateAndAwardPointsAsync(userId, "LessonCompletion", lesson.Points, "Completed lesson", "Lesson", lessonId);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<LessonDto?> GetLessonAsync(int lessonId, int userId)
    {
        var lesson = await _context.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null) return null;
        var progress = await _context.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);
        return new LessonDto { Id = lesson.Id, CourseId = lesson.CourseId, Title = lesson.Title, Description = lesson.Description, Content = lesson.Content, VideoUrl = lesson.VideoUrl, OrderIndex = lesson.OrderIndex, EstimatedDurationMinutes = lesson.EstimatedDurationMinutes, Points = lesson.Points, IsCompleted = progress?.IsCompleted ?? false, ProgressPercentage = progress?.IsCompleted == true ? 100 : 0 };
    }

    private async Task<CourseDto> MapToCourseDto(Course course, int? userId)
    {
        var enrollment = userId.HasValue ? await _context.CourseEnrollments.FirstOrDefaultAsync(e => e.UserId == userId.Value && e.CourseId == course.Id) : null;
        var lessons = await _context.Lessons.Where(l => l.CourseId == course.Id && l.IsActive).OrderBy(l => l.OrderIndex).Select(l => new LessonDto { Id = l.Id, CourseId = l.CourseId, Title = l.Title, Description = l.Description, Content = l.Content, VideoUrl = l.VideoUrl, OrderIndex = l.OrderIndex, EstimatedDurationMinutes = l.EstimatedDurationMinutes, Points = l.Points, IsCompleted = userId.HasValue && _context.UserProgress.Any(p => p.UserId == userId.Value && p.LessonId == l.Id && p.IsCompleted), ProgressPercentage = userId.HasValue && _context.UserProgress.Any(p => p.UserId == userId.Value && p.LessonId == l.Id && p.IsCompleted) ? 100 : 0 }).ToListAsync();
        return new CourseDto { Id = course.Id, Title = course.Title, Slug = course.Slug, Description = course.Description, ShortDescription = course.ShortDescription, ThumbnailUrl = course.ThumbnailUrl, Difficulty = course.Difficulty, EstimatedDurationMinutes = course.EstimatedDurationMinutes, Points = course.Points, Category = course.Category != null ? new CategoryDto { Id = course.Category.Id, Name = course.Category.Name, Slug = course.Category.Slug, Color = course.Category.Color } : null!, LessonCount = lessons.Count, EnrolledCount = course.EnrolledCount, CompletionCount = course.CompletionCount, AverageRating = course.AverageRating, IsPublished = course.IsPublished, IsFeatured = course.IsFeatured, CreatedDate = course.CreatedDate, Lessons = lessons, UserEnrollment = enrollment != null ? new EnrollmentDto { Id = enrollment.Id, CourseId = enrollment.CourseId, UserId = enrollment.UserId, EnrolledDate = enrollment.EnrolledDate, CompletedDate = enrollment.CompletedDate, ProgressPercentage = enrollment.ProgressPercentage, Status = enrollment.Status, LastAccessedDate = enrollment.LastAccessedDate } : null };
    }

    private static string GenerateSlug(string title) => title.ToLowerInvariant().Replace(" ", "-").Replace("'", "").Replace("\"", "") + "-" + DateTime.UtcNow.Ticks.ToString()[10..];
}

public class QuizService : IQuizService
{
    private readonly ApplicationDbContext _context;
    private readonly IGamificationService _gamificationService;
    private readonly IAuditService _auditService;

    public QuizService(ApplicationDbContext context, IGamificationService gamificationService, IAuditService auditService)
    {
        _context = context;
        _gamificationService = gamificationService;
        _auditService = auditService;
    }

    public async Task<PaginatedResult<QuizDto>> GetQuizzesAsync(PagedRequest request)
    {
        var query = _context.Quizzes.Include(q => q.Category).Where(q => q.IsActive && q.IsPublished);
        if (!string.IsNullOrEmpty(request.Search)) query = query.Where(q => q.Title.Contains(request.Search));
        var totalCount = await query.CountAsync();
        var quizzes = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            .Select(q => new QuizDto { Id = q.Id, Title = q.Title, Description = q.Description, Difficulty = q.Difficulty, TimeLimit = q.TimeLimit, PassingScore = q.PassingScore, Points = q.Points, QuestionCount = q.QuestionCount, IsPublished = q.IsPublished, Category = q.Category != null ? new CategoryDto { Id = q.Category.Id, Name = q.Category.Name, Slug = q.Category.Slug, Color = q.Category.Color } : null! })
            .ToListAsync();
        return new PaginatedResult<QuizDto> { Items = quizzes, TotalCount = totalCount, PageNumber = request.PageNumber, PageSize = request.PageSize };
    }

    public async Task<QuizDto?> GetQuizByIdAsync(int id)
    {
        var quiz = await _context.Quizzes.Include(q => q.Category).Include(q => q.Questions.Where(qn => qn.IsActive)).ThenInclude(qn => qn.Answers).FirstOrDefaultAsync(q => q.Id == id && q.IsActive);
        if (quiz == null) return null;
        return new QuizDto { Id = quiz.Id, Title = quiz.Title, Description = quiz.Description, Difficulty = quiz.Difficulty, TimeLimit = quiz.TimeLimit, PassingScore = quiz.PassingScore, Points = quiz.Points, QuestionCount = quiz.QuestionCount, IsPublished = quiz.IsPublished, Category = quiz.Category != null ? new CategoryDto { Id = quiz.Category.Id, Name = quiz.Category.Name, Slug = quiz.Category.Slug, Color = quiz.Category.Color } : null!, Questions = quiz.Questions.OrderBy(qn => qn.OrderIndex).Select(qn => new QuestionDto { Id = qn.Id, QuestionText = qn.QuestionText, QuestionType = qn.QuestionType, Explanation = qn.Explanation, Points = qn.Points, OrderIndex = qn.OrderIndex, ImageUrl = qn.ImageUrl, Answers = qn.Answers.OrderBy(a => a.OrderIndex).Select(a => new AnswerDto { Id = a.Id, AnswerText = a.AnswerText, OrderIndex = a.OrderIndex }).ToList() }).ToList() };
    }

    public async Task<QuizAttemptResultDto?> SubmitQuizAsync(int quizId, SubmitQuizRequest request, int userId)
    {
        var quiz = await _context.Quizzes.Include(q => q.Questions.Where(qn => qn.IsActive)).ThenInclude(qn => qn.Answers).FirstOrDefaultAsync(q => q.Id == quizId);
        if (quiz == null) return null;
        var attempt = new QuizAttempt { UserId = userId, QuizId = quizId, TimeSpentSeconds = request.TimeSpentSeconds, TotalQuestions = quiz.Questions.Count, AttemptDate = DateTime.UtcNow };
        int score = 0, maxScore = quiz.Questions.Sum(q => q.Points), correctAnswers = 0;
        foreach (var question in quiz.Questions)
        {
            var submission = request.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            var isCorrect = false; int? selectedAnswerId = null; int pointsEarned = 0;
            if (submission != null)
            {
                selectedAnswerId = submission.SelectedAnswerId;
                var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
                isCorrect = correctAnswer != null && correctAnswer.Id == submission.SelectedAnswerId;
                if (isCorrect) { correctAnswers++; score += question.Points; pointsEarned = question.Points; }
            }
            attempt.AttemptAnswers.Add(new QuizAttemptAnswer { AttemptId = attempt.Id, QuestionId = question.Id, SelectedAnswerId = selectedAnswerId, IsCorrect = isCorrect, PointsEarned = pointsEarned });
        }
        attempt.Score = score; attempt.MaxScore = maxScore; attempt.Percentage = maxScore > 0 ? (decimal)score / maxScore * 100 : 0; attempt.CorrectAnswers = correctAnswers; attempt.IsPassed = attempt.Percentage >= quiz.PassingScore;
        if (attempt.IsPassed) { attempt.PointsEarned = quiz.Points; await _gamificationService.CalculateAndAwardPointsAsync(userId, "QuizCompletion", quiz.Points, $"Passed quiz: {quiz.Title}", "Quiz", quizId); }
        _context.QuizAttempts.Add(attempt);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(userId, "QUIZ_ATTEMPT", "QuizAttempt", attempt.Id, $"Quiz attempt for: {quiz.Title} - Score: {attempt.Percentage}%");
        return new QuizAttemptResultDto { AttemptId = attempt.Id, Score = attempt.Score, MaxScore = attempt.MaxScore, Percentage = attempt.Percentage, CorrectAnswers = attempt.CorrectAnswers, TotalQuestions = attempt.TotalQuestions, IsPassed = attempt.IsPassed, TimeSpentSeconds = attempt.TimeSpentSeconds, PointsEarned = attempt.PointsEarned, AttemptDate = attempt.AttemptDate, QuestionResults = quiz.Questions.Select(qn => { var submission = request.Answers.FirstOrDefault(a => a.QuestionId == qn.Id); return new QuestionResultDto { QuestionId = qn.Id, QuestionText = qn.QuestionText, SelectedAnswerId = submission?.SelectedAnswerId, IsCorrect = attempt.AttemptAnswers.FirstOrDefault(qa => qa.QuestionId == qn.Id)?.IsCorrect ?? false, PointsEarned = attempt.AttemptAnswers.FirstOrDefault(qa => qa.QuestionId == qn.Id)?.PointsEarned ?? 0, Explanation = qn.Explanation, Answers = qn.Answers.Select(a => new AnswerDto { Id = a.Id, AnswerText = a.AnswerText, OrderIndex = a.OrderIndex }).ToList() }; }).ToList() };
    }

    public async Task<List<QuizAttemptResultDto>> GetUserQuizHistoryAsync(int userId, int count = 10)
    {
        return await _context.QuizAttempts.Where(qa => qa.UserId == userId).OrderByDescending(qa => qa.AttemptDate).Take(count)
            .Select(qa => new QuizAttemptResultDto { AttemptId = qa.Id, Score = qa.Score, MaxScore = qa.MaxScore, Percentage = qa.Percentage, CorrectAnswers = qa.CorrectAnswers, TotalQuestions = qa.TotalQuestions, IsPassed = qa.IsPassed, TimeSpentSeconds = qa.TimeSpentSeconds, PointsEarned = qa.PointsEarned, AttemptDate = qa.AttemptDate, QuestionResults = new List<QuestionResultDto>() })
            .ToListAsync();
    }
}

public class ChallengeService : IChallengeService
{
    private readonly ApplicationDbContext _context;
    private readonly IGamificationService _gamificationService;
    private readonly IAuditService _auditService;

    public ChallengeService(ApplicationDbContext context, IGamificationService gamificationService, IAuditService auditService)
    {
        _context = context; _gamificationService = gamificationService; _auditService = auditService;
    }

    public async Task<ChallengeDto?> GetDailyChallengeAsync(int userId)
    {
        var today = DateTime.UtcNow.Date;
        var challenge = await _context.Challenges.Include(c => c.Category).Where(c => c.IsActive && c.ChallengeType == "Daily" && c.ActiveDate == today).OrderByDescending(c => c.CreatedDate).FirstOrDefaultAsync();
        if (challenge == null) challenge = await _context.Challenges.Include(c => c.Category).Where(c => c.IsActive && c.ChallengeType == "Daily").OrderByDescending(c => c.ActiveDate).FirstOrDefaultAsync();
        if (challenge == null) return null;
        var userChallenge = await _context.UserChallenges.FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == challenge.Id);
        var options = !string.IsNullOrEmpty(challenge.Options) ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(challenge.Options) ?? new List<string>() : new List<string>();
        return new ChallengeDto { Id = challenge.Id, Title = challenge.Title, Description = challenge.Description, ChallengeType = challenge.ChallengeType, QuestionText = challenge.QuestionText, Options = options, Explanation = challenge.Explanation, Points = challenge.Points, Difficulty = challenge.Difficulty, Category = challenge.Category != null ? new CategoryDto { Id = challenge.Category.Id, Name = challenge.Category.Name, Slug = challenge.Category.Slug, Color = challenge.Category.Color } : null!, ActiveDate = challenge.ActiveDate, IsCompleted = userChallenge != null, WasCorrect = userChallenge?.IsCorrect };
    }

    public async Task<ChallengeResultDto> SubmitChallengeAnswerAsync(int challengeId, string answer, int userId)
    {
        var challenge = await _context.Challenges.FindAsync(challengeId);
        if (challenge == null) throw new InvalidOperationException("Challenge not found");
        var existingAttempt = await _context.UserChallenges.FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == challengeId);
        if (existingAttempt != null) throw new InvalidOperationException("You have already completed this challenge");
        var isCorrect = string.Equals(challenge.CorrectAnswer, answer, StringComparison.OrdinalIgnoreCase);
        var pointsEarned = isCorrect ? challenge.Points : 0;
        var userChallenge = new UserChallenge { UserId = userId, ChallengeId = challengeId, UserAnswer = answer, IsCorrect = isCorrect, PointsEarned = pointsEarned, AttemptedDate = DateTime.UtcNow };
        _context.UserChallenges.Add(userChallenge);
        if (isCorrect) await _gamificationService.CalculateAndAwardPointsAsync(userId, "ChallengeCompletion", challenge.Points, "Daily challenge completed", "Challenge", challengeId);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(userId, "CHALLENGE_ATTEMPT", "UserChallenge", userChallenge.Id, $"Challenge attempt - Correct: {isCorrect}");
        var user = await _context.Users.FindAsync(userId);
        return new ChallengeResultDto { ChallengeId = challengeId, IsCorrect = isCorrect, CorrectAnswer = challenge.CorrectAnswer, Explanation = challenge.Explanation, PointsEarned = pointsEarned, TotalPoints = user?.TotalPoints ?? 0 };
    }

    public async Task<List<ChallengeDto>> GetChallengeHistoryAsync(int userId, int count = 10)
    {
        var userChallenges = await _context.UserChallenges.Include(uc => uc.Challenge).Where(uc => uc.UserId == userId).OrderByDescending(uc => uc.AttemptedDate).Take(count).ToListAsync();
        return userChallenges.Select(uc => new ChallengeDto { Id = uc.Challenge.Id, Title = uc.Challenge.Title, Description = uc.Challenge.Description, ChallengeType = uc.Challenge.ChallengeType, QuestionText = uc.Challenge.QuestionText, Options = !string.IsNullOrEmpty(uc.Challenge.Options) ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(uc.Challenge.Options) ?? new List<string>() : new List<string>(), Explanation = uc.Challenge.Explanation, Points = uc.Challenge.Points, Difficulty = uc.Challenge.Difficulty, ActiveDate = uc.Challenge.ActiveDate, IsCompleted = true, WasCorrect = uc.IsCorrect }).ToList();
    }
}
