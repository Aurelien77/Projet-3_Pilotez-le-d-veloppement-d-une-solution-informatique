using DataShareBackend.Models;

using Microsoft.EntityFrameworkCore;
// ORM


namespace DataShareBackend.Data
    //Fournit un nom pour appeler le composant ailleur
{
    public class DataShareDbContext : DbContext
       

    {
        public DataShareDbContext(DbContextOptions<DataShareDbContext> options)
            : base(options)
        {

        }

        public DbSet<Users> Users { get; set; } = null!;


        // Ajout de la table File 

        public DbSet<Files> Files { get; set; } = null!;

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


            //Tables pour les fichiers

            modelBuilder.Entity<Files>(entity =>
            {
                entity.HasKey(f => f.Id);

                entity.HasIndex(f => f.IdUser)
                    .HasDatabaseName("IX_Files_IdUser");

                entity.HasIndex(f => f.Deleted)
                    .HasDatabaseName("IX_Files_Deleted");

                entity.HasIndex(f => f.EndDate)
                    .HasDatabaseName("IX_Files_EndDate");

                entity.Property(f => f.FileName)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(f => f.FilePassword)
                    .HasMaxLength(255);

                entity.Property(f => f.FilePath)
                    .HasMaxLength(500);

                entity.Property(f => f.Deleted)
                    .IsRequired()
                    .HasDefaultValue(false);

                entity.Property(f => f.CreationDate)
                    .IsRequired()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(f => f.EndDate)
                    .IsRequired();

                // Lien relationnel pour récupérer l'id de l'utilisateur qui envoit le fichier
                entity.HasOne(f => f.User)
                    .WithMany()
                    .HasForeignKey(f => f.IdUser)
                    .OnDelete(DeleteBehavior.Cascade);
            });


        }


    }
}