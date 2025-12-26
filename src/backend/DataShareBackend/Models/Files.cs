using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataShareBackend.Models
{
    [Table("files")]
    public class Files
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required(ErrorMessage = "L'ID utilisateur est obligatoire")]
        [Column("id_user")]
        public int IdUser { get; set; }

        [Required(ErrorMessage = "Le nom du fichier est obligatoire")]
        [Column("file_name")]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Column("file_password")]
        [StringLength(255)]
        public string? FilePassword { get; set; }

        [Required]
        [Column("deleted")]
        public bool Deleted { get; set; } = false;

        [Required]
        [Column("creation_date")]
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("file_path")]
        [StringLength(500)]
        public string? FilePath { get; set; }


        // Hérite de la table User
        [ForeignKey("IdUser")]
        public virtual Users? User { get; set; }
    }
}