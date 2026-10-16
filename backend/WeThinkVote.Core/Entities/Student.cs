namespace WeThinkVote.Core.Entities;

public class Student
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string StudentNumber { get; set; } = string.Empty;
    public string MatricNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsEligible { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<VoterRegistration> Registrations { get; set; } = new List<VoterRegistration>();
}
