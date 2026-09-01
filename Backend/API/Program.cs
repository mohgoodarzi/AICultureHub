using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using AICultureHub.Application.Interfaces;
using AICultureHub.Domain.Entities;
using AICultureHub.Infrastructure.Services;
using AICultureHub.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") 
    ?? "Server=localhost;Database=AICultureHub;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<IAuthService, AICultureHub.Infrastructure.Services.AuthService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IGlossaryService, GlossaryService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IChallengeService, ChallengeService>();
builder.Services.AddScoped<IGamificationService, GamificationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IAuditService, AuditService>();

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? "DefaultSecretKey123456789012345678901234567890";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "AICultureHub";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "AI Culture Hub API", 
        Version = "v1",
        Description = "API for AI Culture & Digital Transformation Hub"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.EnsureCreated();

        if (!dbContext.Permissions.Any())
        {
            var permissions = new List<Permission>
            {
                new Permission { Name = "View Dashboard", Code = "Dashboard.View", Module = "Dashboard", Description = "View dashboard", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Dashboard", Code = "Dashboard.Manage", Module = "Dashboard", Description = "Manage dashboard settings", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Users", Code = "Users.View", Module = "Users", Description = "View user list", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Users", Code = "Users.Create", Module = "Users", Description = "Create new users", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Users", Code = "Users.Edit", Module = "Users", Description = "Edit user information", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Users", Code = "Users.Delete", Module = "Users", Description = "Delete users", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Users", Code = "Users.Manage", Module = "Users", Description = "Full user management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Roles", Code = "Roles.View", Module = "Roles", Description = "View role list", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Roles", Code = "Roles.Create", Module = "Roles", Description = "Create new roles", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Roles", Code = "Roles.Edit", Module = "Roles", Description = "Edit role information", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Roles", Code = "Roles.Delete", Module = "Roles", Description = "Delete roles", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Roles", Code = "Roles.Manage", Module = "Roles", Description = "Full role management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Articles", Code = "Articles.View", Module = "Articles", Description = "View article list", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Articles", Code = "Articles.Create", Module = "Articles", Description = "Create new articles", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Articles", Code = "Articles.Edit", Module = "Articles", Description = "Edit articles", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Articles", Code = "Articles.Delete", Module = "Articles", Description = "Delete articles", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Articles", Code = "Articles.Manage", Module = "Articles", Description = "Full article management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Categories", Code = "Categories.View", Module = "Categories", Description = "View category list", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Categories", Code = "Categories.Create", Module = "Categories", Description = "Create new categories", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Categories", Code = "Categories.Edit", Module = "Categories", Description = "Edit categories", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Categories", Code = "Categories.Delete", Module = "Categories", Description = "Delete categories", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Categories", Code = "Categories.Manage", Module = "Categories", Description = "Full category management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Courses", Code = "Courses.View", Module = "Courses", Description = "View course list", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Courses", Code = "Courses.Create", Module = "Courses", Description = "Create new courses", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Courses", Code = "Courses.Edit", Module = "Courses", Description = "Edit courses", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Courses", Code = "Courses.Delete", Module = "Courses", Description = "Delete courses", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Courses", Code = "Courses.Manage", Module = "Courses", Description = "Full course management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Quizzes", Code = "Quizzes.View", Module = "Quizzes", Description = "View quiz list", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Quizzes", Code = "Quizzes.Create", Module = "Quizzes", Description = "Create new quizzes", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Quizzes", Code = "Quizzes.Edit", Module = "Quizzes", Description = "Edit quizzes", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Quizzes", Code = "Quizzes.Delete", Module = "Quizzes", Description = "Delete quizzes", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Quizzes", Code = "Quizzes.Manage", Module = "Quizzes", Description = "Full quiz management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Challenges", Code = "Challenges.View", Module = "Challenges", Description = "View challenge list", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Challenges", Code = "Challenges.Create", Module = "Challenges", Description = "Create new challenges", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Challenges", Code = "Challenges.Edit", Module = "Challenges", Description = "Edit challenges", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Challenges", Code = "Challenges.Delete", Module = "Challenges", Description = "Delete challenges", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Challenges", Code = "Challenges.Manage", Module = "Challenges", Description = "Full challenge management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Announcements", Code = "Announcements.View", Module = "Announcements", Description = "View announcements", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Announcements", Code = "Announcements.Create", Module = "Announcements", Description = "Create announcements", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Announcements", Code = "Announcements.Edit", Module = "Announcements", Description = "Edit announcements", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Announcements", Code = "Announcements.Delete", Module = "Announcements", Description = "Delete announcements", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Announcements", Code = "Announcements.Manage", Module = "Announcements", Description = "Full announcement management", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Reports", Code = "Reports.View", Module = "Reports", Description = "View reports", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Reports", Code = "Reports.Manage", Module = "Reports", Description = "Manage reports", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Settings", Code = "Settings.View", Module = "Settings", Description = "View settings", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Settings", Code = "Settings.Manage", Module = "Settings", Description = "Manage settings", IsActive = true, CreatedDate = DateTime.UtcNow },

                new Permission { Name = "View Glossary", Code = "Glossary.View", Module = "Glossary", Description = "View glossary", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Create Glossary", Code = "Glossary.Create", Module = "Glossary", Description = "Create glossary entries", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Edit Glossary", Code = "Glossary.Edit", Module = "Glossary", Description = "Edit glossary entries", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Delete Glossary", Code = "Glossary.Delete", Module = "Glossary", Description = "Delete glossary entries", IsActive = true, CreatedDate = DateTime.UtcNow },
                new Permission { Name = "Manage Glossary", Code = "Glossary.Manage", Module = "Glossary", Description = "Full glossary management", IsActive = true, CreatedDate = DateTime.UtcNow },
            };
            dbContext.Permissions.AddRange(permissions);
            dbContext.SaveChanges();
            Console.WriteLine($"Seeded {permissions.Count} permissions.");
        }

        if (!dbContext.Roles.Any())
        {
            var allPermissions = dbContext.Permissions.ToList();
            var adminPerms = allPermissions.Select(p => p.Id).ToList();
            var editorModules = new[] { "Articles", "Categories", "Announcements", "Glossary" };
            var instructorModules = new[] { "Courses", "Quizzes", "Challenges" };
            var contentManagerPerms = allPermissions.Where(p => p.Module != "Users" && p.Module != "Roles" && p.Module != "Settings" && p.Module != "Reports").Select(p => p.Id).ToList();
            var editorPerms = allPermissions.Where(p => editorModules.Contains(p.Module)).Select(p => p.Id).ToList();
            var instructorPerms = allPermissions.Where(p => instructorModules.Contains(p.Module)).Select(p => p.Id).ToList();

            var adminRole = new Role { Name = "Administrator", Description = "Full system access", IsActive = true, CreatedDate = DateTime.UtcNow };
            var contentManagerRole = new Role { Name = "ContentManager", Description = "Manage content (articles, courses, etc.)", IsActive = true, CreatedDate = DateTime.UtcNow };
            var editorRole = new Role { Name = "Editor", Description = "Edit articles and content", IsActive = true, CreatedDate = DateTime.UtcNow };
            var instructorRole = new Role { Name = "Instructor", Description = "Manage courses and quizzes", IsActive = true, CreatedDate = DateTime.UtcNow };
            var employeeRole = new Role { Name = "Employee", Description = "Basic employee access", IsActive = true, CreatedDate = DateTime.UtcNow };

            dbContext.Roles.AddRange(adminRole, contentManagerRole, editorRole, instructorRole, employeeRole);
            dbContext.SaveChanges();

            dbContext.RolePermissions.AddRange(adminPerms.Select(pid => new RolePermission { RoleId = adminRole.Id, PermissionId = pid }));
            dbContext.RolePermissions.AddRange(contentManagerPerms.Select(pid => new RolePermission { RoleId = contentManagerRole.Id, PermissionId = pid }));
            dbContext.RolePermissions.AddRange(editorPerms.Select(pid => new RolePermission { RoleId = editorRole.Id, PermissionId = pid }));
            dbContext.RolePermissions.AddRange(instructorPerms.Select(pid => new RolePermission { RoleId = instructorRole.Id, PermissionId = pid }));
            dbContext.SaveChanges();

            Console.WriteLine($"Seeded 5 roles with permissions.");
        }

        // Seed admin user with Administrator role
        if (!dbContext.Users.Any(u => u.Username == "admin"))
        {
            var adminRole = dbContext.Roles.FirstOrDefault(r => r.Name == "Administrator");
            if (adminRole != null)
            {
                var salt = Guid.NewGuid().ToString();
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@company.com",
                    PasswordHash = HashPassword("Admin123!", salt),
                    PasswordSalt = salt,
                    FirstName = "Admin",
                    LastName = "User",
                    CurrentLevelId = 1,
                    IsActive = true,
                    IsEmailVerified = true,
                    CreatedDate = DateTime.UtcNow
                };
                dbContext.Users.Add(adminUser);
                dbContext.SaveChanges();

                dbContext.UserRoles.Add(new UserRole
                {
                    UserId = adminUser.Id,
                    RoleId = adminRole.Id,
                    AssignedDate = DateTime.UtcNow
                });
                dbContext.SaveChanges();

                Console.WriteLine($"Admin user created with Administrator role.");
            }
        }

        // Seed Departments
        if (!dbContext.Departments.Any())
        {
            var departments = new List<Department>
            {
                new Department { Name = "اطلاعات و فناوری", Code = "IT", Description = "فناوری اطلاعات و ارتباطات", DisplayOrder = 1, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Department { Name = "منابع انسانی", Code = "HR", Description = "مدیریت منابع انسانی", DisplayOrder = 2, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Department { Name = "مالی و حسابداری", Code = "FIN", Description = "امور مالی و حسابداری", DisplayOrder = 3, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Department { Name = "بازاریابی و فروش", Code = "MKT", Description = "بازاریابی و توسعه کسب و کار", DisplayOrder = 4, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Department { Name = "عملیات و تولید", Code = "OPS", Description = "عملیات و تولید", DisplayOrder = 5, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Department { Name = "تحقیق و توسعه", Code = "RD", Description = "تحقیق و توسعه", DisplayOrder = 6, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Department { Name = "مدیریت و برنامه‌ریزی", Code = "MGT", Description = "مدیریت ارشد و برنامه‌ریزی", DisplayOrder = 7, IsActive = true, CreatedDate = DateTime.UtcNow }
            };
            dbContext.Departments.AddRange(departments);
            dbContext.SaveChanges();
            Console.WriteLine($"Seeded {departments.Count} departments.");
        }

        // Seed Positions
        if (!dbContext.Positions.Any())
        {
            var itDept = dbContext.Departments.FirstOrDefault(d => d.Code == "IT");
            var hrDept = dbContext.Departments.FirstOrDefault(d => d.Code == "HR");
            var finDept = dbContext.Departments.FirstOrDefault(d => d.Code == "FIN");
            var mktDept = dbContext.Departments.FirstOrDefault(d => d.Code == "MKT");
            var mgtDept = dbContext.Departments.FirstOrDefault(d => d.Code == "MGT");

            var positions = new List<Position>
            {
                new Position { Name = "مدیرعامل", Code = "CEO", DepartmentId = mgtDept?.Id, DisplayOrder = 1, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Position { Name = "معاونت", Code = "VP", DepartmentId = mgtDept?.Id, DisplayOrder = 2, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Position { Name = "مدیر", Code = "MGR", DepartmentId = null, DisplayOrder = 3, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Position { Name = "رئیس", Code = "HEAD", DepartmentId = null, DisplayOrder = 4, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Position { Name = "کارشناس ارشد", Code = "SSE", DepartmentId = null, DisplayOrder = 5, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Position { Name = "کارشناس", Code = "SE", DepartmentId = null, DisplayOrder = 6, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Position { Name = "مسئول", Code = "INCHARGE", DepartmentId = null, DisplayOrder = 7, IsActive = true, CreatedDate = DateTime.UtcNow },
                new Position { Name = "کارمند", Code = "EMP", DepartmentId = null, DisplayOrder = 8, IsActive = true, CreatedDate = DateTime.UtcNow }
            };
            dbContext.Positions.AddRange(positions);
            dbContext.SaveChanges();
            Console.WriteLine($"Seeded {positions.Count} positions.");
        }

        // Seed sample data
        if (!dbContext.Articles.Any() && !dbContext.Courses.Any())
        {
            // Get or create tech category
            var techCategory = dbContext.Categories.FirstOrDefault(c => c.Name.Contains("เทคโนโลยี") || c.Name == "Tech");
            if (techCategory == null)
            {
                techCategory = new Category { Name = "เทคโนโลยี", Slug = "tech", Description = "เทคโนโลยีและการดิจิทัล" };
                dbContext.Categories.Add(techCategory);
                dbContext.SaveChanges();
            }
            
            // Create sample articles about AI
            var articles = new List<Article>
            {
                new Article
                {
                    Title = "ปัญญาประดิษฐ์เปลี่ยนโลก: โอกาสและความท้าทาย",
                    Slug = "ai-changing-world",
                    Summary = "การปฏิรูปทางเทคโนโลยีที่สำคัญที่สุดในศวรรษนี้",
                    Content = "ปัญญาประดิษฐ์ (AI) ได้กลายเป็นหัวใจสำคัญของนวัตกรรมทางเทคโนโลยีในปัจจุบัน จากรถยนต์ขับขับอัตโนมัติไปจนถึงระบบสุขภาพอัจฉริยะ AI กำลังปฏิรูปทุกอุद्योग โอกาสมีมากมาย แต่ก็ยังมีความท้าทายด้านจริยธรรม ความเป็นส่วนตัวของข้อมูล และการสูญเสียนงานที่ต้องได้รับการจัดการ",
                    ImageUrl = "/images/ai-transformation.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 8,
                    ViewCount = 0,
                    LikeCount = 0,
                    IsPublished = true,
                    IsFeatured = true,
                    PublishedDate = DateTime.UtcNow,
                    Difficulty = "Intermediate"
                },
                new Article
                {
                    Title = "ทำความเข้าใจ Generative AI: จาก Concept ถึง การใช้งานจริง",
                    Slug = "generative-ai-explained",
                    Summary = "คำแนะนำ complete เกี่ยวกับ AI ที่สร้างสรรค์และโมเดล Language Model",
                    Content = "Generative AI หรือ AI ที่สร้างสรรค์ ได้ปฏิรูปวิธีที่เราสร้างเนื้อหาโค้ดและแก้ปัญหา ตั้งแต่ ChatGPT จนถึง DALL-E เทคโนโลยีเหล่านี้ใช้ deep learning เพื่อสร้างข้อมูลใหม่ที่คล้ายกับข้อมูลที่ฝึกสอน โมเดล Language Model เช่น GPT-4 สามารถเขียนโค้ด ตอบคำถาม และช่วยในงานสร้างสรรค์ได้อย่างมีประสิทธิภาพ",
                    ImageUrl = "/images/generative-ai.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 12,
                    ViewCount = 0,
                    IsPublished = true,
                    IsFeatured = true,
                    PublishedDate = DateTime.UtcNow,
                    Difficulty = "Beginner"
                },
                new Article
                {
                    Title = "AI ในที่ทำงาน: เพิประสิทธิภาพให้กับทีมของคุณ",
                    Slug = "ai-workplace-productivity",
                    Summary = "วิธีการใช้ AI เพื่อเพิ่มประสิทธิภาพในงานประจำวัน",
                    Content = "AI สามารถช่วยเพิ่มประสิทธิภาพในที่ทำงานได้หลายวิธี เช่น การอัตโนมัติงานซ้ำซ้อน การวิเคราะห์ข้อมูล และการช่วยเหลือการตัดสินใจ โดยการใช้ AI Tools เช่น ตัวช่วยเขียนโค้ดและระบบอัตโนมัติ ทีมงานสามารถใช้เวลาไปกับงานเชิงกลยุทธ์และสร้างสรรค์มากขึ้น การรับ AI ไปพร้อมกันต้องการการฝึกอบรมและการปรับเปลี่ยนวัฒนธรรมองค์กร",
                    ImageUrl = "/images/ai-workplace.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 6,
                    ViewCount = 0,
                    IsPublished = true,
                    Difficulty = "Intermediate"
                },
                new Article
                {
                    Title = "ดิจิทัลทรานส์ฟอร์มเมอร์: ภาพรวมแบบ entire",
                    Slug = "digital-transformation-overview",
                    Summary = "คำแนะนำแบบ entire เกี่ยวกับการเปลี่ยนแปลงดิจิทัลสำหรับองค์กร",
                    Content = "ดิจิทัลทรานส์ฟอร์มเมอร์ไม่ได้หมายถึงแค่การนำเทคโนโลยีใหม่มาใช้ แต่เป็นกระบวนการเปลี่ยนแปลงพื้นฐานวิธีที่องค์กรทำงานและมอบคุณค่าให้กับลูกค้า มันรวมถึงการเปลี่ยนวัฒนธรรม กระบวนการทำงาน และโมเดลธุรกิจ การประสบความสำเร็จต้องมีการวางแผน การลงทุนเทคโนโลยี และการรับเปลี่ยนจากพนักงานทุกระดับ",
                    ImageUrl = "/images/digital-transformation.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 10,
                    ViewCount = 0,
                    IsPublished = true,
                    Difficulty = "Advanced"
                },
                new Article
                {
                    Title = "อนาคตของ AI: เทรนด์ที่ควรจับตามองในปี 2024",
                    Slug = "future-ai-trends-2024",
                    Summary = "การคาดการณ์เทรนด์ปัญญาประดิษฐ์รุ่นใหม่",
                    Content = "ในปี 2024 เราคาดว่าจะเห็นความก้าวหน้าที่สำคัญในหลายด้าน รวมถึง AI รุ่นหลายโหมด (Multimodal AI) ที่สามารถประมวลผลข้อความ รูปภาพ และเสียงพร้อมกัน การพัฒนาด้าน AI ที่มีจริยธรรม การเพิ่มประสิทธิภาพด้านพลังงาน และการใช้ AI ในอุद्योगเฉพาะทาง เช่น ยาและการเงิน การจับตาดูเทรนด์เหล่านี้จะช่วยให้องค์กรและบุคคลเตรียมพร้อมสำหรับอนาคต",
                    ImageUrl = "/images/future-ai.jpg",
                    CategoryId = techCategory.Id,
                    AuthorId = 1,
                    ReadingTimeMinutes = 7,
                    ViewCount = 0,
                    IsPublished = true,
                    Difficulty = "Intermediate"
                }
            };

            foreach (var article in articles)
            {
                dbContext.Articles.Add(article);
            }
            dbContext.SaveChanges();

            // Create sample courses
            var courses = new List<Course>
            {
                new Course
                {
                    Title = "ปัญญาประดิษฐ์สำหรับผู้เริ่มต้น",
                    Slug = "ai-basics",
                    Description = "หลักสูตรแนะนำพื้นฐานสำหรับผู้ที่ต้องการเรียนรู้เกี่ยวกับปัญญาประดิษฐ์",
                    ShortDescription = "เรียนรู้พื้นฐาน AI อันดับแรก",
                    ThumbnailUrl = "/courses/ai-thumbnail.jpg",
                    Difficulty = "Beginner",
                    EstimatedDurationMinutes = 60,
                    Points = 100,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    IsFeatured = true,
                    DisplayOrder = 1
                },
                new Course
                {
                    Title = "Generative AI and Large Language Models",
                    Slug = "generative-ai-llm",
                    Description = "เรียนรู้เกี่ยวกับ AI ที่สร้างสรรค์และโมเดล Language Model ขั้นสูง",
                    ShortDescription = " deep dive เข้าสู่โลก Generative AI",
                    ThumbnailUrl = "/courses/gen-ai.jpg",
                    Difficulty = "Advanced",
                    EstimatedDurationMinutes = 120,
                    Points = 200,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    IsFeatured = true,
                    DisplayOrder = 2
                },
                new Course
                {
                    Title = "AI ในที่ทำงาน",
                    Slug = "ai-workplace",
                    Description = "การนำ AI ไปใช้จริงเพื่อเพิ่มประสิทธิภาพในองค์กร",
                    ShortDescription = "วิธีการนำ AI ไปใช้จริง",
                    ThumbnailUrl = "/courses/ai-workplace.jpg",
                    Difficulty = "Intermediate",
                    EstimatedDurationMinutes = 90,
                    Points = 150,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    DisplayOrder = 3
                },
                new Course
                {
                    Title = "ดิจิทัลทรานส์ฟอร์มเมอร์",
                    Slug = "digital-transformation",
                    Description = "หลักสูตร entire เกี่ยวกับการเปลี่ยนแปลงดิจิทัลสำหรับผู้นำองค์กร",
                    ShortDescription = "แนวทางแบบ entire ในการเปลี่ยนแปลงดิจิทัล",
                    ThumbnailUrl = "/courses/dt-overview.jpg",
                    Difficulty = "Advanced",
                    EstimatedDurationMinutes = 180,
                    Points = 300,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    DisplayOrder = 4
                },
                new Course
                {
                    Title = "AI Tools สำหรับนักพัฒนา",
                    Slug = "ai-tools-developers",
                    Description = "เครื่องมือและเทคโนโลยี AI ที่นักพัฒนาควรรู้จัก",
                    ShortDescription = "เรียนรู้ AI Tools ที่จำเป็น",
                    ThumbnailUrl = "/courses/ai-tools.jpg",
                    Difficulty = "Intermediate",
                    EstimatedDurationMinutes = 45,
                    Points = 80,
                    CategoryId = techCategory.Id,
                    IsPublished = true,
                    DisplayOrder = 5
                }
            };

            foreach (var course in courses)
            {
                dbContext.Courses.Add(course);
            }
            dbContext.SaveChanges();

            Console.WriteLine($"Seed data added: 5 articles and 5 courses.");
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Database seeding failed.");
    }
}

static string HashPassword(string password, string salt)
{
    using var sha256 = SHA256.Create();
    var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + salt));
    return Convert.ToBase64String(hashedBytes);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();