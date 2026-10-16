namespace WeThinkVote.Core.DTOs;

public class VerifyEligibilityRequest
{
    public string StudentId { get; set; } = string.Empty;
    public string MatricNumber { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
}

public class VerifyEligibilityResponse
{
    public bool Eligible { get; set; }
    public string? StudentId { get; set; }
    public string? FullName { get; set; }
    public string? Department { get; set; }
    public string? Level { get; set; }
    public string? Message { get; set; }
}
