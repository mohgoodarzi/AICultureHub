-- =============================================
-- AI Culture & Digital Transformation Hub
-- Seed Data Script
-- =============================================

USE [AICultureHub]
GO

-- =============================================
-- 1. ROLES
-- =============================================
INSERT INTO [dbo].[Roles] ([Name], [Description], [IsActive]) VALUES
(N'Administrator', N'Full system access including user management, content management, and analytics', 1),
(N'ContentManager', N'Can create and manage content, courses, quizzes, and glossary', 1),
(N'Employee', N'Standard employee access - browse content, take quizzes, participate in challenges', 1)
GO

-- =============================================
-- 2. PERMISSIONS
-- =============================================
INSERT INTO [dbo].[Permissions] ([Name], [Code], [Module], [Description]) VALUES
(N'View Users', N'users.view', N'Users', N'View user list and details'),
(N'Create User', N'users.create', N'Users', N'Create new users'),
(N'Edit User', N'users.edit', N'Users', N'Edit user information'),
(N'Delete User', N'users.delete', N'Users', N'Delete users'),
(N'Manage Roles', N'users.roles', N'Users', N'Assign roles to users'),
(N'View Articles', N'articles.view', N'Articles', N'View articles'),
(N'Create Article', N'articles.create', N'Articles', N'Create new articles'),
(N'Edit Article', N'articles.edit', N'Articles', N'Edit articles'),
(N'Delete Article', N'articles.delete', N'Articles', N'Delete articles'),
(N'View Courses', N'courses.view', N'Courses', N'View courses'),
(N'Create Course', N'courses.create', N'Courses', N'Create new courses'),
(N'Edit Course', N'courses.edit', N'Courses', N'Edit courses'),
(N'Delete Course', N'delete course', N'Courses', N'Delete courses'),
(N'View Quizzes', N'quizzes.view', N'Quizzes', N'View quizzes'),
(N'Create Quiz', N'quizzes.create', N'Quizzes', N'Create quizzes'),
(N'Edit Quiz', N'quizzes.edit', N'Quizzes', N'Edit quizzes'),
(N'Delete Quiz', N'quizzes.delete', N'Quizzes', N'Delete quizzes'),
(N'Manage Challenges', N'challenges.manage', N'Challenges', N'Create and edit challenges'),
(N'Manage Badges', N'badges.manage', N'Badges', N'Manage badges'),
(N'Manage Levels', N'levels.manage', N'Levels', N'Manage levels'),
(N'View Analytics', N'analytics.view', N'Analytics', N'View analytics dashboard'),
(N'Manage Settings', N'settings.manage', N'Settings', N'Manage system settings'),
(N'View Audit Logs', N'audit.view', N'Audit', N'View audit logs'),
(N'Manage Glossary', N'glossary.manage', N'Glossary', N'Manage glossary terms'),
(N'Manage Announcements', N'announcements.manage', N'Announcements', N'Create announcements')
GO

-- =============================================
-- 3. ROLE PERMISSIONS
-- =============================================
DECLARE @AdminRoleId INT = (SELECT Id FROM Roles WHERE Name = 'Administrator')
DECLARE @CMRoleId INT = (SELECT Id FROM Roles WHERE Name = 'ContentManager')
DECLARE @EmpRoleId INT = (SELECT Id FROM Roles WHERE Name = 'Employee')

-- Admin gets all permissions
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT @AdminRoleId, Id FROM [dbo].[Permissions]
GO

-- Content Manager permissions
DECLARE @CMRoleId INT = (SELECT Id FROM Roles WHERE Name = 'ContentManager')
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT @CMRoleId, Id FROM [dbo].[Permissions] 
WHERE [Code] IN ('articles.view', 'articles.create', 'articles.edit', 'articles.delete',
                  'courses.view', 'courses.create', 'courses.edit', 'courses.delete',
                  'quizzes.view', 'quizzes.create', 'quizzes.edit', 'quizzes.delete',
                  'challenges.manage', 'glossary.manage', 'announcements.manage')
GO

-- Employee permissions
DECLARE @EmpRoleId INT = (SELECT Id FROM Roles WHERE Name = 'Employee')
INSERT INTO [dbo].[RolePermissions] ([RoleId], [PermissionId])
SELECT @EmpRoleId, Id FROM [dbo].[Permissions] 
WHERE [Code] IN ('articles.view', 'courses.view', 'quizzes.view')
GO

-- =============================================
-- 4. THEMES
-- =============================================
INSERT INTO [dbo].[Themes] ([Name], [Code], [PrimaryColor], [SecondaryColor], [AccentColor], [BackgroundColor], [TextColor], [IsDark], [IsDefault], [Description]) VALUES
(N'Modern Blue', N'modern-blue', N'#1E40AF', N'#3B82F6', N'#06B6D4', N'#F8FAFC', N'#0F172A', 0, 1, N'Professional modern blue theme for enterprise'),
(N'AI Dark', N'ai-dark', N'#7C3AED', N'#A855F7', N'#EC4899', N'#0F172A', N'#F1F5F9', 1, 0, N'Dark futuristic AI-inspired theme'),
(N'Digital Purple', N'digital-purple', N'#7C3AED', N'#C026D3', N'#F472B6', N'#FAF5FF', N'#1E1B4B', 0, 0, N'Vibrant digital transformation purple'),
(N'Corporate', N'corporate', N'#1F2937', N'#4B5563', N'#6B7280', N'#FFFFFF', N'#111827', 0, 0, N'Professional corporate gray theme'),
(N'Light Minimal', N'light-minimal', N'#0EA5E9', N'#22D3EE', N'#10B981', N'#FFFFFF', N'#0F172A', 0, 0, N'Clean minimal light theme'),
(N'Dark Mode', N'dark-mode', N'#3B82F6', N'#6366F1', N'#8B5CF6', N'#111827', N'#E5E7EB', 1, 0, N'Professional dark mode')
GO

-- =============================================
-- 5. LEVELS
-- =============================================
INSERT INTO [dbo].[Levels] ([LevelNumber], [Name], [Description], [PointsRequired], [Color], [IsActive]) VALUES
(1, N'AI Curious', N'Beginning your AI journey - exploring AI concepts', 0, N'#10B981', 1),
(2, N'AI Explorer', N'Actively learning about AI and digital transformation', 200, N'#3B82F6', 1),
(3, N'AI Practitioner', N'Applying AI knowledge in daily work', 600, N'#8B5CF6', 1),
(4, N'AI Innovator', N'Creating innovative AI solutions and sharing knowledge', 1500, N'#EC4899', 1),
(5, N'AI Champion', N'Mastering AI and leading digital transformation initiatives', 3000, N'#F59E0B', 1)
GO

-- =============================================
-- 6. CATEGORIES
-- =============================================
INSERT INTO [dbo].[Categories] ([Name], [Slug], [Description], [Icon], [Color], [DisplayOrder]) VALUES
(N'Artificial Intelligence', N'artificial-intelligence', N'Fundamentals of artificial intelligence', N'fa-brain', N'#8B5CF6', 1),
(N'Generative AI', N'generative-ai', N'AI that creates content - text, images, code', N'fa-magic', N'#EC4899', 2),
(N'Machine Learning', N'machine-learning', N'Algorithms that learn from data', N'fa-cogs', N'#3B82F6', 3),
(N'Deep Learning', N'deep-learning', N'Neural networks with multiple layers', N'fa-network-wired', N'#6366F1', 4),
(N'Large Language Models', N'llm', N'LLMs like GPT, Claude, Gemini', N'fa-language', N'#06B6D4', 5),
(N'Prompt Engineering', N'prompt-engineering', N'Crafting effective AI prompts', N'fa-comment-dots', N'#10B981', 6),
(N'AI Agents', N'ai-agents', N'Autonomous AI agents and workflows', N'fa-robot', N'#F59E0B', 7),
(N'Computer Vision', N'computer-vision', N'AI for images and videos', N'fa-eye', N'#EF4444', 8),
(N'Natural Language Processing', N'nlp', N'AI for text and language', N'fa-comments', N'#14B8A6', 9),
(N'AI Ethics', N'ai-ethics', N'Ethical considerations in AI', N'fa-balance-scale', N'#84CC16', 10),
(N'AI Security', N'ai-security', N'Security considerations in AI', N'fa-shield-alt', N'#DC2626', 11),
(N'Automation', N'automation', N'Workflow and process automation', N'fa-cog', N'#0EA5E9', 12),
(N'Data Analytics', N'data-analytics', N'Data-driven insights and analytics', N'fa-chart-line', N'#A855F7', 13),
(N'Digital Transformation', N'digital-transformation', N'Digital transformation strategies', N'fa-digital-tachograph', N'#1E40AF', 14),
(N'Future of Work', N'future-of-work', N'How AI is reshaping work', N'fa-briefcase', N'#F472B6', 15)
GO

