namespace WeThinkVote.Infrastructure.Services;

public interface IBlockchainService
{
    Task<string> CastVoteAsync(string voterWallet, Dictionary<string, string> selectedCandidates);
    Task<string> RegisterVoterOnChainAsync(string voterWallet, string studentId, string department, string level);
    Task<bool> IsConnectedAsync();
}
