using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataShareBackend.Models
{
    [Table("users")] // Nom exact de votre table PostgreSQL
    public class Users
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required(ErrorMessage = "L'email est obligatoire")]
        [EmailAddress(ErrorMessage = "Format d'email invalide")]
        [Column("email")]
        [StringLength(255)]
        public string? Email { get; set; }

        [Column("firstname")]
        [StringLength(100)]
        public string? FirstName { get; set; }

        [Column("lastname")]
        [StringLength(100)]
        public string? LastName { get; set; }

        [Column("login")]
        [StringLength(100)]
        public string? Login { get; set; }

        [Column("picture")]
        [StringLength(500)]
        public string? Picture { get; set; }

        [Required(ErrorMessage = "Le mot de passe est obligatoire")]
        [Column("password")]
        [StringLength(255)]
        public string? Password { get; set; }

        [Column("createdat")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}