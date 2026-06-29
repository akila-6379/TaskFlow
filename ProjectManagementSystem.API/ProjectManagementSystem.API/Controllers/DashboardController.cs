using Microsoft.AspNetCore.Mvc;
using ProjectManagementSystem.API.Data;

namespace ProjectManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public IActionResult GetDashboardStats()
        {
            var totalEmployees = _context.Employees.Count();

            var activeProjects = _context.Projects.Count();

            var totalTasks = _context.Tasks.Count();

            var totalHours =
                _context.Timesheets.Sum(t => (decimal?)t.HoursWorked) ?? 0;

            return Ok(new
            {
                TotalEmployees = totalEmployees,
                ActiveProjects = activeProjects,
                TotalTasks = totalTasks,
                HoursLogged = totalHours
            });
        }
    }
}