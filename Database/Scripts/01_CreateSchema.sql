-- =============================================
-- AI Culture & Digital Transformation Hub
-- Database Creation Script
-- =============================================

USE [master]
GO

-- Drop database if exists (for clean setup)
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'AICultureHub')
BEGIN
    ALTER DATABASE [AICultureHub] SET SINGLE_USER WITH ROLLBACK IMMEDIATE
    DROP DATABASE [AICultureHub]
END
GO

-- Create database
CREATE DATABASE [AICultureHub]
GO

USE [AICultureHub]
GO

-- =============================================
-- 1. ROLES & PERMISSIONS
-- =============================================

CREATE TABLE [dbo].[Roles] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(255) NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [CreatedBy] INT NULL,
    [ModifiedBy] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Roles_Name] UNIQUE ([Name])
)
GO

CREATE TABLE [dbo].[Permissions] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Code] NVARCHAR(100) NOT NULL,
    [Module] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(255) NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Permissions_Code] UNIQUE ([Code])
)
GO

CREATE TABLE [dbo].[RolePermissions] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [RoleId] INT NOT NULL,
    [PermissionId] INT NOT NULL,
    CONSTRAINT [PK_RolePermissions] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_RolePermissions_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_RolePermissions_Permissions] FOREIGN KEY ([PermissionId]) REFERENCES [dbo].[Permissions]([Id]) ON DELETE CASCADE
)
GO

-- =============================================
-- 2. USERS
-- =============================================

CREATE TABLE [dbo].[Users] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Username] NVARCHAR(50) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL,
    [PasswordHash] NVARCHAR(500) NOT NULL,
    [PasswordSalt] NVARCHAR(200) NULL,
    [FirstName] NVARCHAR(50) NOT NULL,
    [LastName] NVARCHAR(50) NOT NULL,
    [Department] NVARCHAR(100) NULL,
    [Position] NVARCHAR(100) NULL,
    [Location] NVARCHAR(100) NULL,
    [EmployeeId] NVARCHAR(50) NULL,
    [AvatarUrl] NVARCHAR(500) NULL,
    [Bio] NVARCHAR(500) NULL,
    [TotalPoints] INT NOT NULL DEFAULT 0,
    [CurrentLevelId] INT NULL,
    [CurrentLevelPoints] INT NOT NULL DEFAULT 0,
    [LearningStreak] INT NOT NULL DEFAULT 0,
    [LastActivityDate] DATETIME2 NULL,
    [ThemeId] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [IsEmailVerified] BIT NOT NULL DEFAULT 0,
    [LastLoginDate] DATETIME2 NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [CreatedBy] INT NULL,
    [ModifiedBy] INT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Users_Username] UNIQUE ([Username]),
    CONSTRAINT [UQ_Users_Email] UNIQUE ([Email]),
    CONSTRAINT [UQ_Users_EmployeeId] UNIQUE ([EmployeeId])
)
GO

CREATE TABLE [dbo].[UserRoles] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [RoleId] INT NOT NULL,
    [AssignedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [AssignedBy] INT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserRoles_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id]) ON DELETE CASCADE
)
GO

CREATE INDEX [IX_Users_Username] ON [dbo].[Users]([Username])
CREATE INDEX [IX_Users_Email] ON [dbo].[Users]([Email])
CREATE INDEX [IX_Users_Department] ON [dbo].[Users]([Department])
GO

-- =============================================
-- 3. THEMES
-- =============================================

CREATE TABLE [dbo].[Themes] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    [Code] NVARCHAR(50) NOT NULL,
    [PrimaryColor] NVARCHAR(20) NULL,
    [SecondaryColor] NVARCHAR(20) NULL,
    [AccentColor] NVARCHAR(20) NULL,
    [BackgroundColor] NVARCHAR(20) NULL,
    [TextColor] NVARCHAR(20) NULL,
    [IsDark] BIT NOT NULL DEFAULT 0,
    [IsDefault] BIT NOT NULL DEFAULT 0,
    [Description] NVARCHAR(255) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Themes] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Themes_Code] UNIQUE ([Code])
)
GO

CREATE TABLE [dbo].[UserThemes] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [ThemeId] INT NOT NULL,
    [AssignedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_UserThemes] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserThemes_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserThemes_Themes] FOREIGN KEY ([ThemeId]) REFERENCES [dbo].[Themes]([Id])
)
GO

