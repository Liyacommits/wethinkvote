using Microsoft.EntityFrameworkCore;
using WeThinkVote.Core.Entities;
using WeThinkVote.Core.Enums;

namespace WeThinkVote.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Students if none exist
        if (!await context.Students.AnyAsync())
        {
            var students = new List<Student>
            {
                new()
                {
                    StudentNumber = "ST12345",
                    MatricNumber = "MAT2023001",
                    FullName = "Kabelo Dlamini",
                    Department = "Computer Science",
                    Level = "300 Level",
                    Email = "kabelo.dlamini@student.wits.ac.za",
                    IsEligible = true
                },
                new()
                {
                    StudentNumber = "ST12346",
                    MatricNumber = "MAT2023002",
                    FullName = "Naledi Khumalo",
                    Department = "Engineering",
                    Level = "400 Level",
                    Email = "naledi.khumalo@student.wits.ac.za",
                    IsEligible = true
                },
                new()
                {
                    StudentNumber = "ST12347",
                    MatricNumber = "MAT2023003",
                    FullName = "Sipho Ndlovu",
                    Department = "Business",
                    Level = "200 Level",
                    Email = "sipho.ndlovu@student.wits.ac.za",
                    IsEligible = true
                },
                new()
                {
                    StudentNumber = "ST12348",
                    MatricNumber = "MAT2023004",
                    FullName = "Lerato Mokoena",
                    Department = "Arts",
                    Level = "100 Level",
                    Email = "lerato.mokoena@student.wits.ac.za",
                    IsEligible = true
                },
                new()
                {
                    StudentNumber = "ST12349",
                    MatricNumber = "MAT2023005",
                    FullName = "Thulani Sithole",
                    Department = "Science",
                    Level = "300 Level",
                    Email = "thulani.sithole@student.wits.ac.za",
                    IsEligible = true
                },
                new()
                {
                    StudentNumber = "ST12350",
                    MatricNumber = "MAT2023006",
                    FullName = "Zanele Zulu",
                    Department = "Law",
                    Level = "400 Level",
                    Email = "zanele.zulu@student.wits.ac.za",
                    IsEligible = true
                },
                new()
                {
                    StudentNumber = "ST12351",
                    MatricNumber = "MAT2023007",
                    FullName = "Bongani Cele",
                    Department = "Health Sciences",
                    Level = "500 Level",
                    Email = "bongani.cele@student.wits.ac.za",
                    IsEligible = true
                }
            };

            await context.Students.AddRangeAsync(students);
            await context.SaveChangesAsync();
        }

        // 2. Seed Active Election if none exist
        if (!await context.Elections.AnyAsync())
        {
            var election = new Election
            {
                Title = "University Student Representative Council (SRC) Election 2026",
                Description = "Annual democratic election for the Central SRC Executives, Faculty Council Representatives, and Departmental Leadership.",
                StartDate = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow.AddDays(5),
                Status = ElectionStatus.Active,
                ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                RequireVerification = true,
                AllowResultsDuringVoting = true
            };

            // Category 1: Student Union Government (SUG / Central SRC)
            var sugCategory = new VotingCategory
            {
                Election = election,
                CategoryCode = "sug",
                Name = "Student Union Government",
                Description = "Executive council presiding over general student affairs and university senate advocacy.",
                IsActive = true
            };

            var presPosition = new Position
            {
                Category = sugCategory,
                Title = "President",
                DisplayOrder = 1
            };
            presPosition.Candidates.Add(new Candidate
            {
                OnChainId = 1,
                Name = "Liya",
                Party = "Progress Party",
                Bio = "Advocating for digital student infrastructure, free data bundles, and 24-hour campus security.",
                Votes = 145
            });
            presPosition.Candidates.Add(new Candidate
            {
                OnChainId = 2,
                Name = "Nyakallo",
                Party = "Student Voice",
                Bio = "Championing affordable campus accommodation, meal plan subsidies, and transparent bursary allocations.",
                Votes = 120
            });
            presPosition.Candidates.Add(new Candidate
            {
                OnChainId = 3,
                Name = "Letlotlo",
                Party = "Independent",
                Bio = "Dedicated to mental health support networks, career development, and academic grievance resolution.",
                Votes = 76
            });

            var vpPosition = new Position
            {
                Category = sugCategory,
                Title = "Vice President",
                DisplayOrder = 2
            };
            vpPosition.Candidates.Add(new Candidate
            {
                OnChainId = 4,
                Name = "Thabo Maseko",
                Party = "Progress Party",
                Bio = "Focus on campus transport and academic mentorship programs.",
                Votes = 160
            });
            vpPosition.Candidates.Add(new Candidate
            {
                OnChainId = 5,
                Name = "Nomvula Dube",
                Party = "Student Voice",
                Bio = "Championing female leadership, STEM empowerment, and campus safety.",
                Votes = 148
            });

            var secPosition = new Position
            {
                Category = sugCategory,
                Title = "Secretary General",
                DisplayOrder = 3
            };
            secPosition.Candidates.Add(new Candidate
            {
                OnChainId = 6,
                Name = "Keitumetse Moloi",
                Party = "Progress Party",
                Bio = "Ensuring minutes and administrative circulars are accessible online in real time.",
                Votes = 135
            });
            secPosition.Candidates.Add(new Candidate
            {
                OnChainId = 7,
                Name = "Ayanda Gumede",
                Party = "Independent",
                Bio = "Transparency in university-student negotiations.",
                Votes = 110
            });

            sugCategory.Positions.Add(presPosition);
            sugCategory.Positions.Add(vpPosition);
            sugCategory.Positions.Add(secPosition);

            // Category 2: Faculty Representatives
            var facultyCategory = new VotingCategory
            {
                Election = election,
                CategoryCode = "faculty",
                Name = "Faculty Representatives",
                Description = "Academic governance reps liaising directly with Faculty Deans.",
                IsActive = true
            };

            var engRep = new Position
            {
                Category = facultyCategory,
                Title = "Faculty Rep: Engineering & Built Environment",
                DisplayOrder = 4
            };
            engRep.Candidates.Add(new Candidate { OnChainId = 8, Name = "Karabo Molefe", Party = "Engineering Alliance", Bio = "Extended computer lab hours and software license subsidies.", Votes = 92 });
            engRep.Candidates.Add(new Candidate { OnChainId = 9, Name = "Farai Moyo", Party = "Independent Engineers", Bio = "Better workshop equipment and industry internship partnerships.", Votes = 85 });

            var sciRep = new Position
            {
                Category = facultyCategory,
                Title = "Faculty Rep: Science & Technology",
                DisplayOrder = 5
            };
            sciRep.Candidates.Add(new Candidate { OnChainId = 10, Name = "Ziyanda Sithole", Party = "Science Forum", Bio = "Research grant access for undergraduates and upgraded lab reagents.", Votes = 78 });
            sciRep.Candidates.Add(new Candidate { OnChainId = 11, Name = "Mandla Nkosi", Party = "Student Voice", Bio = "Equitable access to advanced computing clusters.", Votes = 69 });

            facultyCategory.Positions.Add(engRep);
            facultyCategory.Positions.Add(sciRep);

            // Category 3: Departmental Executives
            var deptCategory = new VotingCategory
            {
                Election = election,
                CategoryCode = "department",
                Name = "Departmental Executives",
                Description = "Grassroots leadership for specialized academic department student chapters.",
                IsActive = true
            };
            var csExec = new Position
            {
                Category = deptCategory,
                Title = "Computer Science Executive Chair",
                DisplayOrder = 6
            };
            csExec.Candidates.Add(new Candidate { OnChainId = 12, Name = "Sizwe Vilakazi", Party = "Open Source Society", Bio = "Organizing hackathons, technical interview bootcamps, and cloud credits.", Votes = 112 });
            csExec.Candidates.Add(new Candidate { OnChainId = 13, Name = "Chloe Van Der Merwe", Party = "ByteClub", Bio = "Peer tutoring and female dev mentorship circles.", Votes = 98 });

            deptCategory.Positions.Add(csExec);

            election.Categories.Add(sugCategory);
            election.Categories.Add(facultyCategory);
            election.Categories.Add(deptCategory);

            await context.Elections.AddAsync(election);
            await context.SaveChangesAsync();

            // Seed initial registered voters
            var studentList = await context.Students.ToListAsync();
            var voterWallets = new[]
            {
                ("0x1234567890abcdef1234567890abcdef12345678", true),
                ("0x2345678901abcdef2345678901abcdef23456789", true),
                ("0x3456789012abcdef3456789012abcdef34567890", false),
                ("0x4567890123abcdef4567890123abcdef45678901", true),
                ("0x5678901234abcdef5678901234abcdef56789012", false),
            };

            for (int i = 0; i < voterWallets.Length && i < studentList.Count; i++)
            {
                context.VoterRegistrations.Add(new VoterRegistration
                {
                    StudentId = studentList[i].Id,
                    ElectionId = election.Id,
                    WalletAddress = voterWallets[i].Item1,
                    HasVoted = voterWallets[i].Item2,
                    RegistrationDate = DateTime.UtcNow.AddDays(-1).AddHours(i)
                });
            }

            // Seed Audit Logs
            context.AuditLogs.AddRange(
                new AuditLog
                {
                    Action = "ElectionCreated",
                    PerformedBy = "IEC Admin",
                    Details = "Created election: " + election.Title,
                    Timestamp = DateTime.UtcNow.AddDays(-2)
                },
                new AuditLog
                {
                    Action = "ElectionStarted",
                    PerformedBy = "IEC Admin",
                    Details = "Voting poll opened on Ethereum smart contract",
                    Timestamp = DateTime.UtcNow.AddDays(-2).AddHours(1)
                },
                new AuditLog
                {
                    Action = "VoterRegistered",
                    PerformedBy = "ST12345",
                    Details = "Wallet 0x1234...5678 registered for voting",
                    Timestamp = DateTime.UtcNow.AddMinutes(-45)
                },
                new AuditLog
                {
                    Action = "VoteCast",
                    PerformedBy = "0x1234...5678",
                    Details = "Ballot cast successfully on blockchain",
                    Timestamp = DateTime.UtcNow.AddMinutes(-20)
                }
            );

            await context.SaveChangesAsync();
        }
    }
}
