using System.ComponentModel.DataAnnotations;

namespace DataShareBackend.DTO
{
  
    // DTO pour l'upload de fichiers
  
    public class UploadFileDto
    {
        [Required(ErrorMessage = "Le fichier est obligatoire")]
        public IFormFile File { get; set; } = null!;

        [Required(ErrorMessage = "L'ID utilisateur est obligatoire")]
        public int IdUser { get; set; }

        [Required(ErrorMessage = "La date de fin est obligatoire")]
        public DateTime EndDate { get; set; }

       
        //Mot de passe optionnel pour protéger le fichier
     
        public string? FilePassword { get; set; }
    }

 
    // DTO pour le téléchargement de fichiers protégés

    public class DownloadFileDto
    {
        public string? Password { get; set; }
    }
}