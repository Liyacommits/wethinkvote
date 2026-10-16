using WeThinkVote.Core.DTOs;

namespace WeThinkVote.Infrastructure.Services;

public interface IElectionService
{
    Task<VerifyEligibilityResponse> VerifyEligibilityAsync(VerifyEligibilityRequest request);
    Task<RegisterVoterResponse> RegisterVoterAsync(RegisterVoterRequest request);
    Task<VoterStatusResponse> GetVoterStatusAsync(string walletAddress);
    Task<ElectionDataResponse> GetActiveElectionDataAsync();
    Task<ElectionResultsResponse> GetElectionResultsAsync(Guid? electionId = null);
    Task<CastVoteResponse> CastVoteAsync(CastVoteRequest request);
    Task<AdminDashboardResponse> GetAdminDashboardAsync();
    Task<bool> CreateElectionAsync(CreateElectionRequest request);
    Task<bool> AddCandidateAsync(AddCandidateRequest request);
    Task<bool> RemoveCandidateAsync(string candidateId);
    Task<bool> StartElectionAsync();
    Task<bool> EndElectionAsync();
    Task<List<VotingCategoryDto>> GetVotingCategoriesAsync();
    Task<bool> AddVotingCategoryAsync(AddVotingCategoryRequest request);
    Task<bool> RemoveVotingCategoryAsync(string categoryId);
}
