using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using AICultureHub.Application.DTOs;
using AICultureHub.Application.Interfaces;
using AICultureHub.Domain.Entities;
using AICultureHub.Infrastructure.Data;

namespace AICultureHub.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IAuditService _auditService;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly int _jwtExpiryMinutes;

    public AuthService(
        ApplicationDbContext context,
        INotificationService notificationService,
        IAuditService auditService)
    {
        _context = context;
        _notificationService = notificationService;
        _auditService = auditService;
        _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "DefaultSecretKey123456789012345678901234567890";
        _jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "AICultureHub";
        _jwtExpiryMinutes = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES") ?? "60");
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.CurrentLevel)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        if (!VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt ?? ""))
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        user.LastLoginDate = DateTime.UtcNow;
        user.LastActivityDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var userDto = await MapToUserDto(user);

        await _auditService.LogAsync(user.Id, "LOGIN", "User", user.Id, "User logged in");

        return new LoginResponse
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtExpiryMinutes),
            User = userDto
        };
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Trim().Length < 3)
            throw new InvalidOperationException("Username must be at least 3 characters");
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            throw new InvalidOperationException("A valid email address is required");
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            throw new InvalidOperationException("Password must be at least 6 characters");
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            throw new InvalidOperationException("First name and last name are required");

        request.Username = request.Username.Trim().ToLowerInvariant();
        request.Email = request.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            throw new InvalidOperationException("Username already exists");
        }

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        if (!string.IsNullOrWhiteSpace(request.EmployeeId) && await _context.Users.AnyAsync(u => u.EmployeeId == request.EmployeeId.Trim()))
        {
            throw new InvalidOperationException("این شماره پرسنلی قبلاً ثبت شده است. هر کارمند فقط یک‌بار می‌تواند ثبت‌نام کند.");
        }

        var salt = GenerateSalt();
        var passwordHash = HashPassword(request.Password, salt);

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            PasswordSalt = salt,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DepartmentId = request.DepartmentId,
            PositionId = request.PositionId,
            EmployeeId = string.IsNullOrWhiteSpace(request.EmployeeId) ? null : request.EmployeeId.Trim(),
            CurrentLevelId = 1,
            IsActive = true,
            IsEmailVerified = true,
            CreatedDate = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var employeeRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Employee");
        if (employeeRole != null)
        {
            _context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = employeeRole.Id,
                AssignedDate = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }

        await _notificationService.CreateNotificationAsync(
            user.Id,
            "Welcome to AI Culture Hub!",
            "Start your AI learning journey today. Check out our latest courses and articles.",
            "System");

        await _auditService.LogAsync(user.Id, "REGISTER", "User", user.Id, "User registered");

        var userDto = await MapToUserDto(user);
        var token = GenerateJwtToken(user);

        return new LoginResponse
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtExpiryMinutes),
            User = userDto
        };
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.CurrentLevel)
            .Include(u => u.Department)
            .Include(u => u.Position)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user != null ? await MapToUserDto(user) : null;
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;
        if (request.DepartmentId.HasValue) user.DepartmentId = request.DepartmentId;
        if (request.PositionId.HasValue) user.PositionId = request.PositionId;
        if (!string.IsNullOrEmpty(request.Location)) user.Location = request.Location;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;

        user.ModifiedDate = DateTime.UtcNow;
        user.ModifiedBy = userId;

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(userId, "UPDATE_PROFILE", "User", userId, "Profile updated");

        return await GetCurrentUserAsync(userId);
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (!VerifyPassword(currentPassword, user.PasswordHash, user.PasswordSalt ?? ""))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        var newSalt = GenerateSalt();
        user.PasswordHash = HashPassword(newPassword, newSalt);
        user.PasswordSalt = newSalt;
        user.ModifiedDate = DateTime.UtcNow;
        user.ModifiedBy = userId;

        await _context.SaveChangesAsync();
        await _auditService.LogAsync(userId, "CHANGE_PASSWORD", "User", userId, "Password changed");

        return true;
    }

    private async Task<UserDto> MapToUserDto(User user)
    {
        var badges = await _context.UserBadges
            .Where(ub => ub.UserId == user.Id)
            .Include(ub => ub.Badge)
            .Select(ub => new BadgeDto
            {
                Id = ub.Badge.Id,
                Name = ub.Badge.Name,
                Description = ub.Badge.Description,
                IconUrl = ub.Badge.IconUrl,
                Color = ub.Badge.Color,
                EarnedDate = ub.EarnedDate
            })
            .ToListAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            DepartmentId = user.DepartmentId,
            DepartmentName = user.Department?.Name,
            PositionId = user.PositionId,
            PositionName = user.Position?.Name,
            Location = user.Location,
            EmployeeId = user.EmployeeId,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            IsActive = user.IsActive,
            TotalPoints = user.TotalPoints,
            CurrentLevelPoints = user.CurrentLevelPoints,
            LearningStreak = user.LearningStreak,
            CurrentLevel = user.CurrentLevel != null ? new LevelDto
            {
                Id = user.CurrentLevel.Id,
                LevelNumber = user.CurrentLevel.LevelNumber,
                Name = user.CurrentLevel.Name,
                Description = user.CurrentLevel.Description,
                PointsRequired = user.CurrentLevel.PointsRequired,
                Color = user.CurrentLevel.Color,
                NextLevelPoints = _context.Levels.Where(l => l.LevelNumber == user.CurrentLevel.LevelNumber + 1).Select(l => l.PointsRequired).FirstOrDefault()
            } : null,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            Badges = badges
        };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName)
        };

        foreach (var role in user.UserRoles.Select(ur => ur.Role.Name))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtExpiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateSalt()
    {
        var salt = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(salt);
        return Convert.ToBase64String(salt);
    }

    private static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var saltedPassword = password + salt;
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPassword(string password, string storedHash, string salt)
    {
        var hash = HashPassword(password, salt);
        return hash == storedHash;
    }
}
