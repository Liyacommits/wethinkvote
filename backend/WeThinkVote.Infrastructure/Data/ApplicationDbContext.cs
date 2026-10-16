using Microsoft.EntityFrameworkCore;
using WeThinkVote.Core.Entities;

namespace WeThinkVote.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Election> Elections => Set<Election>();
    public DbSet<VotingCategory> VotingCategories => Set<VotingCategory>();
    public DbSet<Position> Positions => Set<Position>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<VoterRegistration> VoterRegistrations => Set<VoterRegistration>();
    public DbSet<VoteRecord> VoteRecords => Set<VoteRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasIndex(s => s.StudentNumber).IsUnique();
            entity.HasIndex(s => s.MatricNumber).IsUnique();
        });

        modelBuilder.Entity<VoterRegistration>(entity =>
        {
            entity.HasIndex(v => new { v.ElectionId, v.WalletAddress }).IsUnique();
            entity.HasIndex(v => new { v.ElectionId, v.StudentId }).IsUnique();
        });

        modelBuilder.Entity<Election>(entity =>
        {
            entity.HasMany(e => e.Categories)
                .WithOne(c => c.Election)
                .HasForeignKey(c => c.ElectionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Registrations)
                .WithOne(r => r.Election)
                .HasForeignKey(r => r.ElectionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.VoteRecords)
                .WithOne(v => v.Election)
                .HasForeignKey(v => v.ElectionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VotingCategory>(entity =>
        {
            entity.HasMany(c => c.Positions)
                .WithOne(p => p.Category)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Position>(entity =>
        {
            entity.HasMany(p => p.Candidates)
                .WithOne(c => c.Position)
                .HasForeignKey(c => c.PositionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
