namespace ProjectManagementSystem.API.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int EmployeeId { get; set; }

        public int ProjectId { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime DueDate { get; set; }
    }
}