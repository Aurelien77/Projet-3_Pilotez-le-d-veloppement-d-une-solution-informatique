using Microsoft.AspNetCore.Identity;

namespace Users.Models
{
    public class ApplicationUser : IdentityUser
    {

        //? = Permet au champ d'être null
        //new permet de créer l'élément 
        new public int? Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        public string? Picture { get; set; }

        public string? Password { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
