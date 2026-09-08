using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using AICultureHub.Application.Interfaces;
using AICultureHub.Domain.Entities;
using AICultureHub.Infrastructure.Services;
using AICultureHub.Infrastructure.Data;
using AICultureHub.Infrastructure.Services;

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

    // Reject tokens of deactivated or deleted users immediately (not just at token expiry)
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
            var userIdClaim = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                context.Fail("Invalid token subject");
                return;
            }

            var isActive = await dbContext.Users
                .Where(u => u.Id == userId)
                .Select(u => u.IsActive)
                .FirstOrDefaultAsync();

            if (!isActive)
            {
                context.Fail("User account is deactivated or no longer exists");
            }
        }
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

// Allow large media uploads (actual per-type limits are enforced by UploadController from admin settings)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 210 * 1024 * 1024; // slightly above the absolute upload cap
});
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 200 * 1024 * 1024;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.EnsureCreated();

        // Generic schema sync: EnsureCreated() never alters existing tables. Add any columns
        // present in the EF model but missing from the database (BaseEntity columns on tables
        // created before they were added, etc.) so inserts don't fail with "Invalid column name".
        SyncMissingColumns(dbContext);

        // Personnel number must be unique per employee. Recreate the index as FILTERED so multiple
        // NULL/empty values are allowed (users without a personnel number) while duplicates are impossible.
        EnsureEmployeeIdUniqueIndex(dbContext);

        // Seed the AI policy items once (admin can edit them afterwards via the Admin Panel)
        if (!dbContext.AiPolicyItems.Any())
        {
            var policyItems = new (string Title, string Text)[]
            {
                ("حاکمیت", "کلیه کاربردهای هوش مصنوعی باید تحت چارچوب حاکمیت، مسئولیت‌پذیری و نظارت مدیریت ارشد و کمیته حاکمیت AI انجام شود."),
                ("هم‌راستایی کسب‌وکار", "استفاده از AI باید در راستای اهداف استراتژیک، افزایش بهره‌وری، کیفیت، نوآوری و تحول دیجیتال شرکت باشد."),
                ("اخلاق", "استفاده از هوش مصنوعی باید منصفانه، شفاف، مسئولانه و بدون تبعیض و سوءاستفاده انجام شود."),
                ("نظارت انسانی و پاسخگویی", "استفاده از هوش مصنوعی در تمامی واحدها و فرایندهای سازمانی باید با نظارت انسانی متناسب با سطح ریسک انجام شود و مسئولیت بررسی، اعتبارسنجی و تصمیم‌گیری نهایی بر عهده فرد یا واحد مسئول باشد."),
                ("امنیت", "سامانه‌ها و خدمات AI باید مطابق الزامات امنیت سایبری، مدیریت دسترسی، ثبت رویداد و حفاظت در برابر تهدیدات و سوءاستفاده‌ها به‌کار گرفته شوند."),
                ("محرمانگی", "اطلاعات محرمانه، فنی، قراردادی، مالی، پروژه‌ای و اطلاعات کارفرمایان نباید بدون مجوز در ابزارهای عمومی هوش مصنوعی وارد یا پردازش شوند."),
                ("حریم خصوصی", "جمع‌آوری و پردازش اطلاعات کارکنان و سایر داده‌های شخصی باید با رعایت الزامات قانونی و اصول حفاظت از حریم خصوصی انجام شود."),
                ("صحت و قابلیت اعتماد", "خروجی‌های AI باید متناسب با سطح ریسک، از نظر صحت، اعتبار، سوگیری و قابلیت اتکا بررسی و اعتبارسنجی شوند."),
                ("مدیریت ریسک", "کلیه کاربردهای AI باید قبل و بعد از استقرار، از نظر ریسک‌های فنی، عملیاتی، امنیتی، حقوقی و اخلاقی ارزیابی و پایش شوند."),
                ("مالکیت فکری و قراردادها", "استفاده از AI باید با رعایت حقوق مالکیت فکری، حقوق کارفرمایان، الزامات قراردادها و محدودیت‌های مربوط به داده و محتوا انجام شود."),
                ("فرهنگ و آموزش", "شرکت متعهد به توسعه فرهنگ استفاده مسئولانه از AI و آموزش مستمر مدیران و کارکنان برای بهره‌برداری ایمن و مؤثر از آن است."),
                ("بهبود مستمر", "کلیه سامانه‌ها و کاربردهای AI باید مستندسازی، پایش، ممیزی و به‌صورت دوره‌ای بازنگری شوند تا اثربخشی، امنیت و انطباق آن‌ها بهبود یابد.")
            };
            dbContext.AiPolicyItems.AddRange(policyItems.Select((p, idx) => new AiPolicyItem
            {
                DisplayOrder = idx + 1,
                Title = p.Title,
                Text = p.Text,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            }));
            dbContext.SaveChanges();
            Console.WriteLine($"Seeded {policyItems.Length} AI policy items.");
        }

        // ===== Section-based permission model =====
        // Six sections, each with a View permission that controls visibility AND access:
        // Dashboard, Articles, Courses & Exams, Leaderboard, Management, AI Policy.
        var sectionPermissions = new (string Name, string Code, string Module, string Description)[]
        {
            ("View Dashboard", "Dashboard.View", "Dashboard", "مشاهده داشبورد"),
            ("View Articles", "Articles.View", "Articles", "مشاهده مقالات"),
            ("View Courses & Exams", "Courses.View", "CoursesExams", "مشاهده دوره‌ها و آزمون‌ها"),
            ("View Leaderboard", "Scoreboard.View", "Leaderboard", "مشاهده جدول امتیازات"),
            ("View Management", "Management.View", "Management", "مشاهده پنل مدیریت (کاربران، نقش‌ها، واحدها، سمت‌ها، اطلاعیه‌ها، خط‌مشی AI، تنظیمات)"),
            ("View AI Policy", "AiPolicy.View", "AIPolicy", "مشاهده خط‌مشی هوش مصنوعی"),
        };

        var existingByCode = new Dictionary<string, Permission>(StringComparer.OrdinalIgnoreCase);
        foreach (var ep in dbContext.Permissions.ToList())
        {
            existingByCode[ep.Code] = ep;
        }

        foreach (var def in sectionPermissions)
        {
            if (existingByCode.TryGetValue(def.Code, out var match))
            {
                if (match.Code != def.Code) { match.Code = def.Code; match.Name = def.Name; match.Module = def.Module; match.Description = def.Description; }
            }
        }
        dbContext.SaveChanges();

        var missingPerms = sectionPermissions
            .Where(p => !existingByCode.ContainsKey(p.Code))
            .Select(p => new Permission { Name = p.Name, Code = p.Code, Module = p.Module, Description = p.Description, IsActive = true, CreatedDate = DateTime.UtcNow })
            .ToList();
        if (missingPerms.Any())
        {
            dbContext.Permissions.AddRange(missingPerms);
            dbContext.SaveChanges();
            Console.WriteLine($"Seeded {missingPerms.Count} section permissions.");
        }

        existingByCode = dbContext.Permissions.ToDictionary(p => p.Code, p => p, StringComparer.OrdinalIgnoreCase);

        // Deactivate ALL legacy permissions (old 57-code model) - the new model has only 6
        var activeCodes = sectionPermissions.Select(s => s.Code).ToList();
        var legacyPerms = dbContext.Permissions.Where(p => p.IsActive).ToList().Where(p => !activeCodes.Contains(p.Code)).ToList();
        foreach (var lp in legacyPerms) { lp.IsActive = false; }
        if (legacyPerms.Any()) { dbContext.SaveChanges(); Console.WriteLine($"Deactivated {legacyPerms.Count} legacy permissions."); }

        // Remove old roles entirely; recreate the two standard roles
        var oldRoles = dbContext.Roles.Include(r => r.RolePermissions).Where(r => r.Name != "Administrator" && r.Name != "Employee").ToList();
        foreach (var or in oldRoles)
        {
            dbContext.RolePermissions.RemoveRange(or.RolePermissions);
            dbContext.UserRoles.RemoveRange(dbContext.UserRoles.Where(ur => ur.RoleId == or.Id));
            or.IsActive = false;
        }
        if (oldRoles.Any()) { dbContext.SaveChanges(); Console.WriteLine($"Deactivated {oldRoles.Count} legacy roles."); }

        // Administrator: every section + legacy full permissions kept for backward compat of admin APIs
        var adminRole = dbContext.Roles.Include(r => r.RolePermissions).FirstOrDefault(r => r.Name == "Administrator");
        if (adminRole == null)
        {
            adminRole = new Role { Name = "Administrator", Description = "مدیر سیستم", IsActive = true, CreatedDate = DateTime.UtcNow };
            dbContext.Roles.Add(adminRole);
            dbContext.SaveChanges();
        }
        var adminOwned = adminRole.RolePermissions.Select(rp => rp.PermissionId).ToHashSet();
        var adminMissing = existingByCode.Values.Where(p => p.IsActive).Where(p => !adminOwned.Contains(p.Id)).ToList();
        foreach (var p in adminMissing)
        {
            dbContext.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id });
        }
        dbContext.SaveChanges();

        // Employee: all sections EXCEPT Management and Leaderboard (admin can enable later)
        var employeeRole = dbContext.Roles.Include(r => r.RolePermissions).FirstOrDefault(r => r.Name == "Employee");
        if (employeeRole == null)
        {
            employeeRole = new Role { Name = "Employee", Description = "کارمند", IsActive = true, CreatedDate = DateTime.UtcNow };
            dbContext.Roles.Add(employeeRole);
            dbContext.SaveChanges();
        }
        var employeeCodes = new[] { "Dashboard.View", "Articles.View", "Courses.View", "AiPolicy.View" };
        var employeePerms = employeeCodes.Select(code => existingByCode[code]).Where(p => p.IsActive).ToList();
        var empOwned = employeeRole.RolePermissions.Select(rp => rp.PermissionId).ToHashSet();
        var empMissing = employeePerms.Where(p => !empOwned.Contains(p.Id)).ToList();
        var empLegacyToRemove = employeeRole.RolePermissions.Where(rp => !employeePerms.Any(p => p.Id == rp.PermissionId)).ToList();
        foreach (var rp in empLegacyToRemove) { dbContext.RolePermissions.Remove(rp); }
        foreach (var p in empMissing)
        {
            dbContext.RolePermissions.Add(new RolePermission { RoleId = employeeRole.Id, PermissionId = p.Id });
        }
        dbContext.SaveChanges();
        Console.WriteLine("Seeded section-based roles: Administrator (all), Employee (Dashboard/Articles/Courses/AI Policy).");

        // Self-heal: Administrator always has every permission
        var adminRoleSync = dbContext.Roles.Include(r => r.RolePermissions).FirstOrDefault(r => r.Name == "Administrator");
        if (adminRoleSync != null)
        {
            var allPermIds = existingByCode.Values.Where(p => p.IsActive).Select(p => p.Id).ToList();
            var adminOwned2 = adminRoleSync.RolePermissions.Select(rp => rp.PermissionId).ToHashSet();
            var missing2 = allPermIds.Where(id => !adminOwned2.Contains(id)).ToList();
            if (missing2.Any())
            {
                foreach (var pid in missing2)
                {
                    dbContext.RolePermissions.Add(new RolePermission { RoleId = adminRoleSync.Id, PermissionId = pid });
                }
                dbContext.SaveChanges();
                Console.WriteLine($"Granted {missing2.Count} missing permissions to Administrator role.");
            }
        }
        // Seed admin user with Administrator role
        if (!dbContext.Users.Any(u => u.Username == "admin"))
        {
            var adminRoleOld = dbContext.Roles.FirstOrDefault(r => r.Name == "Administrator");
            if (adminRoleOld != null)
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
                    RoleId = adminRoleOld.Id,
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

static void EnsureEmployeeIdUniqueIndex(ApplicationDbContext dbContext)
{
    var conn = dbContext.Database.GetDbConnection();
    var openedHere = false;
    if (conn.State != System.Data.ConnectionState.Open) { conn.Open(); openedHere = true; }
    try
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql = @sql + 'ALTER TABLE [Users] DROP CONSTRAINT [' + name + ']; '
FROM sys.indexes
WHERE object_id = OBJECT_ID('Users') AND name LIKE '%EmployeeId%' AND has_filter = 0 AND is_unique_constraint = 1;
EXEC(@sql);
IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('Users') AND name LIKE '%EmployeeId%' AND has_filter = 0 AND is_unique_constraint = 0)
BEGIN
    DROP INDEX [UQ_Users_EmployeeId] ON [Users];
    DROP INDEX [IX_Users_EmployeeId] ON [Users];
END
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('Users') AND name = 'IX_Users_EmployeeId')
BEGIN
    CREATE UNIQUE INDEX [IX_Users_EmployeeId] ON [Users] ([EmployeeId])
    WHERE [EmployeeId] IS NOT NULL AND [EmployeeId] <> '';
