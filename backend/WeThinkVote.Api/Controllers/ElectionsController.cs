using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using WeThinkVote.Api.Hubs;
using WeThinkVote.Core.DTOs;
using WeThinkVote.Infrastructure.Services;

namespace WeThinkVote.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ElectionsController : ControllerBase
{
    private readonly IElectionService _electionService;
    private readonly IHubContext<ElectionHub> _hubContext;

    public ElectionsController(IElectionService electionService, IHubContext<ElectionHub> hubContext)
    {
        _electionService = electionService;
        _hubContext = hubContext;
    }

    [HttpGet("active")]
    public async Task<ActionResult<ElectionDataResponse>> GetActiveElection()
    {
        var result = await _electionService.GetActiveElectionDataAsync();
        return Ok(result);
    }

    [HttpPost("vote")]
    public async Task<ActionResult<CastVoteResponse>> CastVote([FromBody] CastVoteRequest request)
    {
        var result = await _electionService.CastVoteAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        // Notify all clients of new vote and broadcast updated results
        try
        {
            var updatedResults = await _electionService.GetElectionResultsAsync();
            await _hubContext.Clients.All.SendAsync("ResultsUpdated", updatedResults);
            await _hubContext.Clients.All.SendAsync("VoteRecorded", new { TxHash = result.TransactionHash, Timestamp = DateTime.UtcNow });
        }
        catch
        {
            // Logging or non-fatal fallback
        }

        return Ok(result);
    }
}