-- =============================================
-- 4. CATEGORIES
-- =============================================

CREATE TABLE [dbo].[Categories] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Slug] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [Icon] NVARCHAR(50) NULL,
    [Color] NVARCHAR(20) NULL,
    [DisplayOrder] INT NOT NULL DEFAULT 0,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Categories_Slug] UNIQUE ([Slug])
)
GO

CREATE TABLE [dbo].[Tags] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    [Slug] NVARCHAR(50) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Tags] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Tags_Slug] UNIQUE ([Slug])
)
GO

-- =============================================
-- 5. ARTICLES
-- =============================================

CREATE TABLE [dbo].[Articles] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Slug] NVARCHAR(255) NOT NULL,
    [Summary] NVARCHAR(1000) NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [CategoryId] INT NOT NULL,
    [AuthorId] INT NOT NULL,
    [ImageUrl] NVARCHAR(500) NULL,
    [ReadingTimeMinutes] INT NOT NULL DEFAULT 5,
    [ViewCount] INT NOT NULL DEFAULT 0,
    [LikeCount] INT NOT NULL DEFAULT 0,
    [IsPublished] BIT NOT NULL DEFAULT 0,
    [IsFeatured] BIT NOT NULL DEFAULT 0,
    [PublishedDate] DATETIME2 NULL,
    [Difficulty] NVARCHAR(20) NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [CreatedBy] INT NULL,
    [ModifiedBy] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Articles] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Articles_Slug] UNIQUE ([Slug]),
    CONSTRAINT [FK_Articles_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([Id]),
    CONSTRAINT [FK_Articles_Users] FOREIGN KEY ([AuthorId]) REFERENCES [dbo].[Users]([Id])
)
GO

CREATE TABLE [dbo].[ArticleTags] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [ArticleId] INT NOT NULL,
    [TagId] INT NOT NULL,
    CONSTRAINT [PK_ArticleTags] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_ArticleTags_Articles] FOREIGN KEY ([ArticleId]) REFERENCES [dbo].[Articles]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ArticleTags_Tags] FOREIGN KEY ([TagId]) REFERENCES [dbo].[Tags]([Id]) ON DELETE CASCADE
)
GO

CREATE INDEX [IX_Articles_CategoryId] ON [dbo].[Articles]([CategoryId])
CREATE INDEX [IX_Articles_AuthorId] ON [dbo].[Articles]([AuthorId])
CREATE INDEX [IX_Articles_IsPublished] ON [dbo].[Articles]([IsPublished])
CREATE INDEX [IX_Articles_PublishedDate] ON [dbo].[Articles]([PublishedDate] DESC)
GO

CREATE TABLE [dbo].[ArticleViews] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [ArticleId] INT NOT NULL,
    [UserId] INT NOT NULL,
    [ViewedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_ArticleViews] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_ArticleViews_Articles] FOREIGN KEY ([ArticleId]) REFERENCES [dbo].[Articles]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ArticleViews_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
)
GO

CREATE TABLE [dbo].[Bookmarks] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [ArticleId] INT NOT NULL,
    [BookmarkedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Bookmarks] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Bookmarks_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Bookmarks_Articles] FOREIGN KEY ([ArticleId]) REFERENCES [dbo].[Articles]([Id]) ON DELETE CASCADE,
    CONSTRAINT [UQ_Bookmarks] UNIQUE ([UserId], [ArticleId])
)
GO

-- =============================================
-- 6. COURSES & LESSONS
-- =============================================

CREATE TABLE [dbo].[Courses] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Slug] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [ShortDescription] NVARCHAR(500) NULL,
    [ThumbnailUrl] NVARCHAR(500) NULL,
    [Difficulty] NVARCHAR(20) NULL,
    [EstimatedDurationMinutes] INT NOT NULL DEFAULT 60,
    [Points] INT NOT NULL DEFAULT 100,
    [CategoryId] INT NULL,
    [CreatedBy] INT NOT NULL,
    [IsPublished] BIT NOT NULL DEFAULT 0,
    [IsFeatured] BIT NOT NULL DEFAULT 0,
    [DisplayOrder] INT NOT NULL DEFAULT 0,
    [EnrolledCount] INT NOT NULL DEFAULT 0,
    [CompletionCount] INT NOT NULL DEFAULT 0,
    [AverageRating] DECIMAL(3,2) NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Courses] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Courses_Slug] UNIQUE ([Slug]),
    CONSTRAINT [FK_Courses_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([Id]),
    CONSTRAINT [FK_Courses_Users] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([Id])
)
GO

