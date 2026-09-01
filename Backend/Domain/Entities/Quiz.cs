using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Quiz : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public int? CourseId { get; set; }
    public string Difficulty { get; set; } = "Beginner";
    public int TimeLimit { get; set; } = 30;
    public int PassingScore { get; set; } = 70;
    public int Points { get; set; } = 50;
    public int QuestionCount { get; set; } = 0;
    public bool IsPublished { get; set; } = false;
    public int CreatedBy { get; set; }
    
    public virtual Category? Category { get; set; }
    public virtual Course? Course { get; set; }
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    public virtual ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}

public class Question : BaseEntity
{
    public int QuizId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "MultipleChoice";
    public string? Explanation { get; set; }
    public int Points { get; set; } = 10;
    public int OrderIndex { get; set; } = 0;
    public string? ImageUrl { get; set; }
    
    public virtual Quiz Quiz { get; set; } = null!;
    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public virtual ICollection<QuizAttemptAnswer> AttemptAnswers { get; set; } = new List<QuizAttemptAnswer>();
}

public class Answer
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public int OrderIndex { get; set; } = 0;
    
    public virtual Question Question { get; set; } = null!;
}

public class QuizAttempt
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int QuizId { get; set; }
    public int Score { get; set; } = 0;
    public int MaxScore { get; set; } = 0;
    public decimal Percentage { get; set; } = 0;
    public int CorrectAnswers { get; set; } = 0;
    public int TotalQuestions { get; set; } = 0;
    public bool IsPassed { get; set; } = false;
    public int TimeSpentSeconds { get; set; } = 0;
    public int PointsEarned { get; set; } = 0;
    public DateTime AttemptDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
    public virtual Quiz Quiz { get; set; } = null!;
    public virtual ICollection<QuizAttemptAnswer> AttemptAnswers { get; set; } = new List<QuizAttemptAnswer>();
}

public class QuizAttemptAnswer
{
    public int Id { get; set; }
    public int AttemptId { get; set; }
    public int QuestionId { get; set; }
    public int? SelectedAnswerId { get; set; }
    public bool IsCorrect { get; set; } = false;
    public int PointsEarned { get; set; } = 0;
    
    public virtual QuizAttempt Attempt { get; set; } = null!;
    public virtual Question Question { get; set; } = null!;
    public virtual Answer? SelectedAnswer { get; set; }
}
