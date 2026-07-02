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
        policy.WithOrigins(
                "http://localhost:3000",
                "https://taskflow-nine-coral.vercel.app",
                "https://taskflow-kt876d50u-aka16.vercel.app",
                "https://taskflow-4okx9ozqp-aka16.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Database Connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Initialize DB Sequence if not exists
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.sequences WHERE name = 'EmployeeIdSequence')
            BEGIN
                DECLARE @MaxVal INT = 0;
                SELECT @MaxVal = ISNULL(MAX(CAST(SUBSTRING(EmployeeId, 4, LEN(EmployeeId) - 3) AS INT)), 0)
                FROM Employees
                WHERE EmployeeId LIKE 'EMP%';

                DECLARE @StartVal INT = CASE WHEN @MaxVal >= 7 THEN @MaxVal + 1 ELSE 8 END;
                
                DECLARE @Sql NVARCHAR(MAX) = 'CREATE SEQUENCE EmployeeIdSequence START WITH ' + CAST(@StartVal AS NVARCHAR(10)) + ' INCREMENT BY 1;';
                EXEC sp_executesql @Sql;
            END
        ");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error creating sequence: {ex.Message}");
    }
}


// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowNextJs");

app.MapControllers();

app.Run();