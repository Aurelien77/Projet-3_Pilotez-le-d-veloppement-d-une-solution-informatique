
using System.ComponentModel.DataAnnotations;

public class DeleteFileDto
{
    [Required(ErrorMessage = "L'ID utilisateur est obligatoire")]
    public int UserId { get; set; }
}