namespace WeThinkVote.Core.DTOs;

public class CandidateDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Party { get; set; } = string.Empty;
    public int Votes { get; set; }
    public double Percentage { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}

public class PositionDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? CategoryCode { get; set; }
    public List<CandidateDto> Candidates { get; set; } = new();
    public int TotalVotes { get; set; }
}

public class ElectionDataResponse
{
    public string ElectionId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ContractAddress { get; set; } = string.Empty;
    public List<PositionDto> Positions { get; set; } = new();
}

public class CastVoteRequest
{
    public Dictionary<string, string> SelectedCandidates { get; set; } = new();
    public string? VoterAddress { get; set; }
    public string? Signature { get; set; }
}

public class CastVoteResponse
{
    public bool Success { get; set; }
    public string TransactionHash { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ElectionResultsResponse
{
    public string ElectionId { get; set; } = string.Empty;
    public string ElectionTitle { get; set; } = string.Empty;
    public string ElectionStatus { get; set; } = string.Empty;
    public int TotalVotes { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public List<PositionDto> Positions { get; set; } = new();
}
