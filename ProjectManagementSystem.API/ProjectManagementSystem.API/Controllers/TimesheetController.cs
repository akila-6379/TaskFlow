using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Data;
using ProjectManagementSystem.API.Models;

namespace ProjectManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimesheetController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TimesheetController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Timesheet
        [HttpGet]
        public async Task<IActionResult> GetTimesheets()
        {
            var timesheets = await _context.Timesheets.ToListAsync();
            return Ok(timesheets);
        }

        // POST: api/Timesheet
        [HttpPost]
        public async Task<IActionResult> AddTimesheet(Timesheet timesheet)
        {
            _context.Timesheets.Add(timesheet);
            await _context.SaveChangesAsync();

            return Ok(timesheet);
        }

        // PUT: api/Timesheet/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTimesheet(int id, Timesheet timesheet)
        {
            if (id != timesheet.Id)
            {
                return BadRequest("Timesheet ID mismatch.");
            }

            var existingTimesheet = await _context.Timesheets.FindAsync(id);

            if (existingTimesheet == null)
            {
                return NotFound();
            }

            existingTimesheet.EmployeeId = timesheet.EmployeeId;
            existingTimesheet.ProjectId = timesheet.ProjectId;
            existingTimesheet.WorkDate = timesheet.WorkDate;
            existingTimesheet.HoursWorked = timesheet.HoursWorked;
            existingTimesheet.Description = timesheet.Description;

            await _context.SaveChangesAsync();

            return Ok(existingTimesheet);
        }

        // DELETE: api/Timesheet/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTimesheet(int id)
        {
            var timesheet = await _context.Timesheets.FindAsync(id);

            if (timesheet == null)
            {
                return NotFound();
            }

            _context.Timesheets.Remove(timesheet);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}