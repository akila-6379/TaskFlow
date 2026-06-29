using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Models;

namespace ProjectManagementSystem.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Employee> Employees { get; set; }

        public DbSet<Project> Projects { get; set; }

        public DbSet<TaskItem> Tasks { get; set; }

        public DbSet<Timesheet> Timesheets { get; set; }
    }
}