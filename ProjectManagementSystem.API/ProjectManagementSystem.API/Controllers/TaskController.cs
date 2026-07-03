using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Data;
using ProjectManagementSystem.API.Models;

namespace ProjectManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TaskController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            return Ok(await _context.Tasks.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> AddTask(TaskItem task)
        {
            Console.WriteLine("Received DueDate:");
            Console.WriteLine(task.DueDate);
            Console.WriteLine(task.DueDate.Kind);

            task.DueDate = DateTime.SpecifyKind(task.DueDate, DateTimeKind.Utc);

            Console.WriteLine("After SpecifyKind:");
            Console.WriteLine(task.DueDate);
            Console.WriteLine(task.DueDate.Kind);

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, TaskItem task)
        {
            if (id != task.Id)
                return BadRequest();

            task.DueDate = DateTime.SpecifyKind(task.DueDate, DateTimeKind.Utc);

            _context.Entry(task).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound();

            Console.WriteLine(task.DueDate.Kind);

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}