using DataShareBackend.Data;
using DataShareBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
public class CreateUserDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Login { get; set; }
    public string Picture { get; set; }
}

namespace DataShareBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly DataShareDbContext _context;
        public UsersController(DataShareDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Users>> GetUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                {
                    return NotFound(new { message = $"Utilisateur avec l'ID {id} introuvable" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération de l'utilisateur", error = ex.Message });
            }
        }
        // api/<UsersController/register>
        [HttpPost("register")]
        public async Task<ActionResult<Users>> CreateUser([FromBody] CreateUserDto userDto)
        {
            try
            {
                // Vérifier si l'email existe déjà
                if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
                {
                    return BadRequest(new { message = "Cet email est déjà utilisé" });
                }

                // Vérifier si le login existe déjà
                if (!string.IsNullOrEmpty(userDto.Login) && await _context.Users.AnyAsync(u => u.Login == userDto.Login))
                {
                    return BadRequest(new { message = "Ce login est déjà utilisé" });
                }

                var user = new Users
                {
                    Email = userDto.Email,
                    FirstName = userDto.FirstName,
                    LastName = userDto.LastName,
                    Login = userDto.Login,
                    Picture = userDto.Picture,
                    Password = HashPassword(userDto.Password),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la création de l'utilisateur", error = ex.Message });
            }
        }

        // Méthode pour hasher le mot de passe
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
