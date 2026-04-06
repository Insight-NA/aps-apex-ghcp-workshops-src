# Workshop 3: Advanced C# Testing with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: C# developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Experience with explicit prompting, few-shot learning, ASP.NET Core basics, xUnit fundamentals

---

## Learning Objectives

By the end of this workshop, you will master these **8 advanced Copilot techniques** — all applied to **C# testing** using real code from the Road Trip Planner's `backend-csharp/` service:

1. **[Chain-of-Thought Prompting](#demo-1-chain-of-thought-prompting-10-min)** — Break complex test scenarios into logical reasoning steps
2. **[Tree of Thought Prompting](#demo-2-tree-of-thought-prompting-10-min)** — Explore multiple test strategy branches simultaneously, evaluate tradeoffs, and converge on the optimal approach
3. **[Instruction Files](#demo-3-instruction-files-8-min)** — Customize `.github/copilot-instructions.md` with C# testing rules
4. **[Prompt Files](#demo-4-prompt-files-10-min)** — Create reusable `.prompt.md` files for consistent test generation
5. **[Copilot Code Review](#demo-5-copilot-code-review-8-min)** — Use Copilot to review test PRs and identify quality issues
6. **[Copilot Plan Mode](#demo-6-copilot-plan-mode-14-min)** — Architect a complete test infrastructure from scratch
7. **[Copilot Coding Agent](#demo-7-copilot-coding-agent-13-min)** — Delegate autonomous multi-file test creation to Copilot
8. **[Architecture & Tech Stack Generation](#demo-8-architecture--tech-stack-generation-8-min)** — Generate test project scaffolding and ADRs

### CORE Prompt Framework

All prompts in this workshop follow the **CORE** framework:

| Element | Meaning | Example |
|---------|---------|---------|
| **C** – Context | Background, tech stack, relevant files | "In the ASP.NET Web API backend (`backend-csharp/`), `AiParsingService.cs` has zero tests..." |
| **O** – Objective | What you want Copilot to produce | "Generate xUnit tests for the fallback vehicle parsing logic" |
| **R** – Requirements | Constraints, rules, patterns to follow | "Use Moq for DI mocks, FluentAssertions, `Method_Scenario_Expected` naming" |
| **E** – Examples | Expected inputs/outputs, code patterns | "Input: `ParseVehicleAsync('2024 Winnebago')` → Output: `VehicleType == 'rv'`" |

### Codebase Context — What We're Testing

The `backend-csharp/` service is an ASP.NET Web API (.NET 8) that provides AI-powered vehicle parsing and trip generation via Azure OpenAI. **It currently has zero tests.**

| File | Purpose | Key Issues (from Roadmap) |
|------|---------|--------------------------|
| `Program.cs` | App bootstrap, DI, CORS, middleware | Hardcoded strings, no error middleware |
| `Controllers/VehicleController.cs` | REST: `POST /api/v1/parse-vehicle`, `POST /api/v1/generate-trip` | SRP violation, inline error strings |
| `Services/IAiParsingService.cs` | Service interface | ISP violation (2 concerns in 1 interface) |
| `Services/AiParsingService.cs` | Azure OpenAI + rule-based fallback | SRP (4 jobs), DIP (direct env vars, `new AzureOpenAIClient` inline) |
| `Models/AiModels.cs` | DTOs: requests, responses, `VehicleSpecs` | No validation attributes, magic defaults |
| `Tests/` | **Does not exist yet — must be created from scratch** | Critical gap |

**Reference**: See [CSHARP_BACKEND_ROADMAP.md](../../CSHARP_BACKEND_ROADMAP.md) for the full deficiency analysis.

---

## Workshop Agenda

| Time | Demo | Topic | Testing Focus | Key Files |
|------|------|-------|---------------|-----------|
| 0–10 min | Demo 1 | Chain-of-Thought Prompting | Unit tests, integration tests, mock-based tests | `AiParsingService.cs`, `VehicleController.cs` |
| 10–20 min | Demo 2 | **Tree of Thought Prompting** | Test strategy selection, mock architecture decisions | `AiParsingService.cs`, `IAiParsingService.cs` |
| 20–28 min | Demo 3 | Instruction Files | C# testing rules & conventions | `.github/copilot-instructions.md` |
| 28–38 min | Demo 4 | Prompt Files | Reusable test generation templates | `.github/prompts/*.prompt.md` |
| 38–46 min | Demo 5 | Copilot Code Review | Test quality review | `Tests/` (after creation) |
| 46–60 min | Demo 6 | Copilot Plan Mode | Test infrastructure architecture | `Tests/` project scaffolding |
| 60–73 min | Demo 7 | Copilot Coding Agent | Autonomous test suite creation | All `backend-csharp/` files |
| 73–82 min | Demo 8 | Architecture & Tech Stack Generation | Test project generation + ADR | `.csproj`, `WebApplicationFactory` |

---

## Testing Stack Reference

Before diving into demos, here is the C# testing stack used throughout this workshop:

| Package | Version | Purpose |
|---------|---------|---------|
| `xunit` | 2.9+ | Test framework (facts, theories, assertions) |
| `xunit.runner.visualstudio` | 2.8+ | Test discovery and execution in VS/CLI |
| `Moq` | 4.20+ | Interface mocking for dependency injection |
| `FluentAssertions` | 6.12+ | Readable assertion syntax (`.Should().Be()`) |
| `Microsoft.AspNetCore.Mvc.Testing` | 8.0+ | `WebApplicationFactory` for integration tests |
| `coverlet.collector` | 6.0+ | Code coverage collection |

### Key Testing Conventions

| Convention | Standard | Example |
|------------|----------|---------|
| **Test naming** | `Method_Scenario_ExpectedBehavior` | `ParseVehicleAsync_RvDescription_ReturnsRvSpecs` |
| **Test structure** | Arrange-Act-Assert (AAA) | Three clearly separated sections |
| **Assertions** | FluentAssertions over raw `Assert` | `result.Should().Be("rv")` not `Assert.Equal("rv", result)` |
| **Mocking** | Moq with `Setup()` / `Verify()` | `mock.Setup(s => s.ParseVehicleAsync(...)).ReturnsAsync(...)` |
| **Integration tests** | `WebApplicationFactory<Program>` | Override DI with `ConfigureTestServices` |
| **Parameterized tests** | `[Theory]` + `[InlineData]` | One test method, multiple input/output pairs |
| **TDD workflow** | Red → Green → Refactor | Write failing test first, then implementation |

---

## Demo 1: Chain-of-Thought Prompting (10 min)

### Objective
Learn to decompose complex test scenarios into step-by-step reasoning chains that guide Copilot toward correct, comprehensive test implementations.

### Scenario
Create three types of tests for the C# AI service backend: a unit test for fallback logic, an integration test for the controller endpoint, and a mock-based test for the service interface.

---

### Example 1A: Unit Test — Fallback Vehicle Specs (`AiParsingService.cs`)

**CORE Prompt:**
```
Context: In backend-csharp/Services/AiParsingService.cs, the private method
GetFallbackSpecs(string description) contains an if/else chain (lines ~150–210) that
maps vehicle description text to default VehicleSpecs. It checks for keywords like
"rv", "truck", "suv", "van" using string.Contains() on the lowercased input.
The method is called when Azure OpenAI is unconfigured or fails. The method is
private static, so we must test it through the public ParseVehicleAsync method
(Microsoft best practice: test private methods through public surface area).

Objective: Write xUnit parameterized tests that verify all 5 vehicle type
fallback paths plus the default car fallback.

Requirements:
- Use [Theory] with [InlineData] for each vehicle type
- Test through the public ParseVehicleAsync method (which calls GetFallbackSpecs
  when Azure OpenAI is not configured)
- Use FluentAssertions (.Should().Be(), .Should().BeGreaterThan())
- Follow Method_Scenario_ExpectedBehavior naming convention
- No Azure OpenAI env vars set → forces fallback path
- Arrange-Act-Assert structure with comments

Examples:
- Input: "2024 Winnebago View 24D motorhome" → VehicleType = "rv", Height = 3.5
- Input: "Ford F-150 truck" → VehicleType = "truck", Weight = 3000
- Input: "Honda Civic" (no keyword match) → VehicleType = "car" (default)

Chain of thought:
Step 1: Instantiate AiParsingService with a mock ILogger (no Azure OpenAI config)
Step 2: For each vehicle type keyword, call ParseVehicleAsync with a description
Step 3: Assert the returned VehicleSpecs matches expected vehicle type and dimensions
Step 4: Test the default fallback when no keyword matches
Step 5: Verify Status is always "success" and RawAiResponse is null (fallback mode)

Now implement:
```

**Expected Copilot Output:**
```csharp
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using RoadTrip.AiService.Services;
using Xunit;

namespace RoadTrip.AiService.Tests.Services;

public class AiParsingServiceFallbackTests
{
    private readonly AiParsingService _service;

    public AiParsingServiceFallbackTests()
    {
        // No Azure OpenAI env vars → forces fallback path
        _service = new AiParsingService(Mock.Of<ILogger<AiParsingService>>());
    }

    [Theory]
    [InlineData("2024 Winnebago View 24D motorhome", "rv", 10.0, 2.5, 3.5, 8000)]
    [InlineData("Ford F-150 Super Duty truck", "truck", 6.0, 2.0, 2.0, 3000)]
    [InlineData("Toyota RAV4 SUV", "suv", 5.0, 2.0, 1.8, 2200)]
    [InlineData("Mercedes Sprinter van", "van", 5.5, 2.0, 2.0, 2500)]
    [InlineData("Honda Civic sedan", "car", 4.5, 1.8, 1.5, 1500)]
    public async Task ParseVehicleAsync_KnownVehicleType_ReturnsFallbackSpecs(
        string description, string expectedType,
        double expectedLength, double expectedWidth,
        double expectedHeight, double expectedWeight)
    {
        // Act
        var result = await _service.ParseVehicleAsync(description);

        // Assert
        result.Status.Should().Be("success");
        result.RawAiResponse.Should().BeNull("fallback mode does not produce raw AI output");
        result.Specs.VehicleType.Should().Be(expectedType);
        result.Specs.Length.Should().Be(expectedLength);
        result.Specs.Width.Should().Be(expectedWidth);
        result.Specs.Height.Should().Be(expectedHeight);
        result.Specs.Weight.Should().Be(expectedWeight);
    }

    [Fact]
    public async Task ParseVehicleAsync_UnknownDescription_DefaultsToCar()
    {
        // Arrange
        var unknownDescription = "xyzzy flying carpet";

        // Act
        var result = await _service.ParseVehicleAsync(unknownDescription);

        // Assert
        result.Specs.VehicleType.Should().Be("car");
        result.Specs.NumAxles.Should().Be(2);
        result.Specs.IsCommercial.Should().BeFalse();
    }

    [Fact]
    public async Task ParseVehicleAsync_EmptyDescription_DefaultsToCar()
    {
        // Arrange & Act
        var result = await _service.ParseVehicleAsync("some vehicle");

        // Assert
        result.Specs.VehicleType.Should().Be("car");
        result.Specs.Weight.Should().Be(1500);
        result.Specs.MaxWeight.Should().Be(2000);
    }
}
```

---

### Example 1B: Integration Test — VehicleController Endpoint

**CORE Prompt:**
```
Context: In backend-csharp/Controllers/VehicleController.cs, the ParseVehicle
action (POST /api/v1/parse-vehicle) accepts a ParseVehicleRequest body with a
Description property. It validates that Description is not null/whitespace,
then delegates to IAiParsingService.ParseVehicleAsync. The controller uses
constructor-injected IAiParsingService and ILogger<VehicleController>.

The app bootstrap is in Program.cs, which registers IAiParsingService as a
Singleton. For integration tests, we need a WebApplicationFactory<Program> that
replaces IAiParsingService with a mock to avoid hitting Azure OpenAI.

Objective: Write integration tests for the parse-vehicle endpoint covering:
success, validation error (empty description), and correct content type.

Requirements:
- Use WebApplicationFactory<Program> with ConfigureTestServices
- Replace IAiParsingService with a Moq mock in DI
- Send real HTTP requests via HttpClient
- Verify HTTP status codes (200, 400) and JSON response body
- Use IClassFixture for shared factory
- FluentAssertions for assertions
- Arrange-Act-Assert pattern

Examples:
- POST /api/v1/parse-vehicle {"description":"Ford F-150"} → 200 + ParseVehicleResponse JSON
- POST /api/v1/parse-vehicle {"description":""} → 400 + error message
- POST /api/v1/parse-vehicle {"description":"  "} → 400 (whitespace only)

Chain of thought:
Step 1: Create a custom WebApplicationFactory that overrides IAiParsingService
Step 2: Configure the mock to return a known ParseVehicleResponse
Step 3: For success test: POST valid JSON, assert 200 and deserialized response
Step 4: For validation test: POST empty/whitespace description, assert 400
Step 5: Verify the mock was called exactly once for the success case

Now implement:
```

**Expected Copilot Output:**
```csharp
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using RoadTrip.AiService.Models;
using RoadTrip.AiService.Services;
using Xunit;

namespace RoadTrip.AiService.Tests.Controllers;

public class VehicleControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly Mock<IAiParsingService> _mockService;

    public VehicleControllerTests(WebApplicationFactory<Program> factory)
    {
        _mockService = new Mock<IAiParsingService>();
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                // Remove the real service registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IAiParsingService));
                if (descriptor != null) services.Remove(descriptor);

                // Register mock
                services.AddSingleton(_mockService.Object);
            });
        });
    }

    [Fact]
    public async Task ParseVehicle_ValidDescription_ReturnsOkWithSpecs()
    {
        // Arrange
        var expectedResponse = new ParseVehicleResponse
        {
            Status = "success",
            Specs = new VehicleSpecs
            {
                VehicleType = "truck", Length = 6.0, Width = 2.0,
                Height = 2.0, Weight = 3000,
            },
        };
        _mockService
            .Setup(s => s.ParseVehicleAsync("Ford F-150"))
            .ReturnsAsync(expectedResponse);

        var client = _factory.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync(
            "/api/v1/parse-vehicle",
            new ParseVehicleRequest { Description = "Ford F-150" });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ParseVehicleResponse>();
        body!.Status.Should().Be("success");
        body.Specs.VehicleType.Should().Be("truck");
        _mockService.Verify(s => s.ParseVehicleAsync("Ford F-150"), Times.Once);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task ParseVehicle_EmptyOrWhitespaceDescription_ReturnsBadRequest(
        string? description)
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync(
            "/api/v1/parse-vehicle",
            new ParseVehicleRequest { Description = description ?? string.Empty });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        _mockService.Verify(
            s => s.ParseVehicleAsync(It.IsAny<string>()), Times.Never);
    }
}
```

---

### Example 1C: Mock-Based Test — Service with Dependency Injection

**CORE Prompt:**
```
Context: In backend-csharp/Controllers/VehicleController.cs, the GenerateTrip
action (POST /api/v1/generate-trip) accepts a GenerateTripRequest with Origin,
Destination, and Interests properties. It validates Origin and Destination are
not null/whitespace, then calls IAiParsingService.GenerateTripAsync().

Currently the controller mixes two responsibilities (vehicle parsing + trip
generation) — this is SRP violation SRP-2 from the roadmap. Tests should
verify the controller correctly delegates to the service and validates input.

Objective: Write tests that verify the GenerateTrip endpoint's input validation
and delegation to the service interface.

Requirements:
- Use Moq to mock IAiParsingService
- Verify the mock is called with correct parameters
- Test both success and all validation failure paths
- Use FluentAssertions
- Arrange-Act-Assert pattern

Examples:
- Input: { origin: "Denver", destination: "Vegas", interests: ["hiking"] }
  → service.GenerateTripAsync("Denver", "Vegas", ["hiking"]) called once
- Input: { origin: "", destination: "Vegas" } → 400 Bad Request, service never called
- Input: { origin: "Denver", destination: "" } → 400 Bad Request, service never called

Chain of thought:
Step 1: Create a mock IAiParsingService with configurable GenerateTripAsync
Step 2: Test success path — verify service called with correct args
Step 3: Test missing origin — verify 400 and service NOT called
Step 4: Test missing destination — verify 400 and service NOT called
Step 5: Test that response body matches what service returns

Now implement:
```

**Expected Copilot Output:**
```csharp
[Fact]
public async Task GenerateTrip_ValidRequest_ReturnsOkWithSuggestions()
{
    // Arrange
    var expectedResponse = new GenerateTripResponse
    {
        Status = "success",
        Suggestions = new List<string>
        {
            "Visit Red Rocks Amphitheatre",
            "Stop at Arches National Park",
        },
    };
    _mockService
        .Setup(s => s.GenerateTripAsync("Denver, CO", "Las Vegas, NV",
            It.Is<List<string>>(l => l.Contains("hiking"))))
        .ReturnsAsync(expectedResponse);

    var client = _factory.CreateClient();

    // Act
    var response = await client.PostAsJsonAsync(
        "/api/v1/generate-trip",
        new GenerateTripRequest
        {
            Origin = "Denver, CO",
            Destination = "Las Vegas, NV",
            Interests = new List<string> { "hiking" },
        });

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await response.Content.ReadFromJsonAsync<GenerateTripResponse>();
    body!.Suggestions.Should().HaveCount(2);
    body.Suggestions.Should().Contain("Visit Red Rocks Amphitheatre");
}

[Theory]
[InlineData("", "Las Vegas")]
[InlineData("Denver", "")]
[InlineData("  ", "Las Vegas")]
[InlineData("Denver", "   ")]
public async Task GenerateTrip_MissingOriginOrDestination_ReturnsBadRequest(
    string origin, string destination)
{
    // Arrange
    var client = _factory.CreateClient();

    // Act
    var response = await client.PostAsJsonAsync(
        "/api/v1/generate-trip",
        new GenerateTripRequest
        {
            Origin = origin,
            Destination = destination,
            Interests = new List<string> { "food" },
        });

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    _mockService.Verify(
        s => s.GenerateTripAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<string>>()),
        Times.Never);
}
```

---

### Teaching Points

| Chain-of-Thought Element | Unit Test (1A) | Integration Test (1B) | Mock Test (1C) |
|-------------------------|----------------|----------------------|----------------|
| Step 1: Setup | `new AiParsingService(mockLogger)` | `WebApplicationFactory` + DI override | `Mock<IAiParsingService>` setup |
| Step 2: Input | Vehicle description strings | HTTP POST with JSON body | Request DTOs with edge cases |
| Step 3: Execution | `await ParseVehicleAsync(desc)` | `await client.PostAsJsonAsync(...)` | `await client.PostAsJsonAsync(...)` |
| Step 4: Assertion | `FluentAssertions` on `VehicleSpecs` | HTTP status code + deserialized body | `Verify()` on mock invocations |
| Step 5: Edge cases | Unknown description → default car | Empty description → 400 | Missing origin/destination → 400 |

**When to Use**: Multi-path business logic, controller validation, service delegation  
**Avoid**: Simple DTO property tests, trivial constructors

---

## Demo 2: Tree of Thought Prompting (10 min)

### Objective
Learn to prompt Copilot with branching "what-if" reasoning — exploring multiple test strategies simultaneously, evaluating their tradeoffs against real constraints, and converging on the optimal approach.

### Scenario
Three real design decisions from the `backend-csharp/` codebase where there is no single obvious answer: choosing a testing strategy for `AiParsingService`, selecting a mock architecture for `IAiParsingService`, and deciding how to approach the untestable Azure OpenAI path.

### How Tree of Thought Differs from Chain-of-Thought

| | Chain-of-Thought (Demo 1) | Tree of Thought (Demo 2) |
|--|--------------------------|--------------------------|
| **Structure** | Linear steps 1 → 2 → 3 → result | Branches A / B / C → evaluate each → select best |
| **Best for** | Known single path, decomposing test bodies | Ambiguous decisions with multiple valid approaches |
| **Copilot role** | Execute a pre-decided strategy | Evaluate alternatives and recommend with rationale |
| **C# testing use** | Writing a specific test method | Choosing strategy, mock architecture, coverage approach |
| **CORE emphasis** | Strong **R**equirements + **E**xamples | Strong **O**bjective (decision) + **R**equirements (constraints) |

---

### Example 2A: Test Strategy Decision — How Should We Test `AiParsingService`?

**CORE Prompt:**
```
Context: In backend-csharp/Services/AiParsingService.cs, ParseVehicleAsync has
two code paths: (1) Azure OpenAI path — requires live credentials, creates an
AzureOpenAIClient internally (DIP violation), and (2) Fallback path — pure C#
if/else keyword matching, fully testable without credentials.

The constructor reads AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and
AZURE_OPENAI_DEPLOYMENT from environment variables. When any are missing,
_isConfigured = false and the fallback path executes.

Objective: Decide the optimal testing strategy for AiParsingService by evaluating
three branches simultaneously. Pick the best approach and explain why.

Requirements:
- Tests must pass in CI with no Azure credentials
- Target ≥ 80% code coverage on AiParsingService.cs
- Must use xUnit + Moq + FluentAssertions
- Strategy must work with the current DIP violation (no refactoring yet)
- Should not slow CI to more than 5 seconds total for this class

Branch A — Pure unit tests via the fallback path only:
  - Instantiate AiParsingService with no env vars set
  - Test all 5 keyword paths + default car fallback in GetFallbackSpecs
  - Test GenerateTripAsync fallback (4 suggestions, origin/destination interpolation)
  - Coverage of ParseWithAzureOpenAI and GenerateWithAzureOpenAI: 0% (DIP violation)
  - Estimated coverage: ~65%

Branch B — Integration tests via WebApplicationFactory only:
  - Replace IAiParsingService with a Moq mock in DI
  - Test HTTP endpoints end-to-end
  - Does NOT test AiParsingService logic directly — mock bypasses it
  - Coverage of AiParsingService.cs: ~0% (mock replaces it entirely)
  - Estimated coverage: ~50% on VehicleController, ~0% on AiParsingService

Branch C — Hybrid: unit tests for service + integration tests for controller:
  - Unit: AiParsingService instantiated directly (fallback path) for all service tests
  - Integration: WebApplicationFactory with mock IAiParsingService for HTTP tests
  - Azure OpenAI path coverage: 0% until DIP-2 is fixed (document as known gap)
  - Estimated coverage: ~75% on AiParsingService + ~90% on VehicleController

Evaluate each branch against: coverage %, CI speed, mock complexity, future
maintainability. Select the best branch and explain the rationale. Then provide
a recommended file structure showing which tests go where.
```

**Expected Copilot Output:**
```markdown
## Test Strategy Evaluation for AiParsingService

### Branch A — Pure Unit Tests via Fallback
| Criterion | Score | Detail |
|-----------|-------|--------|
| Coverage | ⚠️ ~65% | Azure OpenAI path untestable without DIP fix |
| CI speed | ✅ <1 sec | No HTTP, no DI container startup |
| Mock complexity | ✅ Low | Only `Mock.Of<ILogger<AiParsingService>>()` |
| Maintainability | ✅ High | Tests match exactly what the method does |
| HTTP validation | ❌ None | Controller validation untested |

### Branch B — Integration Tests Only
| Criterion | Score | Detail |
|-----------|-------|--------|
| Coverage | ❌ ~0% on service | Mock replaces service entirely |
| CI speed | ⚠️ 1–2 sec | WebApplicationFactory startup overhead |
| Mock complexity | ⚠️ Medium | DI override via ConfigureTestServices |
| Maintainability | ⚠️ Medium | Tests HTTP behavior, not service logic |
| HTTP validation | ✅ Full | Tests routing, serialization, validation |

### Branch C — Hybrid (RECOMMENDED ✅)
| Criterion | Score | Detail |
|-----------|-------|--------|
| Coverage | ✅ ~75% service + ~90% controller | Best combined coverage |
| CI speed | ✅ <3 sec total | Unit fast + integration modest |
| Mock complexity | ⚠️ Medium | Two test setups: direct + factory |
| Maintainability | ✅ High | Each test file has single responsibility |
| HTTP validation | ✅ Full | Integration layer covers controller |

### Recommendation: Branch C — Hybrid
Branch C maximizes coverage without requiring the DIP refactoring needed to
reach the Azure OpenAI path. The ~25% uncovered code (ParseWithAzureOpenAI,
GenerateWithAzureOpenAI) is explicitly documented as a known gap requiring
DIP-2 remediation from the CSHARP_BACKEND_ROADMAP.md.

### Recommended File Structure
```
Tests/
├── Services/
│   ├── AiParsingServiceFallbackTests.cs  ← Branch A (unit, direct instantiation)
│   └── AiParsingServiceTripTests.cs      ← Branch A (unit, fallback trip path)
└── Controllers/
    ├── ParseVehicleEndpointTests.cs      ← Branch B (integration, HTTP)
    └── GenerateTripEndpointTests.cs      ← Branch B (integration, HTTP)
```
Coverage gap document:
> `ParseWithAzureOpenAI` and `GenerateWithAzureOpenAI` require extracting
> `IAzureOpenAIClientFactory` (DIP-2 fix) before they can be mocked and tested.
```

---

### Example 2B: Mock Architecture Decision — Shared vs Per-Test Mock

**CORE Prompt:**
```
Context: In integration tests for backend-csharp/Controllers/VehicleController.cs,
we need to mock IAiParsingService via WebApplicationFactory<Program>. IAiParsingService
is registered as a Singleton in Program.cs:
  services.AddSingleton<IAiParsingService, AiParsingService>()

There are two common architectures for managing mock state in xUnit:

Branch A — IClassFixture with shared factory, mock reset per test:
  public class ParseVehicleEndpointTests : IClassFixture<CustomWebApplicationFactory>
  {
      private readonly CustomWebApplicationFactory _factory;
      private readonly Mock<IAiParsingService> _mock;
      public ParseVehicleEndpointTests(CustomWebApplicationFactory factory)
      {
          _factory = factory;
          _mock = factory.MockAiService;
          _mock.Reset(); // Reset between tests
      }
  }

Branch B — WithWebHostBuilder per-test, fresh mock each time:
  public class ParseVehicleEndpointTests : IClassFixture<WebApplicationFactory<Program>>
  {
      private readonly WebApplicationFactory<Program> _factory;
      public ParseVehicleEndpointTests(WebApplicationFactory<Program> factory)
      { _factory = factory; }

      [Fact]
      public async Task ParseVehicle_ValidInput_ReturnsOk()
      {
          var mock = new Mock<IAiParsingService>();
          mock.Setup(s => s.ParseVehicleAsync("Ford F-150")).ReturnsAsync(expected);
          var client = _factory.WithWebHostBuilder(builder =>
              builder.ConfigureTestServices(services => {
                  services.AddSingleton(mock.Object);
              })).CreateClient();
          // ...
      }
  }

Objective: Evaluate both branches and recommend the better architecture for
this project's test suite.

Requirements:
- xUnit creates a new class instance per test (constructor runs per test)
- Singleton services in DI mean mock state can leak between tests
- CI must support parallel test execution without flakiness
- Solution should work without adding custom infrastructure beyond what is needed

Evaluate: test isolation, execution order independence, DI startup cost, code
clarity, suitability for the Singleton registration in Program.cs.
Select the better branch and show a concrete implementation.
```

**Expected Copilot Output:**
```markdown
## Mock Architecture Evaluation

### Branch A — IClassFixture + Mock.Reset()
| Criterion | Assessment |
|-----------|-----------|
| Test isolation | ⚠️ Risk — Reset() clears setups but xUnit may parallelize |
| Execution order | ⚠️ Fragile — test order affects mock state if Reset() is misused |
| DI startup cost | ✅ Low — factory created once, reused |
| Code clarity | ✅ Clean — single `_mock` field, easy to read |
| Singleton safety | ⚠️ Requires disciplined Reset() call in every constructor |

**Verdict**: Acceptable for sequential test runs, but fragile for parallel execution
due to shared mock state on a Singleton-registered service.

### Branch B — WithWebHostBuilder per test (RECOMMENDED ✅)
| Criterion | Assessment |
|-----------|-----------|
| Test isolation | ✅ Perfect — fresh mock per test, no shared state |
| Execution order | ✅ Independent — each test owns its mock |
| DI startup cost | ⚠️ Slight overhead — new WebHostBuilder per test (~50ms) |
| Code clarity | ⚠️ More verbose — mock setup inline per test |
| Singleton safety | ✅ Guaranteed — new mock instance replaces Singleton each time |

**Verdict**: Recommended for correctness. The overhead (~50ms/test) is negligible for
a test suite of <30 tests. Perfect isolation prevents the class of flaky test bugs
caused by shared Singleton mock state.

### Recommended Implementation (Branch B)
```csharp
public class ParseVehicleEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ParseVehicleEndpointTests(WebApplicationFactory<Program> factory)
        => _factory = factory;

    [Fact]
    public async Task ParseVehicle_ValidDescription_ReturnsOkWithSpecs()
    {
        // Arrange — fresh mock, fully isolated
        var mock = new Mock<IAiParsingService>();
        mock.Setup(s => s.ParseVehicleAsync("Ford F-150"))
            .ReturnsAsync(new ParseVehicleResponse
            {
                Status = "success",
                Specs = new VehicleSpecs { VehicleType = "truck" },
            });

        var client = _factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IAiParsingService>();
                services.AddSingleton(mock.Object);
            })).CreateClient();

        // Act
        var response = await client.PostAsJsonAsync(
            "/api/v1/parse-vehicle",
            new ParseVehicleRequest { Description = "Ford F-150" });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        mock.Verify(s => s.ParseVehicleAsync("Ford F-150"), Times.Once);
    }
}
```
```

---

### Example 2C: Covering the Azure OpenAI Path — Three Approaches

**CORE Prompt:**
```
Context: In backend-csharp/Services/AiParsingService.cs, the private methods
ParseWithAzureOpenAI (~line 95) and GenerateWithAzureOpenAI (~line 120) are
currently untestable because they instantiate AzureOpenAIClient directly inside
the method body (DIP-2 violation from CSHARP_BACKEND_ROADMAP.md).

Current constructor:
  _endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT");
  _apiKey   = Environment.GetEnvironmentVariable("AZURE_OPENAI_API_KEY");
  _deployment = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT");
  _isConfigured = !string.IsNullOrEmpty(_endpoint) && ...

These paths cannot be reached in tests without real Azure credentials or
structural code changes.

Objective: Explore three approaches to gain test coverage of the Azure OpenAI
path. Evaluate them against testability, security, and implementation effort.

Branch A — Inject Azure credentials via environment variables in test setup:
  // In test constructor, before instantiating AiParsingService:
  Environment.SetEnvironmentVariable("AZURE_OPENAI_ENDPOINT", "https://fake.openai.com");
  Environment.SetEnvironmentVariable("AZURE_OPENAI_API_KEY", "fake-key-000");
  Environment.SetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT", "gpt-4o");
  var service = new AiParsingService(Mock.Of<ILogger<AiParsingService>>());
  // _isConfigured = true → tries to hit https://fake.openai.com → HttpRequestException

Branch B — Refactor to extract IAzureOpenAIClientFactory, inject and mock it:
  public interface IAzureOpenAIClientFactory {
      ChatClient CreateChatClient();
  }
  // AiParsingService takes IAzureOpenAIClientFactory via constructor
  // Tests provide a Mock<IAzureOpenAIClientFactory> returning controlled ChatCompletions

Branch C — Record and replay HTTP responses (VCR pattern):
  // Use Microsoft.Extensions.Http.Polly or custom DelegatingHandler
  // Intercept outbound HTTP, return recorded JSON responses from test fixtures
  // No real Azure credentials needed

Evaluate each branch against: security, test isolation, implementation effort,
coverage achieved, alignment with SOLID principles.
Select the best long-term strategy. If the best requires refactoring, explicitly
flag it as a prerequisite linked to CSHARP_BACKEND_ROADMAP.md.
```

**Expected Copilot Output:**
```markdown
## Azure OpenAI Path Coverage Evaluation

### Branch A — Environment Variable Injection
| Criterion | Assessment |
|-----------|-----------|
| Security | ❌ Dangerous — fake credentials in test env, can leak to CI logs |
| Test isolation | ❌ Global state via Environment.SetEnvironmentVariable pollutes parallel tests |
| Implementation effort | ✅ Zero — no code changes |
| Coverage achieved | ⚠️ Partial — reaches _isConfigured=true, but gets HttpRequestException |
| SOLID alignment | ❌ Worsens DIP — no injection, still static env var dependency |

**Verdict**: ❌ Rejected. Security risk (credentials in CI logs) and parallel test
pollution make this approach unacceptable.

### Branch B — Extract IAzureOpenAIClientFactory (RECOMMENDED ✅)
| Criterion | Assessment |
|-----------|-----------|
| Security | ✅ No credentials in tests — mock returns controlled data |
| Test isolation | ✅ Perfect — injected via constructor, no global state |
| Implementation effort | ⚠️ Medium — requires DIP-2 refactor (new interface + factory class) |
| Coverage achieved | ✅ ~95% — both AI paths fully testable via mock factory |
| SOLID alignment | ✅ Fixes DIP-2 violation from roadmap, enables OCP for providers |

**Verdict**: ✅ Best long-term strategy. Documents the path to full coverage.

### Branch C — VCR / HTTP Record-Replay
| Criterion | Assessment |
|-----------|-----------|
| Security | ✅ No real credentials — recorded responses only |
| Test isolation | ✅ Good — recorded fixtures are deterministic |
| Implementation effort | ❌ High — requires custom DelegatingHandler + fixture recording |
| Coverage achieved | ✅ High — reaches real code paths with faked HTTP |
| SOLID alignment | ⚠️ Neutral — doesn't fix DIP but tests around it |

**Verdict**: ⚠️ Valid but over-engineered. Branch B achieves the same coverage
with less infrastructure and also fixes the underlying SOLID violation.

### Recommendation: Branch B — Requires DIP-2 Refactor First
This is a **prerequisite task** before writing tests for the Azure OpenAI path:

```csharp
// Step 1: Add to Services/IAzureOpenAIClientFactory.cs
public interface IAzureOpenAIClientFactory
{
    ChatClient CreateChatClient(string deploymentName);
}

// Step 2: Implement in Services/AzureOpenAIClientFactory.cs
public class AzureOpenAIClientFactory : IAzureOpenAIClientFactory
{
    private readonly AzureOpenAIClient _client;
    public AzureOpenAIClientFactory(IOptions<AzureOpenAIOptions> options)
        => _client = new AzureOpenAIClient(new Uri(options.Value.Endpoint),
                                           new AzureKeyCredential(options.Value.ApiKey));
    public ChatClient CreateChatClient(string deployment)
        => _client.GetChatClient(deployment);
}

// Step 3: In tests — inject mock factory
var mockFactory = new Mock<IAzureOpenAIClientFactory>();
mockFactory.Setup(f => f.CreateChatClient("gpt-4o"))
           .Returns(fakeChatClient);
var service = new AiParsingService(mockLogger, mockFactory.Object, options);
```

📌 **Track in Roadmap**: Add as sub-task under DIP-2 in CSHARP_BACKEND_ROADMAP.md.
Until DIP-2 is fixed, document Azure OpenAI path as a known coverage gap (~25%).
```

---

### Teaching Points

| Technique | Chain-of-Thought (Demo 1) | Tree of Thought (Demo 2) |
|-----------|--------------------------|--------------------------|
| **Prompt structure** | "Step 1…Step 2…Step 3…Now implement" | "Branch A…Branch B…Branch C…Evaluate…Select best" |
| **When to use** | You know the test structure, just need the code | You're deciding *which* test approach to take |
| **Copilot's role** | Code generator executing known steps | Advisor evaluating alternatives with tradeoffs |
| **Output type** | Test code | Evaluation table + recommendation + code |
| **CORE emphasis** | **R**equirements + **E**xamples | **O**bjective (decision) + **R**equirements (constraints) |
| **Example from workshop** | "Write a [Theory] for GetFallbackSpecs" | "Should I use unit tests, integration tests, or hybrid?" |

**When to Use Tree of Thought**:
- Choosing between testing strategies with real tradeoffs
- Designing mock architecture for complex DI setups
- Deciding which SOLID violation to fix first to unlock testability
- Any question where the answer is "it depends" — ToT makes Copilot evaluate *what* it depends on

**Avoid Tree of Thought When**:
- The approach is already decided — use Chain-of-Thought instead
- The decision is trivial (e.g., "use [Theory] or [Fact]?" — just use the right one)
- You need code output, not analysis — combine ToT for the decision, then CoT for implementation

---

## Demo 3: Instruction Files (8 min)

### Objective
Add C# testing-specific rules to `.github/copilot-instructions.md` that Copilot automatically applies when generating tests.

### Scenario
Define project-wide testing conventions so Copilot consistently produces tests that match team standards.

### Live Coding Steps

**Step 1: Add C# test naming convention**

```markdown
<!-- Add to .github/copilot-instructions.md -->

### C# Testing Standards (Strictly Enforced)

**Test Naming Convention: `Method_Scenario_ExpectedBehavior`**

```csharp
// ❌ WRONG — vague names
[Fact]
public async Task TestParseVehicle() { }

[Fact]
public async Task Test1() { }

// ✅ CORRECT — descriptive three-part names
[Fact]
public async Task ParseVehicleAsync_RvDescription_ReturnsRvSpecs() { }

[Fact]
public async Task ParseVehicle_EmptyDescription_ReturnsBadRequest() { }

[Fact]
public async Task GenerateTripAsync_AzureOpenAiUnavailable_ReturnsFallbackSuggestions() { }
```
```

**Step 2: Add Arrange-Act-Assert enforcement**

```markdown
### Arrange-Act-Assert Pattern (AAA)

All tests MUST follow the AAA pattern with section comments:

```csharp
// ❌ WRONG — no structure, assertion mixed with action
[Fact]
public async Task ParseVehicle_Works()
{
    Assert.Equal("success",
        (await _service.ParseVehicleAsync("truck")).Status);
}

// ✅ CORRECT — clear AAA sections
[Fact]
public async Task ParseVehicleAsync_TruckDescription_ReturnsSuccessStatus()
{
    // Arrange
    var description = "Ford F-250 Super Duty truck";

    // Act
    var result = await _service.ParseVehicleAsync(description);

    // Assert
    result.Status.Should().Be("success");
    result.Specs.VehicleType.Should().Be("truck");
}
```
```

**Step 3: Add assertion library rule**

```markdown
### FluentAssertions Over Raw Assert (Required)

```csharp
// ❌ WRONG — raw xUnit Assert
Assert.Equal("rv", result.Specs.VehicleType);
Assert.True(result.Specs.Height > 0);
Assert.NotNull(result.RawAiResponse);

// ✅ CORRECT — FluentAssertions
result.Specs.VehicleType.Should().Be("rv");
result.Specs.Height.Should().BeGreaterThan(0);
result.RawAiResponse.Should().NotBeNull();
```
```

**Step 4: Add test isolation rule**

```markdown
### Test Isolation (Critical)

```csharp
// ❌ WRONG — tests share state via static field
private static AiParsingService _sharedService = new(...);

// ❌ WRONG — test depends on another test's execution
[Fact]
public async Task ParseVehicle_AfterGenerateTrip_StillWorks() { }

// ✅ CORRECT — each test creates its own instance
public class AiParsingServiceTests
{
    private readonly AiParsingService _service;

    public AiParsingServiceTests()
    {
        // Fresh instance per test (xUnit creates new class per test)
        _service = new AiParsingService(Mock.Of<ILogger<AiParsingService>>());
    }
}

// ✅ CORRECT — integration tests use IClassFixture for shared factory only
public class VehicleControllerTests : IClassFixture<WebApplicationFactory<Program>>
```
```

**Step 5: Add mock verification rule**

```markdown
### Mock Verification Standards

```csharp
// ❌ WRONG — no verification that service was actually called
[Fact]
public async Task ParseVehicle_ValidInput_ReturnsOk()
{
    var response = await client.PostAsJsonAsync("/api/v1/parse-vehicle", request);
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    // Missing: did the controller actually call the service?
}

// ✅ CORRECT — verify mock interaction
[Fact]
public async Task ParseVehicle_ValidInput_DelegatesToService()
{
    var response = await client.PostAsJsonAsync("/api/v1/parse-vehicle", request);
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    _mockService.Verify(s => s.ParseVehicleAsync("Ford F-150"), Times.Once);
}

// ✅ CORRECT — verify service NOT called on validation failure
[Fact]
public async Task ParseVehicle_EmptyInput_DoesNotCallService()
{
    var response = await client.PostAsJsonAsync("/api/v1/parse-vehicle", emptyRequest);
    response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    _mockService.Verify(s => s.ParseVehicleAsync(It.IsAny<string>()), Times.Never);
}
```
```

### Teaching Points

| Instruction Rule | What It Enforces | Why It Matters |
|-----------------|------------------|----------------|
| `Method_Scenario_Expected` naming | Readable test explorer output | Failed tests immediately describe what broke |
| Arrange-Act-Assert | Structured test bodies | Prevents assertion-in-action mixing |
| FluentAssertions | Readable assertions | `.Should().Be("rv")` reads like English |
| Test isolation | No shared mutable state | Tests can run in parallel without flakiness |
| Mock verification | `Verify()` on every mock | Catches silent delegation failures |

---

<a id="demo-4-prompt-files-10-min"></a>
## Demo 4: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files for consistent C# test generation — one for unit tests, one for integration tests, and one for mock-based service tests.

### Scenario
Build a library of test generation templates that any team member can invoke in Copilot Chat.

---

### Step 1: Create xUnit Unit Test Prompt

```markdown
<!-- .github/prompts/csharp-unit-test.prompt.md -->

# C# xUnit Unit Test Generator (CORE Framework)

## Context
You are generating xUnit unit tests for the Road Trip Planner C# backend
(`backend-csharp/`). The service uses ASP.NET Web API (.NET 8) with:
- `AiParsingService` — AI vehicle parsing with rule-based fallback
- `VehicleSpecs` — DTO with vehicleType, length, width, height, weight, etc.
- `ILogger<T>` — injected via constructor for all services
- No Azure OpenAI credentials in test environment → fallback path executes

## Objective
Generate unit tests for a specific class or method with full coverage of
success, failure, and edge-case paths.

## Requirements
- xUnit with `[Fact]` and `[Theory]` + `[InlineData]`
- FluentAssertions (`.Should().Be()`, `.Should().BeNull()`)
- Moq for dependency mocking (`Mock.Of<T>()`, `new Mock<T>()`)
- `Method_Scenario_ExpectedBehavior` naming convention
- Arrange-Act-Assert with `// Arrange`, `// Act`, `// Assert` comments
- One assertion concept per test (no multi-assertion monsters)
- Test private methods through public surface area only
- No hardcoded magic strings — use constants or local variables with descriptive names

## Examples

### Input
"Generate unit tests for AiParsingService.ParseVehicleAsync fallback behavior"

### Expected Output
```csharp
public class AiParsingServiceFallbackTests
{
    private readonly AiParsingService _service;

    public AiParsingServiceFallbackTests()
    {
        _service = new AiParsingService(Mock.Of<ILogger<AiParsingService>>());
    }

    [Theory]
    [InlineData("RV motorhome", "rv")]
    [InlineData("pickup truck", "truck")]
    [InlineData("Honda sedan", "car")]
    public async Task ParseVehicleAsync_FallbackMode_MapsDescriptionToVehicleType(
        string description, string expectedType)
    {
        // Act
        var result = await _service.ParseVehicleAsync(description);

        // Assert
        result.Specs.VehicleType.Should().Be(expectedType);
        result.Status.Should().Be("success");
        result.RawAiResponse.Should().BeNull();
    }
}
```

## Checklist
- [ ] `[Fact]` for single-case tests, `[Theory]` for parameterized
- [ ] FluentAssertions — NOT raw `Assert.Equal`
- [ ] `Method_Scenario_Expected` naming
- [ ] AAA comments in every test body
- [ ] `Mock.Of<ILogger<T>>()` for logger dependencies
- [ ] No calls to external APIs or Azure services
- [ ] Tests run without environment variables set
```

---

### Step 2: Create Integration Test Prompt

```markdown
<!-- .github/prompts/csharp-integration-test.prompt.md -->

# C# ASP.NET Integration Test Generator (CORE Framework)

## Context
You are generating integration tests for the Road Trip Planner C# backend
(`backend-csharp/`). Integration tests use ASP.NET Core's
`WebApplicationFactory<Program>` to spin up a real in-memory test server.

Key endpoints:
- `POST /api/v1/parse-vehicle` — accepts `ParseVehicleRequest`, returns `ParseVehicleResponse`
- `POST /api/v1/generate-trip` — accepts `GenerateTripRequest`, returns `GenerateTripResponse`
- `GET /health` — returns health check status

DI registration in Program.cs:
- `IAiParsingService` registered as Singleton → must be replaced in tests

## Objective
Generate integration tests that verify HTTP request/response behavior through the
full middleware pipeline (CORS, routing, serialization, validation).

## Requirements
- Use `WebApplicationFactory<Program>` with `IClassFixture`
- Override `IAiParsingService` via `ConfigureTestServices`
- Use `HttpClient.PostAsJsonAsync` and `ReadFromJsonAsync<T>` for type-safe HTTP
- Test HTTP status codes: 200, 400, 404, 500
- Test response content type: `application/json`
- Use Moq for service mocking
- FluentAssertions for all assertions
- One `HttpClient` per test method (create from factory)

## Examples

### Input
"Generate integration tests for the health endpoint and parse-vehicle endpoint"

### Expected Output
```csharp
public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_Get_ReturnsHealthy()
    {
        // Act
        var response = await _client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
```

## Checklist
- [ ] `IClassFixture<WebApplicationFactory<Program>>` for shared factory
- [ ] `ConfigureTestServices` to replace real services with mocks
- [ ] Type-safe HTTP with `PostAsJsonAsync` / `ReadFromJsonAsync`
- [ ] Status code assertions on every response
- [ ] `Verify()` on mocks to confirm service delegation
- [ ] No external API calls — all services mocked
- [ ] Tests pass without any environment variables
```

---

### Step 3: Create Moq Service Mock Prompt

```markdown
<!-- .github/prompts/csharp-moq-service.prompt.md -->

# C# Moq Service Mock Generator (CORE Framework)

## Context
You are generating Moq-based mock configurations for the Road Trip Planner
C# backend (`backend-csharp/`). The service interface is `IAiParsingService`
with two methods:
- `ParseVehicleAsync(string description)` → `ParseVehicleResponse`
- `GenerateTripAsync(string origin, string destination, List<string> interests)` → `GenerateTripResponse`

## Objective
Generate reusable mock builders and test helper methods for `IAiParsingService`.

## Requirements
- Use `Moq` 4.20+ with `Setup()`, `ReturnsAsync()`, `Verify()`, `Callback()`
- Create helper methods that return pre-configured mocks
- Support both success and failure scenarios
- Throw specific exceptions for error testing (e.g., `HttpRequestException`)
- Use `It.Is<T>()` for parameter matching, not `It.IsAny<T>()` unless intentional
- Include `Verify()` helpers for common assertion patterns

## Examples

### Input
"Create a mock helper for IAiParsingService that supports success, fallback, and error scenarios"

### Expected Output
```csharp
public static class MockAiParsingServiceBuilder
{
    public static Mock<IAiParsingService> CreateSuccessMock(
        string vehicleType = "car")
    {
        var mock = new Mock<IAiParsingService>();
        mock.Setup(s => s.ParseVehicleAsync(It.IsAny<string>()))
            .ReturnsAsync(new ParseVehicleResponse
            {
                Status = "success",
                Specs = new VehicleSpecs { VehicleType = vehicleType },
            });
        return mock;
    }

    public static Mock<IAiParsingService> CreateFailureMock()
    {
        var mock = new Mock<IAiParsingService>();
        mock.Setup(s => s.ParseVehicleAsync(It.IsAny<string>()))
            .ThrowsAsync(new HttpRequestException("Azure OpenAI unavailable"));
        return mock;
    }
}
```

## Checklist
- [ ] `Mock<IAiParsingService>` — not concrete class
- [ ] `Setup()` + `ReturnsAsync()` for async methods
- [ ] `ThrowsAsync()` for error scenarios
- [ ] `It.Is<T>(predicate)` for specific parameter matching
- [ ] Helper returns `Mock<T>` (not `.Object`) so tests can add `Verify()`
- [ ] Covers success, fallback, and exception paths
```

---

### Step 4: Use a Prompt File in Chat

```
# In Copilot Chat:
#file:.github/prompts/csharp-unit-test.prompt.md

Generate unit tests for the GenerateTripAsync method in AiParsingService,
covering the fallback path when Azure OpenAI is not configured. Test that
it returns 4 default suggestions including the origin and destination in
the first suggestion string.
```

### Teaching Points

| Prompt File Element | Unit Test | Integration Test | Mock Helper |
|--------------------|-----------|------------------|-------------|
| **C**ontext | `AiParsingService`, `VehicleSpecs` | `WebApplicationFactory<Program>` | `IAiParsingService` interface |
| **O**bjective | Method-level coverage | HTTP request/response behavior | Reusable mock configurations |
| **R**equirements | `[Theory]`, FluentAssertions | `IClassFixture`, `ConfigureTestServices` | `Setup()`, `ReturnsAsync()`, `Verify()` |
| **E**xamples | Parameterized test class | Health + endpoint tests | Builder pattern with success/failure |

---

<a id="demo-5-copilot-code-review-8-min"></a>
## Demo 5: Copilot Code Review (8 min)

### Objective
Use Copilot to review a test pull request, identifying quality issues specific to C# testing patterns.

### Scenario
Review a PR that adds the first batch of tests to the `backend-csharp/Tests/` project.

### Live Coding Steps

**Step 1: Invoke Copilot Code Review with CORE Prompt**
```
Context: A PR adds the first test suite to backend-csharp/Tests/. The PR includes:
- Tests/RoadTrip.AiService.Tests.csproj (xUnit + Moq + FluentAssertions)
- Tests/Services/AiParsingServiceTests.cs (8 tests for fallback parsing)
- Tests/Controllers/VehicleControllerTests.cs (6 integration tests)
- Tests/Helpers/WebAppFactory.cs (custom WebApplicationFactory)

The project follows these testing standards:
- Method_Scenario_ExpectedBehavior naming
- AAA pattern with section comments
- FluentAssertions (not raw Assert)
- Moq for DI mocking
- IClassFixture for integration tests
- No external API calls

Objective: Review all test files for quality, correctness, and adherence
to our testing standards.

Requirements: Check for
1. Test naming convention violations
2. Missing AAA structure or comments
3. Raw Assert usage instead of FluentAssertions
4. Test isolation issues (shared mutable state)
5. Missing mock verification (Verify calls)
6. Hardcoded magic strings in assertions
7. Missing edge cases or negative test paths
8. Proper async/await usage (no .Result or .Wait())

Examples of issues to flag:
- Test named "TestParseVehicle" instead of "ParseVehicleAsync_RvInput_ReturnsRvSpecs"
- Missing Verify() after mock setup
- Assert.Equal used instead of .Should().Be()
- Tests depending on execution order
```

**Step 2: Expected Copilot Review Output**
```markdown
## Code Review: Initial Test Suite for backend-csharp

### 🔴 Critical Issues

**1. Shared Mock State (VehicleControllerTests.cs:15)**
```csharp
// ❌ Current — mock configured in constructor, shared across tests
private readonly Mock<IAiParsingService> _mockService = new();

public VehicleControllerTests(WebApplicationFactory<Program> factory)
{
    _mockService.Setup(s => s.ParseVehicleAsync(It.IsAny<string>()))
        .ReturnsAsync(new ParseVehicleResponse { Status = "success" });
    // All tests share this single setup — cannot configure per-test
}

// ✅ Fix — configure mock per-test using WithWebHostBuilder
[Fact]
public async Task ParseVehicle_ValidInput_ReturnsOk()
{
    var mockService = new Mock<IAiParsingService>();
    mockService.Setup(s => s.ParseVehicleAsync("Ford F-150"))
        .ReturnsAsync(expectedResponse);

    var client = _factory.WithWebHostBuilder(builder =>
        builder.ConfigureTestServices(services =>
            services.AddSingleton(mockService.Object)))
        .CreateClient();
    // ...
}
```

**2. Missing Async Await (AiParsingServiceTests.cs:42)**
```csharp
// ❌ Current — blocking call
var result = _service.ParseVehicleAsync("truck").Result;

// ✅ Fix — proper async/await
var result = await _service.ParseVehicleAsync("truck");
```

**3. Raw Assert Usage (AiParsingServiceTests.cs:58)**
```csharp
// ❌ Current — raw xUnit Assert
Assert.Equal("rv", result.Specs.VehicleType);
Assert.True(result.Specs.Height > 0);

// ✅ Fix — FluentAssertions
result.Specs.VehicleType.Should().Be("rv");
result.Specs.Height.Should().BeGreaterThan(0);
```

### 🟡 Warnings

**4. Naming Violation (AiParsingServiceTests.cs:25)**
```csharp
// ❌ Current — unclear name
[Fact]
public async Task TestFallback() { }

// ✅ Fix — three-part naming
[Fact]
public async Task ParseVehicleAsync_NoAzureConfig_UsesFallbackSpecs() { }
```

**5. Missing Mock Verification (VehicleControllerTests.cs:65)**
```csharp
// ❌ Current — tests response but not delegation
var response = await client.PostAsJsonAsync("/api/v1/parse-vehicle", request);
response.StatusCode.Should().Be(HttpStatusCode.OK);
// Service could be bypassed and we'd never know

// ✅ Fix — add Verify
_mockService.Verify(s => s.ParseVehicleAsync("Ford F-150"), Times.Once);
```

**6. Missing Edge Case — Null Request Body (VehicleControllerTests.cs)**
```csharp
// ⚠️ Missing test: what happens when body is null?
[Fact]
public async Task ParseVehicle_NullBody_ReturnsBadRequest()
{
    var client = _factory.CreateClient();
    var response = await client.PostAsync("/api/v1/parse-vehicle",
        new StringContent("null", Encoding.UTF8, "application/json"));
    response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
}
```

### 🟢 Suggestions

**7. Use Theory for Repeated Patterns**
```csharp
// ❌ Current — 5 separate [Fact] tests with same structure
[Fact] public async Task ParseVehicle_Rv_ReturnsRv() { ... }
[Fact] public async Task ParseVehicle_Truck_ReturnsTruck() { ... }
[Fact] public async Task ParseVehicle_Suv_ReturnsSuv() { ... }

// ✅ Consolidate into [Theory]
[Theory]
[InlineData("RV motorhome", "rv")]
[InlineData("Ford truck", "truck")]
[InlineData("Toyota SUV", "suv")]
public async Task ParseVehicleAsync_KnownType_ReturnsMatchingSpecs(
    string description, string expectedType) { ... }
```

**8. Add Test Category Traits**
```csharp
// ✅ Enables filtering: dotnet test --filter "Category=Integration"
[Trait("Category", "Integration")]
[Fact]
public async Task ParseVehicle_ValidInput_ReturnsOk() { }

[Trait("Category", "Unit")]
[Fact]
public async Task ParseVehicleAsync_RvInput_ReturnsRvSpecs() { }
```

### Summary
| Category | Count | Details |
|----------|-------|---------|
| 🔴 Critical | 3 | Shared state, blocking async, raw Assert |
| 🟡 Warning | 3 | Naming, missing Verify, missing edge case |
| 🟢 Suggestion | 2 | Theory consolidation, test traits |
```

### Teaching Points

| Review Focus | What to Check | Why It Matters |
|-------------|---------------|----------------|
| Test isolation | No shared mutable state between tests | Prevents flaky parallel execution |
| Async correctness | `await` not `.Result` or `.Wait()` | Avoids deadlocks, follows best practice |
| Assertion library | FluentAssertions not raw Assert | Consistent, readable assertion messages |
| Mock verification | `Verify()` on every mock setup | Catches silent delegation failures |
| Edge cases | Null bodies, whitespace, boundary values | Prevents production surprises |
| Naming | `Method_Scenario_Expected` | Self-documenting test explorer output |

---

<a id="demo-6-copilot-plan-mode-14-min"></a>
## Demo 6: Copilot Plan Mode (14 min)

### Objective
Use Plan Mode to architect a complete test infrastructure for the C# backend — from zero tests to a fully scaffolded test project.

### Scenario
The `backend-csharp/Tests/` directory is **completely empty** — no `.csproj`, no test files, no helpers. Create a phased plan to achieve comprehensive test coverage.

### Live Coding Steps

**Step 1: Invoke Plan Mode with CORE Prompt**
```
Context: The Road Trip Planner C# backend (backend-csharp/) currently has:
- Tests/ directory does not exist yet — no .csproj, no folders, must be created from scratch
- Not added to the solution file (road_trip_app.sln)
- 5 SOLID violations documented in docs/CSHARP_BACKEND_ROADMAP.md
- 6 security gaps (prompt injection, no auth, no rate limiting)
- 12+ hardcoded strings across all source files

Key source files:
- Program.cs (40 lines) — DI, CORS, health checks
- Controllers/VehicleController.cs (58 lines) — 2 POST endpoints
- Services/IAiParsingService.cs (10 lines) — interface with 2 methods
- Services/AiParsingService.cs (214 lines) — Azure OpenAI + fallback
- Models/AiModels.cs (55 lines) — 5 DTOs

The project uses .NET 8, has 2 NuGet packages (Azure.AI.OpenAI, Swashbuckle).
Azure OpenAI credentials are read from environment variables (not IOptions).

Objective: Create a phased plan to build comprehensive test coverage from scratch.

Requirements:
- Use xUnit 2.9+, Moq 4.20+, FluentAssertions 6.12+
- Microsoft.AspNetCore.Mvc.Testing for integration tests
- Target ≥ 80% code coverage
- Follow TDD mandate: Red → Green → Refactor
- All tests must pass without Azure OpenAI credentials
- Tests must run in CI without network access
- Follow Method_Scenario_ExpectedBehavior naming

Examples of existing test patterns from other backends:
  Python: conftest.py with pytest fixtures + JSON test data files
  Java (planned): MockWebServer for WebClient testing
  C# should follow: WebApplicationFactory + Moq for DI mocking
```

**Step 2: Review Generated Plan**
```markdown
## Plan: C# Backend Test Infrastructure — From Zero to 80% Coverage

### Phase 1: Project Scaffolding (15 min)
☐ 1.1 Create `Tests/RoadTrip.AiService.Tests.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.10.0" />
    <PackageReference Include="xunit" Version="2.9.0" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.2" />
    <PackageReference Include="Moq" Version="4.20.70" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.8" />
    <PackageReference Include="coverlet.collector" Version="6.0.2" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="../../backend-csharp/RoadTrip.AiService.csproj" />
  </ItemGroup>
</Project>
```

☐ 1.2 Add to `road_trip_app.sln`:
```bash
dotnet sln road_trip_app.sln add backend-csharp/Tests/RoadTrip.AiService.Tests.csproj
```

☐ 1.3 Verify: `dotnet test backend-csharp/Tests/` → build succeeds, 0 tests

### Phase 2: Test Helpers & Infrastructure (20 min)
☐ 2.1 Create `Tests/Helpers/CustomWebApplicationFactory.cs`:
```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public Mock<IAiParsingService> MockAiService { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IAiParsingService));
            if (descriptor != null) services.Remove(descriptor);
            services.AddSingleton(MockAiService.Object);
        });
        builder.UseEnvironment("Testing");
    }
}
```

☐ 2.2 Create `Tests/Helpers/MockServiceBuilder.cs` — reusable mock factories
☐ 2.3 Create `Tests/Fixtures/` directory with JSON test data:
  - `valid_parse_request.json`
  - `valid_trip_request.json`
  - `expected_rv_specs.json`
  - `expected_car_specs.json`

☐ 2.4 Verify: `dotnet build backend-csharp/Tests/` → compiles with helpers

### Phase 3: Unit Tests — AiParsingService (30 min)
☐ 3.1 Create `Tests/Services/AiParsingServiceFallbackTests.cs`:
  - ParseVehicleAsync_RvDescription_ReturnsRvSpecs
  - ParseVehicleAsync_TruckDescription_ReturnsTruckSpecs
  - ParseVehicleAsync_SuvDescription_ReturnsSuvSpecs
  - ParseVehicleAsync_VanDescription_ReturnsVanSpecs
  - ParseVehicleAsync_UnknownDescription_DefaultsToCar
  - ParseVehicleAsync_FallbackMode_ReturnsNullRawResponse
  - ParseVehicleAsync_FallbackMode_ReturnsSuccessStatus

☐ 3.2 Create `Tests/Services/AiParsingServiceTripTests.cs`:
  - GenerateTripAsync_NoAzureConfig_ReturnsFallbackSuggestions
  - GenerateTripAsync_FallbackSuggestions_ContainOriginAndDestination
  - GenerateTripAsync_FallbackSuggestions_HasFourItems

☐ 3.3 Verify: `dotnet test backend-csharp/Tests/ --filter "Category=Unit"` → all green

### Phase 4: Integration Tests — VehicleController (30 min)
☐ 4.1 Create `Tests/Controllers/ParseVehicleEndpointTests.cs`:
  - ParseVehicle_ValidDescription_ReturnsOkWithSpecs
  - ParseVehicle_EmptyDescription_ReturnsBadRequest
  - ParseVehicle_WhitespaceDescription_ReturnsBadRequest
  - ParseVehicle_ResponseContentType_IsApplicationJson
  - ParseVehicle_ValidInput_DelegatesToService

☐ 4.2 Create `Tests/Controllers/GenerateTripEndpointTests.cs`:
  - GenerateTrip_ValidRequest_ReturnsOkWithSuggestions
  - GenerateTrip_MissingOrigin_ReturnsBadRequest
  - GenerateTrip_MissingDestination_ReturnsBadRequest
  - GenerateTrip_EmptyInterests_StillSucceeds
  - GenerateTrip_ValidInput_DelegatesToServiceWithCorrectArgs

☐ 4.3 Create `Tests/Controllers/HealthEndpointTests.cs`:
  - Health_Get_ReturnsOk
  - Health_Get_ReturnsHealthyStatus

☐ 4.4 Verify: `dotnet test backend-csharp/Tests/ --filter "Category=Integration"` → all green

### Phase 5: Model & Edge Case Tests (15 min)
☐ 5.1 Create `Tests/Models/VehicleSpecsTests.cs`:
  - VehicleSpecs_DefaultValues_AreCarDefaults
  - ParseVehicleRequest_DefaultDescription_IsEmpty
  - GenerateTripRequest_DefaultInterests_IsEmptyList

☐ 5.2 Create `Tests/Models/ResponseModelTests.cs`:
  - ParseVehicleResponse_DefaultStatus_IsSuccess
  - GenerateTripResponse_DefaultSuggestions_IsEmptyList

☐ 5.3 Verify: `dotnet test backend-csharp/Tests/` → all tests green

### Phase 6: Coverage & CI (10 min)
☐ 6.1 Run coverage:
```bash
dotnet test backend-csharp/Tests/ --collect:"XPlat Code Coverage"
```
☐ 6.2 Verify ≥ 80% coverage on `AiParsingService.cs` and `VehicleController.cs`
☐ 6.3 Add test step to CI pipeline (remove `continueOnError` if applicable)

### Success Criteria
✅ Test project builds and is part of `road_trip_app.sln`
✅ 20+ tests across unit, integration, and model categories
✅ All tests pass without Azure OpenAI credentials
✅ ≥ 80% code coverage on service and controller
✅ Total test runtime < 5 seconds
✅ `dotnet test backend-csharp/Tests/ --verbosity normal` → 0 failures
```

### Teaching Points

| Plan Mode Element | Purpose |
|-------------------|---------|
| Phased by test type | Unit → Integration → Model → Coverage |
| Specific file paths | `Tests/Services/`, `Tests/Controllers/`, `Tests/Helpers/` |
| Code snippets | `.csproj`, `WebApplicationFactory`, fixture JSON |
| Verification commands | `dotnet test` with filter flags |
| Success criteria | Measurable coverage and runtime targets |

---

<a id="demo-7-copilot-coding-agent-13-min"></a>
## Demo 7: Copilot Coding Agent (13 min)

### Objective
Delegate autonomous creation of the entire test suite to Copilot's coding agent — spanning test project scaffolding, helpers, unit tests, and integration tests.

### Scenario
Use the coding agent to create the complete test infrastructure identified in Demo 6's plan.

### Live Coding Steps

**Step 1: Invoke Copilot Agent with CORE Prompt**
```
Context: The Road Trip Planner C# backend (backend-csharp/) has zero tests.
The codebase consists of:

1. Program.cs (~38 lines) — App bootstrap, DI registration:
   services.AddSingleton<IAiParsingService, AiParsingService>()
   Health checks at "/health"
   CORS configured from "ALLOWED_ORIGINS" env var

2. Controllers/VehicleController.cs (58 lines):
   - POST /api/v1/parse-vehicle → validates Description, calls ParseVehicleAsync
   - POST /api/v1/generate-trip → validates Origin+Destination, calls GenerateTripAsync
   - Returns BadRequest(new { error = "..." }) for validation failures

3. Services/IAiParsingService.cs (10 lines):
   - ParseVehicleAsync(string description) → ParseVehicleResponse
   - GenerateTripAsync(string origin, string destination, List<string> interests) → GenerateTripResponse

4. Services/AiParsingService.cs (214 lines):
   - Constructor reads env vars: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT
   - _isConfigured flag controls AI vs fallback path
   - GetFallbackSpecs(string) — if/else chain: rv, truck, suv, van, car (default)
   - Fallback trip suggestions include origin/destination interpolation

5. Models/AiModels.cs (55 lines):
   - ParseVehicleRequest { Description }
   - VehicleSpecs { VehicleType, Length, Width, Height, Weight, MaxWeight, NumAxles, IsCommercial }
   - ParseVehicleResponse { Status, Specs, RawAiResponse }
   - GenerateTripRequest { Origin, Destination, Interests }
   - GenerateTripResponse { Status, Suggestions }

Tests/ directory does not exist yet — no .csproj, no folders.

Objective: Create the complete test project and test suite with the following
files:
1. Tests/RoadTrip.AiService.Tests.csproj — test project with all packages
2. Tests/Helpers/CustomWebApplicationFactory.cs — WebApplicationFactory with mock DI
3. Tests/Helpers/MockServiceBuilder.cs — reusable mock helpers
4. Tests/Services/AiParsingServiceFallbackTests.cs — unit tests for fallback logic
5. Tests/Services/AiParsingServiceTripTests.cs — unit tests for trip generation fallback
6. Tests/Controllers/ParseVehicleEndpointTests.cs — integration tests
7. Tests/Controllers/GenerateTripEndpointTests.cs — integration tests
8. Tests/Controllers/HealthEndpointTests.cs — health check tests
9. Tests/Models/ModelDefaultTests.cs — DTO default value tests

Requirements:
- xUnit 2.9+, Moq 4.20+, FluentAssertions 6.12+, Microsoft.AspNetCore.Mvc.Testing 8.0+
- Method_Scenario_ExpectedBehavior naming
- AAA pattern with section comments
- FluentAssertions everywhere (no raw Assert)
- All tests pass without Azure OpenAI credentials
- Integration tests use ConfigureTestServices to replace IAiParsingService with mock
- Target: 20+ tests covering all public methods and endpoints

Examples:
- Unit test: ParseVehicleAsync("rv motorhome") → Specs.VehicleType == "rv"
- Integration: POST /api/v1/parse-vehicle {"description":"truck"} → 200 OK
- Integration: POST /api/v1/parse-vehicle {"description":""} → 400 Bad Request
- Health: GET /health → 200 OK

Report progress after creating each file.
```

**Step 2: Agent Executes Autonomously**
```markdown
## Agent Progress Report

### File 1: Tests/RoadTrip.AiService.Tests.csproj ✅
Created test project with:
- xunit 2.9.0, Moq 4.20.70, FluentAssertions 6.12.0
- Microsoft.AspNetCore.Mvc.Testing 8.0.8
- coverlet.collector 6.0.2
- Project reference to ../../backend-csharp/RoadTrip.AiService.csproj

### File 2: Tests/Helpers/CustomWebApplicationFactory.cs ✅
```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public Mock<IAiParsingService> MockAiService { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IAiParsingService));
            if (descriptor != null) services.Remove(descriptor);
            services.AddSingleton(MockAiService.Object);
        });
        builder.UseEnvironment("Testing");
    }
}
```

### File 3: Tests/Helpers/MockServiceBuilder.cs ✅
Created with 3 factory methods:
- `CreateSuccessMock(VehicleSpecs specs)`
- `CreateTripMock(List<string> suggestions)`
- `CreateFailureMock<TException>(string message)`

### File 4: Tests/Services/AiParsingServiceFallbackTests.cs ✅
Created 7 tests:
- ParseVehicleAsync_RvDescription_ReturnsRvSpecs [Theory]
- ParseVehicleAsync_TruckDescription_ReturnsTruckSpecs [Theory]  
- ParseVehicleAsync_UnknownDescription_DefaultsToCar [Fact]
- ParseVehicleAsync_FallbackMode_StatusIsSuccess [Fact]
- ParseVehicleAsync_FallbackMode_RawResponseIsNull [Fact]
- ParseVehicleAsync_CaseInsensitive_MatchesUppercase [Fact]
- ParseVehicleAsync_MultipleKeywords_MatchesFirst [Fact]

### File 5: Tests/Services/AiParsingServiceTripTests.cs ✅
Created 3 tests:
- GenerateTripAsync_NoAzureConfig_ReturnsFallbackSuggestions [Fact]
- GenerateTripAsync_FallbackSuggestions_ContainOriginAndDestination [Fact]
- GenerateTripAsync_FallbackSuggestions_HasFourItems [Fact]

### File 6: Tests/Controllers/ParseVehicleEndpointTests.cs ✅
Created 5 tests:
- ParseVehicle_ValidDescription_Returns200WithSpecs [Fact]
- ParseVehicle_EmptyDescription_Returns400 [Theory with 3 InlineData]
- ParseVehicle_ValidInput_DelegatesToService [Fact]
- ParseVehicle_ResponseBody_MatchesServiceOutput [Fact]
- ParseVehicle_ContentType_IsApplicationJson [Fact]

### File 7: Tests/Controllers/GenerateTripEndpointTests.cs ✅
Created 5 tests:
- GenerateTrip_ValidRequest_Returns200WithSuggestions [Fact]
- GenerateTrip_MissingOriginOrDestination_Returns400 [Theory]
- GenerateTrip_ValidInput_DelegatesToServiceWithCorrectArgs [Fact]
- GenerateTrip_EmptyInterests_StillSucceeds [Fact]
- GenerateTrip_ResponseBody_ContainsSuggestionsList [Fact]

### File 8: Tests/Controllers/HealthEndpointTests.cs ✅
Created 2 tests:
- Health_Get_Returns200 [Fact]
- Health_Get_ReturnsHealthyStatus [Fact]

### File 9: Tests/Models/ModelDefaultTests.cs ✅
Created 5 tests:
- VehicleSpecs_Defaults_VehicleTypeIsCar [Fact]
- VehicleSpecs_Defaults_NumAxlesIsTwo [Fact]
- ParseVehicleRequest_Default_DescriptionIsEmpty [Fact]
- GenerateTripRequest_Default_InterestsIsEmpty [Fact]
- ParseVehicleResponse_Default_StatusIsSuccess [Fact]

### Summary
| Category | Files | Tests | Status |
|----------|-------|-------|--------|
| Infrastructure | 3 | — | ✅ |
| Unit Tests | 2 | 10 | ✅ |
| Integration Tests | 3 | 12 | ✅ |
| Model Tests | 1 | 5 | ✅ |
| **Total** | **9** | **27** | ✅ |

### Verification
```bash
dotnet test backend-csharp/Tests/ --verbosity normal
# Expected: 27 tests passed, 0 failed, 0 skipped
```
```

### Teaching Points

| Agent Capability | What It Did |
|-----------------|-------------|
| Multi-file creation | 9 files across 4 directories |
| Consistent patterns | AAA + FluentAssertions + `Method_Scenario_Expected` in every test |
| Dependency awareness | Correct project references and NuGet versions |
| Progress reporting | Per-file completion with test counts |
| Verification output | `dotnet test` command with expected results |

**Agent Prompt Best Practices (CORE)**:
```
Context:  List every source file with line counts, classes, and methods
Objective: Enumerate every file to create with specific test methods
Requirements: Package versions, naming conventions, assertion patterns
Examples: Input/output pairs for each test type (unit, integration, model)
```

---

<a id="demo-8-architecture--tech-stack-generation-8-min"></a>
## Demo 8: Architecture & Tech Stack Generation (8 min)

### Objective
Use Copilot to generate the complete test project structure and an Architecture Decision Record (ADR) documenting the testing strategy.

### Scenario
Generate the test project scaffolding with all directories, and create an ADR justifying the xUnit + Moq + FluentAssertions stack choice.

---

### Step 1: Generate Test Project Structure with CORE Prompt

```
Context: The Road Trip Planner C# backend (backend-csharp/) uses:
- ASP.NET Web API (.NET 8) with controllers and DI
- IAiParsingService interface with AiParsingService implementation
- Azure OpenAI SDK (Azure.AI.OpenAI 2.1.0) for AI parsing
- Fallback mode when Azure OpenAI is not configured
- Tests/ directory does not exist yet — must be created from scratch
- Existing test patterns in other backends:
  Python: pytest + conftest.py fixtures + tests/fixtures/ JSON files
  Java (planned): JUnit 5 + MockWebServer + src/test/resources/fixtures/

Objective: Generate the complete test project directory structure,
including all files needed for unit, integration, and acceptance testing.

Requirements:
- xUnit 2.9+ as test framework (matches team decision in CSHARP_BACKEND_ROADMAP.md)
- Moq 4.20+ for interface mocking
- FluentAssertions 6.12+ for readable assertions
- Microsoft.AspNetCore.Mvc.Testing 8.0+ for WebApplicationFactory
- coverlet.collector for code coverage
- Mirror the fixture-based test data pattern from Python backend
- Separate test classes by source file being tested
- Include helpers for WebApplicationFactory and mock builders

Examples:
- Python pattern to mirror:
  backend/tests/conftest.py → Tests/Helpers/CustomWebApplicationFactory.cs
  backend/tests/fixtures/*.json → Tests/Fixtures/*.json
  backend/tests/test_main.py → Tests/Controllers/VehicleControllerTests.cs
```

**Expected Copilot Output — Project Structure:**
```
backend-csharp/Tests/
├── RoadTrip.AiService.Tests.csproj
├── GlobalUsings.cs
├── Helpers/
│   ├── CustomWebApplicationFactory.cs
│   └── MockServiceBuilder.cs
├── Fixtures/
│   ├── valid_parse_vehicle_request.json
│   ├── valid_generate_trip_request.json
│   ├── expected_rv_specs.json
│   ├── expected_truck_specs.json
│   ├── expected_car_specs.json
│   └── expected_fallback_suggestions.json
├── Services/
│   ├── AiParsingServiceFallbackTests.cs
│   └── AiParsingServiceTripTests.cs
├── Controllers/
│   ├── ParseVehicleEndpointTests.cs
│   ├── GenerateTripEndpointTests.cs
│   └── HealthEndpointTests.cs
└── Models/
    └── ModelDefaultTests.cs
```

**Generated `GlobalUsings.cs`:**
```csharp
// Tests/GlobalUsings.cs — shared across all test files
global using Xunit;
global using FluentAssertions;
global using Moq;
global using RoadTrip.AiService.Models;
global using RoadTrip.AiService.Services;
```

**Generated `CustomWebApplicationFactory.cs`:**
```csharp
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace RoadTrip.AiService.Tests.Helpers;

/// <summary>
/// Custom WebApplicationFactory that replaces IAiParsingService with a Moq mock.
/// Usage: Inherit IClassFixture<CustomWebApplicationFactory> in integration tests.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    /// <summary>
    /// Pre-configured mock — configure per-test via Setup().
    /// </summary>
    public Mock<IAiParsingService> MockAiService { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Remove the real AiParsingService registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IAiParsingService));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Register the mock
            services.AddSingleton(MockAiService.Object);
        });

        builder.UseEnvironment("Testing");
    }
}
```

**Generated Fixture File (`expected_rv_specs.json`):**
```json
{
  "vehicleType": "rv",
  "length": 10.0,
  "width": 2.5,
  "height": 3.5,
  "weight": 8000,
  "maxWeight": 10000,
  "numAxles": 3,
  "isCommercial": false
}
```

---

### Step 2: Generate Architecture Decision Record (ADR)

```
Context: The Road Trip Planner C# backend needs a testing strategy.
Current state:
- Zero tests in backend-csharp/Tests/
- 5 SOLID violations affecting testability (documented in CSHARP_BACKEND_ROADMAP.md)
- Other backends use: Python → pytest, Java → JUnit 5 (planned)
- .NET ecosystem offers three main frameworks: xUnit, NUnit, MSTest
- Mocking options: Moq, NSubstitute, FakeItEasy
- Assertion options: FluentAssertions, Shouldly, raw xUnit Assert

Objective: Generate an ADR documenting the testing framework decision and
rationale for xUnit + Moq + FluentAssertions.

Requirements:
- Follow the ADR format used in docs/adr/ (Title, Status, Context, Decision,
  Alternatives, Consequences)
- Include comparison table of frameworks
- Justify each choice with specific technical reasons
- Reference Microsoft's official testing documentation
- Include migration path if the team wants to change later

Examples of ADR format: see docs/adr/ for existing ADRs
```

**Expected Copilot Output:**
```markdown
<!-- docs/adr/004-csharp-testing-strategy.md -->

# ADR 004: C# Backend Testing Strategy

## Status
Accepted

## Context
The `backend-csharp/` service has zero tests and 5 SOLID violations that
affect testability (DIP-1, DIP-2, SRP-1, SRP-2, ISP-1). We need to
establish a testing framework, mocking library, assertion library, and
integration testing approach before writing any tests.

Key constraints:
- .NET 8 target framework
- ASP.NET Web API with dependency injection
- Azure OpenAI SDK must be mockable
- Tests must pass without external API credentials
- Team has existing pytest (Python) and planned JUnit (Java) experience
- Microsoft recommends xUnit for new .NET projects (docs.microsoft.com)

## Decision

### Test Framework: xUnit 2.9+

| Criterion | xUnit | NUnit | MSTest |
|-----------|-------|-------|--------|
| .NET Core support | First-class | Good | Good |
| Microsoft recommendation | Default in templates | — | Official but older |
| Parallel execution | Per-class default | Configurable | Configurable |
| Constructor injection | ✅ New instance per test | — | — |
| Theory + InlineData | ✅ | TestCase | DataRow |
| Community adoption | Highest for .NET Core | Strong | Moderate |

**Rationale**: xUnit is the de facto standard for .NET Core testing. Its
constructor-per-test pattern naturally enforces test isolation. Microsoft's
ASP.NET Core documentation uses xUnit exclusively for integration test
examples.

### Mocking Library: Moq 4.20+

| Criterion | Moq | NSubstitute | FakeItEasy |
|-----------|-----|-------------|------------|
| Syntax | `Setup().Returns()` | `Returns()` direct | `A.CallTo().Returns()` |
| Verification | `Verify(Times.Once)` | `Received(1)` | `MustHaveHappened()` |
| Strictness | Loose default | Loose | Loose |
| Popularity | Most popular | Growing | Moderate |

**Rationale**: Moq is the most widely used mocking library in .NET. Its
`Setup/Verify` pattern aligns with the AAA structure. The CSHARP_BACKEND_ROADMAP.md
already specifies Moq for Task 1.1.

### Assertion Library: FluentAssertions 6.12+

| Criterion | FluentAssertions | Shouldly | Raw xUnit Assert |
|-----------|-----------------|----------|-------------------|
| Readability | `.Should().Be()` | `.ShouldBe()` | `Assert.Equal()` |
| Error messages | Detailed, contextual | Good | Basic |
| Collection support | `.Should().Contain()` | `.ShouldContain()` | `Assert.Contains()` |
| Async support | `.Should().ThrowAsync()` | `.ShouldThrow()` | `Assert.ThrowsAsync()` |

**Rationale**: FluentAssertions produces the most descriptive failure messages
and reads like natural language. This is critical for a team learning TDD.

### Integration Testing: WebApplicationFactory<Program>

**Rationale**: Microsoft's official approach for ASP.NET Core integration
testing. `ConfigureTestServices` allows replacing `IAiParsingService` with
a Moq mock, avoiding Azure OpenAI calls entirely.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **xUnit + Moq + FluentAssertions** ✅ | Industry standard, best docs | Moq licensing controversy (resolved) |
| NUnit + NSubstitute + Shouldly | Simpler syntax | Less ASP.NET Core documentation |
| MSTest + FakeItEasy | Microsoft-native | Older patterns, less community content |
| Playwright for .NET (E2E) | Real browser testing | Overkill for API backend |

## Consequences

### Positive
- Aligns with Microsoft documentation and ASP.NET Core templates
- Moq's `Setup/Verify` pattern coaches developers on proper dependency isolation
- FluentAssertions failure messages are self-explanatory in CI output
- `WebApplicationFactory` tests the full middleware pipeline without network calls

### Negative
- FluentAssertions adds ~50KB analysis dependency to test project
- Moq uses Castle.Core for proxy generation (slightly complex under the hood)
- Team must learn three libraries (xUnit + Moq + FluentAssertions) instead of one

### Migration Path
If the team wants to switch later:
- xUnit → NUnit: Rename `[Fact]` to `[Test]`, `[Theory]` to `[TestCase]`
- Moq → NSubstitute: Replace `Setup().Returns()` with `Returns()` syntax
- FluentAssertions → Shouldly: Replace `.Should().Be()` with `.ShouldBe()`
```

---

### Teaching Points

| Generation Type | CORE Element | Example |
|----------------|-------------|---------|
| Test project structure | **C**: Zero tests, existing patterns | Directory tree + `.csproj` |
| ADR generation | **C**: Current state, alternatives | Framework comparison tables |
| Project scaffolding | **O**: Complete test directory | 12 files + fixtures |
| Tech evaluation | **R**: .NET 8 compatibility, TDD mandate | xUnit vs NUnit vs MSTest |

---

## Workshop Summary

### 8 Advanced Techniques Mastered — All Applied to C# Testing

| # | Technique | CORE Focus | C# Testing Application |
|---|-----------|-----------|----------------------|
| 1 | **Chain-of-Thought** | Numbered steps as **R**equirements | Unit + integration + mock tests for `AiParsingService` |
| 2 | **Tree of Thought** | Branching **O**bjectives with evaluation criteria | Test strategy decision, mock architecture, DIP coverage gap analysis |
| 3 | **Instruction Files** | **R**ules with ❌/✅ patterns | Naming, AAA, FluentAssertions, isolation, verification rules |
| 4 | **Prompt Files** | Full **CORE** templates | `csharp-unit-test.prompt.md`, `csharp-integration-test.prompt.md`, `csharp-moq-service.prompt.md` |
| 5 | **Code Review** | **C**ontext of PR, **R**eview criteria | 8-point quality checklist for test PRs |
| 6 | **Plan Mode** | Phased **O**bjectives with verification | 6-phase plan from zero to 80% coverage |
| 7 | **Coding Agent** | **E**xamples showing per-file deliverables | 9 files, 27 tests, autonomous creation |
| 8 | **Architecture Gen** | **C**ontext of existing stack, **E**xample ADR | Test project scaffolding + framework decision ADR |

### CORE Quick Reference for C# Testing

```markdown
# CORE Prompt Template — C# Testing

Context: [Source file under test, class name, method signatures, DI dependencies,
         current test coverage state, known SOLID violations]

Objective: [Test type: unit/integration/model/edge-case, specific methods to test,
           coverage target]

Requirements: [xUnit patterns (Fact/Theory), Moq setup, FluentAssertions syntax,
              naming convention, AAA structure, test isolation rules]

Examples: [Input → Expected output pairs using real DTOs:
          ParseVehicleAsync("rv description") → VehicleType == "rv"
          POST /api/v1/parse-vehicle {desc:""} → 400 BadRequest]
```

### Technique Quick Reference

```
# Chain-of-Thought (C# Unit Test)
"""
Step 1: [arrange — create service with mock dependencies]
Step 2: [act — call the method under test]
Step 3: [assert — FluentAssertions on response]
Step 4: [edge case — null/empty/whitespace inputs]
Step 5: [mock verification — Verify() on interactions]
Now implement:
"""

# Tree of Thought (Test Strategy / Architecture Decision)
"""
Context: [source file structure, current SOLID violations, test constraints]
Objective: Evaluate [N] approaches to [decision] and recommend the best.
Branch A — [approach name]: [brief description]
  Coverage: [%], Speed: [ms], Complexity: [low/med/high], SOLID: [✅/⚠️/❌]
Branch B — [approach name]: [brief description]
  Coverage: [%], Speed: [ms], Complexity: [low/med/high], SOLID: [✅/⚠️/❌]
Branch C — [approach name]: [brief description]
  Coverage: [%], Speed: [ms], Complexity: [low/med/high], SOLID: [✅/⚠️/❌]
Evaluate against: [constraints list]
Select the best branch and provide the implementation.
"""
# Instruction File (.github/copilot-instructions.md)
### C# Testing Standards
// ❌ WRONG — [Fact] public async Task TestParse() { }
// ✅ CORRECT — [Fact] public async Task ParseVehicleAsync_Rv_ReturnsRvSpecs() { }

# Prompt File (.github/prompts/csharp-unit-test.prompt.md)
## Context — AiParsingService, VehicleSpecs, fallback mode
## Objective — xUnit tests with full path coverage
## Requirements — [Theory], FluentAssertions, AAA
## Examples — Input/output pairs with real DTOs

# Code Review
Context: [Test PR files, current standards]
Objective: [Quality check: naming, isolation, assertions, coverage]
Requirements: [8-point checklist]
Examples: [Issues to flag per category]

# Plan Mode
Context: [Zero tests, SOLID violations, source file inventory]
Objective: [Phased plan from scaffolding to 80% coverage]
Requirements: [NuGet packages, project structure, TDD workflow]
Examples: [dotnet test commands, coverage targets]

# Coding Agent
Context: [All source files with line counts and methods]
Objective: [Create 9 files with 27+ tests]
Requirements: [Per-file test lists, naming, patterns]
Examples: [Expected test output per file]

# Architecture Generation
Context: [Zero tests, existing Python/Java patterns]
Objective: [Test project structure + ADR]
Requirements: [Framework comparison, migration path]
Examples: [Directory tree, .csproj, comparison tables]
```

### TDD Workflow Reminder

Every test in this workshop follows **strict TDD**:

```
1. RED   — Write a failing test that defines expected behavior
2. GREEN — Write the minimum code to make the test pass
3. REFACTOR — Clean up without changing behavior, all tests still pass
```

**Verification after each change:**
```bash
cd backend-csharp/Tests
dotnet test --verbosity normal
```

**Coverage measurement:**
```bash
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults
```

**Target**: ≥ 80% line coverage on all non-generated code

---

## Resources

### Microsoft Documentation
- [Unit Testing Best Practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices) — Naming, AAA, avoiding magic strings
- [Integration Tests in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests) — `WebApplicationFactory`, `ConfigureTestServices`
- [Testing with `dotnet test`](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-dotnet-test) — CLI commands, coverage collection
- [xUnit Documentation](https://xunit.net/docs/getting-started/netcore/cmdline) — `[Fact]`, `[Theory]`, `[InlineData]`, `IClassFixture`

### Project Files
- **Instruction File**: `.github/copilot-instructions.md`
- **Prompt Files**: `.github/prompts/csharp-*.prompt.md`
- **Roadmap**: `docs/CSHARP_BACKEND_ROADMAP.md` (Epics 1-8)
- **ADR Template**: `docs/adr/`

### File Reference (Used in This Workshop)

| File | Purpose | Used In Demos |
|------|---------|--------------|
| `backend-csharp/Services/AiParsingService.cs` | AI parsing + fallback (~210 lines) | 1A, 1C, 2A, 2B, 2C, 4, 6, 7 |
| `backend-csharp/Controllers/VehicleController.cs` | REST endpoints (58 lines) | 1B, 1C, 2B, 5, 6, 7 |
| `backend-csharp/Services/IAiParsingService.cs` | Service interface (10 lines) | 1B, 1C, 2B, 4, 7 |
| `backend-csharp/Models/AiModels.cs` | DTOs: requests, responses (55 lines) | 1A, 1B, 4, 6, 7 |
| `backend-csharp/Program.cs` | App bootstrap, DI (~38 lines) | 1B, 6, 8 |
| `backend-csharp/Tests/` | Test project (to be created) | All demos |
| `.github/copilot-instructions.md` | Project-wide Copilot rules | 3 |
| `.github/prompts/*.prompt.md` | Reusable prompt templates | 4 |
| `docs/CSHARP_BACKEND_ROADMAP.md` | SOLID violations + test plan | 2C, 6, 7 |
| `docs/adr/004-csharp-testing-strategy.md` | Testing framework ADR | 8 |

### xUnit vs NUnit vs MSTest Quick Reference

| Feature | xUnit | NUnit | MSTest |
|---------|-------|-------|--------|
| Test attribute | `[Fact]` | `[Test]` | `[TestMethod]` |
| Parameterized | `[Theory]` + `[InlineData]` | `[TestCase]` | `[DataRow]` |
| Setup | Constructor | `[SetUp]` | `[TestInitialize]` |
| Teardown | `IDisposable` | `[TearDown]` | `[TestCleanup]` |
| Shared context | `IClassFixture<T>` | `[OneTimeSetUp]` | `[ClassInitialize]` |
| Parallel | Per-class (default) | Configurable | Configurable |
| Instance per test | ✅ New instance | ❌ Reused | ❌ Reused |