-- =============================================
-- 7. TAGS
-- =============================================
INSERT INTO [dbo].[Tags] ([Name], [Slug]) VALUES
(N'Beginner', N'beginner'), (N'Intermediate', N'intermediate'), (N'Advanced', N'advanced'),
(N'Tutorial', N'tutorial'), (N'Guide', N'guide'), (N'Best Practices', N'best-practices'),
(N'ChatGPT', N'chatgpt'), (N'Claude', N'claude'), (N'Gemini', N'gemini'),
(N'Python', N'python'), (N'TensorFlow', N'tensorflow'), (N'PyTorch', N'pytorch'),
(N'Microsoft Copilot', N'copilot'), (N'OpenAI', N'openai'), (N'Anthropic', N'anthropic')
GO

-- =============================================
-- 8. USERS (Passwords are hashed versions)
-- Default password for all test users: "Admin123!" or "User123!"
-- Hash below is for "Admin123!" - all users use same password for simplicity
-- =============================================

-- Note: In production, password should be hashed using BCrypt or similar
-- For demo purposes, we'll use a placeholder hash that will be replaced by the app on first login
-- BCrypt hash of "Admin123!" with salt
DECLARE @DefaultPasswordHash NVARCHAR(500) = N'vvzme8l9mLtU+bqlazZk7a7+7LH//A+9JctZu4nYJT8='
DECLARE @DefaultSalt NVARCHAR(200) = N'somesaltvalue'