CREATE TABLE [dbo].[Lessons] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [CourseId] INT NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    [Content] NVARCHAR(MAX) NULL,
    [VideoUrl] NVARCHAR(500) NULL,
    [OrderIndex] INT NOT NULL DEFAULT 0,
    [EstimatedDurationMinutes] INT NOT NULL DEFAULT 15,
    [Points] INT NOT NULL DEFAULT 20,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    CONSTRAINT [PK_Lessons] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Lessons_Courses] FOREIGN KEY ([CourseId]) REFERENCES [dbo].[Courses]([Id]) ON DELETE CASCADE
)
GO

CREATE TABLE [dbo].[CourseEnrollments] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [CourseId] INT NOT NULL,
    [EnrolledDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CompletedDate] DATETIME2 NULL,
    [ProgressPercentage] DECIMAL(5,2) NOT NULL DEFAULT 0,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Enrolled',
    [LastAccessedDate] DATETIME2 NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_CourseEnrollments] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_CourseEnrollments_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CourseEnrollments_Courses] FOREIGN KEY ([CourseId]) REFERENCES [dbo].[Courses]([Id]) ON DELETE CASCADE,
    CONSTRAINT [UQ_CourseEnrollments] UNIQUE ([UserId], [CourseId])
)
GO

CREATE TABLE [dbo].[UserProgress] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [LessonId] INT NOT NULL,
    [EnrollmentId] INT NOT NULL,
    [IsCompleted] BIT NOT NULL DEFAULT 0,
    [CompletionDate] DATETIME2 NULL,
    [TimeSpentMinutes] INT NOT NULL DEFAULT 0,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    CONSTRAINT [PK_UserProgress] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserProgress_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserProgress_Lessons] FOREIGN KEY ([LessonId]) REFERENCES [dbo].[Lessons]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserProgress_Enrollments] FOREIGN KEY ([EnrollmentId]) REFERENCES [dbo].[CourseEnrollments]([Id]) ON DELETE NO ACTION
)
GO

-- =============================================
-- 7. QUIZZES & QUESTIONS
-- =============================================

CREATE TABLE [dbo].[Quizzes] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    [CategoryId] INT NULL,
    [CourseId] INT NULL,
    [Difficulty] NVARCHAR(20) NOT NULL DEFAULT 'Beginner',
    [TimeLimit] INT NOT NULL DEFAULT 30,
    [PassingScore] INT NOT NULL DEFAULT 70,
    [Points] INT NOT NULL DEFAULT 50,
    [QuestionCount] INT NOT NULL DEFAULT 0,
    [IsPublished] BIT NOT NULL DEFAULT 0,
    [CreatedBy] INT NOT NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Quizzes] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Quizzes_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([Id]),
    CONSTRAINT [FK_Quizzes_Courses] FOREIGN KEY ([CourseId]) REFERENCES [dbo].[Courses]([Id]),
    CONSTRAINT [FK_Quizzes_Users] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([Id])
)
GO

CREATE TABLE [dbo].[Questions] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [QuizId] INT NOT NULL,
    [QuestionText] NVARCHAR(MAX) NOT NULL,
    [QuestionType] NVARCHAR(30) NOT NULL DEFAULT 'MultipleChoice',
    [Explanation] NVARCHAR(MAX) NULL,
    [Points] INT NOT NULL DEFAULT 10,
    [OrderIndex] INT NOT NULL DEFAULT 0,
    [ImageUrl] NVARCHAR(500) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    CONSTRAINT [PK_Questions] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Questions_Quizzes] FOREIGN KEY ([QuizId]) REFERENCES [dbo].[Quizzes]([Id]) ON DELETE CASCADE
)
GO

CREATE TABLE [dbo].[Answers] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [QuestionId] INT NOT NULL,
    [AnswerText] NVARCHAR(500) NOT NULL,
    [IsCorrect] BIT NOT NULL DEFAULT 0,
    [OrderIndex] INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_Answers] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Answers_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions]([Id]) ON DELETE CASCADE
)
GO

