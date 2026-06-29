namespace ProjectManagementSystem.API.Models
{
    public class Employee
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";

        public string EmployeeId { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? JoinDate { get; set; }
    }
}