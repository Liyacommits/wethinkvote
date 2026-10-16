namespace WeThinkVote.Core.DTOs;

public class AdminDashboardResponse
{
    public int TotalVoters { get; set; }
    public int RegisteredVoters { get; set; }
    public int VotesCount { get; set; }
    public string ElectionStatus { get; set; } = "Not Started";
    public string ElectionTitle { get; set; } = string.Empty;
    public List<CandidateDto> Candidates { get; set; } = new();
    public List<VoterListItemDto> Voters { get; set; } = new();
    public List<ActivityLogDto> RecentActivity { get; set; } = new();
}

public class ActivityLogDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TimeAgo { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class CreateElectionRequest
{
    public string Title { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public bool RequireVerification { get; set; } = true;
    public bool AllowResults { get; set; } = false;
}

public class AddCandidateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Party { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Bio { get; set; }
}

public class VotingCategoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Positions { get; set; } = new();
}

public class AddVotingCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Positions { get; set; } = new();
}
