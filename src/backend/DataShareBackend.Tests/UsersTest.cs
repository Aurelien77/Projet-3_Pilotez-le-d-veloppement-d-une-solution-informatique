using DataShareBackend.Controllers;
using DataShareBackend.Data;
using DataShareBackend.DTO;
using DataShareBackend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using Xunit.Abstractions;

namespace DataShareBackend.Tests
{
    // Classe pour parser les réponses d'erreur du controller
    public class ErrorResponse
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = null!;
    }
    // Classe pour parser la réponse de connexion réussie
    public class LoginResponse
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = null!;
        [JsonPropertyName("userId")]
        public int UserId { get; set; }
        [JsonPropertyName("token")]
        public string Token { get; set; } = null!;
    }

    // Création de la classe pour le test UNITAIRES
    public class UsersControllerTests
    {
        private readonly ITestOutputHelper _output;
        private readonly TokenSetting _tokenSetting;
        private readonly PasswordService _passwordService;


        //Dépendances Partagées
        public UsersControllerTests(ITestOutputHelper output)
        {
            _output = output;

            _passwordService = new PasswordService();
            _tokenSetting = new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            };
        }

        //Création de METHODES contextualisée lié a la class model Shareddbcontext pour simuler une BD
        //Méthode poru récupéré le data model

        private DataShareDbContext CreateContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<DataShareDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            return new DataShareDbContext(options);
        }


        //Méthode pour récupéré le Model User  + injecter PassService (Hash) + Token

        private UsersController CreateController(DataShareDbContext context)
        {
            var tokenService = new TokenService(_tokenSetting);
            return new UsersController(context, _passwordService, tokenService);
        }
        //*************************************** CREATE USERS ************************************** ##//

        //********************************** ERRORS **********************************//
        [Fact]
        public async Task Wrong_create_user_email()
        {
            await using var context = CreateContext("TestDb_CreateUser_Invalid_user_email");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "testexample.com",
                Login = "Test30",
                Password = "Password123!"
            };

            var result = await controller.CreateUser(newUser);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequest.Value);

            _output.WriteLine("❌ Création erreur email refusée comme attendu");
            _output.WriteLine($"Message retourné : {badRequest.Value}");
        }

        [Fact]
        public async Task Empty_create_user_email()
        {
            await using var context = CreateContext("TestDb_CreateUser_Invalid_email");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "",
                Login = "Test30",
                Password = "Password123!"
            };

            var result = await controller.CreateUser(newUser);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequest.Value);

            _output.WriteLine("❌ Création erreur l'email est refusée car il est vide comme attendu");
            _output.WriteLine($"Message retourné : {badRequest.Value}");
        }


        [Fact]
        public async Task Create_user_login_is_too_short()
        {
            await using var context = CreateContext("TestDb_CreateUser_LoginTooShort");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "ab",
                Password = "Password123!"
            };

            var result = await controller.CreateUser(newUser);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("login", error!.Message.ToLower());
            _output.WriteLine($"❌ Login trop court rejeté: {error.Message}");
        }

        [Fact]
        public async Task GetUser_NotFound_ReturnsNotFound()
        {
            // Arrange
            await using var context = CreateContext("TestDb_GetUser_NotFound");
            var controller = CreateController(context);

            // Act
            var result = await controller.GetUser(9999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);

            var json = JsonSerializer.Serialize(notFoundResult.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("introuvable", error!.Message.ToLower());

            _output.WriteLine($"❌ Utilisateur non trouvé comme attendu: {error.Message}");
        }
        [Fact]
        public async Task CreateUser_DuplicateEmail_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_DuplicateEmail");

            // Créer un premier utilisateur
            context.Users.Add(new Users
            {
                Email = "duplicate@example.com",
                Login = "User1",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Tenter de créer un utilisateur avec le même email
            var newUser = new CreateUserDto
            {
                Email = "duplicate@example.com",
                Login = "User2",
                Password = "Password123!"
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);

            _output.WriteLine("❌ Email dupliqué rejeté comme attendu");
        }

        [Fact]
        public async Task CreateUser_DuplicateLogin_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_DuplicateLogin");

            context.Users.Add(new Users
            {
                Email = "user1@example.com",
                Login = "DuplicateLogin",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "user2@example.com",
                Login = "DuplicateLogin",
                Password = "Password123!"
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("login", error!.Message.ToLower());

            _output.WriteLine($"❌ Login dupliqué rejeté: {error.Message}");
        }

        [Fact]
        public async Task CreateUser_InvalidPassword_NoUppercase_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_InvalidPassword_NoUppercase");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = "password123!" // Pas de majuscule
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("majuscule", error!.Message.ToLower());

            _output.WriteLine($"❌ Mot de passe sans majuscule rejeté: {error.Message}");
        }

        [Fact]
        public async Task CreateUser_InvalidPassword_TooShort_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_InvalidPassword_TooShort");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = "Pass1!" // Moins de 8 caractères
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("8 caractères", error!.Message);

            _output.WriteLine($"❌ Mot de passe trop court rejeté: {error.Message}");
        }

        [Fact]
        public async Task CreateUser_EmptyPassword_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_EmptyPassword");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = "" // Mot de passe vide
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("vide", error!.Message.ToLower());

            _output.WriteLine($"❌ Mot de passe vide rejeté: {error.Message}");
        }

        [Fact]
        public async Task CreateUser_InvalidPassword_NoSpecialChar_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_InvalidPassword_NoSpecialChar");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = "Password123" // Pas de caractère spécial
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("spécial", error!.Message.ToLower());

            _output.WriteLine($"❌ Mot de passe sans caractère spécial rejeté: {error.Message}");
        }

        [Fact]
        public async Task CreateUser_LoginTooLong_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_LoginTooLong");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "ThisLoginIsFarTooLongAndShouldBeRejected123", // Plus de 20 caractères
                Password = "Password123!"
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("login", error!.Message.ToLower());

            _output.WriteLine($"❌ Login trop long rejeté: {error.Message}");
        }

        [Fact]
        public async Task CreateUser_LoginWithSpecialChars_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_CreateUser_LoginWithSpecialChars");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "User@Name!", // Caractères spéciaux non autorisés
                Password = "Password123!"
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("login", error!.Message.ToLower());

            _output.WriteLine($"❌ Login avec caractères spéciaux rejeté: {error.Message}");
        }


        //********************************** SUCCES **********************************//
        [Fact]
        public async Task Create_user_succes()
        {
            await using var context = CreateContext("TestDb_CreateUser");
            var controller = CreateController(context);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "TestUser",
                FirstName = "John",
                LastName = "Doe",
                Password = "Password123!",
                Picture = "https://example.com/picture.jpg"
            };

            var result = await controller.CreateUser(newUser);

            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdUser = Assert.IsType<Users>(actionResult.Value);

            Assert.Equal("test@example.com", createdUser.Email);
            Assert.Equal("TestUser", createdUser.Login);
            Assert.Equal("John", createdUser.FirstName);
            Assert.Equal("Doe", createdUser.LastName);
            Assert.Equal("https://example.com/picture.jpg", createdUser.Picture);
            Assert.NotNull(createdUser.Password);
          
            _output.WriteLine($"--- Utilisateur créé ---");
            _output.WriteLine($"ID: {createdUser.Id}");
            _output.WriteLine($"Email: {createdUser.Email}");
            _output.WriteLine($"Login: {createdUser.Login}");
            _output.WriteLine($"Prénom: {createdUser.FirstName}");
            _output.WriteLine($"Nom: {createdUser.LastName}");
            _output.WriteLine($"Picture: {createdUser.Picture}");
            _output.WriteLine($"Password (hash): {createdUser.Password}");
            _output.WriteLine($"Créé le: {createdUser.CreatedAt}");
        }



        //*************************************** LOGIN USERS ************************************** ##//

        //********************************** ERRORS **********************************//
        [Fact]
        public async Task Login_fail_wrong_password()
        {
            await using var context = CreateContext("TestDb_LoginWrongPassword");

            context.Users.Add(new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword!"
            };

            var result = await controller.Login(loginDto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequest.Value);

            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.NotNull(error);
            Assert.Equal("Le mot de passe n'est pas correct", error!.Message);

            _output.WriteLine("Login échoué : mot de passe incorrect");
            _output.WriteLine($"Email : {loginDto.Email}");
            _output.WriteLine($"Mot de passe tenté : {loginDto.Password}");
            _output.WriteLine($"Message renvoyé : {error.Message}");
        }

        [Fact]
        public async Task Login_EmptyEmail_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_Login_EmptyEmail");
            var controller = CreateController(context);

            var loginDto = new LoginDto
            {
                Email = "",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("demandés", error!.Message.ToLower());

            _output.WriteLine($"❌ Email vide rejeté: {error.Message}");
        }

        [Fact]
        public async Task Login_EmptyPassword_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_Login_EmptyPassword");
            var controller = CreateController(context);

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = ""
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("demandés", error!.Message.ToLower());

            _output.WriteLine($"❌ Mot de passe vide rejeté: {error.Message}");
        }

        [Fact]
        public async Task Login_UserNotFound_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_Login_UserNotFound");
            var controller = CreateController(context);

            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("email", error!.Message.ToLower());
            Assert.Contains("trouvé", error.Message.ToLower());

            _output.WriteLine($"❌ Email inexistant rejeté: {error.Message}");
        }

        //********************************** SUCCES **********************************//



        [Fact]
        public async Task Login_working_good()
        {
            // Arrange
            await using var context = CreateContext("TestDb_LoginSuccess");

            context.Users.Add(new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Mock du HttpContext pour éviter l'erreur avec Response.Cookies
            var httpContext = new DefaultHttpContext();
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);

            //   / ! \ correction d'un bug lors du test car il était impossible de récupérer le token en retour de la reponse, bienq ue cela était possible sur Swagger.
            //   Solution : Lors des test unitaire il n'y a pas de requêtes HTTP
            //  Le fait de Mocker uen requuette HTTP permet de résoudre. Le Toekn est récupére lors de test Xunit.

            // transformer la reposne reçu C# en JSON  => Ok
            var json = JsonSerializer.Serialize(okResult.Value);
            var loginResponse = JsonSerializer.Deserialize<LoginResponse>(json);

            Assert.NotNull(loginResponse);
            Assert.Equal("Email et mot de passe vérifiés", loginResponse.Message);
            Assert.True(loginResponse.UserId > 0);
            Assert.NotNull(loginResponse.Token);
            Assert.NotEmpty(loginResponse.Token);

            // Vérifier que le cookie a bien été créé
            Assert.True(httpContext.Response.Headers.ContainsKey("Set-Cookie"));

            _output.WriteLine("Login réussi");
            _output.WriteLine($"Email : {loginDto.Email}");
            _output.WriteLine($"UserId : {loginResponse.UserId}");
            _output.WriteLine($"Token : {loginResponse.Token}");
            _output.WriteLine($"Message : {loginResponse.Message}");
            _output.WriteLine($"Cookie créé : {httpContext.Response.Headers["Set-Cookie"]}");
        }

        //*************************************** GET USERS ************************************** ##//

        [Fact]
        public async Task GetUser_Success_ReturnsUser()
        {
            // Arrange
            await using var context = CreateContext("TestDb_GetUser_Success");

            var user = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                FirstName = "John",
                LastName = "Doe",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Act
            var result = await controller.GetUser(user.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedUser = Assert.IsType<Users>(okResult.Value);

            Assert.Equal(user.Email, returnedUser.Email);
            Assert.Equal(user.Login, returnedUser.Login);

            _output.WriteLine($"✅ Utilisateur récupéré avec succès: {returnedUser.Login}");
        }

    }

}



