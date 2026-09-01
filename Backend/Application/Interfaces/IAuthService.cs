using AICultureHub.Application.DTOs;

namespace AICultureHub.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RegisterAsync(RegisterRequest request);
    Task<UserDto?> GetCurrentUserAsync(int userId);
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
}
