namespace AICultureHub.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(int? userId, string action, string? entityType, int? entityId, string? description, string? oldValues = null, string? newValues = null);
}
