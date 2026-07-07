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

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string TaskId
        {
            get
            {
                if (Id <= 0 || ProjectId <= 0) return string.Empty;
                return Services.IdSequenceHelper.GetTaskId(Id, ProjectId);
            }
            set { }
        }
    }
}