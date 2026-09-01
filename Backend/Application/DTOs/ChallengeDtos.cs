namespace AICultureHub.Application.DTOs;

public class ChallengeDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ChallengeType { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string? Explanation { get; set; }
    public int Points { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public CategoryDto? Category { get; set; }
    public DateTime? ActiveDate { get; set; }
    public bool IsCompleted { get; set; }
    public bool? WasCorrect { get; set; }
}

public class ChallengeResultDto
{
    public int ChallengeId { get; set; }
    public bool IsCorrect { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public int PointsEarned { get; set; }
    public int TotalPoints { get; set; }
}

public class LeaderboardEntryDto
{
    public int Rank { get; set; }
    public int UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public string LevelColor { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int BadgesCount { get; set; }
}

public class DashboardDto
{
    public UserDto User { get; set; } = null!;
    public LevelDto? CurrentLevel { get; set; }
    public int TotalPoints { get; set; }
    public int PointsToNextLevel { get; set; }
    public decimal LevelProgressPercentage { get; set; }
    public int LearningStreak { get; set; }
    public List<BadgeDto> RecentBadges { get; set; } = new();
    public List<ArticleListDto> RecommendedArticles { get; set; } = new();
    public List<CourseListDto> RecommendedCourses { get; set; } = new();
    public ChallengeDto? DailyChallenge { get; set; }
    public int UnreadNotifications { get; set; }
    public int? UserRank { get; set; }
}

public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class AnnouncementDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsPublished { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class AnalyticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int NewUsersThisMonth { get; set; }
    public int TotalArticles { get; set; }
    public int TotalCourses { get; set; }
    public int CourseCompletions { get; set; }
    public int TotalQuizzes { get; set; }
    public int QuizAttempts { get; set; }
    public decimal AverageQuizScore { get; set; }
    public int ChallengesCompleted { get; set; }
    public int TotalPointsAwarded { get; set; }
    public List<PopularItemDto> PopularArticles { get; set; } = new();
    public List<PopularItemDto> PopularCourses { get; set; } = new();
    public List<ActiveUserDto> TopUsers { get; set; } = new();
}

public class PopularItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ActiveUserDto
{
    public int UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public int Points { get; set; }
}
