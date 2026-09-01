namespace AICultureHub.Application.DTOs;

public class CourseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Difficulty { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public int Points { get; set; }
    public CategoryDto? Category { get; set; }
    public int LessonCount { get; set; }
    public int EnrolledCount { get; set; }
    public int CompletionCount { get; set; }
    public decimal? AverageRating { get; set; }
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();
    public EnrollmentDto? UserEnrollment { get; set; }
}

public class CourseListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Difficulty { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public int Points { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int LessonCount { get; set; }
    public int EnrolledCount { get; set; }
    public decimal? AverageRating { get; set; }
    public bool IsFeatured { get; set; }
}

public class LessonDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public int OrderIndex { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public int Points { get; set; }
    public bool IsCompleted { get; set; }
    public decimal ProgressPercentage { get; set; }
}

public class EnrollmentDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int UserId { get; set; }
    public DateTime EnrolledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal ProgressPercentage { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? LastAccessedDate { get; set; }
}

public class CreateCourseRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Difficulty { get; set; }
    public int EstimatedDurationMinutes { get; set; } = 60;
    public int? CategoryId { get; set; }
    public bool IsPublished { get; set; }
    public List<CreateLessonRequest> Lessons { get; set; } = new();
}

public class CreateLessonRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public int OrderIndex { get; set; }
    public int EstimatedDurationMinutes { get; set; } = 15;
    public int Points { get; set; } = 20;
}

public class QuizDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CategoryDto? Category { get; set; }
    public int? CourseId { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public int TimeLimit { get; set; }
    public int PassingScore { get; set; }
    public int Points { get; set; }
    public int QuestionCount { get; set; }
    public bool IsPublished { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}

public class QuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public int Points { get; set; }
    public int OrderIndex { get; set; }
    public string? ImageUrl { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}

public class AnswerDto
{
    public int Id { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}

public class QuizAttemptResultDto
{
    public int AttemptId { get; set; }
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public decimal Percentage { get; set; }
    public int CorrectAnswers { get; set; }
    public int TotalQuestions { get; set; }
    public bool IsPassed { get; set; }
    public int TimeSpentSeconds { get; set; }
    public int PointsEarned { get; set; }
    public DateTime AttemptDate { get; set; }
    public List<QuestionResultDto> QuestionResults { get; set; } = new();
}

public class QuestionResultDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int? SelectedAnswerId { get; set; }
    public bool IsCorrect { get; set; }
    public int PointsEarned { get; set; }
    public string? Explanation { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}

public class CreateQuizRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public int? CourseId { get; set; }
    public string Difficulty { get; set; } = "Beginner";
    public int TimeLimit { get; set; } = 30;
    public int PassingScore { get; set; } = 70;
    public int Points { get; set; } = 50;
    public bool IsPublished { get; set; }
    public List<CreateQuestionRequest> Questions { get; set; } = new();
}

public class CreateQuestionRequest
{
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "MultipleChoice";
    public string? Explanation { get; set; }
    public int Points { get; set; } = 10;
    public int OrderIndex { get; set; }
    public string? ImageUrl { get; set; }
    public List<CreateAnswerRequest> Answers { get; set; } = new();
}

public class CreateAnswerRequest
{
    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int OrderIndex { get; set; }
}

public class SubmitQuizRequest
{
    public List<QuizAnswerSubmission> Answers { get; set; } = new();
    public int TimeSpentSeconds { get; set; }
}

public class QuizAnswerSubmission
{
    public int QuestionId { get; set; }
    public int? SelectedAnswerId { get; set; }
}
