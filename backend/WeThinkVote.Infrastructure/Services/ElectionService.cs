using Microsoft.EntityFrameworkCore;
using WeThinkVote.Core.DTOs;
using WeThinkVote.Core.Entities;
using WeThinkVote.Core.Enums;
using WeThinkVote.Infrastructure.Data;

namespace WeThinkVote.Infrastructure.Services;

public class ElectionService : IElectionService
{
    private readonly ApplicationDbContext _context;
    private readonly IBlockchainService _blockchainService;

    public ElectionService(ApplicationDbContext context, IBlockchainService blockchainService)
    {
        _context = context;
        _blockchainService = blockchainService;
    }

    public async Task<VerifyEligibilityResponse> VerifyEligibilityAsync(VerifyEligibilityRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.StudentId) || string.IsNullOrWhiteSpace(request.MatricNumber))
        {
            return new VerifyEligibilityResponse
            {
                Eligible = false,
                Message = "Student ID and Matriculation number are required."
            };
        }

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.StudentNumber.ToLower() == request.StudentId.Trim().ToLower()
                                   && s.MatricNumber.ToLower() == request.MatricNumber.Trim().ToLower());

        if (student == null)
        {
            return new VerifyEligibilityResponse
            {
                Eligible = false,
                Message = "Student credentials not found on the official university registrar roll. Please contact the electoral office."
            };
        }

        if (!student.IsEligible)
        {
            return new VerifyEligibilityResponse
            {
                Eligible = false,
                Message = "Student record indicates active suspension or ineligible enrollment status."
            };
        }

        return new VerifyEligibilityResponse
        {
            Eligible = true,
            StudentId = student.StudentNumber,
            FullName = student.FullName,
            Department = student.Department,
            Level = student.Level,
            Message = "Student eligibility verified successfully."
        };
    }

    public async Task<RegisterVoterResponse> RegisterVoterAsync(RegisterVoterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.WalletAddress))
        {
            return new RegisterVoterResponse { Success = false, Message = "Wallet address is required." };
        }

        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.StudentNumber.ToLower() == request.StudentId.Trim().ToLower());

        if (student == null || !student.IsEligible)
        {
            return new RegisterVoterResponse { Success = false, Message = "Eligible student record could not be found." };
        }

        var election = await _context.Elections.FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active)
                       ?? await _context.Elections.OrderByDescending(e => e.CreatedAt).FirstOrDefaultAsync();

        if (election == null)
        {
            return new RegisterVoterResponse { Success = false, Message = "No active election found." };
        }

        var normalizedWallet = request.WalletAddress.Trim().ToLower();

        // Check if student already registered for this election
        var studentReg = await _context.VoterRegistrations
            .FirstOrDefaultAsync(r => r.ElectionId == election.Id && r.StudentId == student.Id);

        if (studentReg != null)
        {
            if (studentReg.WalletAddress.Equals(request.WalletAddress.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return new RegisterVoterResponse
                {
                    Success = true,
                    Message = "You are already registered to vote with this wallet address.",
                    WalletAddress = request.WalletAddress
                };
            }

            if (!studentReg.HasVoted)
            {
                studentReg.WalletAddress = request.WalletAddress.Trim();
                studentReg.RegistrationDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return new RegisterVoterResponse
                {
                    Success = true,
                    Message = "Wallet address updated successfully on the election ledger.",
                    WalletAddress = request.WalletAddress
                };
            }

            return new RegisterVoterResponse
            {
                Success = false,
                Message = "This student has already cast a ballot and cannot change wallets."
            };
        }

        // Check if wallet is already bound to another student
        var existingWalletReg = await _context.VoterRegistrations
            .AnyAsync(r => r.ElectionId == election.Id && r.WalletAddress.ToLower() == normalizedWallet);

        if (existingWalletReg)
        {
            return new RegisterVoterResponse
            {
                Success = false,
                Message = "This wallet address is already bound to another student registration."
            };
        }

        var txHash = await _blockchainService.RegisterVoterOnChainAsync(
            request.WalletAddress, student.StudentNumber, student.Department, student.Level);

        var reg = new VoterRegistration
        {
            StudentId = student.Id,
            ElectionId = election.Id,
            WalletAddress = request.WalletAddress.Trim(),
            RegistrationDate = DateTime.UtcNow,
            HasVoted = false,
            TransactionHash = txHash
        };

        _context.VoterRegistrations.Add(reg);
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "VoterRegistered",
            PerformedBy = student.StudentNumber,
            Details = $"Registered wallet {request.WalletAddress} for election {election.Title}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return new RegisterVoterResponse
        {
            Success = true,
            Message = "Voter registered successfully on the blockchain ledger.",
            WalletAddress = request.WalletAddress
        };
    }

    public async Task<VoterStatusResponse> GetVoterStatusAsync(string walletAddress)
    {
        if (string.IsNullOrWhiteSpace(walletAddress))
        {
            return new VoterStatusResponse { IsRegistered = false, HasVoted = false };
        }

        var normalizedWallet = walletAddress.Trim().ToLower();
        var election = await _context.Elections.FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active)
                       ?? await _context.Elections.OrderByDescending(e => e.CreatedAt).FirstOrDefaultAsync();

        if (election == null)
        {
            return new VoterStatusResponse { IsRegistered = false, HasVoted = false };
        }

        var reg = await _context.VoterRegistrations
            .Include(r => r.Student)
            .FirstOrDefaultAsync(r => r.ElectionId == election.Id && r.WalletAddress.ToLower() == normalizedWallet);

        if (reg == null)
        {
            return new VoterStatusResponse { IsRegistered = false, HasVoted = false };
        }

        return new VoterStatusResponse
        {
            IsRegistered = true,
            HasVoted = reg.HasVoted,
            StudentId = reg.Student?.StudentNumber,
            Department = reg.Student?.Department,
            WalletAddress = reg.WalletAddress
        };
    }

    public async Task<ElectionDataResponse> GetActiveElectionDataAsync()
    {
        var election = await _context.Elections
            .Include(e => e.Categories)
                .ThenInclude(c => c.Positions)
                    .ThenInclude(p => p.Candidates)
            .FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active)
            ?? await _context.Elections
                .Include(e => e.Categories)
                    .ThenInclude(c => c.Positions)
                        .ThenInclude(p => p.Candidates)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

        if (election == null)
        {
            return new ElectionDataResponse { Title = "No active election" };
        }

        var positions = new List<PositionDto>();

        foreach (var category in election.Categories.Where(c => c.IsActive))
        {
            foreach (var pos in category.Positions.OrderBy(p => p.DisplayOrder))
            {
                var totalVotesForPos = pos.Candidates.Sum(c => c.Votes);
                var candDtos = pos.Candidates.Select(c => new CandidateDto
                {
                    Id = c.Id.ToString(),
                    Name = c.Name,
                    Position = pos.Title,
                    Party = c.Party,
                    Votes = c.Votes,
                    Percentage = totalVotesForPos > 0 ? Math.Round((double)c.Votes / totalVotesForPos * 100, 1) : 0,
                    Bio = c.Bio,
                    AvatarUrl = c.AvatarUrl
                }).ToList();

                positions.Add(new PositionDto
                {
                    Id = pos.Id.ToString(),
                    Title = pos.Title,
                    CategoryCode = category.CategoryCode,
                    Candidates = candDtos,
                    TotalVotes = totalVotesForPos
                });
            }
        }

        return new ElectionDataResponse
        {
            ElectionId = election.Id.ToString(),
            Title = election.Title,
            Status = election.Status.ToString(),
            ContractAddress = election.ContractAddress,
            Positions = positions
        };
    }

    public async Task<ElectionResultsResponse> GetElectionResultsAsync(Guid? electionId = null)
    {
        var query = _context.Elections
            .Include(e => e.Categories)
                .ThenInclude(c => c.Positions)
                    .ThenInclude(p => p.Candidates)
            .AsQueryable();

        Election? election;
        if (electionId.HasValue)
        {
            election = await query.FirstOrDefaultAsync(e => e.Id == electionId.Value);
        }
        else
        {
            election = await query.FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active)
                       ?? await query.OrderByDescending(e => e.CreatedAt).FirstOrDefaultAsync();
        }

        if (election == null)
        {
            return new ElectionResultsResponse { ElectionTitle = "No election results found" };
        }

        var positions = new List<PositionDto>();
        int grandTotalVotes = 0;

        foreach (var category in election.Categories.Where(c => c.IsActive))
        {
            foreach (var pos in category.Positions.OrderBy(p => p.DisplayOrder))
            {
                var totalVotes = pos.Candidates.Sum(c => c.Votes);
                grandTotalVotes += totalVotes;

                var cands = pos.Candidates.Select(c => new CandidateDto
                {
                    Id = c.Id.ToString(),
                    Name = c.Name,
                    Position = pos.Title,
                    Party = c.Party,
                    Votes = c.Votes,
                    Percentage = totalVotes > 0 ? Math.Round((double)c.Votes / totalVotes * 100, 1) : 0,
                    Bio = c.Bio
                }).OrderByDescending(c => c.Votes).ToList();

                positions.Add(new PositionDto
                {
                    Id = pos.Id.ToString(),
                    Title = pos.Title,
                    CategoryCode = category.CategoryCode,
                    Candidates = cands,
                    TotalVotes = totalVotes
                });
            }
        }

        return new ElectionResultsResponse
        {
            ElectionId = election.Id.ToString(),
            ElectionTitle = election.Title,
            ElectionStatus = election.Status.ToString(),
            TotalVotes = grandTotalVotes,
            LastUpdated = DateTime.UtcNow,
            Positions = positions
        };
    }

    public async Task<CastVoteResponse> CastVoteAsync(CastVoteRequest request)
    {
        if (request.SelectedCandidates == null || !request.SelectedCandidates.Any())
        {
            return new CastVoteResponse { Success = false, Message = "No candidates were selected." };
        }

        var election = await _context.Elections
            .Include(e => e.Categories)
                .ThenInclude(c => c.Positions)
                    .ThenInclude(p => p.Candidates)
            .FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active);

        if (election == null)
        {
            return new CastVoteResponse { Success = false, Message = "There is no currently active election accepting votes." };
        }

        VoterRegistration? registration = null;
        if (!string.IsNullOrWhiteSpace(request.VoterAddress))
        {
            var normalizedWallet = request.VoterAddress.Trim().ToLower();
            registration = await _context.VoterRegistrations
                .FirstOrDefaultAsync(r => r.ElectionId == election.Id && r.WalletAddress.ToLower() == normalizedWallet);

            if (registration != null && registration.HasVoted)
            {
                return new CastVoteResponse { Success = false, Message = "This voter wallet has already cast a ballot in this election." };
            }
        }

        // Tally votes for each candidate
        foreach (var (posIdStr, candIdStr) in request.SelectedCandidates)
        {
            if (Guid.TryParse(candIdStr, out var candGuid))
            {
                var cand = await _context.Candidates.FirstOrDefaultAsync(c => c.Id == candGuid);
                if (cand != null)
                {
                    cand.Votes++;
                }
            }
            else
            {
                // Fallback by name or index
                var cand = await _context.Candidates.FirstOrDefaultAsync(c => c.Name == candIdStr);
                if (cand != null)
                {
                    cand.Votes++;
                }
            }
        }

        var voterWallet = request.VoterAddress ?? "0xAnonymousVoter";
        var txHash = await _blockchainService.CastVoteAsync(voterWallet, request.SelectedCandidates);

        if (registration != null)
        {
            registration.HasVoted = true;
            registration.TransactionHash = txHash;
        }

        _context.AuditLogs.Add(new AuditLog
        {
            Action = "VoteCast",
            PerformedBy = voterWallet.Length > 10 ? $"{voterWallet[..6]}...{voterWallet[^4..]}" : voterWallet,
            Details = $"Cast vote for {request.SelectedCandidates.Count} positions. Tx: {txHash}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return new CastVoteResponse
        {
            Success = true,
            TransactionHash = txHash,
            Message = "Your vote has been verified and permanently recorded on the blockchain ledger."
        };
    }

    public async Task<AdminDashboardResponse> GetAdminDashboardAsync()
    {
        var election = await _context.Elections
            .Include(e => e.Categories)
                .ThenInclude(c => c.Positions)
                    .ThenInclude(p => p.Candidates)
            .FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active)
            ?? await _context.Elections
                .Include(e => e.Categories)
                    .ThenInclude(c => c.Positions)
                        .ThenInclude(p => p.Candidates)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

        var totalEligible = await _context.Students.CountAsync(s => s.IsEligible);
        var totalRegistered = election != null 
            ? await _context.VoterRegistrations.CountAsync(r => r.ElectionId == election.Id)
            : await _context.VoterRegistrations.CountAsync();

        var totalVotesCount = election != null
            ? await _context.VoterRegistrations.CountAsync(r => r.ElectionId == election.Id && r.HasVoted)
            : await _context.VoterRegistrations.CountAsync(r => r.HasVoted);

        // Collect all candidates
        var candidates = new List<CandidateDto>();
        if (election != null)
        {
            foreach (var cat in election.Categories)
            {
                foreach (var pos in cat.Positions)
                {
                    foreach (var c in pos.Candidates)
                    {
                        candidates.Add(new CandidateDto
                        {
                            Id = c.Id.ToString(),
                            Name = c.Name,
                            Position = pos.Title,
                            Party = c.Party,
                            Votes = c.Votes,
                            Bio = c.Bio
                        });
                    }
                }
            }
        }

        // Collect voters
        var voters = await _context.VoterRegistrations
            .Include(r => r.Student)
            .OrderByDescending(r => r.RegistrationDate)
            .Take(50)
            .Select(r => new VoterListItemDto
            {
                Id = r.Id.ToString(),
                StudentId = r.Student != null ? r.Student.StudentNumber : "N/A",
                WalletAddress = r.WalletAddress,
                Department = r.Student != null ? r.Student.Department : "General",
                RegistrationDate = r.RegistrationDate.ToString("yyyy-MM-dd"),
                HasVoted = r.HasVoted
            })
            .ToListAsync();

        // Recent Activity
        var logs = await _context.AuditLogs
            .OrderByDescending(l => l.Timestamp)
            .Take(10)
            .ToListAsync();

        var activityDtos = logs.Select(l => new ActivityLogDto
        {
            Id = l.Id.ToString(),
            Type = l.Action,
            Title = $"{l.Action}: {l.Details}",
            TimeAgo = FormatTimeAgo(l.Timestamp),
            Timestamp = l.Timestamp
        }).ToList();

        return new AdminDashboardResponse
        {
            TotalVoters = totalEligible > 0 ? totalEligible : 500,
            RegisteredVoters = totalRegistered,
            VotesCount = totalVotesCount,
            ElectionStatus = election != null ? election.Status.ToString() : "Not Started",
            ElectionTitle = election != null ? election.Title : "No Active Election",
            Candidates = candidates,
            Voters = voters,
            RecentActivity = activityDtos
        };
    }

    private static string FormatTimeAgo(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 1) return "Just now";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} minutes ago";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} hours ago";
        return $"{(int)diff.TotalDays} days ago";
    }

    public async Task<bool> CreateElectionAsync(CreateElectionRequest request)
    {
        var election = new Election
        {
            Title = request.Title,
            Description = "General Student Election",
            StartDate = DateTime.TryParse(request.StartDate, out var s) ? s : DateTime.UtcNow,
            EndDate = DateTime.TryParse(request.EndDate, out var e) ? e : DateTime.UtcNow.AddDays(3),
            Status = ElectionStatus.Created,
            RequireVerification = request.RequireVerification,
            AllowResultsDuringVoting = request.AllowResults,
            ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        };

        var sug = new VotingCategory
        {
            Election = election,
            CategoryCode = "sug",
            Name = "Student Union Government",
            Description = "Executive Council",
            IsActive = true
        };

        sug.Positions.Add(new Position { Category = sug, Title = "President", DisplayOrder = 1 });
        sug.Positions.Add(new Position { Category = sug, Title = "Vice President", DisplayOrder = 2 });
        election.Categories.Add(sug);

        _context.Elections.Add(election);
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "ElectionCreated",
            PerformedBy = "Admin",
            Details = $"Created election: {election.Title}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddCandidateAsync(AddCandidateRequest request)
    {
        var election = await _context.Elections
            .Include(e => e.Categories)
                .ThenInclude(c => c.Positions)
                    .ThenInclude(p => p.Candidates)
            .FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active)
            ?? await _context.Elections
                .Include(e => e.Categories)
                    .ThenInclude(c => c.Positions)
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

        if (election == null) return false;

        var category = election.Categories.FirstOrDefault(c => c.IsActive) 
                       ?? election.Categories.FirstOrDefault();

        if (category == null)
        {
            category = new VotingCategory
            {
                Election = election,
                CategoryCode = "general",
                Name = "General Positions",
                Description = "General positions",
                IsActive = true
            };
            election.Categories.Add(category);
            await _context.SaveChangesAsync();
        }

        var position = category.Positions.FirstOrDefault(p => p.Title.Equals(request.Position, StringComparison.OrdinalIgnoreCase));
        if (position == null)
        {
            position = new Position
            {
                CategoryId = category.Id,
                Title = request.Position,
                DisplayOrder = category.Positions.Count + 1
            };
            category.Positions.Add(position);
            await _context.SaveChangesAsync();
        }

        var candidate = new Candidate
        {
            PositionId = position.Id,
            Name = request.Name,
            Party = request.Party,
            Bio = request.Bio ?? "",
            Votes = 0
        };

        _context.Candidates.Add(candidate);
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "CandidateAdded",
            PerformedBy = "Admin",
            Details = $"Added candidate {request.Name} for position {request.Position}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveCandidateAsync(string candidateId)
    {
        if (!Guid.TryParse(candidateId, out var id)) return false;

        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null) return false;

        _context.Candidates.Remove(candidate);
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "CandidateRemoved",
            PerformedBy = "Admin",
            Details = $"Removed candidate: {candidate.Name}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> StartElectionAsync()
    {
        var election = await _context.Elections.OrderByDescending(e => e.CreatedAt).FirstOrDefaultAsync();
        if (election == null) return false;

        election.Status = ElectionStatus.Active;
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "ElectionStarted",
            PerformedBy = "Admin",
            Details = $"Started election: {election.Title}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> EndElectionAsync()
    {
        var election = await _context.Elections.FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active);
        if (election == null) return false;

        election.Status = ElectionStatus.Ended;
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "ElectionEnded",
            PerformedBy = "Admin",
            Details = $"Concluded election: {election.Title}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<VotingCategoryDto>> GetVotingCategoriesAsync()
    {
        var categories = await _context.VotingCategories
            .Where(c => c.IsActive)
            .Include(c => c.Positions)
            .ToListAsync();

        return categories.Select(c => new VotingCategoryDto
        {
            Id = c.CategoryCode,
            Name = c.Name,
            Description = c.Description,
            Positions = c.Positions.Select(p => p.Title).ToList()
        }).ToList();
    }

    public async Task<bool> AddVotingCategoryAsync(AddVotingCategoryRequest request)
    {
        var election = await _context.Elections.FirstOrDefaultAsync(e => e.Status == ElectionStatus.Active)
                       ?? await _context.Elections.OrderByDescending(e => e.CreatedAt).FirstOrDefaultAsync();

        if (election == null) return false;

        var code = request.Name.ToLower().Replace(" ", "-");
        var category = new VotingCategory
        {
            ElectionId = election.Id,
            CategoryCode = code,
            Name = request.Name,
            Description = request.Description,
            IsActive = true
        };

        if (request.Positions != null)
        {
            int order = 1;
            foreach (var posTitle in request.Positions)
            {
                category.Positions.Add(new Position
                {
                    Title = posTitle,
                    DisplayOrder = order++
                });
            }
        }

        _context.VotingCategories.Add(category);
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "CategoryAdded",
            PerformedBy = "Admin",
            Details = $"Added category: {request.Name}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveVotingCategoryAsync(string categoryId)
    {
        var category = await _context.VotingCategories
            .FirstOrDefaultAsync(c => c.CategoryCode == categoryId || c.Id.ToString() == categoryId);

        if (category == null) return false;

        category.IsActive = false;
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "CategoryRemoved",
            PerformedBy = "Admin",
            Details = $"Deactivated category: {category.Name}",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }
}