INSERT INTO [dbo].[Users] ([Username], [Email], [PasswordHash], [PasswordSalt], [FirstName], [LastName], [Department], [Position], [Location], [EmployeeId], [TotalPoints], [CurrentLevelId], [CurrentLevelPoints], [LearningStreak], [ThemeId], [IsActive], [IsEmailVerified], [CreatedDate]) VALUES
(N'admin', N'admin@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'System', N'Administrator', N'IT', N'System Administrator', N'Headquarters', N'EMP001', 2500, 4, 500, 30, 2, 1, 1, GETDATE()),
(N'cmgr', N'content.manager@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Sarah', N'Johnson', N'Marketing', N'Content Manager', N'New York', N'EMP002', 1800, 4, 300, 21, 1, 1, 1, GETDATE()),
(N'jdoe', N'john.doe@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'John', N'Doe', N'Engineering', N'Senior Software Engineer', N'San Francisco', N'EMP003', 1200, 3, 200, 14, 1, 1, 1, GETDATE()),
(N'asmith', N'alice.smith@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Alice', N'Smith', N'Data Science', N'Data Scientist', N'London', N'EMP004', 950, 3, 50, 10, 1, 1, 1, GETDATE()),
(N'brown', N'bob.brown@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Bob', N'Brown', N'HR', N'HR Specialist', N'Toronto', N'EMP005', 750, 3, 50, 7, 1, 1, 1, GETDATE()),
(N'clee', N'carol.lee@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Carol', N'Lee', N'Finance', N'Financial Analyst', N'Singapore', N'EMP006', 600, 3, 100, 5, 1, 1, 1, GETDATE()),
(N'dwilson', N'david.wilson@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'David', N'Wilson', N'Operations', N'Operations Manager', N'Berlin', N'EMP007', 450, 2, 250, 3, 1, 1, 1, GETDATE()),
(N'emartinez', N'emma.martinez@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Emma', N'Martinez', N'Sales', N'Sales Lead', N'Madrid', N'EMP008', 350, 2, 150, 2, 1, 1, 1, GETDATE()),
(N'fchen', N'frank.chen@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Frank', N'Chen', N'Product', N'Product Manager', N'Seattle', N'EMP009', 280, 2, 80, 1, 1, 1, 1, GETDATE()),
(N'gkim', N'grace.kim@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Grace', N'Kim', N'Design', N'UX Designer', N'Seoul', N'EMP010', 150, 1, 150, 0, 1, 1, 1, GETDATE()),
(N'hpatel', N'henry.patel@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Henry', N'Patel', N'IT', N'IT Support', N'Mumbai', N'EMP011', 80, 1, 80, 0, 1, 1, 1, GETDATE()),
(N'itoledo', N'iris.toledo@aiculturehub.com', @DefaultPasswordHash, @DefaultSalt, N'Iris', N'Toledo', N'Legal', N'Legal Counsel', N'Sydney', N'EMP012', 50, 1, 50, 0, 1, 1, 1, GETDATE())
GO

-- =============================================
-- 9. USER ROLES
-- =============================================
DECLARE @AdminId INT = (SELECT Id FROM Users WHERE Username = 'admin')
DECLARE @CMgrId INT = (SELECT Id FROM Users WHERE Username = 'cmgr')
DECLARE @AdminRoleId INT = (SELECT Id FROM Roles WHERE Name = 'Administrator')
DECLARE @CMRoleId INT = (SELECT Id FROM Roles WHERE Name = 'ContentManager')
DECLARE @EmpRoleId INT = (SELECT Id FROM Roles WHERE Name = 'Employee')

INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES
(@AdminId, @AdminRoleId),
(@AdminId, @EmpRoleId),
(@CMgrId, @CMRoleId),
(@CMgrId, @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'jdoe'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'asmith'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'brown'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'clee'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'dwilson'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'emartinez'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'fchen'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'gkim'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'hpatel'), @EmpRoleId),
((SELECT Id FROM Users WHERE Username = 'itoledo'), @EmpRoleId)
GO

-- =============================================
-- 10. USER LEVELS (initial level for each user)
-- =============================================
INSERT INTO [dbo].[UserLevels] ([UserId], [LevelId])
SELECT u.Id, l.Id FROM Users u CROSS JOIN Levels l WHERE l.LevelNumber = 1
GO

-- =============================================
-- 11. BADGES
-- =============================================
INSERT INTO [dbo].[Badges] ([Name], [Description], [IconUrl], [Color], [Criteria], [CriteriaType], [CriteriaValue], [Points], [IsActive]) VALUES
(N'AI Beginner', N'Completed your first AI lesson', NULL, N'#10B981', N'Complete 1 lesson', N'LessonsCompleted', 1, 25, 1),
(N'AI Explorer', N'Completed 5 AI lessons', NULL, N'#3B82F6', N'Complete 5 lessons', N'LessonsCompleted', 5, 50, 1),
(N'AI Practitioner', N'Completed 10 AI lessons', NULL, N'#8B5CF6', N'Complete 10 lessons', N'LessonsCompleted', 10, 100, 1),
(N'Quiz Master', N'Passed 5 quizzes', NULL, N'#F59E0B', N'Pass 5 quizzes', N'QuizzesPassed', 5, 75, 1),
(N'Challenge Master', N'Completed 10 daily challenges', NULL, N'#EC4899', N'Complete 10 challenges', N'ChallengesCompleted', 10, 75, 1),
(N'Course Champion', N'Completed 3 full courses', NULL, N'#06B6D4', N'Complete 3 courses', N'CoursesCompleted', 3, 150, 1),
(N'Knowledge Seeker', N'Read 10 articles', NULL, N'#14B8A6', N'Read 10 articles', N'ArticlesRead', 10, 50, 1),
(N'Learning Streak', N'7-day learning streak', NULL, N'#F472B6', N'Maintain 7-day streak', N'LearningStreak', 7, 100, 1),
(N'Digital Transformation Champion', N'Mastered all digital transformation content', NULL, N'#1E40AF', N'Complete digital transformation course', N'SpecialAchievement', 1, 200, 1),
(N'AI Innovator', N'Earned 1000+ total points', NULL, N'#DC2626', N'Earn 1000 points', N'TotalPoints', 1000, 150, 1)
GO

-- =============================================
-- 12. ARTICLES
-- =============================================
INSERT INTO [dbo].[Articles] ([Title], [Slug], [Summary], [Content], [CategoryId], [AuthorId], [ImageUrl], [ReadingTimeMinutes], [IsPublished], [IsFeatured], [PublishedDate], [Difficulty], [CreatedDate]) VALUES
(N'Introduction to Artificial Intelligence', N'introduction-to-ai', 
N'A comprehensive beginner-friendly introduction to AI concepts and applications.',
N'# Introduction to Artificial Intelligence

Artificial Intelligence (AI) is transforming every aspect of our work and daily lives. This comprehensive guide will help you understand the fundamental concepts of AI.

## What is AI?

Artificial Intelligence refers to computer systems that can perform tasks that typically require human intelligence. These tasks include:

- **Learning** from data and experience
- **Reasoning** and problem solving
- **Perception** through vision, speech, and language
- **Decision-making** under uncertainty

## Types of AI

### Narrow AI (Weak AI)
Designed to perform a specific task, such as voice assistants or image recognition systems.

### General AI (Strong AI)
A theoretical AI with human-level cognitive abilities across all domains.

### Superintelligent AI
An AI that surpasses human intelligence in all aspects.

## Key Concepts

1. **Machine Learning** - Algorithms that learn from data
2. **Neural Networks** - Brain-inspired computing models
3. **Deep Learning** - Multi-layer neural networks
4. **Natural Language Processing** - AI for text and language
5. **Computer Vision** - AI for images and videos

## Real-World Applications

AI is being used across industries:
- **Healthcare**: Diagnosis, drug discovery, patient care
- **Finance**: Fraud detection, algorithmic trading
- **Retail**: Recommendation systems, inventory management
- **Manufacturing**: Quality control, predictive maintenance
- **Education**: Personalized learning, automated grading

## Getting Started with AI

1. Learn the basics of mathematics (linear algebra, calculus, statistics)
2. Study programming (Python is most common)
3. Understand machine learning fundamentals
4. Practice with real datasets
5. Build projects and learn by doing

## Conclusion

AI is not just a technology - it is a new way of thinking about problems. Embrace the journey and start learning today!',
(SELECT Id FROM Categories WHERE Slug = 'artificial-intelligence'),
(SELECT Id FROM Users WHERE Username = 'cmgr'),
N'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
8, 1, 1, DATEADD(DAY, -30, GETDATE()), N'Beginner', GETDATE()),

(N'Generative AI: The Future of Content Creation', N'generative-ai-future',
N'Explore how generative AI is revolutionizing content creation across industries.',
N'# Generative AI: The Future of Content Creation

Generative AI represents one of the most significant technological advances of our time. This technology can create text, images, audio, video, and even code.

## What is Generative AI?

Generative AI refers to AI models that can generate new content based on patterns learned from training data. Unlike traditional AI that classifies or predicts, generative AI creates.

## Popular Generative AI Tools

### Text Generation
- **ChatGPT** by OpenAI
- **Claude** by Anthropic
- **Gemini** by Google
- **Microsoft Copilot**

### Image Generation
- **DALL-E** by OpenAI
- **Midjourney**
- **Stable Diffusion**
- **Adobe Firefly**

### Code Generation
- **GitHub Copilot**
- **Cursor**
- **Codeium**

## Use Cases in the Enterprise

1. **Marketing**: Blog posts, social media content, email campaigns
2. **Sales**: Personalized pitches, proposal generation
3. **Customer Service**: Intelligent chatbots, automated responses
4. **Product Development**: Feature ideation, requirement drafting
5. **HR**: Job descriptions, candidate screening

## Best Practices

- Always review AI-generated content
- Maintain brand voice consistency
- Use AI as a tool, not a replacement for human creativity
- Be transparent about AI use when appropriate
- Verify factual claims

## Ethical Considerations

- **Bias**: AI can perpetuate biases in training data
- **Privacy**: Be careful with sensitive information
- **Copyright**: Understand IP implications
- **Misinformation**: Prevent generation of false content

## Future Trends

- Multimodal AI (text + images + audio)
- More personalized and contextual AI
- AI agents that can take actions
- Improved reasoning capabilities',
(SELECT Id FROM Categories WHERE Slug = 'generative-ai'),
(SELECT Id FROM Users WHERE Username = 'cmgr'),
N'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
10, 1, 1, DATEADD(DAY, -25, GETDATE()), N'Beginner', GETDATE()),

(N'Prompt Engineering: Getting Better Results from AI', N'prompt-engineering-guide',
N'Master the art of crafting effective prompts for AI systems.',
N'# Prompt Engineering: Getting Better Results from AI

Prompt engineering is the skill of crafting inputs that get the best results from AI models. This guide covers the essential techniques.

## Why Prompt Engineering Matters

The quality of AI output depends heavily on the quality of your input. A well-crafted prompt can mean the difference between mediocre and excellent results.

## Core Principles

### 1. Be Clear and Specific
Instead of: "Write about AI"
Try: "Write a 300-word blog post about the impact of AI on small businesses, focusing on cost savings and productivity gains"

### 2. Provide Context
Help the AI understand the situation:
- Your audience
- Your goals
- Any constraints
- The desired format

### 3. Use Examples
Show the AI what you want:
"Write product descriptions in this style: [example]"

### 4. Specify the Format
- "Format as a table"
- "Use bullet points"
- "Write in 3 paragraphs"
- "Return JSON"

## Advanced Techniques

### Chain-of-Thought Prompting
Ask the AI to think step by step:
"Let''s think through this step by step..."

### Few-Shot Learning
Provide multiple examples:
"Here are three examples of the tone I want: [examples]"

### Role Prompting
Assign the AI a specific role:
"You are an experienced marketing copywriter..."

### Iterative Refinement
Start broad and refine:
1. First draft
2. "Make it more concise"
3. "Add specific examples"
4. "Adjust the tone to be more friendly"

## Common Mistakes

1. **Vague instructions** - leads to generic responses
2. **Too many requests** in one prompt - confuses the AI
3. **No format specification** - hard to use the output
4. **Ignoring context** - AI doesn''t know your specific situation
5. **Not iterating** - first attempt is rarely perfect

## Templates You Can Use

### Content Creation Template
"Write a [type] about [topic] for [audience]. The tone should be [tone]. Include [elements]. Length: [length]."

### Analysis Template
"Analyze [subject] considering [factors]. Present findings in [format]. Highlight [aspects]."

### Decision Support Template
"Compare [option A] vs [option B] for [use case]. Consider [criteria]. Recommend the better option with reasoning."',
(SELECT Id FROM Categories WHERE Slug = 'prompt-engineering'),
(SELECT Id FROM Users WHERE Username = 'jdoe'),
N'https://images.unsplash.com/photo-1676277791608-ac4a50fb5d76?w=800',
12, 1, 1, DATEADD(DAY, -20, GETDATE()), N'Intermediate', GETDATE()),

(N'Machine Learning Fundamentals for Business Users', N'ml-fundamentals-business',
N'Understand machine learning concepts without the technical jargon.',
N'# Machine Learning Fundamentals for Business Users

This guide explains machine learning concepts in plain language for non-technical audiences.

## What is Machine Learning?

Machine Learning (ML) is a subset of AI where computers learn from data instead of being explicitly programmed. Instead of writing rules, you provide examples and the system finds patterns.

## Types of Machine Learning

### Supervised Learning
The system learns from labeled examples (input + correct output).
- **Examples**: Email spam detection, image classification, sales forecasting

### Unsupervised Learning
The system finds patterns in data without labeled examples.
- **Examples**: Customer segmentation, anomaly detection, recommendation systems

### Reinforcement Learning
The system learns by trial and error, receiving rewards or penalties.
- **Examples**: Game playing, robotics, dynamic pricing

## How Machine Learning Works

1. **Collect Data**: Gather relevant historical data
2. **Prepare Data**: Clean and organize it
3. **Choose Algorithm**: Select appropriate ML technique
4. **Train Model**: Let the algorithm find patterns
5. **Evaluate**: Test on new data
6. **Deploy**: Use in production
7. **Monitor**: Track performance over time

## Common Business Applications

### Customer Analytics
- Churn prediction
- Customer lifetime value
- Next best action recommendations

### Operations
- Demand forecasting
- Predictive maintenance
- Quality control

### Finance
- Credit scoring
- Fraud detection
- Risk assessment

### Marketing
- Campaign optimization
- Personalization
- Lead scoring

## Key Concepts to Know

- **Accuracy**: How often the model is correct
- **Precision vs Recall**: Different ways to measure performance
- **Overfitting**: When a model is too specific to training data
- **Bias**: Systematic errors in predictions
- **Features**: The input variables used for predictions

## Working with Data Scientists

1. **Define the problem** clearly
2. **Identify available data** and data sources
3. **Set success metrics** in business terms
4. **Plan for iteration** - models improve over time
5. **Consider ethical implications**

## Getting Started

- Take online courses (Coursera, edX, Udemy)
- Read case studies in your industry
- Attend AI/ML conferences
- Experiment with no-code ML tools
- Build a culture of data-driven decisions',
(SELECT Id FROM Categories WHERE Slug = 'machine-learning'),
(SELECT Id FROM Users WHERE Username = 'asmith'),
N'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
15, 1, 1, DATEADD(DAY, -18, GETDATE()), N'Beginner', GETDATE()),

(N'AI Ethics: Building Responsible AI Systems', N'ai-ethics-guide',
N'A guide to understanding ethical considerations when implementing AI.',
N'# AI Ethics: Building Responsible AI Systems

As AI becomes more powerful and pervasive, ethical considerations are paramount.

## Core Ethical Principles

### 1. Fairness
AI systems should treat all people equitably and avoid discrimination.

### 2. Transparency
AI decisions should be explainable and understandable.

### 3. Privacy
User data must be protected and used responsibly.

### 4. Accountability
Clear ownership of AI outcomes is essential.

### 5. Safety
AI systems must be reliable and secure.

## Common Ethical Issues

### Bias and Discrimination
AI can perpetuate or amplify biases in training data:
- Hiring algorithms discriminating against certain groups
- Facial recognition performing poorly on certain demographics
- Loan approval systems with embedded bias

### Privacy Concerns
- Collection of personal data
- Surveillance capabilities
- Data breaches
- Consent and control

### Job Displacement
- Automation of routine tasks
- Need for reskilling
- Economic inequality
- New job creation

### Misinformation
- Deepfakes
- AI-generated fake content
- Manipulation at scale

## Building Ethical AI

### At the Design Stage
- Diverse development teams
- Ethics review boards
- Stakeholder consultation
- Bias audits

### At the Implementation Stage
- Fairness testing
- Privacy by design
- Security measures
- Human oversight

### At the Deployment Stage
- Continuous monitoring
- User feedback channels
- Incident response plans
- Regular audits

## Regulatory Landscape

- **EU AI Act**: Comprehensive AI regulation
- **GDPR**: Data protection requirements
- **Industry-specific**: Healthcare (HIPAA), Finance, etc.
- **Company policies**: Internal AI guidelines

## Practical Steps

1. Establish an AI ethics committee
2. Create clear AI usage policies
3. Train employees on AI ethics
4. Document AI decisions
5. Regular audits and reviews
6. Engage with stakeholders

## Conclusion

Ethical AI is not just about compliance - it''s about building systems that benefit everyone while minimizing harm.',
(SELECT Id FROM Categories WHERE Slug = 'ai-ethics'),
(SELECT Id FROM Users WHERE Username = 'cmgr'),
N'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
10, 1, 1, DATEADD(DAY, -15, GETDATE()), N'Intermediate', GETDATE()),

(N'Digital Transformation Strategy for Modern Organizations', N'digital-transformation-strategy',
N'A comprehensive guide to leading digital transformation in your organization.',
N'# Digital Transformation Strategy for Modern Organizations

Digital transformation is the integration of digital technology into all areas of business, fundamentally changing how you operate and deliver value.

## What is Digital Transformation?

Digital transformation goes beyond just adopting new technology. It involves:
- Cultural change
- Process optimization
- New business models
- Customer experience improvements
- Data-driven decision making

## Key Pillars

### 1. Technology
- Cloud computing
- AI and ML
- IoT
- Blockchain
- 5G networks

### 2. Data
- Data strategy
- Analytics
- Business intelligence
- Data governance

### 3. People
- Digital skills
- Change management
- Leadership buy-in
- New ways of working

### 4. Process
- Automation
- Agile methodologies
- DevOps practices
- Continuous improvement

## Common Challenges

1. **Resistance to change** - employees fear the unknown
2. **Legacy systems** - old technology is hard to replace
3. **Skill gaps** - need for new digital skills
4. **Budget constraints** - transformation requires investment
5. **Lack of vision** - unclear strategy leads to failure

## Success Factors

### Leadership
- Strong executive sponsorship
- Clear vision and strategy
- Willingness to take risks

### Culture
- Experimentation encouraged
- Failure is learning
- Continuous learning

### Customer Focus
- Start with customer needs
- Iterate based on feedback
- Measure satisfaction

## Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Assess current state
- Define vision
- Build the team
- Quick wins

### Phase 2: Experimentation (Months 4-9)
- Pilot projects
- Learn and adjust
- Build capabilities
- Share successes

### Phase 3: Scaling (Months 10-18)
- Scale successful pilots
- Standardize practices
- Broader rollout
- Measure impact

### Phase 4: Optimization (Months 19+)
- Continuous improvement
- Innovation
- New opportunities
- Sustainable change

## Measuring Success

### Business Metrics
- Revenue growth
- Cost reduction
- Customer satisfaction
- Employee productivity

### Digital Metrics
- Digital adoption rate
- Process automation %
- Data utilization
- Innovation pipeline

## Conclusion

Digital transformation is a journey, not a destination. Start small, learn fast, and scale what works.',
(SELECT Id FROM Categories WHERE Slug = 'digital-transformation'),
(SELECT Id FROM Users WHERE Username = 'cmgr'),
N'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
14, 1, 1, DATEADD(DAY, -10, GETDATE()), N'Intermediate', GETDATE()),

(N'Understanding Large Language Models (LLMs)', N'understanding-llms',
N'A business-friendly explanation of how large language models work.',
N'# Understanding Large Language Models (LLMs)

Large Language Models have taken the world by storm. Here''s what they are and how they work.

## What are LLMs?

LLMs are AI models trained on massive amounts of text data to understand and generate human language. Examples include GPT-4, Claude, and Gemini.

## How Do They Work?

### Training Process
1. **Data Collection**: Billions of web pages, books, articles
2. **Pre-training**: Learning language patterns
3. **Fine-tuning**: Specializing for specific tasks
4. **RLHF**: Learning from human feedback

### Key Concepts
- **Tokens**: Pieces of text (words or subwords)
- **Context Window**: How much text the model can consider at once
- **Parameters**: The model''s learned knowledge (billions of numbers)
- **Embeddings**: Numerical representations of meaning

## Capabilities

### What LLMs Can Do
- Answer questions
- Write and edit content
- Translate languages
- Summarize documents
- Generate code
- Brainstorm ideas
- Analyze data

### Limitations
- May generate incorrect information
- No real-time knowledge
- Can''t take actions in the real world
- May have biases
- Expensive to run

## Enterprise Applications

### Productivity
- Email drafting
- Document summarization
- Meeting notes
- Research assistance

### Customer Service
- Intelligent chatbots
- Ticket routing
- Response suggestions
- Knowledge base queries

### Sales & Marketing
- Content creation
- Personalization
- Market analysis
- Competitive research

### Software Development
- Code generation
- Bug fixing
- Code review
- Documentation

## Best Practices for LLM Use

1. **Verify outputs** - always review for accuracy
2. **Be specific** - better prompts = better results
3. **Provide context** - help the AI understand
4. **Iterate** - refine through multiple attempts
5. **Use the right model** - match capability to task
6. **Consider costs** - larger models are more expensive

## Future of LLMs

- **Multimodal**: Text + images + audio + video
- **Agentic**: AI that can take actions
- **More efficient**: Smaller, faster models
- **Better reasoning**: Improved logical thinking
- **Personalized**: Custom models for specific uses',
(SELECT Id FROM Categories WHERE Slug = 'llm'),
(SELECT Id FROM Users WHERE Username = 'jdoe'),
N'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
12, 1, 1, DATEADD(DAY, -8, GETDATE()), N'Intermediate', GETDATE()),

(N'AI in the Workplace: Boosting Productivity', N'ai-workplace-productivity',
N'Practical ways to use AI to enhance productivity in your daily work.',
N'# AI in the Workplace: Boosting Productivity

AI tools can dramatically boost your productivity. Here''s how to use them effectively.

## Communication

### Email
- Draft responses quickly
- Summarize long email threads
- Adjust tone (formal, friendly, concise)
- Translate messages

### Meetings
- Automated transcription
- Smart summaries
- Action item extraction
- Follow-up email generation

## Content Creation

### Writing
- First drafts of articles
- Editing and proofreading
- Style improvements
- Headline suggestions

### Presentations
- Outline generation
- Slide content suggestions
- Visual recommendations
- Speaker notes

## Data Analysis

### Spreadsheets
- Formula generation
- Data cleaning suggestions
- Pattern detection
- Visualization recommendations

### Reports
- Automatic insights
- Trend analysis
- Anomaly detection
- Executive summaries

## Research

### Market Research
- Competitor analysis
- Industry trends
- Customer sentiment
- Market sizing

### Technical Research
- Code examples
- Documentation lookup
- Best practices
- Troubleshooting

## Task Management

### Planning
- Task breakdown
- Time estimates
- Priority suggestions
- Schedule optimization

### Automation
- Repetitive task identification
- Workflow suggestions
- Tool recommendations
- Integration opportunities

## Top AI Tools for Productivity

### General AI Assistants
- ChatGPT
- Microsoft Copilot
- Google Gemini
- Claude

### Specialized Tools
- Grammarly (writing)
- Otter.ai (meetings)
- Notion AI (documents)
- Canva AI (design)

## Best Practices

1. **Start small** - pick one task to improve
2. **Learn prompting** - good input = good output
3. **Verify everything** - AI can make mistakes
4. **Combine tools** - use multiple AI tools together
5. **Stay updated** - AI capabilities evolve rapidly

## Common Mistakes

1. **Over-relying on AI** - still need human judgment
2. **Not verifying** - always check important work
3. **Ignoring privacy** - be careful with sensitive data
4. **Using AI for everything** - some tasks need human touch
5. **Not learning** - invest time in improving skills

## Building AI Habits

1. Identify your most time-consuming tasks
2. Research which AI tools could help
3. Experiment with different approaches
4. Measure time saved and quality
5. Share learnings with your team
6. Continuously refine your approach',
(SELECT Id FROM Categories WHERE Slug = 'future-of-work'),
(SELECT Id FROM Users WHERE Username = 'asmith'),
N'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800',
10, 1, 1, DATEADD(DAY, -5, GETDATE()), N'Beginner', GETDATE())
GO

-- =============================================
-- 13. COURSES
-- =============================================
INSERT INTO [dbo].[Courses] ([Title], [Slug], [Description], [ShortDescription], [ThumbnailUrl], [Difficulty], [EstimatedDurationMinutes], [Points], [CategoryId], [CreatedBy], [IsPublished], [IsFeatured], [DisplayOrder]) VALUES
(N'AI Fundamentals', N'ai-fundamentals',
N'Learn the basics of artificial intelligence, machine learning, and how AI is transforming businesses. Perfect for beginners who want to understand AI without deep technical knowledge.',
N'Start your AI journey with fundamental concepts',
N'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
N'Beginner',
240, 150,
(SELECT Id FROM Categories WHERE Slug = 'artificial-intelligence'),
(SELECT Id FROM Users WHERE Username = 'cmgr'), 1, 1, 1),

(N'Generative AI for Employees', N'generative-ai-employees',
N'Master the practical use of generative AI tools like ChatGPT, Claude, and Microsoft Copilot in your daily work. Learn to write effective prompts and integrate AI into your workflow.',
N'Practical guide to using generative AI tools',
N'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
N'Beginner',
180, 130,
(SELECT Id FROM Categories WHERE Slug = 'generative-ai'),
(SELECT Id FROM Users WHERE Username = 'cmgr'), 1, 1, 2),

(N'Prompt Engineering Masterclass', N'prompt-engineering-masterclass',
N'Become an expert at crafting effective prompts that get the best results from AI systems. Learn advanced techniques used by AI power users.',
N'Master the art of prompt engineering',
N'https://images.unsplash.com/photo-1676277791608-ac4a50fb5d76?w=800',
N'Intermediate',
150, 120,
(SELECT Id FROM Categories WHERE Slug = 'prompt-engineering'),
(SELECT Id FROM Users WHERE Username = 'jdoe'), 1, 1, 3),

(N'AI Tools for Productivity', N'ai-tools-productivity',
N'Discover the best AI tools to boost your productivity at work. From writing assistants to meeting transcribers, learn what tools exist and how to use them effectively.',
N'Boost productivity with AI tools',
N'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800',
N'Beginner',
120, 100,
(SELECT Id FROM Categories WHERE Slug = 'future-of-work'),
(SELECT Id FROM Users WHERE Username = 'cmgr'), 1, 1, 4),

(N'AI and Digital Transformation', N'ai-digital-transformation',
N'Understand how AI is driving digital transformation across industries. Learn to identify opportunities, build business cases, and lead transformation initiatives.',
N'Lead digital transformation with AI',
N'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
N'Intermediate',
200, 140,
(SELECT Id FROM Categories WHERE Slug = 'digital-transformation'),
(SELECT Id FROM Users WHERE Username = 'cmgr'), 1, 1, 5)
GO

-- =============================================
-- 14. LESSONS
-- =============================================
-- AI Fundamentals Lessons
INSERT INTO [dbo].[Lessons] ([CourseId], [Title], [Description], [Content], [OrderIndex], [EstimatedDurationMinutes], [Points]) VALUES
((SELECT Id FROM Courses WHERE Slug = 'ai-fundamentals'), N'What is AI?', N'Introduction to artificial intelligence concepts', N'# What is AI?\n\nArtificial Intelligence is the simulation of human intelligence in machines...', 1, 15, 15),
((SELECT Id FROM Courses WHERE Slug = 'ai-fundamentals'), N'History of AI', N'From Turing to modern AI', N'# History of AI\n\nThe journey of AI from 1950 to today...', 2, 15, 15),
((SELECT Id FROM Courses WHERE Slug = 'ai-fundamentals'), N'Types of AI', N'Narrow, General, and Super AI', N'# Types of AI\n\nDifferent categories of AI systems...', 3, 20, 20),
((SELECT Id FROM Courses WHERE Slug = 'ai-fundamentals'), N'Machine Learning Basics', N'Introduction to ML', N'# Machine Learning Basics\n\nHow machines learn from data...', 4, 20, 20),
((SELECT Id FROM Courses WHERE Slug = 'ai-fundamentals'), N'AI in Business', N'Real-world business applications', N'# AI in Business\n\nHow companies are using AI...', 5, 25, 25),

-- Generative AI for Employees Lessons
((SELECT Id FROM Courses WHERE Slug = 'generative-ai-employees'), N'Introduction to Gen AI', N'What is generative AI?', N'# Introduction to Gen AI\n\nGenerative AI creates new content...', 1, 15, 15),
((SELECT Id FROM Courses WHERE Slug = 'generative-ai-employees'), N'ChatGPT Basics', N'Getting started with ChatGPT', N'# ChatGPT Basics\n\nYour first conversation with AI...', 2, 20, 20),
((SELECT Id FROM Courses WHERE Slug = 'generative-ai-employees'), N'Using AI for Writing', N'AI writing assistant techniques', N'# Using AI for Writing\n\nDrafting emails, reports, and more...', 3, 25, 25),
((SELECT Id FROM Courses WHERE Slug = 'generative-ai-employees'), N'AI for Research', N'Using AI to research topics', N'# AI for Research\n\nResearch assistance with AI...', 4, 20, 20),
((SELECT Id FROM Courses WHERE Slug = 'generative-ai-employees'), N'AI Ethics in Practice', N'Ethical AI usage', N'# AI Ethics in Practice\n\nUsing AI responsibly...', 5, 20, 20),

-- Prompt Engineering Lessons
((SELECT Id FROM Courses WHERE Slug = 'prompt-engineering-masterclass'), N'Prompt Fundamentals', N'Basic prompt structure', N'# Prompt Fundamentals\n\nThe building blocks of good prompts...', 1, 15, 15),
((SELECT Id FROM Courses WHERE Slug = 'prompt-engineering-masterclass'), N'Advanced Techniques', N'Chain-of-thought and more', N'# Advanced Techniques\n\nAdvanced prompting strategies...', 2, 25, 25),
((SELECT Id FROM Courses WHERE Slug = 'prompt-engineering-masterclass'), N'Few-Shot Learning', N'Using examples effectively', N'# Few-Shot Learning\n\nTeaching AI by example...', 3, 20, 20),
((SELECT Id FROM Courses WHERE Slug = 'prompt-engineering-masterclass'), N'Role Prompting', N'Assigning roles to AI', N'# Role Prompting\n\nLeveraging AI personas...', 4, 15, 15),

-- AI Tools for Productivity Lessons
((SELECT Id FROM Courses WHERE Slug = 'ai-tools-productivity'), N'AI Assistants Overview', N'Major AI assistants compared', N'# AI Assistants Overview\n\nComparing ChatGPT, Copilot, Claude...', 1, 15, 15),
((SELECT Id FROM Courses WHERE Slug = 'ai-tools-productivity'), N'Writing Assistants', N'AI for better writing', N'# Writing Assistants\n\nGrammarly, Notion AI, and more...', 2, 20, 20),
((SELECT Id FROM Courses WHERE Slug = 'ai-tools-productivity'), N'Meeting AI Tools', N'Transcription and summaries', N'# Meeting AI Tools\n\nOtter.ai, Fireflies, and more...', 3, 15, 15),

-- AI and Digital Transformation Lessons
((SELECT Id FROM Courses WHERE Slug = 'ai-digital-transformation'), N'Digital Transformation Basics', N'Understanding transformation', N'# Digital Transformation Basics\n\nWhat digital transformation really means...', 1, 20, 20),
((SELECT Id FROM Courses WHERE Slug = 'ai-digital-transformation'), N'AI Strategy', N'Building an AI strategy', N'# AI Strategy\n\nHow to plan AI adoption...', 2, 25, 25),
((SELECT Id FROM Courses WHERE Slug = 'ai-digital-transformation'), N'Implementation', N'Putting AI into practice', N'# Implementation\n\nFrom strategy to execution...', 3, 25, 25)
GO

-- =============================================
-- 15. QUIZZES
-- =============================================
INSERT INTO [dbo].[Quizzes] ([Title], [Description], [CategoryId], [Difficulty], [TimeLimit], [PassingScore], [Points], [IsPublished], [CreatedBy]) VALUES
(N'AI Fundamentals Quiz', N'Test your knowledge of AI basics', (SELECT Id FROM Categories WHERE Slug = 'artificial-intelligence'), N'Beginner', 15, 70, 50, 1, (SELECT Id FROM Users WHERE Username = 'cmgr')),
(N'Generative AI Quiz', N'Test your generative AI knowledge', (SELECT Id FROM Categories WHERE Slug = 'generative-ai'), N'Beginner', 15, 70, 50, 1, (SELECT Id FROM Users WHERE Username = 'cmgr')),
(N'Prompt Engineering Quiz', N'Advanced prompt engineering test', (SELECT Id FROM Categories WHERE Slug = 'prompt-engineering'), N'Intermediate', 20, 75, 60, 1, (SELECT Id FROM Users WHERE Username = 'jdoe')),
(N'Machine Learning Quiz', N'Test your ML knowledge', (SELECT Id FROM Categories WHERE Slug = 'machine-learning'), N'Intermediate', 20, 75, 60, 1, (SELECT Id FROM Users WHERE Username = 'asmith')),
(N'AI Ethics Quiz', N'Test your ethics knowledge', (SELECT Id FROM Categories WHERE Slug = 'ai-ethics'), N'Beginner', 15, 70, 50, 1, (SELECT Id FROM Users WHERE Username = 'cmgr'))
GO

-- =============================================
-- 16. QUESTIONS
-- =============================================
-- Quiz 1: AI Fundamentals
DECLARE @Q1 INT
INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Fundamentals Quiz'), N'What does AI stand for?', N'MultipleChoice', N'AI stands for Artificial Intelligence - the simulation of human intelligence in machines.', 10, 1)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Automated Intelligence', 0, 1),
(@Q1, N'Artificial Intelligence', 1, 2),
(@Q1, N'Advanced Information', 0, 3),
(@Q1, N'Algorithmic Integration', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Fundamentals Quiz'), N'Machine Learning is a subset of AI.', N'TrueFalse', N'Machine Learning is indeed a subset of Artificial Intelligence.', 10, 2)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'True', 1, 1),
(@Q1, N'False', 0, 2)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Fundamentals Quiz'), N'Which of the following are types of AI? (Select all that apply)', N'MultipleAnswer', N'Narrow AI, General AI, and Superintelligent AI are the three main types.', 10, 3)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Narrow AI', 1, 1),
(@Q1, N'General AI', 1, 2),
(@Q1, N'Super AI', 1, 3),
(@Q1, N'Quantum AI', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Fundamentals Quiz'), N'What is the main purpose of neural networks?', N'MultipleChoice', N'Neural networks are designed to recognize patterns, inspired by the human brain.', 10, 4)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Database management', 0, 1),
(@Q1, N'Pattern recognition', 1, 2),
(@Q1, N'Web development', 0, 3),
(@Q1, N'Email processing', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Fundamentals Quiz'), N'Which company created ChatGPT?', N'MultipleChoice', N'ChatGPT was created by OpenAI.', 10, 5)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Google', 0, 1),
(@Q1, N'Microsoft', 0, 2),
(@Q1, N'OpenAI', 1, 3),
(@Q1, N'Anthropic', 0, 4)

-- Quiz 2: Generative AI
INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Generative AI Quiz'), N'Which of these are generative AI tools? (Select all that apply)', N'MultipleAnswer', N'ChatGPT, DALL-E, and Midjourney are all generative AI tools.', 10, 1)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'ChatGPT', 1, 1),
(@Q1, N'DALL-E', 1, 2),
(@Q1, N'Midjourney', 1, 3),
(@Q1, N'Excel', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Generative AI Quiz'), N'Generative AI can only create text content.', N'TrueFalse', N'Generative AI can create text, images, audio, video, code, and more.', 10, 2)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'True', 0, 1),
(@Q1, N'False', 1, 2)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Generative AI Quiz'), N'What is the best practice when using AI-generated content?', N'MultipleChoice', N'You should always review and verify AI-generated content before using it.', 10, 3)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Use it without changes', 0, 1),
(@Q1, N'Review and verify before use', 1, 2),
(@Q1, N'Share immediately', 0, 3),
(@Q1, N'Never use it', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Generative AI Quiz'), N'Which AI model is made by Anthropic?', N'MultipleChoice', N'Claude is the AI model developed by Anthropic.', 10, 4)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'GPT', 0, 1),
(@Q1, N'Claude', 1, 2),
(@Q1, N'Gemini', 0, 3),
(@Q1, N'Llama', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Generative AI Quiz'), N'Microsoft Copilot is an AI assistant.', N'TrueFalse', N'Microsoft Copilot is indeed an AI-powered assistant integrated into Microsoft products.', 10, 5)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'True', 1, 1),
(@Q1, N'False', 0, 2)

-- Quiz 3: Prompt Engineering
INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Prompt Engineering Quiz'), N'Which is a better prompt?', N'MultipleChoice', N'Specific, clear prompts with context get better results from AI.', 10, 1)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Write about AI', 0, 1),
(@Q1, N'Write a 500-word blog post about AI in healthcare for medical professionals, focusing on diagnosis and treatment', 1, 2)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Prompt Engineering Quiz'), N'Chain-of-thought prompting helps AI solve complex problems.', N'TrueFalse', N'Chain-of-thought prompting is a proven technique for improving AI reasoning on complex tasks.', 10, 2)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'True', 1, 1),
(@Q1, N'False', 0, 2)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Prompt Engineering Quiz'), N'Which techniques improve prompt effectiveness? (Select all that apply)', N'MultipleAnswer', N'All of these techniques help improve AI responses.', 10, 3)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Being specific', 1, 1),
(@Q1, N'Providing examples', 1, 2),
(@Q1, N'Using role prompting', 1, 3),
(@Q1, N'Using random words', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Prompt Engineering Quiz'), N'What is few-shot prompting?', N'MultipleChoice', N'Few-shot prompting involves providing examples to guide the AI''s responses.', 10, 4)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Using few words', 0, 1),
(@Q1, N'Providing a few examples', 1, 2),
(@Q1, N'Making few requests', 0, 3),
(@Q1, N'Sending few messages', 0, 4)

-- Quiz 4: Machine Learning
INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Machine Learning Quiz'), N'Supervised learning requires labeled data.', N'TrueFalse', N'Supervised learning algorithms learn from labeled training data.', 10, 1)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'True', 1, 1),
(@Q1, N'False', 0, 2)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Machine Learning Quiz'), N'What is overfitting?', N'MultipleChoice', N'Overfitting occurs when a model is too specific to training data and performs poorly on new data.', 10, 2)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Model is too simple', 0, 1),
(@Q1, N'Model is too specific to training data', 1, 2),
(@Q1, N'Model runs too fast', 0, 3),
(@Q1, N'Model is too small', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'Machine Learning Quiz'), N'Which are types of machine learning? (Select all that apply)', N'MultipleAnswer', N'Supervised, unsupervised, and reinforcement learning are the three main types.', 10, 3)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Supervised', 1, 1),
(@Q1, N'Unsupervised', 1, 2),
(@Q1, N'Reinforcement', 1, 3),
(@Q1, N'Random', 0, 4)

