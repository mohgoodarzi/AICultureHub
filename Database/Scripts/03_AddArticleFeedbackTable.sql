-- =============================================
-- Add ArticleFeedback Table to Existing Database
-- AI Culture Hub - Feedback/Voting Support
-- =============================================

USE [AICultureHub]
GO

-- Create ArticleFeedback table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ArticleFeedback')
BEGIN
    CREATE TABLE [dbo].[ArticleFeedback] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [ArticleId] INT NOT NULL,
        [UserId] INT NOT NULL,
        [IsLike] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_ArticleFeedback] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_ArticleFeedback_Articles] FOREIGN KEY ([ArticleId]) REFERENCES [dbo].[Articles]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ArticleFeedback_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_ArticleFeedback] UNIQUE ([ArticleId], [UserId])
    )

    CREATE INDEX [IX_ArticleFeedback_ArticleId] ON [dbo].[ArticleFeedback]([ArticleId])
    CREATE INDEX [IX_ArticleFeedback_UserId] ON [dbo].[ArticleFeedback]([UserId])

    PRINT 'ArticleFeedback table created successfully'
END
ELSE
BEGIN
    PRINT 'ArticleFeedback table already exists'
END
GO
