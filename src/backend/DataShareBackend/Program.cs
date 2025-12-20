using DataShareBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddScoped<MyPasswordService, PasswordService>();


// Configuration de la connexion PostgreSQL
builder.Services.AddDbContext<DataShareDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString);

    // Pour voir les requêtes SQL dans la console (optionnel, pour le développement)
    options.EnableSensitiveDataLogging();
    options.LogTo(Console.WriteLine, LogLevel.Information);
});

// Configuration CORS (pour permettre les appels depuis un frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

//Pour injecter le service du token dans l'application

builder.Services.Configure<TokenSetting>(builder.Configuration.GetSection("TokenSettings"));
builder.Services.AddSingleton<TokenService>(sp =>
{
    var options = sp.GetRequiredService<IOptions<TokenSetting>>();
    return new TokenService(options.Value);
});

// Swagger pour tester l'API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();