using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        // Temporary for testing
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database Connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseCors("AllowNextJs");

app.UseAuthorization();

app.MapControllers();

// Migrate existing employee IDs from EMP00X to EMPX format on startup
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var employees = await context.Employees.ToListAsync();
        bool changed = false;
        foreach (var emp in employees)
        {
            if (emp.EmployeeId.StartsWith("EMP") && emp.EmployeeId.Length > 3)
            {
                var numPart = emp.EmployeeId.Substring(3);
                if (numPart.All(char.IsDigit))
                {
                    var numStr = numPart.TrimStart('0');
                    if (string.IsNullOrEmpty(numStr)) numStr = "0";
                    var newId = "EMP" + numStr;
                    if (emp.EmployeeId != newId)
                    {
                        emp.EmployeeId = newId;
                        changed = true;
                    }
                }
            }
        }
        if (changed)
        {
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error migrating employee IDs: {ex.Message}");
    }
}

app.Run();