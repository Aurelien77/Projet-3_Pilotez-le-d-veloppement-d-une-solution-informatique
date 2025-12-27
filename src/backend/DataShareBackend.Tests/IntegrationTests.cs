using DataShareBackend.Controllers;
using DataShareBackend.Data;
using DataShareBackend.DTO;
using DataShareBackend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Xunit.Abstractions;

namespace DataShareBackend.Tests
{
  
    public class IntegrationTests
    {
        private readonly ITestOutputHelper _output;
        private readonly TokenSetting _tokenSetting;
        private readonly PasswordService _passwordService;

        public IntegrationTests(ITestOutputHelper output)
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

        private DataShareDbContext CreateContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<DataShareDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;
            return new DataShareDbContext(options);
        }

        private UsersController CreateController(DataShareDbContext context)
        {
            var tokenService = new TokenService(_tokenSetting);
            return new UsersController(context, _passwordService, tokenService);
        }

 
        // Scénario complet : Inscription → Connexion → Récupération du profil

        [Fact]
        public async Task FullUserJourney_RegisterLoginGetProfile_Success()
        {
            _output.WriteLine("  TEST INTÉGRATION : Parcours utilisateur complet");
            // Arrange
            await using var context = CreateContext("TestDb_FullUserJourney");
            var controller = CreateController(context);

            // Mock HttpContext pour les cookies
            var httpContext = new DefaultHttpContext();
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

         
            // ÉTAPE 1 : INSCRIPTION
        
            _output.WriteLine("ÉTAPE 1 : Inscription d'un nouvel utilisateur");

            var registerDto = new CreateUserDto
            {
                Email = "john.doe@example.com",
                Login = "johndoe",
                FirstName = "John",
                LastName = "Doe",
                Password = "SecurePass123!",
                Picture = "https://example.com/john.jpg"
            };

            var registerResult = await controller.CreateUser(registerDto);
            var createdResult = Assert.IsType<CreatedAtActionResult>(registerResult.Result);
            var createdUser = Assert.IsType<Users>(createdResult.Value);

            Assert.Equal("john.doe@example.com", createdUser.Email);
            Assert.Equal("johndoe", createdUser.Login);

            _output.WriteLine($"Utilisateur créé avec succès");
            _output.WriteLine($"ID: {createdUser.Id}");
            _output.WriteLine($"Email: {createdUser.Email}");
            _output.WriteLine($"Login: {createdUser.Login}");
            _output.WriteLine("");

            // ÉTAPE 2 : CONNEXION
           
            _output.WriteLine("ÉTAPE 2 : Connexion avec les identifiants");

            var loginDto = new LoginDto
            {
                Email = "john.doe@example.com",
                Password = "SecurePass123!"
            };

            var loginResult = await controller.Login(loginDto);
            var okLoginResult = Assert.IsType<OkObjectResult>(loginResult.Result);

            var loginJson = JsonSerializer.Serialize(okLoginResult.Value);
            var loginResponse = JsonSerializer.Deserialize<LoginResponse>(loginJson);

            Assert.NotNull(loginResponse);
            Assert.Equal(createdUser.Id, loginResponse.UserId);
            Assert.NotNull(loginResponse.Token);

            _output.WriteLine($"Connexion réussie");
            _output.WriteLine($"UserId: {loginResponse.UserId}");
            _output.WriteLine($"Token: {loginResponse.Token}");
            _output.WriteLine($"Cookie créé: {httpContext.Response.Headers.ContainsKey("Set-Cookie")}");
            _output.WriteLine("");

            // ÉTAPE 3 : RÉCUPÉRATION DU PROFIL
     
            _output.WriteLine("ÉTAPE 3 : Récupération du profil utilisateur");

            var profileResult = await controller.GetUser(createdUser.Id);
            var okProfileResult = Assert.IsType<OkObjectResult>(profileResult.Result);
            var profileUser = Assert.IsType<Users>(okProfileResult.Value);

            Assert.Equal(createdUser.Email, profileUser.Email);
            Assert.Equal(createdUser.Login, profileUser.Login);

            _output.WriteLine($"Profil récupéré avec succès");
            _output.WriteLine($"Nom complet: {profileUser.FirstName} {profileUser.LastName}");
            _output.WriteLine($"Email: {profileUser.Email}");
            _output.WriteLine("");

            _output.WriteLine("PARCOURS UTILISATEUR COMPLET RÉUSSI");
           
        }

 
        // Scénario : Tentative de connexion avec mauvais mot de passe après inscription
      
