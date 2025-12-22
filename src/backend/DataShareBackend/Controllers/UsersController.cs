using DataShareBackend.Data;   //le dosiser data est utiliser comme Le context
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

using DataShareBackend.DTO;   //Utilisation du dossier DTO
using DataShareBackend.Models;  // Le model 
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;   //crée la logic route controller et si besoin une vue
using Microsoft.EntityFrameworkCore;   //Logic ORM

using System.Text.RegularExpressions; // Pour Regex

namespace DataShareBackend.Controllers    
{


    [Route("api/[controller]")]   // Toutes les routes débuteront par   api/nom du controller - conrollers =  api/Users

    [ApiController]   // La class est un controller

    public class UsersController : ControllerBase
    {
        //Datasharedbcontext est hérité de program.cs et appele DataShareDbcontext.cs => Le context 

        private readonly DataShareDbContext _context;

        //Les services

        private readonly MyPasswordService _passwordService;
        private readonly TokenService _tokenService;


        /// Attention : les services sont déjà construit mais on les passent en paramêtres

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

                //Controlle du champ de l'email 
                var emailRegex = new Regex(@"^[A-Za-z0-9._%+-]{3,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$");

                if (string.IsNullOrWhiteSpace(userDto.Email) || !emailRegex.IsMatch(userDto.Email))
                {
                    return BadRequest(new { message = "L'email fourni n'est pas valide. Assurez-vous qu'il contient au moins 3 lettres, un '@' et un domaine correct (ex: .com, .fr, .net)." });
                }


                // ----------------------------Validations-----------------------------------

                // Vérifier si l'email existe déjà
                if (string.IsNullOrWhiteSpace(userDto.Email))
                {
                    return BadRequest(new { message = "L'email est requis et ne peut pas être vide." });
                }

              
             


                //Vérifier si le login est valide
                var loginRegex = new Regex(@"^[a-zA-Z0-9]{3,20}$");
                if (!string.IsNullOrEmpty(userDto.Login) && !loginRegex.IsMatch(userDto.Login))
                {
                    return BadRequest(new { message = "Login invalide (3 à 20 caractères, lettres et chiffres uniquement)" });
                }
                //Verifier si le mots de passe est valide 

                var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$");

                if (string.IsNullOrWhiteSpace(userDto.Password))
                {
                    return BadRequest(new { message = "Le mot de passe est vide. Veuillez saisir un mot de passe." });
                }

                if (!passwordRegex.IsMatch(userDto.Password))
                {
                    return BadRequest(new
                    {
                        message = "Le mot de passe n'est pas valide. Il doit contenir au moins " +
                                  "- 8 caractères" +
                                  "- 1 lettre majuscule" +
                                  "- 1 lettre minuscule" +
                                  "- 1 chiffre" +
                                  "- 1 caractère spécial (ex: !@#$%^&*)"
                    });
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
                    //utilise le service MyPasswordService passwordService.HashPassword  
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