-- Quiz 5: AI Ethics
INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Ethics Quiz'), N'AI bias is not a real concern in modern AI systems.', N'TrueFalse', N'AI bias is a major ethical concern as AI systems can perpetuate societal biases.', 10, 1)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'True', 0, 1),
(@Q1, N'False', 1, 2)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Ethics Quiz'), N'Which are core AI ethics principles? (Select all that apply)', N'MultipleAnswer', N'Fairness, transparency, privacy, accountability, and safety are core principles.', 10, 2)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Fairness', 1, 1),
(@Q1, N'Transparency', 1, 2),
(@Q1, N'Privacy', 1, 3),
(@Q1, N'Speed', 0, 4)

INSERT INTO [dbo].[Questions] ([QuizId], [QuestionText], [QuestionType], [Explanation], [Points], [OrderIndex]) VALUES
((SELECT Id FROM Quizzes WHERE Title = 'AI Ethics Quiz'), N'GDPR is related to:', N'MultipleChoice', N'GDPR is the EU General Data Protection Regulation, focused on data privacy.', 10, 3)
SET @Q1 = SCOPE_IDENTITY()
INSERT INTO [dbo].[Answers] ([QuestionId], [AnswerText], [IsCorrect], [OrderIndex]) VALUES
(@Q1, N'Data protection', 1, 1),
(@Q1, N'Tax compliance', 0, 2),
(@Q1, N'Trade agreements', 0, 3),
(@Q1, N'Travel documents', 0, 4)
GO

