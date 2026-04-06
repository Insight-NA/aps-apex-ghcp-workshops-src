---
name: csharp-constants-extraction
description: "Extract all hardcoded strings from C# files into a centralized Constants class. Covers error messages, config keys, route paths, and magic values."
---

## Context
The C# AI service (`backend-csharp/`) has 12+ hardcoded strings scattered across `Program.cs`, `VehicleController.cs`, `AiParsingService.cs`, and `AiModels.cs`. The `csharp.instructions.md` requires centralized constants.

## Objective
Extract all hardcoded strings from `backend-csharp/` into organized constant classes.

## Requirements

### File Structure
Create `backend-csharp/Constants/` directory with:

```csharp
// Constants/ErrorMessages.cs
namespace RoadTrip.AiService.Constants;

public static class ErrorMessages
{
    public const string VehicleDescriptionRequired = "Vehicle description is required.";
    public const string TripGenerationFailed = "Trip generation failed.";
    public const string AiServiceUnavailable = "AI service is unavailable. Using fallback parsing.";
    // ... all error strings from controllers and services
}

// Constants/ConfigKeys.cs
namespace RoadTrip.AiService.Constants;

public static class ConfigKeys
{
    public const string AzureOpenAiEndpoint = "AzureOpenAi:Endpoint";
    public const string AzureOpenAiApiKey = "AzureOpenAi:ApiKey";
    public const string AzureOpenAiDeployment = "AzureOpenAi:DeploymentName";
    // ... all configuration key strings
}

// Constants/RouteConstants.cs
namespace RoadTrip.AiService.Constants;

public static class RouteConstants
{
    public const string ParseVehicle = "parse-vehicle";
    public const string GenerateTrip = "generate-trip";
    public const string HealthCheck = "health";
}
```

### Extraction Rules
1. Search all `.cs` files for string literals
2. Skip: `nameof()`, `string.Empty`, single-character strings, test files
3. Group by purpose: ErrorMessages, ConfigKeys, RouteConstants, PromptTemplates
4. Replace inline strings with constant references
5. Run all tests after each file change

## Example
```csharp
// ❌ Before
return BadRequest("Vehicle description cannot be empty");

// ✅ After
return BadRequest(ErrorMessages.VehicleDescriptionRequired);
```

Use `@csharp-implementer` to execute this extraction with TDD (Red → Green → Refactor).
