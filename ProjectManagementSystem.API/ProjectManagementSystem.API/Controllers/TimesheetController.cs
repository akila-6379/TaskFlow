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

        // GET: api/Timesheet  — ordered by WorkDate descending (newest first)
        [HttpGet]
        public async Task<IActionResult> GetTimesheets()
        {
            var timesheets = await _context.Timesheets
                .OrderByDescending(t => t.WorkDate)
                .ToListAsync();
            return Ok(timesheets);
        }

        // POST: api/Timesheet
        [HttpPost]
        public async Task<IActionResult> AddTimesheet(Timesheet timesheet)
        {
            timesheet.WorkDate = DateTime.SpecifyKind(timesheet.WorkDate, DateTimeKind.Utc);

            // ── Validate work date: only today, yesterday, day before yesterday ──
            var todayUtc          = DateTime.UtcNow.Date;
            var workDateOnly      = timesheet.WorkDate.Date;
            var daysDifference    = (todayUtc - workDateOnly).TotalDays;

            if (daysDifference < 0)
                return BadRequest(new { message = "Future dates are not allowed. You can only log time for today, yesterday, or the day before yesterday." });

            if (daysDifference > 2)
                return BadRequest(new { message = "You can only log time for today, yesterday, or the day before yesterday." });

            // ── Validate no weekends ──
            var dayOfWeek = workDateOnly.DayOfWeek;
            if (dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.Sunday)
                return BadRequest(new { message = "Timesheet entries are not allowed on weekends (Saturday or Sunday)." });

            // ── Prevent duplicate: one entry per employee per work date ──
            var duplicate = await _context.Timesheets.AnyAsync(t =>
                t.EmployeeId == timesheet.EmployeeId &&
                t.WorkDate.Date == workDateOnly);

            if (duplicate)
                return BadRequest(new { message = "You have already submitted a timesheet for this date." });

            _context.Timesheets.Add(timesheet);
            await _context.SaveChangesAsync();

            return Ok(timesheet);
        }

        // PUT: api/Timesheet/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTimesheet(int id, Timesheet timesheet)
        {
            if (id != timesheet.Id)
                return BadRequest();

            var existingTimesheet = await _context.Timesheets.FindAsync(id);

            if (existingTimesheet == null)
                return NotFound();

            existingTimesheet.EmployeeId = timesheet.EmployeeId;
            existingTimesheet.ProjectId = timesheet.ProjectId;
            existingTimesheet.WorkDate = DateTime.SpecifyKind(timesheet.WorkDate, DateTimeKind.Utc);
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