-- Update QuestionCount for quizzes
UPDATE [dbo].[Quizzes] SET [QuestionCount] = (SELECT COUNT(*) FROM [dbo].[Questions] WHERE QuizId = [dbo].[Quizzes].Id)
GO

-- =============================================
-- 17. CHALLENGES
-- =============================================
INSERT INTO [dbo].[Challenges] ([Title], [Description], [ChallengeType], [QuestionText], [CorrectAnswer], [Options], [Explanation], [Points], [Difficulty], [CategoryId], [ActiveDate], [IsActive], [CreatedBy]) VALUES
(N'Daily AI Challenge - Day 1', N'Test your daily AI knowledge', N'Daily', N'Which AI technology is most suitable for generating a summary of a long document?', N'LLM', N'["LLM", "CNN", "RNN"]', N'Large Language Models (LLMs) like GPT and Claude are specifically designed to understand and summarize long text documents.', 25, N'Beginner', (SELECT Id FROM Categories WHERE Slug = 'llm'), CAST(GETDATE() AS DATE), 1, (SELECT Id FROM Users WHERE Username = 'cmgr')),

(N'Daily AI Challenge - Day 2', N'Test your prompt engineering', N'Daily', N'What is the technique called when you ask an AI to think step by step?', N'Chain-of-Thought', N'["Chain-of-Thought", "Random", "Fast-Forward"]', N'Chain-of-Thought prompting is a technique where you ask the AI to work through problems step by step.', 25, N'Beginner', (SELECT Id FROM Categories WHERE Slug = 'prompt-engineering'), CAST(GETDATE() AS DATE), 1, (SELECT Id FROM Users WHERE Username = 'cmgr')),

