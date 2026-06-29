namespace ProjectManagementSystem.API.Models
{
    public class Timesheet
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }

        public int ProjectId { get; set; }

        public DateTime WorkDate { get; set; }

        public decimal HoursWorked { get; set; }

        public string Description { get; set; } = string.Empty;
    }
}