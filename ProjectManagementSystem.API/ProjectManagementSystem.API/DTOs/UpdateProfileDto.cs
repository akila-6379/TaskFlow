namespace ProjectManagementSystem.API.DTOs
{
    public class UpdateProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Department { get; set; }
        public string? Bio { get; set; }
    }
}
