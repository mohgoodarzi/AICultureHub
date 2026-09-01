using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Challenge : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ChallengeType { get; set; } = "Daily";
    public string QuestionText { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? Options { get; set; }
    public string? Explanation { get; set; }
    public int Points { get; set; } = 25;
    public string Difficulty { get; set; } = "Beginner";
    public int? CategoryId { get; set; }
    public DateTime? ActiveDate { get; set; }
    public int CreatedBy { get; set; }
    
    public virtual Category? Category { get; set; }
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<UserChallenge> UserChallenges { get; set; } = new List<UserChallenge>();
}

public class UserChallenge
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ChallengeId { get; set; }
    public string? UserAnswer { get; set; }
    public bool IsCorrect { get; set; } = false;
    public int PointsEarned { get; set; } = 0;
    public DateTime AttemptedDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
    public virtual Challenge Challenge { get; set; } = null!;
}
