using Microsoft.AspNetCore.Mvc;
using WeThinkVote.Core.DTOs;
using WeThinkVote.Infrastructure.Services;

namespace WeThinkVote.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResultsController : ControllerBase
{
    private readonly IElectionService _electionService;

    public ResultsController(IElectionService electionService)
    {
        _electionService = electionService;
    }

    [HttpGet]
    public async Task<ActionResult<ElectionResultsResponse>> GetResults([FromQuery] Guid? electionId)
    {
        var result = await _electionService.GetElectionResultsAsync(electionId);
        return Ok(result);
    }
}
