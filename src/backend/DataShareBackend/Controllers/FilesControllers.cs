using DataShareBackend.Data;
using DataShareBackend.DTO;
using DataShareBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.StaticFiles;
//Pour que le navigateur reonnaisse le type de fichier a ouvrir

namespace DataShareBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {

        //  Les types Mime des fichiers sert au navigateur pour les ouvrir

 
        //private string GetContentType(string fileName)
        //{
        //    var extension = Path.GetExtension(fileName).ToLowerInvariant();
        //    return extension switch
        //    {
        //        ".pdf" => "application/pdf",
        //        ".jpg" or ".jpeg" => "image/jpeg",
        //        ".png" => "image/png",
        //        ".gif" => "image/gif",
        //        ".txt" => "text/plain",
        //        ".doc" => "application/msword",
        //        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        //        ".xls" => "application/vnd.ms-excel",
        //        ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //        ".zip" => "application/zip",
        //        _ => "application/octet-stream"
        //    };
        //}

        private readonly DataShareDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly MyPasswordService _passwordService;
        private const long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

        public FilesController(DataShareDbContext context, IWebHostEnvironment environment, MyPasswordService passwordService)
        {
            _context = context;
            _environment = environment;
            _passwordService = passwordService;
        }

        // POST: api/Files/upload
      
  
        //Retourne l'ID du fichier et le lien de téléchargement
     