(N'Daily AI Challenge - Day 3', N'Machine learning basics', N'Daily', N'Which type of machine learning uses labeled training data?', N'Supervised Learning', N'["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"]', N'Supervised learning algorithms learn from labeled training data to make predictions.', 25, N'Beginner', (SELECT Id FROM Categories WHERE Slug = 'machine-learning'), CAST(GETDATE() AS DATE), 1, (SELECT Id FROM Users WHERE Username = 'cmgr'))
GO

-- =============================================
-- 18. GLOSSARY
-- =============================================
INSERT INTO [dbo].[Glossary] ([Term], [Slug], [Definition], [ExtendedDescription], [Category], [Examples], [IsActive]) VALUES
(N'Artificial Intelligence', N'ai', N'The simulation of human intelligence in machines that are programmed to think and learn.', N'AI encompasses many subfields including machine learning, natural language processing, and computer vision. AI systems can perform tasks that typically require human intelligence.', N'Core Concepts', N'Speech recognition, image classification, autonomous vehicles', 1),
(N'Machine Learning', N'ml', N'A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.', N'ML algorithms build mathematical models based on sample data (training data) to make predictions or decisions.', N'Core Concepts', N'Spam detection, recommendation systems, fraud detection', 1),
(N'Deep Learning', N'deep-learning', N'A subset of machine learning that uses multi-layered neural networks to progressively extract higher-level features from raw input.', N'Deep learning has revolutionized computer vision, NLP, and speech recognition.', N'Core Concepts', N'Image recognition, voice assistants, language translation', 1),
(N'Generative AI', N'generative-ai', N'AI that can create new content, including text, images, audio, and code, based on patterns learned from training data.', N'Generative AI models learn the patterns and structure of their input training data and then generate new data that has similar characteristics.', N'Core Concepts', N'ChatGPT, DALL-E, Midjourney', 1),
(N'Prompt', N'prompt', N'The input or instruction given to an AI model to elicit a response.', N'A well-crafted prompt is essential for getting useful outputs from AI models. Prompts can be questions, statements, or detailed instructions.', N'AI Interaction', N'"Translate this text to French", "Write a poem about autumn"', 1),
(N'LLM', N'llm', N'Large Language Model - a type of AI model trained on massive amounts of text data to understand and generate human language.', N'LLMs use transformer architecture and have billions of parameters. Examples include GPT-4, Claude, and Gemini.', N'Core Concepts', N'GPT-4, Claude 3, Gemini Pro, Llama 2', 1),
(N'AI Agent', N'ai-agent', N'An AI system that can autonomously take actions and make decisions to achieve specific goals.', N'AI agents can use tools, access information, and perform multi-step tasks with minimal human intervention.', N'Advanced Concepts', N'Customer service bots, workflow automation, research agents', 1),
(N'Neural Network', N'neural-network', N'A computing system inspired by biological neural networks in the human brain.', N'Neural networks consist of layers of interconnected nodes (neurons) that process information using connectionist approaches to computation.', N'Core Concepts', N'Image classification, speech recognition, game playing', 1),
(N'Computer Vision', N'computer-vision', N'A field of AI that enables machines to interpret and understand visual information from images and videos.', N'Computer vision tasks include object detection, facial recognition, and image segmentation.', N'Core Concepts', N'Face ID, autonomous vehicles, medical imaging', 1),
(N'NLP', N'nlp', N'Natural Language Processing - a branch of AI focused on the interaction between computers and human language.', N'NLP helps computers understand, interpret, and generate human language in valuable ways.', N'Core Concepts', N'Language translation, sentiment analysis, chatbots', 1),
(N'Automation', N'automation', N'The use of technology to perform tasks with minimal human intervention.', N'AI-powered automation can handle complex, variable tasks that previously required human judgment.', N'Applications', N'Workflow automation, RPA, intelligent document processing', 1),
(N'Token', N'token', N'A unit of text that an AI model processes, typically a word or subword.', N'LLMs break text into tokens to process and generate language. Token limits affect how much text can be processed at once.', N'AI Interaction', N'GPT-4 has a context window of 8K or 128K tokens', 1),
(N'Training Data', N'training-data', N'The dataset used to train a machine learning model.', N'Quality and quantity of training data directly impact model performance.', N'ML Concepts', N'Image datasets, text corpora, user behavior logs', 1),
(N'Fine-tuning', N'fine-tuning', N'The process of further training a pre-trained model on a specific dataset to adapt it for a particular task.', N'Fine-tuning allows leveraging general AI capabilities while specializing for specific use cases.', N'ML Concepts', N'Custom GPT models, domain-specific chatbots', 1),
(N'Embedding', N'embedding', N'A numerical representation of data (like words or images) in a continuous vector space.', N'Embeddings capture semantic meaning and enable similarity comparisons.', N'ML Concepts', N'Word embeddings, image embeddings, document embeddings', 1)
GO

