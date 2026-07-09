using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Data;
using ProjectManagementSystem.API.DTOs;
using ProjectManagementSystem.API.Models;

namespace ProjectManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x =>
                x.Email == loginDto.Email &&
                x.Password == loginDto.Password);

            if (user == null)
                return Unauthorized("Invalid Email or Password");

            return Ok(new
            {
                Message = "Login Successful",
                UserId = user.Id,
                User = user.FullName,
                Role = user.Role,
                Phone = user.Phone ?? "",
                Department = user.Department ?? "",
                Bio = user.Bio ?? ""
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            return Ok(await _context.Users.ToListAsync());
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // GET /api/Auth/profile/{id}
        // Returns the current profile fields for the logged-in user.
        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                Phone = user.Phone ?? "",
                Department = user.Department ?? "",
                Bio = user.Bio ?? ""
            });
        }

        // PUT /api/Auth/profile/{id}
        // Updates FullName, Email, Phone, Department, Bio for the logged-in user.
        [HttpPut("profile/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, UpdateProfileDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            // Check email uniqueness (allow same user to keep their own email)
            var emailTaken = await _context.Users
                .AnyAsync(u => u.Email == dto.Email && u.Id != id);
            if (emailTaken)
                return BadRequest("Email is already in use by another account.");

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Phone = dto.Phone;
            user.Department = dto.Department;
            user.Bio = dto.Bio;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                Phone = user.Phone ?? "",
                Department = user.Department ?? "",
                Bio = user.Bio ?? ""
            });
        }

        // PUT /api/Auth/change-password/{id}
        // Verifies the current password then updates to the new one.
        // Passwords are stored as plain text to match the existing authentication
        // method used by the login endpoint — no hashing library is present in
        // this project. If hashing is added in future, update both login and here.
        [HttpPut("change-password/{id}")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            if (user.Password != dto.CurrentPassword)
                return BadRequest("Current password is incorrect.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("New password cannot be empty.");

            user.Password = dto.NewPassword;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Password updated successfully." });
        }
    }
}
