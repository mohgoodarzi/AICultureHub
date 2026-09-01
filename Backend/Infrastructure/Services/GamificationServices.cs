using Microsoft.EntityFrameworkCore;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.Domain.Entities;
using AICultureHub.Infrastructure.Data;

namespace AICultureHub.Infrastructure.Services;

public class GamificationService : IGamificationService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public GamificationService(ApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<DashboardDto?> GetDashboardAsync(int userId)
    {
        var user = await _context.Users.Include(u => u.CurrentLevel).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return null;
        
        var badges = await _context.UserBadges.Include(ub => ub.Badge).Where(ub => ub.UserId == userId).OrderByDescending(ub => ub.EarnedDate).Take(5).ToListAsync();
        var recentBadges = badges.Select(ub => new BadgeDto { Id = ub.Badge.Id, Name = ub.Badge.Name, Description = ub.Badge.Description, IconUrl = ub.Badge.IconUrl, Color = ub.Badge.Color, EarnedDate = ub.EarnedDate }).ToList();
        
        var recommendedArticles = await _context.Articles.Include(a => a.Category).Include(a => a.Author).Where(a => a.IsActive && a.IsPublished).OrderByDescending(a => a.ViewCount).Take(5).ToListAsync();
        var articleDtos = recommendedArticles.Select(a => new ArticleListDto { Id = a.Id, Title = a.Title, Slug = a.Slug, Summary = a.Summary, ImageUrl = a.ImageUrl, ReadingTimeMinutes = a.ReadingTimeMinutes, CategoryName = a.Category.Name, AuthorName = a.Author.FullName, PublishedDate = a.PublishedDate, Difficulty = a.Difficulty, ViewCount = a.ViewCount }).ToList();
        
        var recommendedCourses = await _context.Courses.Include(c => c.Category).Include(c => c.Lessons).Where(c => c.IsActive && c.IsPublished).OrderByDescending(c => c.EnrolledCount).Take(5).ToListAsync();
        var courseDtos = recommendedCourses.Select(c => new CourseListDto { Id = c.Id, Title = c.Title, Slug = c.Slug, ShortDescription = c.ShortDescription, ThumbnailUrl = c.ThumbnailUrl, Difficulty = c.Difficulty, EstimatedDurationMinutes = c.EstimatedDurationMinutes, Points = c.Points, CategoryName = c.Category != null ? c.Category.Name : "", LessonCount = c.Lessons.Count(l => l.IsActive), EnrolledCount = c.EnrolledCount, AverageRating = c.AverageRating, IsFeatured = c.IsFeatured }).ToList();
        
        var userRank = await GetUserRankAsync(userId);
        var unreadCount = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        
        var currentLevel = user.CurrentLevel;
        int nextLevelNumber = (currentLevel?.LevelNumber ?? 0) + 1;
        var nextLevel = await _context.Levels.Where(l => l.LevelNumber == nextLevelNumber).FirstOrDefaultAsync();
        
        return new DashboardDto 
        { 
            User = new UserDto { Id = user.Id, Username = user.Username, Email = user.Email, FirstName = user.FirstName, LastName = user.LastName, FullName = user.FullName, DepartmentId = user.DepartmentId, DepartmentName = user.Department?.Name, PositionId = user.PositionId, PositionName = user.Position?.Name, AvatarUrl = user.AvatarUrl, IsActive = user.IsActive, TotalPoints = user.TotalPoints, CurrentLevelPoints = user.CurrentLevelPoints, LearningStreak = user.LearningStreak }, 
            CurrentLevel = currentLevel != null ? new LevelDto { Id = currentLevel.Id, LevelNumber = currentLevel.LevelNumber, Name = currentLevel.Name, Description = currentLevel.Description, PointsRequired = currentLevel.PointsRequired, Color = currentLevel.Color, NextLevelPoints = nextLevel?.PointsRequired ?? currentLevel.PointsRequired + 1000 } : null!, 
            TotalPoints = user.TotalPoints, 
            PointsToNextLevel = nextLevel != null ? nextLevel.PointsRequired - user.TotalPoints : 0, 
            LevelProgressPercentage = nextLevel != null && currentLevel != null ? (decimal)(user.TotalPoints - currentLevel.PointsRequired) / (nextLevel.PointsRequired - currentLevel.PointsRequired) * 100 : 100, 
            LearningStreak = user.LearningStreak, 
            RecentBadges = recentBadges, 
            RecommendedArticles = articleDtos, 
            RecommendedCourses = courseDtos, 
            UnreadNotifications = unreadCount, 
            UserRank = userRank 
        };
    }

    public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(string period = "all", int page = 1, int pageSize = 20)
    {
        var query = _context.Users.Include(u => u.CurrentLevel).Include(u => u.Badges).Where(u => u.IsActive);
        if (period.ToLower() == "weekly") query = query.Where(u => u.LastActivityDate >= DateTime.UtcNow.AddDays(-7));
        else if (period.ToLower() == "monthly") query = query.Where(u => u.LastActivityDate >= DateTime.UtcNow.AddDays(-30));
        
        var users = await query.OrderByDescending(u => u.TotalPoints).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var leaderboard = users.Select((u, index) => new LeaderboardEntryDto { Rank = (page - 1) * pageSize + index + 1, UserId = u.Id, DisplayName = u.FullName, AvatarUrl = u.AvatarUrl, LevelName = u.CurrentLevel?.Name ?? "Unknown", LevelColor = u.CurrentLevel?.Color ?? "#888888", TotalPoints = u.TotalPoints, BadgesCount = u.Badges.Count }).ToList();
        return leaderboard;
    }

    public async Task<int?> GetUserRankAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;
        var rank = await _context.Users.CountAsync(u => u.IsActive && u.TotalPoints > user.TotalPoints);
        return rank + 1;
    }

    public async Task<int> CalculateAndAwardPointsAsync(int userId, string transactionType, int basePoints, string? reason = null, string? referenceType = null, int? referenceId = null)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return 0;
        var pointTransaction = new PointTransaction { UserId = userId, Points = basePoints, TransactionType = transactionType, Reason = reason, ReferenceType = referenceType, ReferenceId = referenceId, TransactionDate = DateTime.UtcNow };
        _context.PointTransactions.Add(pointTransaction);
        user.TotalPoints += basePoints;
        user.CurrentLevelPoints += basePoints;
        user.LastActivityDate = DateTime.UtcNow;
        await CheckAndAwardBadgesAsync(userId);
        await CheckAndUpdateLevelAsync(userId);
        await UpdateLearningStreakAsync(userId);
        await _context.SaveChangesAsync();
        return user.TotalPoints;
    }

    private async Task CheckAndAwardBadgesAsync(int userId)
    {
        var user = await _context.Users.Include(u => u.Badges).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;
        var existingBadgeIds = user.Badges.Select(ub => ub.BadgeId).ToHashSet();
        var allBadges = await _context.Badges.Where(b => b.IsActive).ToListAsync();
        var completedLessons = await _context.UserProgress.CountAsync(p => p.UserId == userId && p.IsCompleted);
        var passedQuizzes = await _context.QuizAttempts.CountAsync(qa => qa.UserId == userId && qa.IsPassed);
        var completedChallenges = await _context.UserChallenges.CountAsync(uc => uc.UserId == userId && uc.IsCorrect);
        var completedCourses = await _context.CourseEnrollments.CountAsync(ce => ce.UserId == userId && ce.Status == "Completed");
        foreach (var badge in allBadges.Where(b => !existingBadgeIds.Contains(b.Id)))
        {
            bool earned = badge.CriteriaType switch 
            { 
                "LessonsCompleted" => completedLessons >= badge.CriteriaValue, 
                "QuizzesPassed" => passedQuizzes >= badge.CriteriaValue, 
                "ChallengesCompleted" => completedChallenges >= badge.CriteriaValue, 
                "CoursesCompleted" => completedCourses >= badge.CriteriaValue, 
                "TotalPoints" => user.TotalPoints >= badge.CriteriaValue, 
                "LearningStreak" => user.LearningStreak >= badge.CriteriaValue, 
                _ => false 
            };
            if (earned) 
            { 
                _context.UserBadges.Add(new UserBadge { UserId = userId, BadgeId = badge.Id, EarnedDate = DateTime.UtcNow }); 
                await _notificationService.CreateNotificationAsync(userId, "Badge Earned!", $"Congratulations! You earned the '{badge.Name}' badge.", "Badge", "Badge", badge.Id); 
            }
        }
    }

    private async Task CheckAndUpdateLevelAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;
        var currentLevel = await _context.Levels.FindAsync(user.CurrentLevelId);
        int currentLevelNumber = currentLevel?.LevelNumber ?? 0;
        var nextLevel = await _context.Levels.Where(l => l.LevelNumber > currentLevelNumber).OrderBy(l => l.LevelNumber).FirstOrDefaultAsync();
        if (nextLevel != null && user.TotalPoints >= nextLevel.PointsRequired) 
        { 
            user.CurrentLevelId = nextLevel.Id; 
            user.CurrentLevelPoints = user.TotalPoints - nextLevel.PointsRequired; 
            await _notificationService.CreateNotificationAsync(userId, "Level Up!", $"Congratulations! You reached Level {nextLevel.LevelNumber}: {nextLevel.Name}", "LevelUp", "Level", nextLevel.Id); 
        }
    }

    private async Task UpdateLearningStreakAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;
        var today = DateTime.UtcNow.Date;
        var lastActivity = user.LastActivityDate?.Date;
        if (lastActivity == today.AddDays(-1)) user.LearningStreak++;
        else if (lastActivity != today) user.LearningStreak = 1;
    }
}

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    public NotificationService(ApplicationDbContext context) { _context = context; }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int count = 20)
    {
        return await _context.Notifications.Where(n => n.UserId == userId).OrderByDescending(n => n.CreatedDate).Take(count).Select(n => new NotificationDto { Id = n.Id, Title = n.Title, Message = n.Message, NotificationType = n.NotificationType, ReferenceType = n.ReferenceType, ReferenceId = n.ReferenceId, IsRead = n.IsRead, CreatedDate = n.CreatedDate }).ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId) => await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        if (notification == null) return false;
        notification.IsRead = true; notification.ReadDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(int userId)
    {
        var notifications = await _context.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        foreach (var n in notifications) { n.IsRead = true; n.ReadDate = DateTime.UtcNow; }
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task CreateNotificationAsync(int userId, string title, string message, string notificationType, string? referenceType = null, int? referenceId = null)
    {
        _context.Notifications.Add(new Notification { UserId = userId, Title = title, Message = message, NotificationType = notificationType, ReferenceType = referenceType, ReferenceId = referenceId, IsRead = false, IsActive = true, CreatedDate = DateTime.UtcNow });
        await _context.SaveChangesAsync();
    }
}

public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _context;
    public AuditService(ApplicationDbContext context) { _context = context; }

    public async Task LogAsync(int? userId, string action, string? entityType, int? entityId, string? description, string? oldValues = null, string? newValues = null)
    {
        var user = userId.HasValue ? await _context.Users.FindAsync(userId.Value) : null;
        _context.AuditLogs.Add(new AuditLog { UserId = userId, Username = user?.Username, Action = action, EntityType = entityType, EntityId = entityId, Description = description, OldValues = oldValues, NewValues = newValues, Timestamp = DateTime.UtcNow, IsSuccess = true });
        await _context.SaveChangesAsync();
    }
}
