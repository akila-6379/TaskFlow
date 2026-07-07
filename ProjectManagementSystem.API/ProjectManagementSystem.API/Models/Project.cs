namespace ProjectManagementSystem.API.Models
{
    public class Project
    {
        public int Id { get; set; }

        public string ProjectName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int Progress { get; set; }

        public string Status { get; set; } = "Active";

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string ProjectId => $"PR{Id}";
    }
}