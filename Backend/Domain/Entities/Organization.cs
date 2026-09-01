using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public int? ParentId { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public virtual Department? Parent { get; set; }
    public virtual ICollection<Department> Children { get; set; } = new List<Department>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}

public class Position : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
    public int? DepartmentId { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public virtual Department? Department { get; set; }
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