CREATE TABLE [dbo].[QuizAttempts] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [QuizId] INT NOT NULL,
    [Score] INT NOT NULL DEFAULT 0,
    [MaxScore] INT NOT NULL DEFAULT 0,
    [Percentage] DECIMAL(5,2) NOT NULL DEFAULT 0,
    [CorrectAnswers] INT NOT NULL DEFAULT 0,
    [TotalQuestions] INT NOT NULL DEFAULT 0,
    [IsPassed] BIT NOT NULL DEFAULT 0,
    [TimeSpentSeconds] INT NOT NULL DEFAULT 0,
    [PointsEarned] INT NOT NULL DEFAULT 0,
    [AttemptDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_QuizAttempts] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_QuizAttempts_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_QuizAttempts_Quizzes] FOREIGN KEY ([QuizId]) REFERENCES [dbo].[Quizzes]([Id]) ON DELETE CASCADE
)
GO

CREATE TABLE [dbo].[QuizAttemptAnswers] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [AttemptId] INT NOT NULL,
    [QuestionId] INT NOT NULL,
    [SelectedAnswerId] INT NULL,
    [IsCorrect] BIT NOT NULL DEFAULT 0,
    [PointsEarned] INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_QuizAttemptAnswers] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_QuizAttemptAnswers_Attempts] FOREIGN KEY ([AttemptId]) REFERENCES [dbo].[QuizAttempts]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_QuizAttemptAnswers_Questions] FOREIGN KEY ([QuestionId]) REFERENCES [dbo].[Questions]([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_QuizAttemptAnswers_Answers] FOREIGN KEY ([SelectedAnswerId]) REFERENCES [dbo].[Answers]([Id])
)
GO

-- =============================================
-- 8. CHALLENGES
-- =============================================

CREATE TABLE [dbo].[Challenges] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [ChallengeType] NVARCHAR(30) NOT NULL DEFAULT 'Daily',
    [QuestionText] NVARCHAR(MAX) NOT NULL,
    [CorrectAnswer] NVARCHAR(500) NOT NULL,
    [Options] NVARCHAR(MAX) NULL,
    [Explanation] NVARCHAR(MAX) NULL,
    [Points] INT NOT NULL DEFAULT 25,
    [Difficulty] NVARCHAR(20) NOT NULL DEFAULT 'Beginner',
    [CategoryId] INT NULL,
    [ActiveDate] DATE NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [CreatedBy] INT NOT NULL,
    CONSTRAINT [PK_Challenges] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Challenges_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([Id]),
    CONSTRAINT [FK_Challenges_Users] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([Id])
)
GO

CREATE TABLE [dbo].[UserChallenges] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [ChallengeId] INT NOT NULL,
    [UserAnswer] NVARCHAR(500) NULL,
    [IsCorrect] BIT NOT NULL DEFAULT 0,
    [PointsEarned] INT NOT NULL DEFAULT 0,
    [AttemptedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_UserChallenges] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserChallenges_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserChallenges_Challenges] FOREIGN KEY ([ChallengeId]) REFERENCES [dbo].[Challenges]([Id]) ON DELETE CASCADE
)
GO

-- =============================================
-- 9. POINTS & GAMIFICATION
-- =============================================

CREATE TABLE [dbo].[PointTransactions] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [Points] INT NOT NULL,
    [TransactionType] NVARCHAR(50) NOT NULL,
    [Reason] NVARCHAR(255) NULL,
    [ReferenceType] NVARCHAR(50) NULL,
    [ReferenceId] INT NULL,
    [TransactionDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_PointTransactions] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_PointTransactions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
)
GO

CREATE INDEX [IX_PointTransactions_UserId] ON [dbo].[PointTransactions]([UserId])
CREATE INDEX [IX_PointTransactions_TransactionDate] ON [dbo].[PointTransactions]([TransactionDate] DESC)
GO

-- =============================================
-- 10. LEVELS
-- =============================================

CREATE TABLE [dbo].[Levels] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [LevelNumber] INT NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [PointsRequired] INT NOT NULL,
    [IconUrl] NVARCHAR(500) NULL,
    [Color] NVARCHAR(20) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [CreatedBy] INT NULL,
    [ModifiedBy] INT NULL,
    CONSTRAINT [PK_Levels] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Levels_LevelNumber] UNIQUE ([LevelNumber])
)
GO

CREATE TABLE [dbo].[UserLevels] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [LevelId] INT NOT NULL,
    [AchievedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_UserLevels] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserLevels_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserLevels_Levels] FOREIGN KEY ([LevelId]) REFERENCES [dbo].[Levels]([Id])
)
GO

