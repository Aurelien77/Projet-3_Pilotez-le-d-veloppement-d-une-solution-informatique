using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DataShareBackend.Models;
using Microsoft.IdentityModel.Tokens;


public class TokenService
{
    private readonly TokenSetting _tokenSettings;

    public TokenService(TokenSetting tokenSettings)
    {
        _tokenSettings = tokenSettings ?? throw new ArgumentNullException(nameof(tokenSettings));
    }

    public string GenerateToken(Users user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("UserId", user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.Login!)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_tokenSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _tokenSettings.Issuer,
            audience: _tokenSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(_tokenSettings.Expiration),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);

    }
         public int GetTokenExpirationDays() => _tokenSettings.Expiration;

}