-- =============================================
-- 19. ANNOUNCEMENTS
-- =============================================
INSERT INTO [dbo].[Announcements] ([Title], [Content], [Summary], [Priority], [StartDate], [IsPublished], [CreatedBy]) VALUES
(N'Welcome to AI Culture Hub!', N'We are excited to launch the AI Culture & Digital Transformation Hub. This platform is designed to help you learn about AI, develop new skills, and be part of our digital transformation journey. Start exploring today!', N'New platform launch announcement', N'High', GETDATE(), 1, (SELECT Id FROM Users WHERE Username = 'admin')),
(N'New Course: Generative AI for Employees', N'We have just launched a new course on Generative AI for Employees. Learn how to use ChatGPT, Claude, and Microsoft Copilot in your daily work. Earn points and badges as you progress!', N'New course announcement', N'Normal', GETDATE(), 1, (SELECT Id FROM Users WHERE Username = 'admin')),
(N'AI Quiz Competition - Win Points!', N'Participate in our weekly AI quiz competition. Top scorers will receive special badges and recognition. Check the Quizzes section to participate!', N'Quiz competition announcement', N'Normal', GETDATE(), 1, (SELECT Id FROM Users WHERE Username = 'admin'))
GO

-- =============================================
-- 20. SYSTEM SETTINGS
-- =============================================
INSERT INTO [dbo].[SystemSettings] ([SettingKey], [SettingValue], [Description], [Category], [IsActive]) VALUES
(N'PointsPerArticle', N'10', N'Points awarded for reading an article', N'Gamification', 1),
(N'PointsPerLesson', N'20', N'Points awarded for completing a lesson', N'Gamification', 1),
(N'PointsPerCourse', N'100', N'Points awarded for completing a course', N'Gamification', 1),
(N'PointsPerQuiz', N'50', N'Points awarded for passing a quiz', N'Gamification', 1),
(N'PointsPerChallenge', N'25', N'Points awarded for daily challenge', N'Gamification', 1),
(N'PointsPerStreak', N'10', N'Bonus points for learning streak', N'Gamification', 1),
(N'SiteName', N'AI Culture & Digital Transformation Hub', N'Name of the platform', N'General', 1),
(N'MaxQuizAttempts', N'3', N'Maximum quiz attempts per day', N'Quiz', 1),
(N'EnableRegistration', N'true', N'Allow new user registration', N'Authentication', 1),
(N'RequireEmailVerification', N'false', N'Require email verification for new users', N'Authentication', 1)
GO

