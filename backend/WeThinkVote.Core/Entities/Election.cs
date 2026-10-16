using WeThinkVote.Core.Enums;

namespace WeThinkVote.Core.Entities;

public class Election
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public ElectionStatus Status { get; set; } = ElectionStatus.Created;
    public string ContractAddress { get; set; } = string.Empty;
    public bool RequireVerification { get; set; } = true;
    public bool AllowResultsDuringVoting { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<VotingCategory> Categories { get; set; } = new List<VotingCategory>();
    public ICollection<VoterRegistration> Registrations { get; set; } = new List<VoterRegistration>();
    public ICollection<VoteRecord> VoteRecords { get; set; } = new List<VoteRecord>();
}
