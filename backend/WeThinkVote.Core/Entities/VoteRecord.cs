namespace WeThinkVote.Core.Entities;

public class VoteRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ElectionId { get; set; }
    public Election? Election { get; set; }
    public Guid PositionId { get; set; }
    public Guid CandidateId { get; set; }
    public string TransactionHash { get; set; } = string.Empty;
    public string VoterAddressMasked { get; set; } = string.Empty;
    public DateTime CastedAt { get; set; } = DateTime.UtcNow;
}
