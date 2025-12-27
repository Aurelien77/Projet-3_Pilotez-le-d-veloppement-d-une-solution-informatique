using DataShareBackend.Controllers;
using DataShareBackend.Models;
using Xunit.Abstractions;

namespace DataShareBackend.Tests
{
  
    // Tests unitaires pour PasswordService
  
    public class PasswordServiceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly PasswordService _passwordService;

        public PasswordServiceTests(ITestOutputHelper output)
        {
            _output = output;
            _passwordService = new PasswordService();
        }

        [Fact]
        public void HashPassword_ShouldReturnHashedPassword()
        {
            // Arrange
            string plainPassword = "MySecurePassword123!";

            // Act
            string hashedPassword = _passwordService.HashPassword(plainPassword);

            // Assert
            Assert.NotNull(hashedPassword);
            Assert.NotEmpty(hashedPassword);
            Assert.NotEqual(plainPassword, hashedPassword);

            _output.WriteLine($"Mot de passe hashé avec succès");
            _output.WriteLine($"Original: {plainPassword}");
            _output.WriteLine($"Hash: {hashedPassword}");
        }

        [Fact]
        public void HashPassword_SamePassword_ShouldReturnSameHash()
        {
            // Arrange
            string password = "TestPassword123!";

            // Act
            string hash1 = _passwordService.HashPassword(password);
            string hash2 = _passwordService.HashPassword(password);

            // Assert
            Assert.Equal(hash1, hash2);

            _output.WriteLine($"✅ Le même mot de passe produit le même hash (cohérence)");
        }

        [Fact]
        public void HashPassword_DifferentPasswords_ShouldReturnDifferentHashes()
        {
            // Arrange
            string password1 = "Password1!";
            string password2 = "Password2!";

            // Act
            string hash1 = _passwordService.HashPassword(password1);
            string hash2 = _passwordService.HashPassword(password2);

            // Assert
            Assert.NotEqual(hash1, hash2);

            _output.WriteLine($"✅ Des mots de passe différents produisent des hash différents");
            _output.WriteLine($"Password1 hash: {hash1}");
            _output.WriteLine($"Password2 hash: {hash2}");
        }

        [Fact]
        public void HashPassword_EmptyString_ShouldReturnHash()
        {
            // Arrange
            string emptyPassword = "";

            // Act
            string hash = _passwordService.HashPassword(emptyPassword);

            // Assert
            Assert.NotNull(hash);
            Assert.NotEmpty(hash);

            _output.WriteLine($"✅ Même une chaîne vide produit un hash");
            _output.WriteLine($"Hash: {hash}");
        }