-- =============================================
-- 21. NOTIFICATIONS (sample for first few users)
-- =============================================
INSERT INTO [dbo].[Notifications] ([UserId], [Title], [Message], [NotificationType], [IsRead], [CreatedDate])
SELECT TOP 5 Id, N'Welcome to AI Culture Hub!', N'Start your AI learning journey today. Check out our latest courses and articles.', N'System', 0, GETDATE() FROM Users WHERE Username IN ('jdoe', 'asmith', 'brown', 'clee', 'dwilson')

INSERT INTO [dbo].[Notifications] ([UserId], [Title], [Message], [NotificationType], [IsRead], [CreatedDate])
SELECT Id, N'New Course Available', N'A new course "Generative AI for Employees" is now available. Start learning today!', N'Course', 0, GETDATE() FROM Users WHERE Username IN ('jdoe', 'asmith', 'brown', 'clee', 'dwilson', 'emartinez', 'fchen', 'gkim', 'hpatel', 'itoledo')

INSERT INTO [dbo].[Notifications] ([UserId], [Title], [Message], [NotificationType], [IsRead], [CreatedDate])
SELECT Id, N'Daily Challenge Available', N'Your daily AI challenge is ready. Earn 25 points by completing it!', N'Challenge', 0, GETDATE() FROM Users WHERE Username IN ('jdoe', 'asmith', 'brown', 'clee', 'dwilson')
GO

-- =============================================
-- 22. POINT TRANSACTIONS (sample history)
-- =============================================
INSERT INTO [dbo].[PointTransactions] ([UserId], [Points], [TransactionType], [Reason])
SELECT Id, 50, N'Reading', N'Read articles' FROM Users WHERE Username IN ('jdoe', 'asmith', 'brown', 'clee', 'dwilson')

INSERT INTO [dbo].[PointTransactions] ([UserId], [Points], [TransactionType], [Reason])
SELECT Id, 100, N'Course', N'Completed course' FROM Users WHERE Username IN ('jdoe', 'asmith', 'brown')

INSERT INTO [dbo].[PointTransactions] ([UserId], [Points], [TransactionType], [Reason])
SELECT Id, 25, N'Challenge', N'Daily challenge completed' FROM Users WHERE Username IN ('jdoe', 'asmith', 'brown', 'clee', 'dwilson', 'emartinez')
GO

-- =============================================
-- 23. USER BADGES (sample assignments)
-- =============================================
INSERT INTO [dbo].[UserBadges] ([UserId], [BadgeId])
SELECT u.Id, b.Id FROM Users u, Badges b 
WHERE u.Username IN ('jdoe', 'asmith') AND b.Name IN ('AI Beginner', 'AI Explorer')

INSERT INTO [dbo].[UserBadges] ([UserId], [BadgeId])
SELECT u.Id, b.Id FROM Users u, Badges b 
WHERE u.Username = 'admin' AND b.Name IN ('AI Beginner', 'AI Explorer', 'AI Practitioner', 'Quiz Master', 'Challenge Master', 'Course Champion')
GO

PRINT 'Seed data inserted successfully'
GO