-- =============================================
-- 11. BADGES
-- =============================================

CREATE TABLE [dbo].[Badges] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [IconUrl] NVARCHAR(500) NULL,
    [Color] NVARCHAR(20) NULL,
    [Criteria] NVARCHAR(MAX) NULL,
    [CriteriaType] NVARCHAR(50) NULL,
    [CriteriaValue] INT NOT NULL DEFAULT 0,
    [Points] INT NOT NULL DEFAULT 50,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Badges] PRIMARY KEY CLUSTERED ([Id])
)
GO

CREATE TABLE [dbo].[UserBadges] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [BadgeId] INT NOT NULL,
    [EarnedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_UserBadges] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserBadges_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserBadges_Badges] FOREIGN KEY ([BadgeId]) REFERENCES [dbo].[Badges]([Id]),
    CONSTRAINT [UQ_UserBadges] UNIQUE ([UserId], [BadgeId])
)
GO

-- =============================================
-- 12. NOTIFICATIONS
-- =============================================

CREATE TABLE [dbo].[Notifications] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Message] NVARCHAR(MAX) NULL,
    [NotificationType] NVARCHAR(50) NOT NULL,
    [ReferenceType] NVARCHAR(50) NULL,
    [ReferenceId] INT NULL,
    [IsRead] BIT NOT NULL DEFAULT 0,
    [ReadDate] DATETIME2 NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
)
GO

CREATE INDEX [IX_Notifications_UserId_IsRead] ON [dbo].[Notifications]([UserId], [IsRead])
GO

-- =============================================
-- 13. ANNOUNCEMENTS
-- =============================================

CREATE TABLE [dbo].[Announcements] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [Summary] NVARCHAR(500) NULL,
    [Priority] NVARCHAR(20) NOT NULL DEFAULT 'Normal',
    [ImageUrl] NVARCHAR(500) NULL,
    [StartDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [EndDate] DATETIME2 NULL,
    [IsPublished] BIT NOT NULL DEFAULT 1,
    [CreatedBy] INT NOT NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Announcements] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_Announcements_Users] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([Id])
)
GO

-- =============================================
-- 14. GLOSSARY
-- =============================================

CREATE TABLE [dbo].[Glossary] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Term] NVARCHAR(100) NOT NULL,
    [Slug] NVARCHAR(100) NOT NULL,
    [Definition] NVARCHAR(MAX) NOT NULL,
    [ExtendedDescription] NVARCHAR(MAX) NULL,
    [Category] NVARCHAR(50) NULL,
    [RelatedTerms] NVARCHAR(500) NULL,
    [Examples] NVARCHAR(MAX) NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    [CreatedBy] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Glossary] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Glossary_Slug] UNIQUE ([Slug])
)
GO

-- =============================================
-- 15. AUDIT LOGS
-- =============================================

CREATE TABLE [dbo].[AuditLogs] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL,
    [UserId] INT NULL,
    [Username] NVARCHAR(100) NULL,
    [Action] NVARCHAR(100) NOT NULL,
    [EntityType] NVARCHAR(100) NULL,
    [EntityId] INT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [OldValues] NVARCHAR(MAX) NULL,
    [NewValues] NVARCHAR(MAX) NULL,
    [IpAddress] NVARCHAR(50) NULL,
    [UserAgent] NVARCHAR(500) NULL,
    [Timestamp] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [IsSuccess] BIT NOT NULL DEFAULT 1,
    [ErrorMessage] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED ([Id])
)
GO

CREATE INDEX [IX_AuditLogs_UserId] ON [dbo].[AuditLogs]([UserId])
CREATE INDEX [IX_AuditLogs_Timestamp] ON [dbo].[AuditLogs]([Timestamp] DESC)
CREATE INDEX [IX_AuditLogs_Action] ON [dbo].[AuditLogs]([Action])
GO

-- =============================================
-- 16. SYSTEM SETTINGS
-- =============================================

CREATE TABLE [dbo].[SystemSettings] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [SettingKey] NVARCHAR(100) NOT NULL,
    [SettingValue] NVARCHAR(MAX) NULL,
    [Description] NVARCHAR(500) NULL,
    [Category] NVARCHAR(50) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME2 NULL,
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_SystemSettings_Key] UNIQUE ([SettingKey])
)
GO

PRINT 'Database schema created successfully'
GO