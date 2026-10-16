namespace WeThinkVote.Core.DTOs;

public class RegisterVoterRequest
{
    public string StudentId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string WalletAddress { get; set; } = string.Empty;
    public string? Signature { get; set; }
}

public class RegisterVoterResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? WalletAddress { get; set; }
}

public class VoterStatusResponse
{
    public bool IsRegistered { get; set; }
    public bool HasVoted { get; set; }
    public string? StudentId { get; set; }
    public string? Department { get; set; }
    public string? WalletAddress { get; set; }
}

public class VoterListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string WalletAddress { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string RegistrationDate { get; set; } = string.Empty;
    public bool HasVoted { get; set; }
}
