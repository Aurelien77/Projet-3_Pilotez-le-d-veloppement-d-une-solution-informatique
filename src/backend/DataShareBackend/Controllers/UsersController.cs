using DataShareBackend.Data;
using DataShareBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;


//Import des classes DTO

using DataShareBackend.DTO;
using Microsoft.AspNetCore.Diagnostics;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860


//Import du service hash


namespace DataShareBackend.Controllers
{


    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly DataShareDbContext _context;
        private readonly MyPasswordService _passwordService;
        private readonly TokenService _tokenService;
        //import des services en paramêtre

        public UsersController(DataShareDbContext context, MyPasswordService passwordService, TokenService tokenService)
        {
            _context = context;
            _passwordService = passwordService;
            _tokenService = tokenService;
        }



        // api/<UsersController/id>


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
                    Password = _passwordService.HashPassword(userDto.Password),
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

        // api/<UsersController/login>

        //**
        /// <summary>
        /// Login
        /// </summary>
        /// <param name="userDto"></param>
        /// <returns> 
        /// 
        /// 200 connexion réussit | erreur 401  ( Unauthorized )
        /// 
        /// JSON  {
        ///  "message": "Connexion réussie",
        ///     "userId": 1
        /// }
        /// </returns>
        //**
        [HttpPost("login")]
        public async Task<ActionResult<Users>> Login([FromBody] LoginDto userDto)
        {
            try
            {
              //test si l'un des champs est null
                if (string.IsNullOrEmpty(userDto.Email) || string.IsNullOrEmpty(userDto.Password))
                {
                    return BadRequest(new { message = "L'email et le mot de passe sont demandés" });
                }

                // Cherche l'utilisateur par email
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userDto.Email);

                // Vérifier si l'utilisateur existe
                if (user == null)
                {
                    return BadRequest(new { message = "Cet email n'a pas été trouvé" });
                }

                // Hachage du mot de passe reçu pour comparaison
                var pass = _passwordService.HashPassword(userDto.Password);

                // Comparer le mot de passe
                if (user.Password != pass)
                {
                    return BadRequest(new { message = "Le mot de passe n'est pas correct" });
                }
                //Enregistre le token dans un cookie du navigateur Web.
                var token = _tokenService.GenerateToken(user, new List<string>());

                var cookieOptions = new CookieOptions

                {
                    HttpOnly = true,                  
                    Secure = true,                   
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(_tokenService.GetTokenExpirationDays())
                };

                Response.Cookies.Append("jwt_token", token, cookieOptions);
                // Connexion réussie
                return Ok(new { message = "Email et mot de passe vérifiés", userId = user.Id, token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la connexion", error = ex.Message });
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
