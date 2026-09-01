using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Course : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Difficulty { get; set; }
    public int EstimatedDurationMinutes { get; set; } = 60;
    public int Points { get; set; } = 100;
    public int? CategoryId { get; set; }
    public int CreatedBy { get; set; }
    public bool IsPublished { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public int EnrolledCount { get; set; } = 0;
    public int CompletionCount { get; set; } = 0;
    public decimal? AverageRating { get; set; }
    
    public virtual Category? Category { get; set; }
    public virtual User Creator { get; set; } = null!;
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public virtual ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}

public class Lesson : BaseEntity
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public int OrderIndex { get; set; } = 0;
    public int EstimatedDurationMinutes { get; set; } = 15;
    public int Points { get; set; } = 20;
    
    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<UserProgress> UserProgress { get; set; } = new List<UserProgress>();
}

public class CourseEnrollment : BaseEntity
{
    public int UserId { get; set; }
    public int CourseId { get; set; }
    public DateTime EnrolledDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedDate { get; set; }
    public decimal ProgressPercentage { get; set; } = 0;
    public string Status { get; set; } = "Enrolled";
    public DateTime? LastAccessedDate { get; set; }
    
    public virtual User User { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<UserProgress> Progress { get; set; } = new List<UserProgress>();
}

public class UserProgress : BaseEntity
{
    public int UserId { get; set; }
    public int LessonId { get; set; }
    public int EnrollmentId { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletionDate { get; set; }
    public int TimeSpentMinutes { get; set; } = 0;
    
    public virtual User User { get; set; } = null!;
    public virtual Lesson Lesson { get; set; } = null!;
    public virtual CourseEnrollment Enrollment { get; set; } = null!;
}

public class CourseFeedback
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int UserId { get; set; }
    public bool IsLike { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    
    public virtual Course Course { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
