using Microsoft.EntityFrameworkCore;
using AICultureHub.Domain.Entities;

namespace AICultureHub.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<ArticleTag> ArticleTags => Set<ArticleTag>();
    public DbSet<ArticleView> ArticleViews => Set<ArticleView>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<CourseFeedback> CourseFeedbacks => Set<CourseFeedback>();
    public DbSet<ArticleFeedback> ArticleFeedback => Set<ArticleFeedback>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAttemptAnswer> QuizAttemptAnswers => Set<QuizAttemptAnswer>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<UserChallenge> UserChallenges => Set<UserChallenge>();
    public DbSet<PointTransaction> PointTransactions => Set<PointTransaction>();
    public DbSet<Level> Levels => Set<Level>();
    public DbSet<UserLevel> UserLevels => Set<UserLevel>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<Theme> Themes => Set<Theme>();
    public DbSet<UserTheme> UserThemes => Set<UserTheme>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Glossary> Glossary => Set<Glossary>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Position> Positions => Set<Position>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            // Filtered unique index: multiple NULLs allowed (users without a personnel number),
            // but each non-NULL personnel number must be unique — duplicates impossible at DB level.
            entity.HasIndex(e => e.EmployeeId).IsUnique().HasFilter("[EmployeeId] IS NOT NULL AND [EmployeeId] <> ''");
            entity.HasOne(e => e.CurrentLevel)
                  .WithMany(l => l.Users)
                  .HasForeignKey(e => e.CurrentLevelId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasOne(ur => ur.User)
                  .WithMany(u => u.UserRoles)
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ur => ur.Role)
                  .WithMany(r => r.UserRoles)
                  .HasForeignKey(ur => ur.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasOne(rp => rp.Role)
                  .WithMany(r => r.RolePermissions)
                  .HasForeignKey(rp => rp.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rp => rp.Permission)
                  .WithMany(p => p.RolePermissions)
                  .HasForeignKey(rp => rp.PermissionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasOne(a => a.Category)
                  .WithMany(c => c.Articles)
                  .HasForeignKey(a => a.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(a => a.Author)
                  .WithMany(u => u.Articles)
                  .HasForeignKey(a => a.AuthorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ArticleTag>(entity =>
        {
            entity.HasOne(at => at.Article)
                  .WithMany(a => a.ArticleTags)
                  .HasForeignKey(at => at.ArticleId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(at => at.Tag)
                  .WithMany(t => t.ArticleTags)
                  .HasForeignKey(at => at.TagId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Bookmark>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.ArticleId }).IsUnique();
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasOne(c => c.Category)
                  .WithMany(cat => cat.Courses)
                  .HasForeignKey(c => c.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(c => c.Creator)
                  .WithMany()
                  .HasForeignKey(c => c.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasOne(l => l.Course)
                  .WithMany(c => c.Lessons)
                  .HasForeignKey(l => l.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CourseEnrollment>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
            entity.HasOne(ce => ce.User)
                  .WithMany(u => u.Enrollments)
                  .HasForeignKey(ce => ce.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ce => ce.Course)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(ce => ce.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserProgress>(entity =>
        {
            entity.HasOne(up => up.User)
                  .WithMany(u => u.Progress)
                  .HasForeignKey(up => up.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(up => up.Lesson)
                  .WithMany(l => l.UserProgress)
                  .HasForeignKey(up => up.LessonId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(up => up.Enrollment)
                  .WithMany(e => e.Progress)
                  .HasForeignKey(up => up.EnrollmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasOne(q => q.Category)
                  .WithMany(c => c.Quizzes)
                  .HasForeignKey(q => q.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(q => q.Course)
                  .WithMany(c => c.Quizzes)
                  .HasForeignKey(q => q.CourseId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(q => q.Creator)
                  .WithMany()
                  .HasForeignKey(q => q.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasOne(q => q.Quiz)
                  .WithMany(qz => qz.Questions)
                  .HasForeignKey(q => q.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Answer>(entity =>
        {
            entity.HasOne(a => a.Question)
                  .WithMany(q => q.Answers)
                  .HasForeignKey(a => a.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasOne(qa => qa.User)
                  .WithMany(u => u.QuizAttempts)
                  .HasForeignKey(qa => qa.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(qa => qa.Quiz)
                  .WithMany(q => q.Attempts)
                  .HasForeignKey(qa => qa.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizAttemptAnswer>(entity =>
        {
            entity.HasOne(qaa => qaa.Attempt)
                  .WithMany(qa => qa.AttemptAnswers)
                  .HasForeignKey(qaa => qaa.AttemptId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(qaa => qaa.Question)
                  .WithMany(q => q.AttemptAnswers)
                  .HasForeignKey(qaa => qaa.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Challenge>(entity =>
        {
            entity.HasOne(c => c.Category)
                  .WithMany(cat => cat.Challenges)
                  .HasForeignKey(c => c.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(c => c.Creator)
                  .WithMany()
                  .HasForeignKey(c => c.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserChallenge>(entity =>
        {
            entity.HasOne(uc => uc.User)
                  .WithMany(u => u.Challenges)
                  .HasForeignKey(uc => uc.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(uc => uc.Challenge)
                  .WithMany(c => c.UserChallenges)
                  .HasForeignKey(uc => uc.ChallengeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PointTransaction>(entity =>
        {
            entity.HasOne(pt => pt.User)
                  .WithMany()
                  .HasForeignKey(pt => pt.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CourseFeedback>(entity =>
        {
            entity.HasOne(cf => cf.Course)
                  .WithMany()
                  .HasForeignKey(cf => cf.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(cf => cf.User)
                  .WithMany()
                  .HasForeignKey(cf => cf.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.CourseId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<ArticleFeedback>(entity =>
        {
            entity.ToTable("ArticleFeedback");
            entity.HasOne(af => af.Article)
                  .WithMany()
                  .HasForeignKey(af => af.ArticleId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(af => af.User)
                  .WithMany()
                  .HasForeignKey(af => af.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.ArticleId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<UserBadge>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.BadgeId }).IsUnique();
            entity.HasOne(ub => ub.User)
                  .WithMany(u => u.Badges)
                  .HasForeignKey(ub => ub.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ub => ub.Badge)
                  .WithMany(b => b.UserBadges)
                  .HasForeignKey(ub => ub.BadgeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User)
                  .WithMany()
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Announcement>(entity =>
        {
        });

        modelBuilder.Entity<Glossary>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasIndex(e => e.SettingKey).IsUnique();
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasOne(d => d.Parent)
                  .WithMany(d => d.Children)
                  .HasForeignKey(d => d.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Position>(entity =>
        {
            entity.HasOne(p => p.Department)
                  .WithMany()
                  .HasForeignKey(p => p.DepartmentId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasOne(u => u.Department)
                  .WithMany(d => d.Users)
                  .HasForeignKey(u => u.DepartmentId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(u => u.Position)
                  .WithMany(p => p.Users)
                  .HasForeignKey(u => u.PositionId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
