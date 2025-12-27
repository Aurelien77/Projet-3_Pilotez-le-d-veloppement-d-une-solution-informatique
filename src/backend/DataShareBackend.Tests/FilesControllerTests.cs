using DataShareBackend.Controllers;
using DataShareBackend.Data;
using DataShareBackend.DTO;
using DataShareBackend.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Xunit.Abstractions;

namespace DataShareBackend.Tests
{
    // Classe Mock pour IWebHostEnvironment 
    public class FakeWebHostEnvironment : IWebHostEnvironment
    {
        public string WebRootPath { get; set; } = string.Empty;
        public IFileProvider WebRootFileProvider { get; set; } = null!;
        public string ApplicationName { get; set; } = "TestApp";
        public IFileProvider ContentRootFileProvider { get; set; } = null!;
        public string EnvironmentName { get; set; } = "Test";
        public string ContentRootPath { get; set; } = Path.GetTempPath();
    }

    // Classe Mock pour IFormFile
    public class FakeFormFile : IFormFile
    {
        private readonly MemoryStream _stream;
        private readonly string _fileName;

        public FakeFormFile(string fileName, string content)
        {
            _fileName = fileName;
            var bytes = Encoding.UTF8.GetBytes(content);
            _stream = new MemoryStream(bytes);
        }

        public string ContentType => "text/plain";
        public string ContentDisposition => $"form-data; name=\"file\"; filename=\"{_fileName}\"";
        public IHeaderDictionary Headers => new HeaderDictionary();
        public long Length => _stream.Length;
        public string Name => "file";
        public string FileName => _fileName;

        public Stream OpenReadStream() => _stream;

        public void CopyTo(Stream target)
        {
            _stream.Position = 0;
            _stream.CopyTo(target);
        }

        public Task CopyToAsync(Stream target, CancellationToken cancellationToken = default)
        {
            _stream.Position = 0;
            return _stream.CopyToAsync(target, cancellationToken);
        }
    }

    // Classe pour parser les réponses d'upload
    public class UploadFileResponse
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = null!;

        [JsonPropertyName("fileId")]
        public int FileId { get; set; }

        [JsonPropertyName("fileName")]
        public string FileName { get; set; } = null!;

        [JsonPropertyName("downloadLink")]
        public string DownloadLink { get; set; } = null!;

