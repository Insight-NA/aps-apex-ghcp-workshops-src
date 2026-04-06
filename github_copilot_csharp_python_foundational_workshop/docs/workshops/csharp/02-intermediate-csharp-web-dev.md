# Workshop 2: Intermediate C# Web Development with GitHub Copilot

**Duration**: 120 minutes  
**Format**: Live coding demonstrations with step-by-step walkthroughs  
**Audience**: C# developers new to GitHub Copilot (completed Workshop 1 or equivalent)  
**Prerequisites**: VS Code with GitHub Copilot extension, .NET 8 SDK, GitHub Copilot CLI installed  
**Project**: Road Trip App — `backend-csharp/` (ASP.NET Web API with Azure OpenAI integration)

---

## Table of Contents

1. [Learning Objectives](#learning-objectives)
2. [Project Setup](#project-setup)
3. [The CORE Prompting Framework](#the-core-prompting-framework)
4. [Workshop Agenda](#workshop-agenda)
5. [Demo 1: Inline Code Suggestions](#demo-1-inline-code-suggestions-15-min)
6. [Demo 2: Prompting — CORE Framework](#demo-2-prompting--core-framework-15-min)
7. [Demo 3: Comment-Based Generation](#demo-3-comment-based-generation-15-min)
8. [Demo 4: Code Explanations](#demo-4-code-explanations-15-min)
9. [Demo 5: Code Refactoring + Copilot Chat](#demo-5-code-refactoring--copilot-chat-15-min)
10. [Demo 6: Few-Shot Prompting](#demo-6-few-shot-prompting-10-min)
11. [Demo 7: Unit Testing & Debugging](#demo-7-unit-testing--debugging-15-min)
12. [Demo 8: Copilot CLI](#demo-8-copilot-cli-10-min)
13. [Workshop Summary](#workshop-summary--key-takeaways)
14. [Hands-On Exercise](#hands-on-exercise-optional--20-min)
15. [Resources](#resources)

---

## Learning Objectives

By the end of this workshop, you will be able to:

1. **Inline Code Suggestions** — Accept and modify Copilot's real-time code completions in C# files
2. **Prompting** — Write effective CORE prompts using `///` XML doc comments and `//` inline comments
3. **Code Explanations** — Use Copilot to understand dependency injection, Azure OpenAI integration, and service patterns
4. **Comment-Based Generation** — Generate complete controller actions and service methods from descriptive comments
5. **Code Refactoring** — Extract duplicate validation logic and refactor configurations using Copilot Chat
6. **Copilot Chat** — Interact with Copilot for code questions, architecture improvements, and debugging
7. **Few-Shot Prompting** — Teach Copilot DTO patterns by showing existing Request/Response examples
8. **Unit Testing & Debugging** — Create an xUnit test project from scratch and generate tests with Moq
9. **Copilot CLI** — Generate `dotnet` CLI commands, Docker operations, and deployment scripts

---

## Project Setup

Before starting the demos, verify your environment is ready.

### Step 1: Open the C# Backend

```bash
cd backend-csharp
```

### Step 2: Verify .NET 8 SDK

```bash
dotnet --version
# Expected: 8.0.x
```

### Step 3: Build the Project

```bash
dotnet build
# Expected: Build succeeded. 0 Warning(s). 0 Error(s).
```

### Step 4: Verify Copilot is Active

- Open VS Code
- Look for the Copilot icon (✨) in the status bar — it should show "Copilot: Ready"
- If not, sign in via `Ctrl+Shift+P` → "GitHub Copilot: Sign In"

### Project Structure

```
backend-csharp/
├── Controllers/
│   └── VehicleController.cs      ← API endpoints (parse-vehicle, generate-trip)
├── Models/
│   └── AiModels.cs               ← DTOs (request/response classes)
├── Services/
│   ├── IAiParsingService.cs      ← Service interface (DI contract)
│   └── AiParsingService.cs       ← AI + fallback implementation
├── Program.cs                     ← App bootstrap, DI, middleware
├── appsettings.json               ← Configuration
├── Dockerfile                     ← Multi-stage Docker build
└── RoadTrip.AiService.csproj     ← Project file (.NET 8, NuGet packages)
```

### Key Patterns You'll See

| Pattern | Where | Why It Matters |
|---------|-------|---------------|
| **Dependency Injection** | `Program.cs` → `VehicleController` | Copilot understands DI and suggests injected services |
| **Interface Abstraction** | `IAiParsingService` | Enables mocking in tests, Copilot follows this pattern |
| **AI-First + Fallback** | `AiParsingService` | Try Azure OpenAI → catch → rule-based fallback |
| **DTOs with Defaults** | `AiModels.cs` | `{ get; set; } = default` pattern Copilot replicates |
| **Top-Level Statements** | `Program.cs` | Minimal hosting model (no `Startup.cs`) |

---

## The CORE Prompting Framework

All prompts in this workshop follow the **CORE** framework for maximum effectiveness:

| Letter | Element | Description |
|--------|---------|-------------|
| **C** | **Context** | Background — ASP.NET Web API, the specific file/class, DI patterns |
| **O** | **Objective** | What you want — create a DTO, explain a method, refactor a pattern |
| **R** | **Requirements** | Constraints — property types, defaults, validation, error handling |
| **E** | **Examples** | Existing patterns to match — "Follow `ParseVehicleRequest` pattern" |

### How to Write CORE Prompts in C#

There are **two styles** for CORE prompts in C#, depending on where you're writing:

**Style 1: XML Doc Comment** (for classes, methods, interfaces)
```csharp
/// <summary>
/// Context: In this ASP.NET Web API service, DTOs use { get; set; } with defaults.
/// Objective: Create a RouteOptimizationRequest DTO.
/// Requirements: Waypoints list, VehicleType string default "car", AvoidTolls bool.
/// Examples: Follow the ParseVehicleRequest pattern above.
/// </summary>
```

**Style 2: Inline Comments** (for method bodies, quick generation)
```csharp
// Context: ASP.NET Web API controller with constructor-injected IAiParsingService.
// Objective: Add endpoint to compare two vehicle descriptions.
// Requirements: POST /api/v1/compare-vehicles, validate both descriptions, log inputs.
// Examples: Follow ParseVehicle endpoint pattern with BadRequest validation.
```

> 📝 **CORE Formula Template**:
> ```
> Context:      "In this ASP.NET Web API [service/controller], working with [class]..."
> Objective:    "Create / Explain / Refactor / Test [specific thing]..."
> Requirements: "Must include [types, defaults, validation, DI patterns]..."
> Examples:     "Follow the [ParseVehicleRequest / VehicleController] pattern above"
> ```

---

## Workshop Agenda

| Time | Demo | Learning Objective | File(s) |
|------|------|-------------------|---------|
| 0-15 min | Demo 1 | **Inline Code Suggestions** | `AiParsingService.cs`, `AiModels.cs` |
| 15-30 min | Demo 2 | **Prompting** (CORE Framework) | `AiModels.cs` |
| 30-45 min | Demo 3 | **Comment-Based Generation** | `VehicleController.cs` |
| 45-60 min | Demo 4 | **Code Explanations** | `AiParsingService.cs`, `Program.cs` |
| 60-75 min | Demo 5 | **Code Refactoring** + **Copilot Chat** | `VehicleController.cs`, `Program.cs` |
| 75-85 min | Demo 6 | **Few-Shot Prompting** | `AiModels.cs` |
| 85-100 min | Demo 7 | **Unit Testing & Debugging** | New test project |
| 100-110 min | Demo 8 | **Copilot CLI** | Terminal |
| 110-120 min | Summary | Key Takeaways + Q&A | — |

---

## Demo 1: Inline Code Suggestions (15 min)

### Learning Objective

Accept and modify Copilot's real-time code completions as you type. Copilot recognizes **patterns in existing code** and suggests matching structures.

### What Are Inline Suggestions?

As you type in VS Code, Copilot shows **ghost text** — dimmed code that predicts what you'll write next. You can:
- **Accept** the full suggestion with `Tab`
- **Accept word-by-word** with `Cmd+→` (Mac) / `Ctrl+→` (Windows)
- **Dismiss** with `Esc`
- **See alternatives** with `Alt+]` / `Alt+[`

---

### Exercise 1A: Add Vehicle Types to the Fallback Method

**File**: `backend-csharp/Services/AiParsingService.cs`

**What you'll do**: The `GetFallbackSpecs()` method has an `if/else` chain that matches vehicle keywords like "rv", "truck", "suv", and "van". You'll add new vehicle types and watch Copilot suggest complete blocks that match the existing pattern.

#### Step 1: Open the File

Open `backend-csharp/Services/AiParsingService.cs` in VS Code.

#### Step 2: Find the `GetFallbackSpecs` Method

Scroll to the bottom of the file (~line 158). You'll see this pattern:

```csharp
private static VehicleSpecs GetFallbackSpecs(string description)
{
    var lower = description.ToLowerInvariant();

    if (lower.Contains("rv") || lower.Contains("motorhome") || lower.Contains("recreational"))
    {
        return new VehicleSpecs
        {
            VehicleType = "rv", Length = 10.0, Width = 2.5, Height = 3.5,
            Weight = 8000, MaxWeight = 10000, NumAxles = 3, IsCommercial = false,
        };
    }

    if (lower.Contains("truck") || lower.Contains("semi") || lower.Contains("18-wheel"))
    {
        return new VehicleSpecs { ... };
    }

    if (lower.Contains("suv") || lower.Contains("sport utility"))
    {
        return new VehicleSpecs { ... };
    }

    if (lower.Contains("van") || lower.Contains("minivan") || lower.Contains("sprinter"))
    {
        return new VehicleSpecs { ... };
    }

    // Default: sedan/car
    return new VehicleSpecs { ... };
}
```

#### Step 3: Position Your Cursor

Place your cursor on a **new line** just before the `// Default: sedan/car` comment (after the last `if (lower.Contains("van"...))` block).

#### Step 4: Start Typing

```csharp
        if (lower.Contains("motorcycle"))
```

#### Step 5: Watch the Suggestion

Copilot should show **ghost text** like:

```csharp
        if (lower.Contains("motorcycle"))
        {
            return new VehicleSpecs
            {
                VehicleType = "motorcycle",
                Length = 2.2,
                Width = 0.9,
                Height = 1.2,
                Weight = 300,
                MaxWeight = 400,
                NumAxles = 2,
                IsCommercial = false,
            };
        }
```

#### Step 6: Accept the Suggestion

Press `Tab` to accept the full suggestion.

> 🔍 **Review the values!** Does `Weight = 300` (kg) make sense for a motorcycle? That's roughly 660 lbs — reasonable for a touring motorcycle. If Copilot suggests something unreasonable, you can edit after accepting.

#### Step 7: Add Another Vehicle Type

On a new line after the motorcycle block, type:

```csharp
        if (lower.Contains("bus"))
```

Copilot should suggest a complete block matching the pattern:

```csharp
        if (lower.Contains("bus"))
        {
            return new VehicleSpecs
            {
                VehicleType = "bus",
                Length = 12.0,
                Width = 2.6,
                Height = 3.5,
                Weight = 15000,
                MaxWeight = 20000,
                NumAxles = 3,
                IsCommercial = true,
            };
        }
```

Press `Tab` to accept.

---

### Exercise 1B: Add a New Property to VehicleSpecs

**File**: `backend-csharp/Models/AiModels.cs`

**What you'll do**: Add a new property to the existing `VehicleSpecs` class and watch Copilot suggest a matching declaration.

#### Step 1: Open the File

Open `backend-csharp/Models/AiModels.cs` in VS Code.

#### Step 2: Find the VehicleSpecs Class

Look for the `VehicleSpecs` class (~line 14):

```csharp
public class VehicleSpecs
{
    public string VehicleType { get; set; } = "car";
    public double Length { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public double Weight { get; set; }
    public double MaxWeight { get; set; }
    public int NumAxles { get; set; } = 2;
    public bool IsCommercial { get; set; }
}
```

#### Step 3: Position Your Cursor

Place your cursor on a new line **after** `public bool IsCommercial { get; set; }`.

#### Step 4: Start Typing

```csharp
    public double FuelCapacity
```

#### Step 5: Watch the Suggestion

Copilot suggests:

```csharp
    public double FuelCapacity { get; set; }
```

Press `Tab` to accept. Now type another:

```csharp
    public string FuelType
```

Copilot suggests:

```csharp
    public string FuelType { get; set; } = "gasoline";
```

#### Step 6: Try Word-by-Word Acceptance

Type `public int` and pause. When Copilot suggests a full property, use `Cmd+→` (Mac) / `Ctrl+→` (Windows) to accept **one word at a time**. This lets you accept `SeatingCapacity` but change the default value.

---

### Exercise 1C: Add a New Endpoint Attribute (Quick)

**File**: `backend-csharp/Controllers/VehicleController.cs`

#### Step 1: Open the File

Open `backend-csharp/Controllers/VehicleController.cs`.

#### Step 2: Position After the Last Method

After the `GenerateTrip` method's closing `}`, add a blank line and type:

```csharp
    [HttpGet("vehicle-types")]
```

Copilot should suggest a complete method:

```csharp
    [HttpGet("vehicle-types")]
    public ActionResult<List<string>> GetVehicleTypes()
    {
        return Ok(new List<string> { "car", "truck", "suv", "rv", "van", "motorcycle", "bus" });
    }
```

Press `Tab` to accept.

---

### Teaching Points

> 💡 **Key Insight**: Inline suggestions work best when Copilot has **context from existing patterns** in the same file. The `if/return new VehicleSpecs { ... }` chain teaches Copilot the exact shape to follow.

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|----------------|-------------------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Cmd+→` | `Ctrl+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See alternatives | `Alt+]` / `Alt+[` | `Alt+]` / `Alt+[` |

### Common Mistakes

- ❌ **Accepting without review**: Always verify values make sense (e.g., a bus shouldn't weigh 300 kg)
- ❌ **Ignoring alternatives**: Press `Alt+]` to cycle through multiple suggestions — the first isn't always best
- ❌ **Fighting Copilot**: If the suggestion is wrong, type more characters to **steer** it in the right direction

---

## Demo 2: Prompting — CORE Framework (15 min)

### Learning Objective

Write effective prompts using the **CORE** framework (Context, Objective, Requirements, Examples) as C# XML doc comments to generate accurate, project-specific DTOs.

### Why CORE Matters

Without structure, prompts like `"Create a route DTO"` produce generic code that doesn't match your project's conventions. The CORE framework tells Copilot exactly **what patterns to follow**.

---

### Exercise 2A: Create Route Optimization DTOs

**File**: `backend-csharp/Models/AiModels.cs`

**What you'll do**: Write a CORE prompt as an XML doc comment to generate three new DTO classes that match the existing patterns.

#### Step 1: Review Existing Patterns

First, look at the existing DTOs in `AiModels.cs`. Notice the conventions:
- Public properties with `{ get; set; }`
- Default values: `= string.Empty`, `= new()`, `= "success"`
- XML doc comments with `/// <summary>`
- No data annotations — plain POCO classes

```csharp
// Existing pattern — ParseVehicleRequest:
public class ParseVehicleRequest
{
    public string Description { get; set; } = string.Empty;
}

// Existing pattern — GenerateTripRequest:
public class GenerateTripRequest
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public List<string> Interests { get; set; } = new();
}
```

#### Step 2: Navigate to End of File

Place your cursor at the **very end** of `AiModels.cs`, after the closing `}` of the `GenerateTripResponse` class.

#### Step 3: Write the CORE Prompt

Type this XML doc comment (every line matters — this is the prompt):

```csharp
/// <summary>
/// Context: In this ASP.NET Web API service, we use plain C# classes as DTOs
///     with default values. Existing models (VehicleSpecs, ParseVehicleResponse)
///     follow a pattern of public properties with { get; set; } and
///     string.Empty defaults for strings, new() for collections.
///
/// Objective: Create a RouteOptimizationRequest DTO for the route optimization feature.
///
/// Requirements:
///     - Waypoints: List of coordinate pairs (double Longitude, double Latitude)
///     - VehicleType: string, default "car"
///     - AvoidTolls: bool, default false
///     - AvoidHighways: bool, default false
///     - MaxDetourMinutes: int, default 30
///     - FuelLevel: double (0.0-1.0), default 1.0
///     - Create a nested Waypoint class with Longitude, Latitude, and optional Name
///
/// Examples: Follow the ParseVehicleRequest / GenerateTripRequest pattern above
/// </summary>
```

#### Step 4: Start the Class Declaration

On the next line, type:

```csharp
public class Waypoint
```

#### Step 5: Watch Copilot Generate

Copilot should suggest the complete class body. Accept with `Tab`:

```csharp
public class Waypoint
{
    public double Longitude { get; set; }
    public double Latitude { get; set; }
    public string? Name { get; set; }
}
```

#### Step 6: Continue with the Request Class

After `Waypoint`, type:

```csharp
public class RouteOptimizationRequest
```

Copilot suggests:

```csharp
public class RouteOptimizationRequest
{
    public List<Waypoint> Waypoints { get; set; } = new();
    public string VehicleType { get; set; } = "car";
    public bool AvoidTolls { get; set; } = false;
    public bool AvoidHighways { get; set; } = false;
    public int MaxDetourMinutes { get; set; } = 30;
    public double FuelLevel { get; set; } = 1.0;
}
```

#### Step 7: And the Response Class

Type:

```csharp
public class RouteOptimizationResponse
```

Copilot suggests:

```csharp
public class RouteOptimizationResponse
{
    public string Status { get; set; } = "success";
    public List<Waypoint> OptimizedWaypoints { get; set; } = new();
    public double TotalDistanceKm { get; set; }
    public double TotalDurationMinutes { get; set; }
}
```

---

### Exercise 2B: CORE vs. Vague Prompt Comparison

Try this experiment to see the difference:

**❌ Vague Prompt** — Type this comment and start a class:
```csharp
// Create a route DTO
public class RouteDto
```
> Result: Generic, missing defaults, may not match project conventions.

**✅ CORE Prompt** — Type the full CORE XML doc comment from Exercise 2A, then start the class.
> Result: Precise types, correct defaults, matches existing `ParseVehicleRequest` pattern.

| Prompt Quality | What You Get |
|----------------|-------------|
| ❌ `"Create a route DTO"` | Missing defaults, wrong naming, no Waypoint class |
| ❌ `"Create RouteOptimizationRequest"` | May work, but won't match project patterns |
| ✅ Full CORE prompt | Exact types, `= new()` defaults, `{ get; set; }` pattern, matching conventions |

---

### Teaching Points

> 💡 **Why XML Doc Comments Work So Well for CORE Prompts**:
> - They're **real C# syntax** — they won't break your code if left in
> - IntelliSense displays them as tooltips — your prompts become documentation
> - Copilot treats `/// <summary>` with high weight — it's designed to read these

---

## Demo 3: Comment-Based Generation (15 min)

### Learning Objective

Generate complete controller action methods by writing descriptive CORE comments directly above the method signature. Copilot reads the comments and generates the full implementation.

---

### Exercise 3A: Add a Compare Vehicles Endpoint

**File**: `backend-csharp/Controllers/VehicleController.cs`

**What you'll do**: Write a CORE-structured comment block, then a method signature, and let Copilot generate the body.

#### Step 1: Open the File

Open `backend-csharp/Controllers/VehicleController.cs`.

#### Step 2: Review the Existing Pattern

Study the existing `ParseVehicle` method — this is the pattern Copilot will follow:

```csharp
[HttpPost("parse-vehicle")]
public async Task<ActionResult<ParseVehicleResponse>> ParseVehicle(
    [FromBody] ParseVehicleRequest request)
{
    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return BadRequest(new { error = "description is required" });
    }

    _logger.LogInformation("Parsing vehicle: {Description}", request.Description);
    var result = await _aiService.ParseVehicleAsync(request.Description);
    return Ok(result);
}
```

Notice the pattern:
1. `BadRequest` validation at the top
2. Structured logging with `_logger`
3. Delegate to `_aiService`
4. Return `Ok(result)`

#### Step 3: Position Your Cursor

Place your cursor **after** the closing `}` of the `GenerateTrip` method (end of the class, before the final `}`).

#### Step 4: Write the CORE Comment

```csharp
    // Context: ASP.NET Web API controller with constructor-injected IAiParsingService.
    //     Existing endpoints use ActionResult<T> returns with structured logging
    //     and BadRequest validation at the top.
    // Objective: Add endpoint to compare two vehicle descriptions side by side.
    // Requirements:
    //     - POST /api/v1/compare-vehicles
    //     - Body: { "description1": "...", "description2": "..." } (both required, non-empty)
    //     - Parse each description with _aiService.ParseVehicleAsync()
    //     - Returns: object with specs1, specs2, and a list of string differences
    //     - Log both descriptions with _logger
    //     - Return BadRequest if either description is null or whitespace
    // Examples: Follow the ParseVehicle endpoint pattern above with BadRequest validation
```

#### Step 5: Write the Method Signature

```csharp
    [HttpPost("compare-vehicles")]
    public async Task<ActionResult> CompareVehicles([FromBody] CompareVehiclesRequest request)
    {
```

#### Step 6: Let Copilot Complete the Body

Copilot should suggest something like:

```csharp
    [HttpPost("compare-vehicles")]
    public async Task<ActionResult> CompareVehicles([FromBody] CompareVehiclesRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Description1) || string.IsNullOrWhiteSpace(request.Description2))
        {
            return BadRequest(new { error = "Both description1 and description2 are required" });
        }

        _logger.LogInformation("Comparing vehicles: {Desc1} vs {Desc2}",
            request.Description1, request.Description2);

        var result1 = await _aiService.ParseVehicleAsync(request.Description1);
        var result2 = await _aiService.ParseVehicleAsync(request.Description2);

        var differences = new List<string>();
        if (result1.Specs.VehicleType != result2.Specs.VehicleType)
            differences.Add($"Type: {result1.Specs.VehicleType} vs {result2.Specs.VehicleType}");
        if (result1.Specs.Length != result2.Specs.Length)
            differences.Add($"Length: {result1.Specs.Length}m vs {result2.Specs.Length}m");
        if (result1.Specs.Weight != result2.Specs.Weight)
            differences.Add($"Weight: {result1.Specs.Weight}kg vs {result2.Specs.Weight}kg");

        return Ok(new
        {
            specs1 = result1.Specs,
            specs2 = result2.Specs,
            differences
        });
    }
```

Accept with `Tab`.

> 🔍 **Note**: You'll need a `CompareVehiclesRequest` DTO. Copilot may suggest creating it — or you can add it to `AiModels.cs`:
> ```csharp
> public class CompareVehiclesRequest
> {
>     public string Description1 { get; set; } = string.Empty;
>     public string Description2 { get; set; } = string.Empty;
> }
> ```

---

### Exercise 3B: Add a Batch Parsing Endpoint

Still in `VehicleController.cs`, add another endpoint:

#### Step 1: Write the CORE Comment

```csharp
    // Context: ASP.NET Web API controller with IAiParsingService and ILogger.
    // Objective: Add endpoint to parse multiple vehicle descriptions in one request.
    // Requirements:
    //     - POST /api/v1/parse-vehicles-batch
    //     - Body: { "descriptions": ["2024 Tesla Model 3", "Ford F-150", ...] }
    //     - Validate: descriptions list must not be null or empty
    //     - Parse each description with _aiService.ParseVehicleAsync()
    //     - Return: { "status": "success", "results": [...VehicleSpecs...], "count": N }
    //     - Log the count of descriptions being processed
    // Examples: Follow ParseVehicle pattern, iterate over the list with foreach or LINQ
```

#### Step 2: Write the Method Signature

```csharp
    [HttpPost("parse-vehicles-batch")]
    public async Task<ActionResult> ParseVehiclesBatch([FromBody] BatchParseRequest request)
    {
```

#### Step 3: Accept the Completion

Copilot generates the loop, error handling, and response — all matching your CORE requirements.

---

### Exercise 3C: Add a Health Details Endpoint

```csharp
    // Context: ASP.NET Web API with built-in health check at /health via MapHealthChecks.
    // Objective: Add a detailed health endpoint with service metadata.
    // Requirements:
    //     - GET /api/v1/health/details
    //     - Returns: { "status": "healthy", "service": "ai-service", "runtime": "dotnet",
    //         "version": "1.0.0", "timestamp": "<ISO 8601>" }
    //     - No authentication required
    // Examples: Return an anonymous object with Ok()
    [HttpGet("health/details")]
    public ActionResult GetHealthDetails()
    {
```

---

### Teaching Points

> 💡 **Comment-Based Generation Best Practices (CORE)**:
> 1. **Context** — Mention the framework (`ASP.NET Web API`), DI services (`IAiParsingService`), and patterns
> 2. **Objective** — Be specific: "Add endpoint to compare two vehicle descriptions"
> 3. **Requirements** — List HTTP method, route, body shape, validation rules, return format
> 4. **Examples** — Reference existing methods: "Follow the `ParseVehicle` pattern above"

### Comparison: Comment Quality

```csharp
// ❌ Too vague — Copilot may generate incorrect implementation
// Compare vehicles

// ⚠️ Partial — missing validation and pattern context
// Add compare vehicles endpoint

// ✅ CORE — Copilot generates complete, correct implementation
// Context: ASP.NET Web API controller with constructor-injected IAiParsingService.
// Objective: Add endpoint to compare two vehicle descriptions side by side.
// Requirements: POST /api/v1/compare-vehicles, validate both descriptions...
// Examples: Follow the ParseVehicle endpoint pattern above
```

---

## Demo 4: Code Explanations (15 min)

### Learning Objective

Use Copilot Chat to understand complex patterns in the C# backend: the AI-first with fallback architecture, dependency injection flow, and Azure OpenAI SDK integration.

---

### Exercise 4A: Explain the AI-First with Fallback Pattern

**File**: `backend-csharp/Services/AiParsingService.cs`

**What you'll do**: Select a key method and ask Copilot to explain the architecture.

#### Step 1: Open the File

Open `backend-csharp/Services/AiParsingService.cs`.

#### Step 2: Select the `ParseVehicleAsync` Method

Select lines covering the `ParseVehicleAsync` method (approximately lines 54-76):

```csharp
public async Task<ParseVehicleResponse> ParseVehicleAsync(string description)
{
    if (_isConfigured)
    {
        try
        {
            return await ParseWithAzureOpenAI(description);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure OpenAI call failed, using fallback");
        }
    }

    // Rule-based fallback
    return new ParseVehicleResponse
    {
        Status = "success",
        Specs = GetFallbackSpecs(description),
        RawAiResponse = null,
    };
}
```

#### Step 3: Open Copilot Inline Chat

Press `Ctrl+I` (or `Cmd+I` on Mac) and type this CORE prompt:

```
Context: This is an ASP.NET service that parses vehicle descriptions using Azure OpenAI,
    with a rule-based fallback when AI is unavailable.
Objective: Explain the resilience pattern — how does the try/catch flow work across
    all three scenarios?
Requirements: Walk through what happens when (1) Azure OpenAI is configured and succeeds,
    (2) Azure OpenAI is configured but fails, and (3) Azure OpenAI is not configured.
Examples: Trace the code path for each scenario, referencing specific lines.
```

#### Step 4: Read Copilot's Explanation

Expected explanation:

```
This implements a resilient AI-first + fallback pattern:

**Scenario 1: Azure OpenAI configured and succeeds**
1. _isConfigured = true (endpoint + key + deployment set in constructor)
2. ParseWithAzureOpenAI() is called
3. Creates AzureOpenAIClient, sends chat completion request
4. Deserializes JSON response to VehicleSpecs
5. Returns ParseVehicleResponse with AI-parsed specs and raw response

**Scenario 2: Azure OpenAI configured but fails**
1. _isConfigured = true, so AI path is attempted
2. Exception caught (timeout, rate limit, malformed JSON, network error)
3. Logged as error via _logger.LogError()
4. Falls through to the rule-based fallback
5. GetFallbackSpecs() matches keywords ("rv", "truck", etc.)

**Scenario 3: Azure OpenAI not configured**
1. _isConfigured = false (missing env vars)
2. AI path is skipped entirely (if block not entered)
3. Goes directly to GetFallbackSpecs()
4. Returns default specs with RawAiResponse = null
```

---

### Exercise 4B: Explain the Dependency Injection Pipeline

**Files**: `backend-csharp/Program.cs` and `backend-csharp/Controllers/VehicleController.cs`

#### Step 1: Select the DI Registration in Program.cs

Open `Program.cs` and select these lines:

```csharp
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IAiParsingService, AiParsingService>();
builder.Services.AddHealthChecks();
```

#### Step 2: Open Copilot Chat Panel

Press `Ctrl+Shift+I` (or `Cmd+Shift+I` on Mac) to open the full Chat panel.

#### Step 3: Ask with CORE Prompt

```
Context: This is Program.cs for an ASP.NET Web API using the minimal hosting model
    (top-level statements, no Startup.cs class). It registers services into the DI container.
Objective: Explain how the dependency injection flows from registration here to the
    VehicleController constructor that receives IAiParsingService and ILogger.
Requirements: Cover:
    - What AddSingleton<IAiParsingService, AiParsingService>() does
    - Why Singleton vs Scoped vs Transient matters for this service
    - How the controller gets its dependencies without "new" keyword
    - What ILogger<VehicleController> is and where it comes from
Examples: Trace the lifecycle: Program.cs registration → HTTP request → controller creation → service injection.
```

#### Step 4: Read the Explanation

Copilot explains the DI lifecycle:

```
1. **Registration** (Program.cs):
   - AddSingleton<IAiParsingService, AiParsingService>(): ONE shared instance for app lifetime
   - Singleton is correct here because AiParsingService is stateless (reads env vars once)
   - ILogger<T> is auto-registered by the framework — no manual setup needed

2. **Request arrives** (HTTP POST /api/v1/parse-vehicle):
   - ASP.NET middleware routes to VehicleController
   - DI container creates VehicleController instance

3. **Constructor injection** (VehicleController):
   public VehicleController(IAiParsingService aiService, ILogger<VehicleController> logger)
   - Container resolves IAiParsingService → provides the singleton AiParsingService
   - Container resolves ILogger<VehicleController> → provides a categorized logger
   - No "new AiParsingService()" anywhere in your code

4. **Why this matters**:
   - Interface abstraction (IAiParsingService) enables mocking in tests
   - Singleton lifetime means constructor runs ONCE (reads env vars once)
   - Scoped would create a new instance per request (unnecessary overhead here)
```

---

### Exercise 4C: Explain the Azure OpenAI SDK Integration

**File**: `backend-csharp/Services/AiParsingService.cs`

#### Step 1: Select the `ParseWithAzureOpenAI` Method

Select the private method (~lines 102-126):

```csharp
private async Task<ParseVehicleResponse> ParseWithAzureOpenAI(string description)
{
    var client = new AzureOpenAIClient(
        new Uri(_endpoint!),
        new AzureKeyCredential(_apiKey!));

    var chatClient = client.GetChatClient(_deployment!);

    var messages = new List<ChatMessage>
    {
        new SystemChatMessage(VehicleParsingSystemPrompt),
        new UserChatMessage($"Parse this vehicle: {description}"),
    };

    ChatCompletion completion = await chatClient.CompleteChatAsync(messages);
    var rawResponse = completion.Content[0].Text;

    _logger.LogInformation("Azure OpenAI response: {Response}", rawResponse);

    var specs = JsonSerializer.Deserialize<VehicleSpecs>(rawResponse, new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
    });

    return new ParseVehicleResponse
    {
        Status = "success",
        Specs = specs ?? GetFallbackSpecs(description),
        RawAiResponse = rawResponse,
    };
}
```

#### Step 2: Ask Copilot to Explain

Press `Ctrl+I` and use this CORE prompt:

```
Context: Azure.AI.OpenAI SDK v2.1.0 in a .NET 8 service calling Azure-hosted GPT models.
Objective: Explain each step of this method — from client creation to JSON deserialization.
Requirements: Cover the AzureOpenAIClient → GetChatClient → CompleteChatAsync chain,
    the system prompt structure, and the null-coalescing fallback on deserialization.
Examples: Explain what happens if the AI returns malformed JSON that can't be deserialized.
```

---

### Teaching Points

> 🔍 **Code Explanation CORE Prompts**:
> - **Context**: Always specify the SDK version and framework — Copilot adjusts its explanation
> - **Objective**: Specify the *angle* — security review? architecture? debugging?
> - **Requirements**: Tell Copilot what depth to cover — don't just say "explain"
> - **Examples**: Give concrete scenarios — "What happens if the DB is breached?"

| Command | Usage |
|---------|-------|
| `Ctrl+I` / `Cmd+I` | Inline chat — quick explanation of selected code |
| `Ctrl+Shift+I` / `Cmd+Shift+I` | Chat panel — longer conversations, follow-up questions |
| `/explain` | Shortcut command in Chat panel for explanations |

---

## Demo 5: Code Refactoring + Copilot Chat (15 min)

### Learning Objective

Use Copilot Chat to identify duplicate code, refactor shared logic into utilities, and improve the architecture of the C# backend.

---

### Exercise 5A: Extract Duplicate Validation Logic

**File**: `backend-csharp/Controllers/VehicleController.cs`

**What you'll do**: Both `ParseVehicle` and `GenerateTrip` endpoints do manual input validation. You'll use Copilot Chat to refactor this duplication.

#### Step 1: Identify the Duplication

Look at both methods:

```csharp
// In ParseVehicle:
if (string.IsNullOrWhiteSpace(request.Description))
{
    return BadRequest(new { error = "description is required" });
}

// In GenerateTrip:
if (string.IsNullOrWhiteSpace(request.Origin) || string.IsNullOrWhiteSpace(request.Destination))
{
    return BadRequest(new { error = "origin and destination are required" });
}
```

Both follow the same pattern: check for null/whitespace → return `BadRequest` with an error message.

#### Step 2: Open Copilot Chat

Press `Ctrl+Shift+I` / `Cmd+Shift+I`.

#### Step 3: Ask Copilot to Refactor

```
Context: In VehicleController.cs, both ParseVehicle and GenerateTrip manually check
    for null/whitespace strings and return BadRequest. This is a repeated pattern
    that will grow as we add more endpoints (compare-vehicles, batch-parse, etc.).
Objective: Refactor the validation into a reusable approach.
Requirements:
    - Option A: Create a private helper method in the controller
    - Option B: Use a custom ActionFilter attribute [ValidateRequired("field1", "field2")]
    - Show both options so I can choose
    - Keep the error response format consistent: { "error": "field is required" }
Examples: The current pattern is: if (string.IsNullOrWhiteSpace(x)) return BadRequest(...)
```

#### Step 4: Review Copilot's Suggestions

**Option A — Private Helper Method (simpler)**:
```csharp
private BadRequestObjectResult? ValidateRequired(params (string? value, string name)[] fields)
{
    foreach (var (value, name) in fields)
    {
        if (string.IsNullOrWhiteSpace(value))
            return BadRequest(new { error = $"{name} is required" });
    }
    return null;
}

// Usage in ParseVehicle:
var validation = ValidateRequired((request.Description, "description"));
if (validation != null) return validation;

// Usage in GenerateTrip:
var validation = ValidateRequired(
    (request.Origin, "origin"),
    (request.Destination, "destination"));
if (validation != null) return validation;
```

**Option B — ActionFilter Attribute (more advanced)**:
```csharp
[AttributeUsage(AttributeTargets.Method)]
public class ValidateRequiredAttribute : ActionFilterAttribute
{
    private readonly string[] _fields;
    
    public ValidateRequiredAttribute(params string[] fields)
    {
        _fields = fields;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        // Checks request body properties via reflection
        // Returns BadRequest if any are null/whitespace
    }
}

// Usage:
[HttpPost("parse-vehicle")]
[ValidateRequired("Description")]
public async Task<ActionResult<ParseVehicleResponse>> ParseVehicle(...)
```

#### Step 5: Choose and Apply

For this demo, Option A is simpler. Ask Copilot to apply it:

```
Apply Option A — the private helper method approach. Update both ParseVehicle
and GenerateTrip to use it.
```

---

### Exercise 5B: Refactor Health Check to Custom Controller

**Files**: `backend-csharp/Program.cs` and a new `HealthController.cs`

#### Step 1: Identify the Problem

In `Program.cs`, the health check is minimal:
```csharp
app.MapHealthChecks("/health");
```

This returns ASP.NET's default format (just `"Healthy"`). We want a richer response with service name, runtime, and version.

#### Step 2: Ask Copilot Chat

```
Context: Program.cs maps a basic health check via app.MapHealthChecks("/health")
    which returns plain "Healthy". The BFF aggregates health from all backends
    and expects a JSON response with metadata.
Objective: Refactor the basic health check into a custom HealthController that
    returns standardized JSON.
Requirements:
    - Create Controllers/HealthController.cs
    - GET /health returns: { "status": "healthy", "service": "ai-service",
      "runtime": "dotnet", "version": "1.0.0", "timestamp": "2025-01-01T..." }
    - Remove or keep the MapHealthChecks line (explain the trade-off)
    - Follow the existing VehicleController patterns (ApiController attribute, routing)
Examples: The Java backend returns Map.of("status", "healthy", "service", "geospatial-service"...)
```

#### Step 3: Accept and Create the New File

Copilot generates:

```csharp
using Microsoft.AspNetCore.Mvc;

namespace RoadTrip.AiService.Controllers;

[ApiController]
[Route("")]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    public ActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            service = "ai-service",
            runtime = "dotnet",
            version = "1.0.0",
            timestamp = DateTime.UtcNow.ToString("o")
        });
    }
}
```

---

### Exercise 5C: Extract System Prompt to Configuration

**File**: `backend-csharp/Services/AiParsingService.cs`

#### Step 1: Identify the Hardcoded Prompt

The `VehicleParsingSystemPrompt` is a hardcoded `const string` in `AiParsingService.cs`:

```csharp
private const string VehicleParsingSystemPrompt = @"You are a vehicle specification parser...";
```

#### Step 2: Ask Copilot to Externalize It

```
Context: AiParsingService has a hardcoded system prompt as a const string. 
    This makes it hard to update without redeploying the service.
Objective: Move the system prompt to appsettings.json and inject it via IConfiguration.
Requirements:
    - Add a "Prompts:VehicleParsing" section to appsettings.json
    - Inject IConfiguration into AiParsingService constructor
    - Fall back to the current hardcoded prompt if config is missing
    - Don't break the existing constructor that only takes ILogger
Examples: Use configuration.GetValue<string>("Prompts:VehicleParsing") ?? defaultPrompt
```

Copilot suggests the changes across both files — a real multi-file refactoring scenario.

---

### Teaching Points

> 🔧 **Copilot Chat Refactoring Commands**:
> - `@workspace` — Search across entire codebase for patterns
> - Select code → `/refactor` — Extract, rename, restructure
> - `Ctrl+Shift+I` — Multi-step refactoring conversations

---

## Demo 6: Few-Shot Prompting (10 min)

### Learning Objective

Teach Copilot project-specific patterns by showing **2-3 existing examples** from your codebase, then requesting new code that follows the same conventions.

### Why Few-Shot?

Zero-shot prompts (`"Create a DTO"`) rely on Copilot's general training. Few-shot prompts **show** Copilot your project's actual patterns, so it generates code that fits perfectly.

---

### Exercise 6A: Generate Batch and Search DTOs

**File**: `backend-csharp/Models/AiModels.cs`

#### Step 1: Navigate to End of File

Open `AiModels.cs` and go to the end.

#### Step 2: Write the Few-Shot CORE Prompt

```csharp
/// <summary>
/// Context: C# DTO classes for an ASP.NET Web API service. Used for JSON
///     serialization in controller action methods.
///
/// Objective: Create request/response DTOs for a batch vehicle parsing endpoint
///     that processes multiple vehicle descriptions at once.
///
/// Requirements:
///     - Request: list of descriptions (strings)
///     - Response: status string, list of parsed VehicleSpecs, total processing time
///     - Follow existing naming conventions and default values
///
/// Examples (existing patterns in this file — follow these exactly):
///
///     Example 1 — ParseVehicleRequest/Response:
///         public class ParseVehicleRequest
///         {
///             public string Description { get; set; } = string.Empty;
///         }
///         public class ParseVehicleResponse
///         {
///             public string Status { get; set; } = "success";
///             public VehicleSpecs Specs { get; set; } = new();
///             public string? RawAiResponse { get; set; }
///         }
///
///     Example 2 — GenerateTripRequest/Response:
///         public class GenerateTripRequest
///         {
///             public string Origin { get; set; } = string.Empty;
///             public string Destination { get; set; } = string.Empty;
///             public List&lt;string&gt; Interests { get; set; } = new();
///         }
///         public class GenerateTripResponse
///         {
///             public string Status { get; set; } = "success";
///             public List&lt;string&gt; Suggestions { get; set; } = new();
///         }
///
/// NOW CREATE: BatchParseRequest and BatchParseResponse following these patterns
/// </summary>
```

#### Step 3: Start Typing the Class Name

```csharp
public class BatchParseRequest
```

#### Step 4: Accept the Suggestion

Copilot generates:

```csharp
public class BatchParseRequest
{
    public List<string> Descriptions { get; set; } = new();
}

public class BatchParseResponse
{
    public string Status { get; set; } = "success";
    public List<VehicleSpecs> Results { get; set; } = new();
    public double ProcessingTimeMs { get; set; }
}
```

> ✅ **Notice**: Copilot followed the exact conventions — `{ get; set; }`, `= new()` for lists, `= "success"` for status, the naming pattern (`BatchParse` + `Request`/`Response`).

---

### Exercise 6B: Generate a NearbySearch DTO

Still at the end of `AiModels.cs`, write another few-shot prompt:

```csharp
/// <summary>
/// Context: Same ASP.NET Web API DTO file.
///
/// Objective: Create DTOs for a "nearby search" endpoint that finds points of interest
///     near a given coordinate.
///
/// Requirements:
///     - NearbySearchRequest: longitude (double), latitude (double), radiusMeters (int, default 5000),
///       category (string, default ""), maxResults (int, default 10)
///     - NearbySearchResult: name (string), category (string), distance (double),
///       longitude (double), latitude (double)
///     - NearbySearchResponse: status (string), results list, totalCount (int)
///
/// Examples: Same patterns as BatchParseRequest/Response above
///     - Strings default to string.Empty
///     - Lists default to new()
///     - Status defaults to "success"
///
/// NOW CREATE: NearbySearchRequest, NearbySearchResult, and NearbySearchResponse
/// </summary>
```

Type `public class NearbySearchRequest` and let Copilot generate all three classes.

---

### Why Few-Shot Works — Comparison

| Approach | Prompt Style | Result Quality |
|----------|-------------|----------------|
| ❌ Zero-shot | `"Create a batch parse DTO"` | May miss `= new()` defaults, wrong naming |
| ⚠️ CORE only | Context + Objective + Requirements | Good, but may not match conventions exactly |
| ✅ Few-shot (CORE + Examples) | Context + Objective + Requirements + 2 real examples + "NOW CREATE" | Follows project conventions perfectly |

> 💡 **The "NOW CREATE" trigger**: After showing examples, the phrase "NOW CREATE" signals to Copilot that the pattern teaching is done and generation should begin.

---

## Demo 7: Unit Testing & Debugging (15 min)

### Learning Objective

Create an xUnit test project from scratch, generate unit tests using CORE prompts, and debug failing tests with Copilot Chat.

### Why This Matters

The `backend-csharp/` project currently has **no tests**. This demo shows how to use Copilot to bootstrap a complete test suite.

---

### Exercise 7A: Create the Test Project

#### Step 1: Open Terminal in the Workspace Root

```bash
cd /path/to/road_trip_app
```

#### Step 2: Create the xUnit Test Project

```bash
dotnet new xunit -n backend-csharp.Tests -o backend-csharp.Tests
```

#### Step 3: Add a Reference to the Main Project

```bash
cd backend-csharp.Tests
dotnet add reference ../backend-csharp/RoadTrip.AiService.csproj
```

#### Step 4: Add the Moq Mocking Library

```bash
dotnet add package Moq
```

#### Step 5: Verify Everything Builds

```bash
dotnet build
# Expected: Build succeeded.
```

Your test project is ready. You now have:
```
backend-csharp.Tests/
├── backend-csharp.Tests.csproj
├── Usings.cs        ← global usings (xUnit, etc.)
└── UnitTest1.cs     ← placeholder test (we'll replace this)
```

---

### Exercise 7B: Generate Controller Tests with Copilot

**File**: Create `backend-csharp.Tests/VehicleControllerTests.cs`

#### Step 1: Create the File

Create a new file `backend-csharp.Tests/VehicleControllerTests.cs`.

#### Step 2: Write the CORE Prompt

At the top of the empty file, write:

```csharp
// Context: xUnit tests for VehicleController in an ASP.NET Web API project.
//     VehicleController has two endpoints: ParseVehicle and GenerateTrip.
//     It uses constructor-injected IAiParsingService and ILogger<VehicleController>.
//     We use Moq to mock the service interface and logger.
//
// Objective: Generate a complete test class with tests for the ParseVehicle endpoint.
//
// Requirements:
//     - Test 1: Valid description returns OkObjectResult with VehicleSpecs
//     - Test 2: Empty string description returns BadRequestObjectResult
//     - Test 3: Whitespace-only description returns BadRequestObjectResult
//     - Test 4: Null description returns BadRequestObjectResult
//     - Mock IAiParsingService.ParseVehicleAsync to return known VehicleSpecs
//     - Mock ILogger<VehicleController> (it won't be verified, just needs to exist)
//     - Use [Fact] attributes and Assert.IsType<T> assertions
//
// Examples:
//     [Fact]
//     public async Task MethodName_Scenario_ExpectedResult()
//     {
//         // Arrange — set up mocks and inputs
//         // Act — call controller method
//         // Assert — verify result type and values
//     }
```

#### Step 3: Let Copilot Generate

Type:

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using RoadTrip.AiService.Controllers;
using RoadTrip.AiService.Models;
using RoadTrip.AiService.Services;

namespace RoadTrip.AiService.Tests;

public class VehicleControllerTests
{
```

Copilot should generate the complete test class:

```csharp
public class VehicleControllerTests
{
    private readonly Mock<IAiParsingService> _mockAiService;
    private readonly Mock<ILogger<VehicleController>> _mockLogger;
    private readonly VehicleController _controller;

    public VehicleControllerTests()
    {
        _mockAiService = new Mock<IAiParsingService>();
        _mockLogger = new Mock<ILogger<VehicleController>>();
        _controller = new VehicleController(_mockAiService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task ParseVehicle_ValidDescription_ReturnsOkWithSpecs()
    {
        // Arrange
        var expectedSpecs = new VehicleSpecs
        {
            VehicleType = "rv",
            Length = 10.0,
            Width = 2.5,
            Height = 3.5,
            Weight = 8000,
            MaxWeight = 10000,
            NumAxles = 3,
            IsCommercial = false
        };
        var expectedResponse = new ParseVehicleResponse
        {
            Status = "success",
            Specs = expectedSpecs,
            RawAiResponse = null
        };

        _mockAiService
            .Setup(s => s.ParseVehicleAsync("Class A RV"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.ParseVehicle(
            new ParseVehicleRequest { Description = "Class A RV" });

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ParseVehicleResponse>(okResult.Value);
        Assert.Equal("success", response.Status);
        Assert.Equal("rv", response.Specs.VehicleType);
        Assert.Equal(10.0, response.Specs.Length);
    }

    [Fact]
    public async Task ParseVehicle_EmptyDescription_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.ParseVehicle(
            new ParseVehicleRequest { Description = "" });

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task ParseVehicle_WhitespaceDescription_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.ParseVehicle(
            new ParseVehicleRequest { Description = "   " });

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task ParseVehicle_NullDescription_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.ParseVehicle(
            new ParseVehicleRequest { Description = null! });

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
```

#### Step 4: Run the Tests

```bash
cd backend-csharp.Tests
dotnet test --verbosity normal
```

All four tests should **pass** ✅.

---

### Exercise 7C: Generate Service Tests

**File**: Create `backend-csharp.Tests/AiParsingServiceFallbackTests.cs`

#### Step 1: Write the CORE Prompt

```csharp
// Context: Unit tests for AiParsingService's GetFallbackSpecs method.
//     GetFallbackSpecs is a private static method that returns VehicleSpecs
//     based on keyword matching in the description string.
//     Since it's private, we test it indirectly through ParseVehicleAsync
//     when Azure OpenAI is NOT configured (no env vars set).
//
// Objective: Test that each vehicle type keyword returns the correct specs.
//
// Requirements:
//     - Test "rv" → VehicleType = "rv", Length = 10.0
//     - Test "truck" → VehicleType = "truck", Length = 6.0
//     - Test "suv" → VehicleType = "suv", Length = 5.0
//     - Test "van" → VehicleType = "van", Length = 5.5
//     - Test unknown text → VehicleType = "car" (default), Length = 4.5
//     - No mocking needed — AiParsingService with no env vars uses fallback
//     - Use [Theory] with [InlineData] for the parameterized tests
//
// Examples:
//     [Theory]
//     [InlineData("My Class A RV", "rv", 10.0)]
//     [InlineData("unknown thing", "car", 4.5)]
//     public async Task ParseVehicle_Fallback_ReturnsCorrectSpecs(
//         string description, string expectedType, double expectedLength) { ... }
```

#### Step 2: Let Copilot Generate the Test Class

Type the using statements and class declaration, then accept Copilot's suggestions.

---

### Exercise 7D: Debug a Failing Test

#### Step 1: Introduce a Deliberate Bug

Change one assertion in `VehicleControllerTests.cs`:

```csharp
// Change this:
Assert.Equal("rv", response.Specs.VehicleType);

// To this (wrong value):
Assert.Equal("truck", response.Specs.VehicleType);
```

#### Step 2: Run and Observe the Failure

```bash
dotnet test --verbosity normal
```

You'll see:
```
Failed ParseVehicle_ValidDescription_ReturnsOkWithSpecs
  Assert.Equal() Failure
  Expected: "truck"
  Actual:   "rv"
```

#### Step 3: Select the Failing Test and Ask Copilot

Select the test method, press `Ctrl+I`, and type:

```
Context: This xUnit test is failing with Assert.Equal() Failure: Expected "truck", Actual "rv".
Objective: Fix the assertion to match the actual behavior.
Requirements: The mock returns VehicleSpecs with VehicleType = "rv",
    so the assertion should expect "rv", not "truck".
Examples: The mock setup line says: VehicleType = "rv".
```

#### Step 4: Accept the Fix

Copilot suggests changing `"truck"` back to `"rv"`. Apply the fix and re-run:

```bash
dotnet test
# All tests pass ✅
```

---

### Testing Commands Summary

| Command | What It Does |
|---------|-------------|
| `/tests` | Generate tests for selected code |
| `/fix` | Fix a failing test or broken code |
| `@workspace /tests` | Generate tests based on project-wide patterns |
| `Ctrl+I` → "Why is this test failing?" | Debug test failures with context |
| `dotnet test --verbosity normal` | Run all tests with detailed output |
| `dotnet test --filter "MethodName"` | Run a single test by name |

---

## Demo 8: Copilot CLI (10 min)

### Learning Objective

Use GitHub Copilot CLI to generate shell commands and scripts from natural language — no need to memorize `dotnet` CLI syntax, Docker commands, or Azure CLI arguments.

### Prerequisites

```bash
# Verify Copilot CLI is installed
gh copilot --version

# If not installed:
gh extension install github/gh-copilot
```

---

### Exercise 8A: Explain a Command

```bash
gh copilot explain "dotnet publish -c Release -o /app/publish"
```

**Expected Explanation**:
```
This command publishes a .NET application:

- dotnet publish: Compiles the app and its dependencies for deployment
- -c Release: Uses the Release configuration (optimized, no debug symbols)
- -o /app/publish: Outputs the published files to /app/publish directory

This is typically used in Docker builds or CI/CD to create a deployable package.
```

---

### Exercise 8B: Generate .NET Commands

```bash
gh copilot suggest "create a new xunit test project for the backend-csharp folder, add Moq, and reference the main project"
```

**Expected Suggestion**:
```bash
dotnet new xunit -n backend-csharp.Tests -o backend-csharp.Tests
cd backend-csharp.Tests
dotnet add package Moq
dotnet add reference ../backend-csharp/RoadTrip.AiService.csproj
```

---

### Exercise 8C: Generate Docker Commands

```bash
gh copilot suggest "build a Docker image from backend-csharp, tag it as roadtrip-csharp:latest, and run it on port 8081 with AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables"
```

**Expected Suggestion**:
```bash
docker build -t roadtrip-csharp:latest ./backend-csharp
docker run -d -p 8081:8081 \
  -e AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT \
  -e AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY \
  -e AZURE_OPENAI_DEPLOYMENT=$AZURE_OPENAI_DEPLOYMENT \
  roadtrip-csharp:latest
```

---

### Exercise 8D: Generate a Deployment Script

```bash
gh copilot suggest "create a bash script that builds the C# backend Docker image, pushes it to Azure Container Registry named roadtripacr, and deploys to Azure Container App named roadtrip-csharp in resource group aps-demo-rg"
```

**Expected Suggestion**:
```bash
#!/bin/bash
set -e

ACR_NAME="roadtripacr"
RESOURCE_GROUP="aps-demo-rg"
APP_NAME="roadtrip-csharp"
IMAGE="${ACR_NAME}.azurecr.io/csharp-backend:latest"

echo "Logging into Azure Container Registry..."
az acr login --name $ACR_NAME

echo "Building Docker image..."
docker build -t $IMAGE ./backend-csharp

echo "Pushing to ACR..."
docker push $IMAGE

echo "Deploying to Container App..."
az containerapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $IMAGE

echo "✓ Deployment complete!"
```

---

### Exercise 8E: Development Workflow Commands

```bash
# Hot reload during development
gh copilot suggest "run the C# backend with hot reload for development"
# → dotnet watch run --project backend-csharp

# Run tests with coverage
gh copilot suggest "run dotnet tests with code coverage and generate an HTML report"
# → dotnet test --collect:"XPlat Code Coverage" && reportgenerator ...

# Check what's using port 8081
gh copilot suggest "find which process is using port 8081 on macOS"
# → lsof -i :8081
```

---

### Teaching Points

> 💻 **Copilot CLI Commands**:
> - `gh copilot suggest "..."` — Generate a command from natural language
> - `gh copilot explain "..."` — Explain what a command does
> - `ghcs` / `ghce` — Shortcuts for suggest/explain

### Common .NET Commands via Copilot CLI

| Natural Language | Generated Command |
|-----------------|-------------------|
| "Run C# backend with hot reload" | `dotnet watch run --project backend-csharp` |
| "Run only failing tests" | `dotnet test --filter "FullyQualifiedName~FailingTest"` |
| "List all NuGet packages in project" | `dotnet list backend-csharp package` |
| "Add Swagger to the C# project" | `dotnet add backend-csharp package Swashbuckle.AspNetCore` |
| "Check for outdated NuGet packages" | `dotnet list backend-csharp package --outdated` |
| "Create a .NET 8 Web API project" | `dotnet new webapi -n MyService --framework net8.0` |

---

## Workshop Summary & Key Takeaways

### CORE Framework Reference

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE PROMPT FRAMEWORK                     │
├─────────────────────────────────────────────────────────────┤
│  C = Context      ASP.NET Web API, DI, specific class/file  │
│  O = Objective    Create DTO, explain DI flow, test endpoint │
│  R = Requirements Types, defaults, validation, error format  │
│  E = Examples     Existing ParseVehicleRequest pattern       │
├─────────────────────────────────────────────────────────────┤
│  C# TEMPLATE:                                                │
│  /// <summary>                                               │
│  /// Context:      "In this ASP.NET Web API [service]..."    │
│  /// Objective:    "Create / Explain / Test [specific]..."   │
│  /// Requirements: "Must include [types, defaults]..."       │
│  /// Examples:     "Follow [ParseVehicleRequest] pattern"    │
│  /// </summary>                                              │
└─────────────────────────────────────────────────────────────┘
```

### Techniques Comparison Matrix (C#)

| # | Technique | When to Use | Where in This Project | CORE Focus |
|---|-----------|-------------|----------------------|------------|
| 1 | **Inline Suggestions** | Pattern-based code (`if/return` blocks, properties) | `AiParsingService.cs` fallback chain, `AiModels.cs` properties | Context (existing patterns) |
| 2 | **Prompting (CORE)** | Complex DTOs with specific conventions | `AiModels.cs` — `RouteOptimizationRequest` | All four elements |
| 3 | **Comment-Based** | New controller endpoints | `VehicleController.cs` — compare, batch, health | O + R strongest |
| 4 | **Code Explanations** | Understanding DI, AI integration, resilience | `AiParsingService.cs`, `Program.cs` | C + O strongest |
| 5 | **Refactoring + Chat** | Duplicate validation, hardcoded config | `VehicleController.cs`, `Program.cs` | C + R strongest |
| 6 | **Few-Shot** | Generate DTOs matching existing conventions | `AiModels.cs` — BatchParse, NearbySearch | E strongest |
| 7 | **Unit Testing** | Build test suite from scratch | `backend-csharp.Tests/` — xUnit + Moq | C + E strongest |
| 8 | **Copilot CLI** | .NET CLI, Docker, Azure commands | Terminal | O + R strongest |

### Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                  COPILOT QUICK REFERENCE                     │
├─────────────────────────────────────────────────────────────┤
│ INLINE SUGGESTIONS                                           │
│   Tab              Accept full suggestion                    │
│   Cmd+→ / Ctrl+→   Accept word-by-word                      │
│   Alt+]            Next suggestion                           │
│   Esc              Dismiss                                   │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CHAT                                                 │
│   Cmd+I / Ctrl+I           Inline chat (quick question)      │
│   Cmd+Shift+I / Ctrl+Shift+I  Chat panel (conversations)    │
│   /explain         Explain selected code                     │
│   /fix             Fix errors in selection                   │
│   /tests           Generate tests                            │
│   /refactor        Refactor selected code                    │
│   @workspace       Search/query entire codebase              │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CLI                                                  │
│   gh copilot suggest "..."    Generate command               │
│   gh copilot explain "..."    Explain command                │
│   ghcs / ghce                 Shortcuts                      │
└─────────────────────────────────────────────────────────────┘
```

### Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| Accepting inline suggestions blindly | Always review property types, default values, and business logic |
| Vague prompts without CORE elements | Use all four: Context, Objective, Requirements, Examples |
| Missing the "Examples" element | The **E** in CORE is often what makes the difference — show existing patterns |
| Not reviewing generated tests | Verify mocks match actual service behavior and assertions cover edge cases |
| Ignoring alternative suggestions | Press `Alt+]` to cycle — the first suggestion isn't always the best |
| Writing CORE prompts too briefly | More detail = better output. Include specific types, defaults, error formats |
| Forgetting to reference existing code | Saying "Follow `ParseVehicleRequest` pattern" dramatically improves accuracy |

---

## Hands-On Exercise (Optional — 20 min)

**Challenge**: Use ALL 9 techniques with CORE prompts to add a **"Bookmark" feature** to the C# backend.

### Tasks

1. **Inline Suggestions** — Open `AiModels.cs`, add `public bool IsBookmarked { get; set; }` to `GenerateTripResponse` and watch Copilot suggest a default value.

2. **Prompting (CORE)** — Write a CORE XML doc comment to create `BookmarkRequest` (TripId: string, UserId: string) and `BookmarkResponse` (Status: string, BookmarkedAt: DateTime) DTOs in `AiModels.cs`.

3. **Comment-Based Generation** — Write a CORE comment in `VehicleController.cs` (or a new `BookmarkController.cs`) to generate:
   - `POST /api/v1/bookmarks` — Create a bookmark
   - `GET /api/v1/bookmarks/{userId}` — Get user's bookmarks
   - `DELETE /api/v1/bookmarks/{id}` — Remove a bookmark

4. **Code Explanations** — Select your new bookmark controller and ask Copilot: "Explain the REST conventions used in this controller — why POST for create, GET for read, DELETE for remove?"

5. **Refactoring** — Ask Copilot Chat: "The bookmark endpoints have the same input validation pattern as VehicleController. Extract a shared validation helper."

6. **Copilot Chat** — Use `@workspace` in Chat: "Where should bookmark data be persisted in this project? The current backend is stateless."

7. **Few-Shot Prompting** — Show `ParseVehicleRequest`/`Response` and `GenerateTripRequest`/`Response` as examples, then ask Copilot to create `BookmarkListRequest`/`BookmarkListResponse` following the same patterns.

8. **Unit Testing** — Generate xUnit tests for your `BookmarkController` (or the bookmark endpoint logic). Test success, missing TripId, missing UserId.

9. **CLI** — Run:
   ```bash
   gh copilot suggest "run only the bookmark-related tests in backend-csharp.Tests"
   ```

### Verification

```bash
cd backend-csharp
dotnet build
# Expected: Build succeeded

cd ../backend-csharp.Tests
dotnet test --verbosity normal
# Expected: All tests pass
```

---

## Next Workshop Preview

**Workshop 3: Advanced C# Web Development with GitHub Copilot**
- **Copilot Edits**: Multi-file changes in one operation
- **Custom Instructions**: Project-specific `.github/copilot-instructions.md` for C#
- **Agent Mode**: Autonomous multi-step workflows
- **Workspace Agents**: `@workspace`, `@vscode`, `@terminal`
- **MCP Servers**: Connecting to external tools and APIs

**Preparation**:
- Review `.github/copilot-instructions.md`
- Explore Copilot Edits panel (`Ctrl+Shift+I` → Edits tab)
- Read `docs/ROADMAP.md` for project context

---

## Resources

- **GitHub Copilot Docs**: https://docs.github.com/en/copilot
- **Copilot CLI**: https://githubnext.com/projects/copilot-cli
- **xUnit Docs**: https://xunit.net/docs/getting-started/netcore/cmdline
- **Moq Docs**: https://github.com/devlooped/moq
- **ASP.NET Web API Docs**: https://learn.microsoft.com/en-us/aspnet/core/web-api
- **Azure OpenAI SDK**: https://learn.microsoft.com/en-us/dotnet/api/overview/azure/ai.openai-readme
- **Project Documentation**: `docs/PROJECT_INSTRUCTIONS.md`
- **ROADMAP**: `docs/ROADMAP.md`
