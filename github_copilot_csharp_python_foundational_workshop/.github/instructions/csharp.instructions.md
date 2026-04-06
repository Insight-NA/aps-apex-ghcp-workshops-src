---
applyTo: "backend-csharp/**/*.cs,backend-csharp/**/*.csproj"
---
# C# / ASP.NET Web API — AI Service Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these C#-specific rules.

## Stack (Non-Negotiable)
- **Framework**: ASP.NET Web API (.NET 8) — no Minimal API (for new controllers), no older .NET
- **AI Provider**: Azure OpenAI — no Google Gemini, Anthropic, or OpenAI direct
- **Responsible for**: AI vehicle parsing (`/api/v1/parse-vehicle`) and trip generation (`/api/v1/generate-trip`)
- **SDK**: Use `Azure.AI.OpenAI` NuGet package for all OpenAI calls

## Project Structure
```
backend-csharp/
  Controllers/   # ASP.NET API controllers
  Models/        # Request/Response DTOs (record or class)
  Services/      # Business logic — Azure OpenAI integration
  Options/       # Strongly-typed config options (IOptions<T>)
  Program.cs     # Startup — DI registration, middleware
```

## Controller Rules
```csharp
// ❌ WRONG — business logic in controller
[HttpPost("parse-vehicle")]
public async Task<IActionResult> ParseVehicle([FromBody] ParseVehicleRequest req) {
    var client = new OpenAIClient(...);  // Don't instantiate here
    // 80 lines of OpenAI call
}

// ✅ CORRECT — delegate to service
[ApiController]
[Route("api/v1")]
public class VehicleController : ControllerBase {
    private readonly IVehicleParserService _parser;
    public VehicleController(IVehicleParserService parser) => _parser = parser;

    [HttpPost("parse-vehicle")]
    public async Task<IActionResult> ParseVehicle([FromBody] ParseVehicleRequest req) {
        var result = await _parser.ParseAsync(req.Description);
        return Ok(result);
    }
}
```
- Constructor injection only — never `new Service()` inside controllers
- Validate all input with Data Annotations (`[Required]`, `[StringLength]`)
- Return `IActionResult` / `ActionResult<T>` — never raw objects

## Service Rules
- Implement an interface (`IVehicleParserService`) for every service — enables testing
- Register services in `Program.cs` via `builder.Services.AddScoped<IService, Service>()`
- Read Azure OpenAI config from `IOptions<AzureOpenAIOptions>` — never hardcode endpoints or keys:
  ```csharp
  // Options/AzureOpenAIOptions.cs
  public class AzureOpenAIOptions {
      public string Endpoint { get; set; } = string.Empty;
      public string ApiKey   { get; set; } = string.Empty;
      public string DeploymentName { get; set; } = string.Empty;
  }
  ```
  ```json
  // appsettings.json — values provided via environment variables at runtime
  {
    "AzureOpenAI": {
      "Endpoint": "",
      "ApiKey": "",
      "DeploymentName": "gpt-4o"
    }
  }
  ```

## Models / DTOs
- Prefer C# records for immutable request/response types:
  ```csharp
  public record ParseVehicleRequest([Required] string Description);
  public record ParseVehicleResponse(string Make, string Model, int Year);
  ```
- Use `nullable reference types` (`#nullable enable`) in all new files

## Error Handling
```csharp
// Program.cs — global exception handler
app.UseExceptionHandler(errApp => {
    errApp.Run(async ctx => {
        ctx.Response.StatusCode = 500;
        await ctx.Response.WriteAsJsonAsync(new { error = "Internal server error" });
    });
});
```
- Never expose stack traces or Azure keys in error responses
- Use `ProblemDetails` format for 4xx/5xx responses

## Configuration & Secrets
- All secrets via environment variables or Azure Key Vault — never in `appsettings.json`
- Use `builder.Configuration.GetSection("AzureOpenAI").Bind(options)` pattern

## Testing
```bash
cd backend-csharp
dotnet test                              # All tests
dotnet test --filter "DisplayName~Parse" # Filtered
```
- Mock `IVehicleParserService` with `Moq` or `NSubstitute` in controller tests
- Mock `Azure.AI.OpenAI` client in service tests using the interface
- Use `WebApplicationFactory<Program>` for integration tests
