using Microsoft.AspNetCore.Mvc;
using WeThinkVote.Core.DTOs;
using WeThinkVote.Infrastructure.Services;

namespace WeThinkVote.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IElectionService _electionService;

    public AdminController(IElectionService electionService)
    {
        _electionService = electionService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardResponse>> GetDashboard()
    {
        var result = await _electionService.GetAdminDashboardAsync();
        return Ok(result);
    }

    [HttpPost("elections")]
    public async Task<ActionResult> CreateElection([FromBody] CreateElectionRequest request)
    {
        var success = await _electionService.CreateElectionAsync(request);
        if (!success) return BadRequest(new { Message = "Failed to create election" });
        return Ok(new { Success = true, Message = "Election created successfully" });
    }

    [HttpPost("elections/start")]
    public async Task<ActionResult> StartElection()
    {
        var success = await _electionService.StartElectionAsync();
        if (!success) return BadRequest(new { Message = "Failed to start election" });
        return Ok(new { Success = true, Message = "Election started successfully" });
    }

    [HttpPost("elections/end")]
    public async Task<ActionResult> EndElection()
    {
        var success = await _electionService.EndElectionAsync();
        if (!success) return BadRequest(new { Message = "Failed to end election" });
        return Ok(new { Success = true, Message = "Election ended successfully" });
    }

    [HttpPost("candidates")]
    public async Task<ActionResult> AddCandidate([FromBody] AddCandidateRequest request)
    {
        var success = await _electionService.AddCandidateAsync(request);
        if (!success) return BadRequest(new { Message = "Failed to add candidate" });
        return Ok(new { Success = true, Message = "Candidate added successfully" });
    }

    [HttpDelete("candidates/{id}")]
    public async Task<ActionResult> RemoveCandidate(string id)
    {
        var success = await _electionService.RemoveCandidateAsync(id);
        if (!success) return BadRequest(new { Message = "Failed to remove candidate" });
        return Ok(new { Success = true, Message = "Candidate removed successfully" });
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<VotingCategoryDto>>> GetCategories()
    {
        var result = await _electionService.GetVotingCategoriesAsync();
        return Ok(result);
    }

    [HttpPost("categories")]
    public async Task<ActionResult> AddCategory([FromBody] AddVotingCategoryRequest request)
    {
        var success = await _electionService.AddVotingCategoryAsync(request);
        if (!success) return BadRequest(new { Message = "Failed to add voting category" });
        return Ok(new { Success = true, Message = "Voting category added successfully" });
    }

    [HttpDelete("categories/{id}")]
    public async Task<ActionResult> RemoveCategory(string id)
    {
        var success = await _electionService.RemoveVotingCategoryAsync(id);
        if (!success) return BadRequest(new { Message = "Failed to remove voting category" });
        return Ok(new { Success = true, Message = "Voting category removed successfully" });
    }
}
