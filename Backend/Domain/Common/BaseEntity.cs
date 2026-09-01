namespace AICultureHub.Domain.Common;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ModifiedDate { get; set; }
    public int? CreatedBy { get; set; }
    public int? ModifiedBy { get; set; }
}

public abstract class AuditableEntity : BaseEntity
{
    public DateTime? LastActivityDate { get; set; }
}
