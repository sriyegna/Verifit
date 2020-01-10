using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace VerifitRelay
{
    public partial class PhoneDetailDBContext : DbContext
    {
        public PhoneDetailDBContext()
        {
        }

        public PhoneDetailDBContext(DbContextOptions<PhoneDetailDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<ConversationDetails> ConversationDetails { get; set; }
        public virtual DbSet<MessageDetails> MessageDetails { get; set; }
        public virtual DbSet<PhoneDetails> PhoneDetails { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                optionsBuilder.UseSqlServer("Server=(local)\\sqlexpress;Database=PhoneDetailDB;Trusted_Connection=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ConversationDetails>(entity =>
            {
                entity.HasKey(e => e.ConversationId);

                entity.Property(e => e.ConversationId).HasMaxLength(512);

                entity.Property(e => e.ConversationName)
                    .IsRequired()
                    .HasMaxLength(256)
                    .HasDefaultValueSql("(N'')");

                entity.Property(e => e.FromPhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.LastMessage).IsRequired();

                entity.Property(e => e.LastMessageTime)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.ToPhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.UserName)
                    .IsRequired()
                    .HasMaxLength(256);
            });

            modelBuilder.Entity<MessageDetails>(entity =>
            {
                entity.HasKey(e => e.MessageSid);

                entity.Property(e => e.MessageSid).HasMaxLength(50);

                entity.Property(e => e.Body).IsRequired();

                entity.Property(e => e.Direction)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.FromPhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Time)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.ToPhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20);
            });

            modelBuilder.Entity<PhoneDetails>(entity =>
            {
                entity.HasKey(e => e.PhoneSid);

                entity.Property(e => e.PhoneSid).HasMaxLength(60);

                entity.Property(e => e.Country)
                    .IsRequired()
                    .HasMaxLength(3)
                    .HasDefaultValueSql("(N'')");

                entity.Property(e => e.PhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.TimeCreated)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.TimeExpired)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.UserName)
                    .IsRequired()
                    .HasMaxLength(256);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
