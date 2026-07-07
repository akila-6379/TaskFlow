using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Data;
using ProjectManagementSystem.API.Models;

namespace ProjectManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Project
        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await _context.Projects.ToListAsync();
            return Ok(projects);
        }

        // POST: api/Project
        [HttpPost]
public async Task<IActionResult> AddProject(Project project)
{
    project.StartDate = DateTime.SpecifyKind(project.StartDate, DateTimeKind.Utc);
    project.EndDate = DateTime.SpecifyKind(project.EndDate, DateTimeKind.Utc);

    _context.Projects.Add(project);
    await _context.SaveChangesAsync();

    return Ok(project);
}

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, Project project)
        {
            if (id != project.Id)
                return BadRequest();

            // Bug 3: PostgreSQL (Npgsql) requires DateTimeKind.Utc.
            // Date-only strings from the frontend ("YYYY-MM-DD") are parsed as
            // DateTimeKind.Unspecified, causing a save failure identical to the
            // one AddProject already fixed with SpecifyKind.
            project.StartDate = DateTime.SpecifyKind(project.StartDate, DateTimeKind.Utc);
            project.EndDate   = DateTime.SpecifyKind(project.EndDate,   DateTimeKind.Utc);

            _context.Entry(project).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(project);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
                return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}