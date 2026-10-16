using Microsoft.AspNetCore.SignalR;

namespace WeThinkVote.Api.Hubs;

public class ElectionHub : Hub
{
    public async Task JoinElectionGroup(string electionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, electionId);
    }

    public async Task LeaveElectionGroup(string electionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, electionId);
    }
}
