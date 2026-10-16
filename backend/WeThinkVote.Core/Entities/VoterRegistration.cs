namespace WeThinkVote.Core.Entities;

public class VoterRegistration
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public Guid ElectionId { get; set; }
    public Election? Election { get; set; }
    public string WalletAddress { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
    public bool HasVoted { get; set; } = false;
    public string? TransactionHash { get; set; }
}
