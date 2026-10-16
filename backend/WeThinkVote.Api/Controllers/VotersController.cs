using Microsoft.AspNetCore.Mvc;
using WeThinkVote.Core.DTOs;
using WeThinkVote.Infrastructure.Services;

namespace WeThinkVote.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VotersController : ControllerBase
{
    private readonly IElectionService _electionService;

    public VotersController(IElectionService electionService)
    {
        _electionService = electionService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterVoterResponse>> Register([FromBody] RegisterVoterRequest request)
    {
        var result = await _electionService.RegisterVoterAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{walletAddress}/status")]
    public async Task<ActionResult<VoterStatusResponse>> GetStatus(string walletAddress)
    {
        var result = await _electionService.GetVoterStatusAsync(walletAddress);
        return Ok(result);
    }
}
