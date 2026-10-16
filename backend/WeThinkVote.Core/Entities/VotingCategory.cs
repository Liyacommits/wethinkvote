namespace WeThinkVote.Core.Entities;

public class VotingCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ElectionId { get; set; }
    public Election? Election { get; set; }
    public string CategoryCode { get; set; } = string.Empty; // e.g. "sug", "faculty", "department"
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<Position> Positions { get; set; } = new List<Position>();
}
