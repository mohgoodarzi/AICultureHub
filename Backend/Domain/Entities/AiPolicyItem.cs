using AICultureHub.Domain.Common;

namespace AICultureHub.Domain.Entities;

/// <summary>
/// Editable AI Policy items (the 12-line corporate AI governance framework).
/// Stored in the database so content can be managed from the Admin Panel
/// without code changes.
/// </summary>
public class AiPolicyItem : BaseEntity
{
    public int DisplayOrder { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}
