using DataShareBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace DataShareBackend.Data
{
    public class DataShareDbContext : DbContext
    {
        public DataShareDbContext(DbContextOptions<DataShareDbContext> options)
            : base(options)
        {
        }

        public DbSet<Users> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuration de la table Users
            modelBuilder.Entity<Users>(entity =>
            {
                // Clé primaire
                entity.HasKey(u => u.Id);

                // Index uniques
                entity.HasIndex(u => u.Email)
                    .IsUnique()
                    .HasDatabaseName("IX_Users_Email");

                entity.HasIndex(u => u.Login)
                    .IsUnique()
                    .HasDatabaseName("IX_Users_Login");

                // Configuration des colonnes
                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.Password)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.FirstName)
                    .HasMaxLength(100);

                entity.Property(u => u.LastName)
                    .HasMaxLength(100);

                entity.Property(u => u.Login)
                    .HasMaxLength(100);

                entity.Property(u => u.Picture)
                    .HasMaxLength(500);

                entity.Property(u => u.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });
        }
    }
}