        [JsonPropertyName("expirationDate")]
        public DateTime ExpirationDate { get; set; }
    }

    public class FilesControllerTests
    {
        private readonly ITestOutputHelper _output;
        private readonly PasswordService _passwordService;

        public FilesControllerTests(ITestOutputHelper output)
        {
            _output = output;
            _passwordService = new PasswordService();
        }

        // Méthode pour créer le contexte de base de données
        private DataShareDbContext CreateContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<DataShareDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            return new DataShareDbContext(options);
        }

        // Méthode pour créer le controller avec FakeWebHostEnvironment
        private FilesController CreateController(DataShareDbContext context)
        {
            // Créer un dossier temporaire pour les uploads de test
            var uploadsPath = Path.Combine(Path.GetTempPath(), "test_uploads");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var fakeEnvironment = new FakeWebHostEnvironment
            {
                ContentRootPath = Path.GetTempPath()
            };

            return new FilesController(context, fakeEnvironment, _passwordService);
        }

        //*************************************** UPLOAD FILE ************************************** //

        

        //********************************** ERRORS **********************************//


        [Fact]
        public async Task UploadFile_UserNotFound_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_UploadFile_UserNotFound");
            var controller = CreateController(context);

            var fakeFile = new FakeFormFile("test.txt", "Content");

            var uploadDto = new UploadFileDto
            {
                File = fakeFile,
                IdUser = 9999, // Utilisateur inexistant
                EndDate = DateTime.UtcNow.AddDays(7)
            };

            // Act
            var result = await controller.UploadFile(uploadDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("introuvable", error!.Message.ToLower());

            _output.WriteLine($"Upload avec utilisateur inexistant rejeté: {error.Message}");
        }

        [Fact]
        public async Task UploadFile_ExpiredDate_ReturnsBadRequest()
        {
            // Arrange
            await using var context = CreateContext("TestDb_UploadFile_ExpiredDate");

            var user = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var fakeFile = new FakeFormFile("test.txt", "Content");

            var uploadDto = new UploadFileDto
            {
                File = fakeFile,
                IdUser = user.Id,
                EndDate = DateTime.UtcNow.AddDays(-1) // Date dans le passé
            };

            // Act
            var result = await controller.UploadFile(uploadDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequest.Value);
            var error = JsonSerializer.Deserialize<ErrorResponse>(json);

            Assert.Contains("futur", error!.Message.ToLower());

            _output.WriteLine($"❌ Upload avec date expirée rejeté: {error.Message}");
        }
        //********************************** SUCCES **********************************//
        [Fact]
        public async Task UploadFile_Success()
        {
            // Arrange
            await using var context = CreateContext("TestDb_UploadFile_Success");

            // Créer un utilisateur
            var user = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Mock HttpContext pour générer les URLs
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Scheme = "https";
            httpContext.Request.Host = new HostString("localhost:5001");
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            var fakeFile = new FakeFormFile("test.txt", "Hello World!");

            var uploadDto = new UploadFileDto
            {
                File = fakeFile,
                IdUser = user.Id,
                EndDate = DateTime.UtcNow.AddDays(7),
                FilePassword = null
            };

            // Act
            var result = await controller.UploadFile(uploadDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            var response = JsonSerializer.Deserialize<UploadFileResponse>(json);

            Assert.NotNull(response);
            Assert.Contains("succès", response.Message.ToLower());
            Assert.True(response.FileId > 0);
            Assert.Equal("test.txt", response.FileName);
            Assert.Contains("/api/Files/download/", response.DownloadLink);

            _output.WriteLine("✅ Fichier uploadé avec succès");
            _output.WriteLine($"FileId: {response.FileId}");
            _output.WriteLine($"FileName: {response.FileName}");
            _output.WriteLine($"Download Link: {response.DownloadLink}");
            _output.WriteLine($"Expiration: {response.ExpirationDate}");
        }

        [Fact]
        public async Task UploadFile_WithPassword_Success()
        {
            // Arrange
            await using var context = CreateContext("TestDb_UploadFile_WithPassword");

            var user = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Scheme = "https";
            httpContext.Request.Host = new HostString("localhost:5001");
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            var fakeFile = new FakeFormFile("secure.pdf", "Confidential content");

            var uploadDto = new UploadFileDto
            {
                File = fakeFile,
                IdUser = user.Id,
                EndDate = DateTime.UtcNow.AddDays(7),
                FilePassword = "SecurePass123!"
            };

            // Act
            var result = await controller.UploadFile(uploadDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Vérifier que le mot de passe a été hashé en base
            var fileRecord = await context.Files.FirstOrDefaultAsync(f => f.FileName == "secure.pdf");
            Assert.NotNull(fileRecord);
            Assert.NotNull(fileRecord.FilePassword);
            Assert.NotEqual("SecurePass123!", fileRecord.FilePassword); // Service Hash

            _output.WriteLine("Fichier protégé par mot de passe uploadé avec succès");
            _output.WriteLine($"Mot de passe hashé: {fileRecord.FilePassword}");
        }

        //*************************************** GET FILE ************************************** //

        //********************************** ERRORS **********************************//
        [Fact]
        public async Task GetFileInfo_NotFound_ReturnsNotFound()
        {
            // Arrange
            await using var context = CreateContext("TestDb_GetFileInfo_NotFound");
            var controller = CreateController(context);

            // Act
            var result = await controller.GetFileInfo(9999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);

            _output.WriteLine( "Fichier non trouvé comme attendu");
        }

        //********************************** SUCCES **********************************//
        [Fact]
        public async Task GetFileInfo_Success()
        {
            // Arrange
            await using var context = CreateContext("TestDb_GetFileInfo_Success");

            var user = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var file = new Files
            {
                IdUser = user.Id,
                FileName = "test.txt",
                FilePath = "test-guid.txt",
                EndDate = DateTime.UtcNow.AddDays(7),
                CreationDate = DateTime.UtcNow,
                Deleted = false
            };
            context.Files.Add(file);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Act
            var result = await controller.GetFileInfo(file.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            _output.WriteLine("✅ Informations du fichier récupérées avec succès");
        }
        //*************************************** GET USER FILES ************************************** //

        //********************************** SUCCES **********************************//
        [Fact]
        public async Task GetUserFiles_Success()
        {
            // Arrange
            await using var context = CreateContext("TestDb_GetUserFiles_Success");

            var user = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Ajouter plusieurs fichiers
            context.Files.AddRange(
                new Files
                {
                    IdUser = user.Id,
                    FileName = "file1.txt",
                    FilePath = "guid1.txt",
                    EndDate = DateTime.UtcNow.AddDays(7),
                    CreationDate = DateTime.UtcNow,
                    Deleted = false
                },
                new Files
                {
                    IdUser = user.Id,
                    FileName = "file2.pdf",
                    FilePath = "guid2.pdf",
                    EndDate = DateTime.UtcNow.AddDays(3),
                    CreationDate = DateTime.UtcNow,
                    Deleted = false
                }
            );
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Scheme = "https";
            httpContext.Request.Host = new HostString("localhost:5001");
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Act
            var result = await controller.GetUserFiles(user.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            _output.WriteLine($"✅ Fichiers de l'utilisateur récupérés avec succès");
        }

        //*************************************** DELETE FILE ************************************** //

        //********************************** ERRORS **********************************//

        [Fact]
        public async Task DeleteFile_NotOwner_ReturnsForbid()
        {
            // Arrange
            await using var context = CreateContext("TestDb_DeleteFile_NotOwner");

            var user1 = new Users
            {
                Email = "user1@example.com",
                Login = "User1",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            var user2 = new Users
            {
                Email = "user2@example.com",
                Login = "User2",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.AddRange(user1, user2);
            await context.SaveChangesAsync();

            var file = new Files
            {
                IdUser = user1.Id,
                FileName = "test.txt",
                FilePath = "guid.txt",
                EndDate = DateTime.UtcNow.AddDays(7),
                CreationDate = DateTime.UtcNow,
                Deleted = false
            };
            context.Files.Add(file);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Act - User2 essaie de supprimer le fichier de User1
            var result = await controller.DeleteFile(file.Id, user2.Id);

            // Assert
            Assert.IsType<ForbidResult>(result);

            _output.WriteLine(" Suppression par non-propriétaire refusée comme attendu");
        }
        //********************************** SUCCES **********************************//

        [Fact]
        public async Task DeleteFile_Success()
        {
            // Arrange
            await using var context = CreateContext("TestDb_DeleteFile_Success");

            var user = new Users
            {
                Email = "test@example.com",
                Login = "TestUser",
                Password = _passwordService.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var file = new Files
            {
                IdUser = user.Id,
                FileName = "test.txt",
                FilePath = "guid.txt",
                EndDate = DateTime.UtcNow.AddDays(7),
                CreationDate = DateTime.UtcNow,
                Deleted = false
            };
            context.Files.Add(file);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Act
            var result = await controller.DeleteFile(file.Id, user.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Vérifier le soft delete
            var deletedFile = await context.Files.FindAsync(file.Id);
            Assert.True(deletedFile!.Deleted);

            _output.WriteLine("Fichier supprimé (soft delete) avec succès");
        }

       
    }
}