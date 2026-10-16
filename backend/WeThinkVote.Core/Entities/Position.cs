namespace WeThinkVote.Core.Entities;

public class Position
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public VotingCategory? Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;

    public ICollection<Candidate> Candidates { get; set; } = new List<Candidate>();
}