END";
        cmd.ExecuteNonQuery();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"EmployeeId index sync skipped: {ex.Message}");
    }
    finally
    {
        if (openedHere) conn.Close();
    }
}

static void SyncMissingColumns(ApplicationDbContext dbContext)
{
    var conn = dbContext.Database.GetDbConnection();
    var openedHere = false;
    if (conn.State != System.Data.ConnectionState.Open) { conn.Open(); openedHere = true; }
    try
    {
        // 1) Create any tables that exist in the model but not in the database.
        //    Uses EF's generate-schema script so FKs/indexes are correct, executed table-by-table
        //    with existence checks.
        var existingTables = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
            using var reader = cmd.ExecuteReader();
            while (reader.Read()) existingTables.Add(reader.GetString(0));
        }

        var missingEntityTypes = dbContext.Model.GetEntityTypes()
            .Where(e => !string.IsNullOrEmpty(e.GetTableName()) && !existingTables.Contains(e.GetTableName()!))
            .ToList();

        if (missingEntityTypes.Any())
        {
            // Generate the full schema script and execute only the missing tables' CREATE statements.
            var script = dbContext.Database.GenerateCreateScript();
            foreach (var entityType in missingEntityTypes)
            {
                var tableName = entityType.GetTableName()!;
                // Extract the CREATE TABLE block for this table from the script
                var marker = $"CREATE TABLE [{tableName}]";
                var start = script.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                if (start < 0) continue;
                var end = script.IndexOf(");", start, StringComparison.OrdinalIgnoreCase);
                if (end < 0) continue;
                var createStatement = script.Substring(start, end - start + 2);

                try
                {
                    using var createCmd = conn.CreateCommand();
                    createCmd.CommandText = createStatement;
                    createCmd.ExecuteNonQuery();
                    Console.WriteLine($"Schema sync: created table {tableName}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Schema sync: failed to create table {tableName}: {ex.Message}");
                }
            }
            existingTables = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            using (var refreshCmd = conn.CreateCommand())
            {
                refreshCmd.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
                using var reader = refreshCmd.ExecuteReader();
                while (reader.Read()) existingTables.Add(reader.GetString(0));
            }
        }

        // 2) Add any columns present in the model but missing from existing tables.
        foreach (var entityType in dbContext.Model.GetEntityTypes())
        {
            var tableName = entityType.GetTableName();
            if (string.IsNullOrEmpty(tableName) || !existingTables.Contains(tableName)) continue;
            var existingCols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tn";
                var p = cmd.CreateParameter();
                p.ParameterName = "@tn";
                p.Value = tableName;
                cmd.Parameters.Add(p);
                using var reader = cmd.ExecuteReader();
                while (reader.Read()) existingCols.Add(reader.GetString(0));
            }

            foreach (var prop in entityType.GetProperties())
            {
                var colName = prop.GetColumnName();
                if (string.IsNullOrEmpty(colName) || existingCols.Contains(colName)) continue;
                if (prop.IsShadowProperty()) continue;

                var clrType = prop.ClrType;
                string sqlType;
                // Columns are added nullable to avoid failing on tables that already contain rows;
                // new values are always written with defaults by application code.
                var nullableSuffix = " NULL";
                if (clrType == typeof(int) || clrType == typeof(int?)) sqlType = "INT" + nullableSuffix;
                else if (clrType == typeof(long) || clrType == typeof(long?)) sqlType = "BIGINT" + nullableSuffix;
                else if (clrType == typeof(bool) || clrType == typeof(bool?)) sqlType = "BIT" + nullableSuffix;
                else if (clrType == typeof(decimal) || clrType == typeof(decimal?)) sqlType = "DECIMAL(18,2)" + nullableSuffix;
                else if (clrType == typeof(double) || clrType == typeof(double?)) sqlType = "FLOAT" + nullableSuffix;
                else if (clrType == typeof(float) || clrType == typeof(float?)) sqlType = "REAL" + nullableSuffix;
                else if (clrType == typeof(DateTime) || clrType == typeof(DateTime?)) sqlType = "DATETIME2" + nullableSuffix;
                else if (clrType == typeof(Guid) || clrType == typeof(Guid?)) sqlType = "UNIQUEIDENTIFIER" + nullableSuffix;
                else if (clrType == typeof(byte[])) sqlType = "VARBINARY(MAX)";
                else sqlType = "NVARCHAR(MAX)" + nullableSuffix;

                using var alter = conn.CreateCommand();
                alter.CommandText = $"ALTER TABLE [{tableName}] ADD [{colName}] {sqlType}";
                alter.ExecuteNonQuery();
                Console.WriteLine($"Schema sync: added column {tableName}.{colName}");
            }
        }
    }
    finally
    {
        if (openedHere) conn.Close();
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

// Serve uploaded media (images/videos) from wwwroot
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true,
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers["Cache-Control"] = "public, max-age=86400";
    }
});

app.UseAuthentication();
app.UseAuthorization();

// Capture audit context (who, from which computer) for every authenticated request
app.Use(async (context, next) =>
{
    try
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = context.User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var ip = context.Connection.RemoteIpAddress?.ToString();
            var host = AuditContext.ResolveHost(ip);
            AuditContext.Set(
                int.TryParse(userIdClaim, out var uid) ? uid : null, username, host, ip);
        }
    }
    catch { /* audit context capture must never break the request */ }

    try { await next(); }
    finally { AuditContext.Clear(); }
});

app.MapControllers();

// Serve the production Angular app (built into wwwroot/app) with SPA fallback
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "wwwroot", "app")),
    RequestPath = ""
});
app.MapFallbackToFile("{*path:nonfile}", "/app/index.html", new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // index.html must never be cached - it references hashed bundles that change on every build
        ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        ctx.Context.Response.Headers["Pragma"] = "no-cache";
        ctx.Context.Response.Headers["Expires"] = "0";
    }
});

app.Run();