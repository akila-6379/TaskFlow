using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Data;
using ProjectManagementSystem.API.Models;

namespace ProjectManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeeController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetEmployees()
        {
            var employees = await _context.Employees.ToListAsync();
            return Ok(employees);
        }

        [HttpPost]
        public async Task<IActionResult> AddEmployee(Employee employee)
        {
            // Bug 2 Fix: Do NOT derive the EmployeeId from the last remaining row's
            // EmployeeId string, because deleted rows leave gaps and the old logic
            // would reuse IDs (e.g. deleting EMP019 → next employee gets EMP019 again).
            //
            // Instead, save the row first so that EF / PostgreSQL assigns a fresh
            // auto-increment Id from the sequence.  Sequences never reuse numbers after
            // a delete, so employee.Id will always be strictly greater than every Id
            // ever assigned in this table.  We then derive EmployeeId from that Id and
            // persist the update — guaranteeing permanent uniqueness.

            employee.EmployeeId = string.Empty; // placeholder until we have the real Id
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync(); // EF now populates employee.Id

            employee.EmployeeId = $"EMP{employee.Id}";
            await _context.SaveChangesAsync(); // persist the derived EmployeeId

            return Ok(employee);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            var existingEmployee = await _context.Employees.FindAsync(id);

            if (existingEmployee == null)
                return NotFound();

            existingEmployee.Name = employee.Name;
            existingEmployee.Email = employee.Email;
            existingEmployee.Department = employee.Department;
            existingEmployee.Designation = employee.Designation;
            existingEmployee.Status = employee.Status;
            existingEmployee.Phone = employee.Phone;
            existingEmployee.JoinDate = employee.JoinDate;
            // existingEmployee.EmployeeId = employee.EmployeeId; // Employee ID must remain unchanged when editing

            await _context.SaveChangesAsync();

            return Ok(existingEmployee);
        }

        // DELETE: api/Employee/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
                return NotFound();

            _context.Employees.Remove(employee);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee deleted successfully" });
        }
    }
}