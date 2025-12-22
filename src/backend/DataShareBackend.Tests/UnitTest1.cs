using DataShareBackend.Controllers;
using DataShareBackend.Data;
using DataShareBackend.DTO;
using DataShareBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using Xunit;
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

    public class UsersControllerTests
    {
        private readonly ITestOutputHelper _output;

        public UsersControllerTests(ITestOutputHelper output)
        {
            _output = output;
        }

        [Fact]
        public async Task CreateUser_ShouldReturnCreatedUser()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<DataShareDbContext>()
                .UseInMemoryDatabase("TestDb_CreateUser")
                .Options;

            await using var context = new DataShareDbContext(options);
            var passwordService = new PasswordService();
            var tokenService = new TokenService(new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            });

            var controller = new UsersController(context, passwordService, tokenService);

            var newUser = new CreateUserDto
            {
                Email = "test@example.com",
                Login = "TestUser",
                FirstName = "John",
                LastName = "Doe",
                Password = "Password123!",
                Picture = "https://example.com/picture.jpg"
            };

            // Act
            var result = await controller.CreateUser(newUser);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdUser = Assert.IsType<Users>(actionResult.Value);

            // Vérifications principales
            Assert.Equal("test@example.com", createdUser.Email);
            Assert.Equal("TestUser", createdUser.Login);
            Assert.Equal("John", createdUser.FirstName);
            Assert.Equal("Doe", createdUser.LastName);
            Assert.Equal("https://example.com/picture.jpg", createdUser.Picture);
            Assert.NotNull(createdUser.Password);

            // Affichage complet
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

        [Fact]
        public async Task Login_ShouldReturnToken_WhenCredentialsAreCorrect()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<DataShareDbContext>()
                .UseInMemoryDatabase("TestDb_LoginCorrect")
                .Options;

            await using var context = new DataShareDbContext(options);
            var passwordService = new PasswordService();
            var tokenService = new TokenService(new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            });

            var testUser = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                FirstName = "John",
                LastName = "Doe",
                Picture = "https://example.com/picture.jpg",
                Password = passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(testUser);
            await context.SaveChangesAsync();

            var controller = new UsersController(context, passwordService, tokenService);

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result.Result);

            // Affiche tout pour diagnostiquer
            var json = JsonSerializer.Serialize(objectResult.Value, new JsonSerializerOptions { WriteIndented = true });
            _output.WriteLine($"StatusCode: {objectResult.StatusCode}");
            _output.WriteLine("Response JSON:");
            _output.WriteLine(json);

            Assert.Equal(200, objectResult.StatusCode);

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var message = root.GetProperty("message").GetString();
            var token = root.GetProperty("token").GetString();
            var userId = root.GetProperty("userId").GetInt32();

            Assert.Equal("Email et mot de passe vérifiés", message);
            Assert.False(string.IsNullOrEmpty(token));
            Assert.Equal(testUser.Id, userId);

            _output.WriteLine($"Token généré : {token}");
        }

        [Fact]
        public async Task Login_ShouldFail_WhenUserDoesNotExist()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<DataShareDbContext>()
                .UseInMemoryDatabase("TestDb_LoginFail")
                .Options;

            await using var context = new DataShareDbContext(options);
            var passwordService = new PasswordService();
            var tokenService = new TokenService(new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            });

            var controller = new UsersController(context, passwordService, tokenService);

            var loginDto = new LoginDto
            {
                Email = "notfound@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequest.Value);

            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.NotNull(error);
            Assert.Equal("Cet email n'a pas été trouvé", error!.Message);

            _output.WriteLine("Login échoué : utilisateur introuvable");
            _output.WriteLine($"Email tenté : {loginDto.Email}");
            _output.WriteLine($"Message renvoyé : {error.Message}");
        }

        [Fact]
        public async Task Login_ShouldFail_WhenPasswordIsIncorrect()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<DataShareDbContext>()
                .UseInMemoryDatabase("TestDb_LoginWrongPassword")
                .Options;

            await using var context = new DataShareDbContext(options);
            var passwordService = new PasswordService();
            var tokenService = new TokenService(new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            });

            var testUser = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(testUser);
            await context.SaveChangesAsync();

            var controller = new UsersController(context, passwordService, tokenService);

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
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
    }
}
