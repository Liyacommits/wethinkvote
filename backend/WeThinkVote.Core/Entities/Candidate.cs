namespace WeThinkVote.Core.Entities;

public class Candidate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PositionId { get; set; }
    public Position? Position { get; set; }
    public uint OnChainId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Party { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public int Votes { get; set; } = 0;
}
