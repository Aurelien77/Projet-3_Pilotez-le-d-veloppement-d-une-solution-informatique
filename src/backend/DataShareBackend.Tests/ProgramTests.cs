using DataShareBackend.Data;
using DataShareBackend.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Xunit.Abstractions;

namespace DataShareBackend.Tests
{
    public class ProgramConfigurationTests
    {
        private readonly ITestOutputHelper _output;

        public ProgramConfigurationTests(ITestOutputHelper output)
        {
            _output = output;
        }

        private IServiceCollection CreateServices()
        {
            var services = new ServiceCollection();

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    {"ConnectionStrings:DefaultConnection", "Host=localhost;Database=testdb;Username=test;Password=test"},
                    {"TokenSettings:Secret", "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234"},
                    {"TokenSettings:Expiration", "1"},
                    {"TokenSettings:Issuer", "TestIssuer"},
                    {"TokenSettings:Audience", "TestAudience"}
                }!)
                .Build();

            services.AddControllers();
            services.AddScoped<MyPasswordService, PasswordService>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });

            var tokenSetting = new TokenSetting
            {
                Secret = "UneSuperCleTresLongueDeTestAvecPlusDe32Caracteres1234",
                Expiration = 1,
                Issuer = "TestIssuer",
                Audience = "TestAudience"
            };

            services.AddSingleton(new TokenService(tokenSetting));
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            return services;
        }

        [Fact]
        public void Program_TokenService_CanGenerateToken()
        {
            // Arrange
            var services = CreateServices();
            var serviceProvider = services.BuildServiceProvider();
            var tokenService = serviceProvider.GetRequiredService<TokenService>();

            var user = new Users  // ⬅️ Créer l'objet user
            {
                Id = 1,
                Email = "test@test.com",
                Login = "testuser"
            };

            // Act
            var token = tokenService.GenerateToken(user, new List<string>());  // ⬅️ Utiliser user avec roles

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
            Assert.Contains(".", token); // JWT format

            _output.WriteLine($"✅ TokenService génère des tokens valides");
            _output.WriteLine($"   Token: {token.Substring(0, 50)}...");
        }

        [Fact]
        public void Program_AllServices_CanBeRegistered()
        {
            var services = CreateServices();
            var serviceProvider = services.BuildServiceProvider();

            Assert.NotNull(serviceProvider.GetService<MyPasswordService>());
            Assert.NotNull(serviceProvider.GetService<TokenService>());

            _output.WriteLine("✅ Tous les services de Program.cs peuvent être enregistrés");
        }

        [Fact]
        public void Program_PasswordService_CanHashPassword()
        {
            var services = CreateServices();
            var serviceProvider = services.BuildServiceProvider();
            var passwordService = serviceProvider.GetRequiredService<MyPasswordService>();

            var password = "TestPassword123!";
            var hash = passwordService.HashPassword(password);

            Assert.NotNull(hash);
            Assert.NotEmpty(hash);
            Assert.NotEqual(password, hash);

            _output.WriteLine("✅ PasswordService fonctionne correctement");
        }
    }
}