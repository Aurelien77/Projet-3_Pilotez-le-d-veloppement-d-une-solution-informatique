using System.Security.Cryptography;
using System.Text;

public interface MyPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string hashedPassword, string passwordToCheck);
}

public class PasswordService : MyPasswordService
{
    public string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    public bool VerifyPassword(string hashedPassword, string passwordToCheck)
    {
        return hashedPassword == HashPassword(passwordToCheck);
    }
}