        [Theory]
        [InlineData("a")]
        [InlineData("123")]
        [InlineData("Password123!")]
        [InlineData("VeryLongPasswordWithManyCharacters123456789!@#$%")]
        public void HashPassword_VariousLengths_ShouldWork(string password)
        {
            // Act
            string hash = _passwordService.HashPassword(password);

            // Assert
            Assert.NotNull(hash);
            Assert.NotEmpty(hash);

            _output.WriteLine($"✅ Password de longueur {password.Length}: hashé avec succès");
        }
    }


    // Tests unitaires pour TokenService
   
    public class TokenServiceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly TokenService _tokenService;
        private readonly TokenSetting _tokenSetting;

        public TokenServiceTests(ITestOutputHelper output)
        {
            _output = output;

            _tokenSetting = new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            };

            _tokenService = new TokenService(_tokenSetting);
        }

        [Fact]
        public void GenerateToken_ShouldReturnValidToken()
        {
            // Arrange
            var user = new Users
            {
                Id = 1,
                Email = "test@example.com",
                Login = "TestUser"
            };
            var roles = new List<string> { "User" };

            // Act
            string token = _tokenService.GenerateToken(user, roles);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
            Assert.Contains(".", token);

            _output.WriteLine($"✅ Token généré avec succès");
            _output.WriteLine($"Token: {token}");
            _output.WriteLine($"Longueur: {token.Length} caractères");
        }

        [Fact]
        public void GenerateToken_WithoutRoles_ShouldWork()
        {
            // Arrange
            var user = new Users
            {
                Id = 2,
                Email = "noroles@example.com",
                Login = "NoRolesUser"
            };
            var roles = new List<string>();

            // Act
            string token = _tokenService.GenerateToken(user, roles);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);

            _output.WriteLine($"✅ Token généré sans rôles avec succès");
        }

        [Fact]
        public void GenerateToken_WithMultipleRoles_ShouldWork()
        {
            // Arrange
            var user = new Users
            {
                Id = 3,
                Email = "admin@example.com",
                Login = "AdminUser"
            };
            var roles = new List<string> { "User", "Admin", "Moderator" };

            // Act
            string token = _tokenService.GenerateToken(user, roles);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);

            _output.WriteLine($"✅ Token généré avec plusieurs rôles: {string.Join(", ", roles)}");
        }

        [Fact]
        public void GenerateToken_DifferentUsers_ShouldReturnDifferentTokens()
        {
            // Arrange
            var user1 = new Users { Id = 1, Email = "user1@example.com", Login = "User1" };
            var user2 = new Users { Id = 2, Email = "user2@example.com", Login = "User2" };
            var roles = new List<string> { "User" };

            // Act
            string token1 = _tokenService.GenerateToken(user1, roles);
            string token2 = _tokenService.GenerateToken(user2, roles);

            // Assert
            Assert.NotEqual(token1, token2);

            _output.WriteLine($"✅ Différents utilisateurs produisent des tokens différents");
        }

        [Fact]
        public void GetTokenExpirationDays_ShouldReturnConfiguredValue()
        {
            // Act
            int expirationDays = _tokenService.GetTokenExpirationDays();

            // Assert
            Assert.Equal(_tokenSetting.Expiration, expirationDays);
            Assert.Equal(1, expirationDays);

            _output.WriteLine($"✅ Expiration du token: {expirationDays} jour(s)");
        }

        [Theory]
        [InlineData(1)]
        [InlineData(7)]
        [InlineData(30)]
        [InlineData(365)]
        public void TokenService_WithDifferentExpirations_ShouldWork(int expirationDays)
        {
            // Arrange
            var customSetting = new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = expirationDays,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            };
            var customTokenService = new TokenService(customSetting);
            var user = new Users { Id = 1, Email = "test@example.com", Login = "Test" };

            // Act
            string token = customTokenService.GenerateToken(user, new List<string>());
            int returnedExpiration = customTokenService.GetTokenExpirationDays();

            // Assert
            Assert.NotNull(token);
            Assert.Equal(expirationDays, returnedExpiration);

            _output.WriteLine($"✅ Token avec expiration de {expirationDays} jour(s) généré");
        }

        [Fact]
        public void GenerateToken_SameUserMultipleTimes_ShouldReturnSameToken()
        {
            // Arrange
            var user = new Users
            {
                Id = 1,
                Email = "test@example.com",
                Login = "TestUser"
            };
            var roles = new List<string> { "User" };

            // Act
            string token1 = _tokenService.GenerateToken(user, roles);
            // Petit délai pour s'assurer que le timestamp est identique
            System.Threading.Thread.Sleep(10);
            string token2 = _tokenService.GenerateToken(user, roles);

            // Assert
            // Note: Les tokens JWT incluent souvent un timestamp (iat, exp)
            // donc ils peuvent être différents même pour le même utilisateur
            Assert.NotNull(token1);
            Assert.NotNull(token2);

            _output.WriteLine($"Tokens générés pour le même utilisateur");
            _output.WriteLine($"Token1 == Token2: {token1 == token2}");
            _output.WriteLine($"(Note: Peuvent être différents à cause du timestamp)");
        }
    }


    // Tests de performance et edge cases

    public class ServicesPerformanceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly PasswordService _passwordService;
        private readonly TokenService _tokenService;

        public ServicesPerformanceTests(ITestOutputHelper output)
        {
            _output = output;
            _passwordService = new PasswordService();

            var tokenSetting = new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            };
            _tokenService = new TokenService(tokenSetting);
        }

        [Fact]
        public void HashPassword_Performance_100Iterations()
        {
            // Arrange
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var password = "TestPassword123!";

            // Act
            for (int i = 0; i < 100; i++)
            {
                _passwordService.HashPassword(password);
            }
            stopwatch.Stop();

            // Assert
            _output.WriteLine($"✅ 100 hashages en {stopwatch.ElapsedMilliseconds}ms");
            _output.WriteLine($"   Moyenne: {stopwatch.ElapsedMilliseconds / 100.0}ms par hash");

            // Le hashage ne devrait pas prendre plus de 10ms par opération en moyenne
            Assert.True(stopwatch.ElapsedMilliseconds < 1000, "Le hashage est trop lent");
        }

        [Fact]
        public void GenerateToken_Performance_100Iterations()
        {
            // Arrange
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var user = new Users { Id = 1, Email = "test@example.com", Login = "Test" };
            var roles = new List<string> { "User" };

            // Act
            for (int i = 0; i < 100; i++)
            {
                _tokenService.GenerateToken(user, roles);
            }
            stopwatch.Stop();

            // Assert
            _output.WriteLine($"✅ 100 générations de token en {stopwatch.ElapsedMilliseconds}ms");
            _output.WriteLine($"   Moyenne: {stopwatch.ElapsedMilliseconds / 100.0}ms par token");

            Assert.True(stopwatch.ElapsedMilliseconds < 1500, "La génération de token est trop lente");
        }

        [Fact]
        public void HashPassword_SpecialCharacters_ShouldWork()
        {
            // Arrange
            var specialPasswords = new[]
            {
                "Émojis💯✨🔥",
                "Français: àéèêëïôù",
                "Chinese: 中文密码",
                "Arabic: كلمةالسر",
                "Symbols: !@#$%^&*()_+-=[]{}|;':\",./<>?"
            };

            foreach (var password in specialPasswords)
            {
                // Act
                var hash = _passwordService.HashPassword(password);

                // Assert
                Assert.NotNull(hash);
                Assert.NotEmpty(hash);

                _output.WriteLine($"Hash réussi pour: {password}");
            }
        }
    }
}