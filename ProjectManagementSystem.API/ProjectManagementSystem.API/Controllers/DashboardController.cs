using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalEmployees = _context.Employees.Count();

            var activeProjects = _context.Projects.Count();

            var totalTasks = _context.Tasks.Count();

            var totalHours =
                _context.Timesheets.Sum(t => (decimal?)t.HoursWorked) ?? 0;

            // COUNT(DISTINCT EmployeeId) where WorkDate == Today (UTC)
            var todayUtc = DateTime.UtcNow.Date;
            var employeesLoggedToday = await _context.Timesheets
                .Where(t => t.WorkDate.Date == todayUtc)
                .Select(t => t.EmployeeId)
                .Distinct()
                .CountAsync();

            return Ok(new
            {
                TotalEmployees = totalEmployees,
                ActiveProjects = activeProjects,
                TotalTasks = totalTasks,
                HoursLogged = totalHours,
                EmployeesLoggedToday = employeesLoggedToday
            });
        }
    }
}