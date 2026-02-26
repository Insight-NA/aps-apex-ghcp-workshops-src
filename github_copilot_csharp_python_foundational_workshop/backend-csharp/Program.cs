using RoadTrip.AiService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IAiParsingService, AiParsingService>();
builder.Services.AddHealthChecks();

// CORS
var allowedOrigins = builder.Configuration.GetValue<string>("ALLOWED_ORIGINS") ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins.Split(','))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();
app.MapHealthChecks("/health");

var port = Environment.GetEnvironmentVariable("PORT") ?? "8081";
app.Run($"http://0.0.0.0:{port}");