        [Fact]
        public async Task RegisterThenLoginWithWrongPassword_ShouldFail()
        {
         
            _output.WriteLine("TEST : Inscription puis connexion avec mauvais MDP");
          

            // Arrange
            await using var context = CreateContext("TestDb_RegisterThenBadLogin");
            var controller = CreateController(context);

            var httpContext = new DefaultHttpContext();
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Inscription
            var registerDto = new CreateUserDto
            {
                Email = "secure@example.com",
                Login = "secureuser",
                Password = "CorrectPassword123!"
            };

            await controller.CreateUser(registerDto);

            // Tentative de connexion avec mauvais mot de passe
            var loginDto = new LoginDto
            {
                Email = "secure@example.com",
                Password = "WrongPassword456!"
            };

            var loginResult = await controller.Login(loginDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(loginResult.Result);

            _output.WriteLine("Connexion refusée comme attendu (mauvais mot de passe)");
            _output.WriteLine("Sécurité validée : le système protège correctement les comptes");
        }

  
        // Scénario : Plusieurs utilisateurs peuvent s'inscrire avec des emails différents
      
        [Fact]
        public async Task MultipleUsers_CanRegisterWithDifferentEmails()
        {
            _output.WriteLine("  TEST : Inscription de plusieurs utilisateurs");

            // Arrange
            await using var context = CreateContext("TestDb_MultipleUsers");
            var controller = CreateController(context);

            var users = new[]
            {
                new CreateUserDto { Email = "user1@example.com", Login = "user1", Password = "Pass123!" },
                new CreateUserDto { Email = "user2@example.com", Login = "user2", Password = "Pass123!" },
                new CreateUserDto { Email = "user3@example.com", Login = "user3", Password = "Pass123!" }
            };

            var createdUserIds = new List<int>();

            // Act
            foreach (var userDto in users)
            {
                var result = await controller.CreateUser(userDto);
                var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
                var user = Assert.IsType<Users>(createdResult.Value);

                createdUserIds.Add(user.Id);
                _output.WriteLine($" Utilisateur créé: {user.Email} (ID: {user.Id})");
            }

            // Assert
            Assert.Equal(3, createdUserIds.Count);
            Assert.Equal(3, createdUserIds.Distinct().Count()); // Tous les IDs sont uniques

            _output.WriteLine("");
            _output.WriteLine($" {users.Length} utilisateurs créés avec succès");
        }

   
        //Scénario : Validation de tous les champs requis lors de l'inscription
      
        [Fact]
        public async Task Registration_AllValidationRules_AreEnforced()
        {
         
            _output.WriteLine("TEST : Validation de toutes les règles d'inscription");
          

            await using var context = CreateContext("TestDb_AllValidations");
            var controller = CreateController(context);

            var testCases = new[]
            {
                new { Dto = new CreateUserDto { Email = "", Login = "test", Password = "Pass123!" }, Rule = "Email vide" },
                new { Dto = new CreateUserDto { Email = "invalid-email", Login = "test", Password = "Pass123!" }, Rule = "Email invalide" },
                new { Dto = new CreateUserDto { Email = "test@test.com", Login = "ab", Password = "Pass123!" }, Rule = "Login trop court" },
                new { Dto = new CreateUserDto { Email = "test@test.com", Login = "test", Password = "" }, Rule = "Password vide" },
                new { Dto = new CreateUserDto { Email = "test@test.com", Login = "test", Password = "short" }, Rule = "Password trop court" },
                new { Dto = new CreateUserDto { Email = "test@test.com", Login = "test", Password = "NoNumber!" }, Rule = "Password sans chiffre" },
                new { Dto = new CreateUserDto { Email = "test@test.com", Login = "test", Password = "nonumber123" }, Rule = "Password sans majuscule" }
            };

            foreach (var testCase in testCases)
            {
                var result = await controller.CreateUser(testCase.Dto);
                var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);

                _output.WriteLine($" {testCase.Rule} Rejeté");
            }

            _output.WriteLine("");
            _output.WriteLine($"Toutes les {testCases.Length} règles de validation sont appliquées");
        }

        // Test de charge : Créer 50 utilisateurs rapidement
      
        [Fact]
        public async Task LoadTest_Create50Users_ShouldSucceed()
        {
         
            _output.WriteLine("TEST DE CHARGE : Création de 50 utilisateurs");
       

            await using var context = CreateContext("TestDb_LoadTest");
            var controller = CreateController(context);

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            for (int i = 0; i < 50; i++)
            {
                var userDto = new CreateUserDto
                {
                    Email = $"user{i}@example.com",
                    Login = $"user{i}",
                    Password = "Password123!"
                };

                var result = await controller.CreateUser(userDto);
                Assert.IsType<CreatedAtActionResult>(result.Result);
            }

            stopwatch.Stop();

            // Assert
            var totalUsers = await context.Users.CountAsync();
            Assert.Equal(50, totalUsers);

            _output.WriteLine($" 50 utilisateurs créés en {stopwatch.ElapsedMilliseconds}ms");
            _output.WriteLine($" Moyenne: {stopwatch.ElapsedMilliseconds / 50.0:F2}ms par utilisateur");
            _output.WriteLine($" Performances: {(stopwatch.ElapsedMilliseconds < 5000 ? "EXCELLENTES" : "À AMÉLIORER")}");
        }
    }
}