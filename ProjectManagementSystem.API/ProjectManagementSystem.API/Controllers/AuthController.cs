using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Data;
using ProjectManagementSystem.API.DTOs;
using ProjectManagementSystem.API.Models;
using ProjectManagementSystem.API.Services;

namespace ProjectManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _email;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IEmailService email, IConfiguration config)
        {
            _context = context;
            _email = email;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            Console.WriteLine("LOGIN API HIT");
            var user = await _context.Users.FirstOrDefaultAsync(x =>
                x.Email == loginDto.Email &&
                x.Password == loginDto.Password);
            Console.WriteLine(user == null ? "User not found" : "User found");

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

        // POST /api/Auth/forgot-password
        // Generates a reset token, stores it on the user, and emails a reset link.
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Always return OK to avoid email enumeration
            if (user == null)
                return Ok(new { Message = "If that email exists, a reset link has been sent." });

            var token = Guid.NewGuid().ToString("N");
            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);
            await _context.SaveChangesAsync();

            var frontendUrl = _config["AppSettings:FrontendUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?token={token}";

            var body = $"""
                <p>Hi {user.FullName},</p>
                <p>You requested a password reset for your TaskFlow account.</p>
                <p><a href="{resetLink}">Click here to reset your password</a></p>
                <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
                """;

            try
            {
                await _email.SendAsync(
                user.Email,
                "TaskFlow — Reset Your Password",
                body);

                return Ok(new
            
                {
                Message = "If that email exists, a reset link has been sent."
                });
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());

                return StatusCode(500, ex.Message);
            }

            
        }

        // POST /api/Auth/reset-password
        // Validates the token and sets the new password.
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.ResetPasswordToken == dto.Token &&
                u.ResetPasswordTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return BadRequest("Invalid or expired reset token.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("New password cannot be empty.");

            user.Password = dto.NewPassword;
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Password reset successfully." });
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