        [HttpPost("upload")]
        public async Task<ActionResult> UploadFile([FromForm] UploadFileDto fileDto)
        {
            try
            {
                // Validation du fichier
                if (fileDto.File == null || fileDto.File.Length == 0)
                {
                    return BadRequest(new { message = "Aucun fichier n'a été fourni" });
                }

                // Vérifier la taille du fichier
                if (fileDto.File.Length > MAX_FILE_SIZE)
                {
                    return BadRequest(new { message = $"Le fichier est trop volumineux. Taille maximale : {MAX_FILE_SIZE / (1024 * 1024)} MB" });
                }

                // Vérifier que l'utilisateur existe bien
                var userExists = await _context.Users.AnyAsync(u => u.Id == fileDto.IdUser);
                if (!userExists)
                {
                    return BadRequest(new { message = "Utilisateur introuvable" });
                }

                // Valider la date de fin
                if (fileDto.EndDate <= DateTime.UtcNow)
                {
                    return BadRequest(new { message = "La date de fin doit être dans le futur" });
                }

                // Créer le dossier uploads s'il n'existe pas
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Générer un nom de fichier unique
                var fileExtension = Path.GetExtension(fileDto.File.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Sauvegarder le fichier sur le serveur
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await fileDto.File.CopyToAsync(stream);
                }

                // Hasher le mot de passe si il existe
                string? hashedPassword = null;
                if (!string.IsNullOrEmpty(fileDto.FilePassword))
                {
                    hashedPassword = _passwordService.HashPassword(fileDto.FilePassword);
                }

                // Créer dans la base de données
                var fileRecord = new Files
                {
                    IdUser = fileDto.IdUser,
                    FileName = fileDto.File.FileName,
                    FilePassword = hashedPassword,
                    FilePath = uniqueFileName, 
                    EndDate = fileDto.EndDate,
                    CreationDate = DateTime.UtcNow,
                    Deleted = false
                };

                _context.Files.Add(fileRecord);
                await _context.SaveChangesAsync();

                // Générer le lien de téléchargement
                var downloadLink = $"{Request.Scheme}://{Request.Host}/api/Files/download/{fileRecord.Id}";

                return Ok(new
                {
                    message = "Fichier uploadé avec succès",
                    fileId = fileRecord.Id,
                    fileName = fileRecord.FileName,
                    downloadLink = downloadLink,
                    expirationDate = fileRecord.EndDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de l'upload du fichier", error = ex.Message });
            }
        }

        // GET: api/Files/download/{id}
      

        [HttpGet("download/{id}")]
        public async Task<ActionResult> DownloadFile(int id, [FromQuery] string? password)
        {
            try
            {
                var fileRecord = await _context.Files
                    .FirstOrDefaultAsync(f => f.Id == id && !f.Deleted);

                if (fileRecord == null)
                {
                    return NotFound(new { message = "Fichier introuvable ou supprimé" });
                }

                // Vérifier si le fichier est expiré
                if (fileRecord.EndDate < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Ce fichier a expiré" });
                }

                // Vérifier le mot de passe si nécessaire
                if (!string.IsNullOrEmpty(fileRecord.FilePassword))
                {
                    if (string.IsNullOrEmpty(password))
                    {
                        return Unauthorized(new { message = "Un mot de passe est requis pour télécharger ce fichier" });
                    }

                    var hashedPassword = _passwordService.HashPassword(password);
                    if (fileRecord.FilePassword != hashedPassword)
                    {
                        return Unauthorized(new { message = "Mot de passe incorrect" });
                    }
                }

                // Récupérer le fichier
                var filePath = Path.Combine(_environment.ContentRootPath, "uploads", fileRecord.FilePath ?? "");

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "Le fichier physique est introuvable sur le serveur" });
                }

                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;
                //Ajout de la partie d'informations type Mime pour navigateur gérer par le serveur ASP.net
                var provider = new FileExtensionContentTypeProvider();

                if (!provider.TryGetContentType(fileRecord.FileName, out var contentType))
                {
                    contentType = "application/octet-stream";
                }

                return File(memory, contentType, fileRecord.FileName);
                //Fin
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors du téléchargement", error = ex.Message });
            }
        }

        // GET: api/Files/{id}

        [HttpGet("{id}")]
        public async Task<ActionResult> GetFileInfo(int id)
        {
            try
            {
                var fileRecord = await _context.Files
                    .Include(f => f.User)
                    .FirstOrDefaultAsync(f => f.Id == id && !f.Deleted);

                if (fileRecord == null)
                {
                    return NotFound(new { message = "Fichier introuvable" });
                }

                return Ok(new
                {
                    id = fileRecord.Id,
                    fileName = fileRecord.FileName,
                    hasPassword = !string.IsNullOrEmpty(fileRecord.FilePassword),
                    creationDate = fileRecord.CreationDate,
                    expirationDate = fileRecord.EndDate,
                    isExpired = fileRecord.EndDate < DateTime.UtcNow,
                    uploadedBy = new
                    {
                        id = fileRecord.User?.Id,
                        email = fileRecord.User?.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération des informations", error = ex.Message });
            }
        }

        // GET: api/Files/user/{userId}
   

        [HttpGet("user/{userId}")]
        public async Task<ActionResult> GetUserFiles(int userId)
        {
            try
            {
                var files = await _context.Files
                    .Where(f => f.IdUser == userId && !f.Deleted)
                    .OrderByDescending(f => f.CreationDate)
                    .Select(f => new
                    {
                        id = f.Id,
                        fileName = f.FileName,
                        creationDate = f.CreationDate,
                        expirationDate = f.EndDate,
                        isExpired = f.EndDate < DateTime.UtcNow,
                        hasPassword = !string.IsNullOrEmpty(f.FilePassword),
                        downloadLink = $"{Request.Scheme}://{Request.Host}/api/Files/download/{f.Id}"
                    })
                    .ToListAsync();

                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération des fichiers", error = ex.Message });
            }
        }

        // DELETE: api/Files/{id}

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteFile(int id, [FromQuery] int userId)
        {
            try
            {
                var fileRecord = await _context.Files
                    .FirstOrDefaultAsync(f => f.Id == id && !f.Deleted);

                if (fileRecord == null)
                {
                    return NotFound(new { message = "Fichier introuvable" });
                }

                // Vérifier si l'id de l'utilisateur estr bien propirétaire du fichier
                if (fileRecord.IdUser != userId)
                {
                    return Forbid();
                }

                //Delete
                fileRecord.Deleted = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Fichier supprimé avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la suppression", error = ex.Message });
            }
        }

    }
}