namespace DataShareBackend.DTO
{
    public class CreateUserDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Login { get; set; }
        public string? Picture { get; set; }
    }
}
