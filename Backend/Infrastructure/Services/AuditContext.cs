using AICultureHub.Domain.Entities;

namespace AICultureHub.Infrastructure.Services;

/// <summary>
/// Ambient information about the current request, captured by middleware and
/// consumed by ApplicationDbContext when writing audit logs.
/// </summary>
public static class AuditContext
{
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, string> HostCache = new();

    public static string ResolveHost(string? ip)
    {
        if (string.IsNullOrEmpty(ip)) return "";
        return HostCache.GetOrAdd(ip, address =>
        {
            try { return System.Net.Dns.GetHostEntry(address).HostName; }
            catch { return address; }
        });
    }

    public static int? UserId { get; private set; }
    public static string? Username { get; private set; }
    public static string? HostName { get; private set; }
    public static string? IpAddress { get; private set; }
    public static bool Enabled { get; private set; }

    public static void Set(int? userId, string? username, string? hostName, string? ipAddress)
    {
        UserId = userId;
        Username = username;
        HostName = hostName;
        IpAddress = ipAddress;
        Enabled = true;
    }

    public static void Clear()
    {
        UserId = null;
        Username = null;
        HostName = null;
        IpAddress = null;
        Enabled = false;
    }

    public static AuditLog CreateLog(string action, string entityType, int? entityId,
        string? description, string? oldValues, string? newValues, bool success = true, string? error = null)
    {
        return new AuditLog
        {
            UserId = UserId,
            Username = Username ?? (UserId.HasValue ? $"user-{UserId.Value}" : "anonymous"),
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Description = description,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = IpAddress,
            UserAgent = HostName,
            Timestamp = DateTime.UtcNow,
            IsSuccess = success,
            ErrorMessage = error
        };
    }
}