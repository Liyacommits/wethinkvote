using Microsoft.AspNetCore.Mvc;
using WeThinkVote.Core.DTOs;
using WeThinkVote.Infrastructure.Services;

namespace WeThinkVote.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EligibilityController : ControllerBase
{
    private readonly IElectionService _electionService;

    public EligibilityController(IElectionService electionService)
    {
        _electionService = electionService;
    }

    [HttpPost("verify")]
    public async Task<ActionResult<VerifyEligibilityResponse>> Verify([FromBody] VerifyEligibilityRequest request)
    {
        var result = await _electionService.VerifyEligibilityAsync(request);
        return Ok(result);
    }
}
