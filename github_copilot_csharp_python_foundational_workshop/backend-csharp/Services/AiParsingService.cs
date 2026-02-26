using System.Text.Json;
using Azure;
using Azure.AI.OpenAI;
using OpenAI.Chat;
using RoadTrip.AiService.Models;

namespace RoadTrip.AiService.Services;

/// <summary>
/// AI-powered vehicle parsing and trip generation using Azure OpenAI.
/// Falls back to rule-based defaults when Azure OpenAI is not configured.
/// </summary>
public class AiParsingService : IAiParsingService
{
    private readonly ILogger<AiParsingService> _logger;
    private readonly string? _endpoint;
    private readonly string? _apiKey;
    private readonly string? _deployment;
    private readonly bool _isConfigured;

    private const string VehicleParsingSystemPrompt = @"You are a vehicle specification parser. Given a vehicle description, 
extract structured specifications. Return ONLY valid JSON with this exact schema:
{
  ""vehicleType"": ""car|truck|suv|rv|van|motorcycle"",
  ""length"": <meters as number>,
  ""width"": <meters as number>,
  ""height"": <meters as number>,
  ""weight"": <kg as number>,
  ""maxWeight"": <kg as number>,
  ""numAxles"": <integer>,
  ""isCommercial"": <boolean>
}
Use reasonable defaults if specific values aren't mentioned. Return ONLY the JSON object, no markdown.";

    public AiParsingService(ILogger<AiParsingService> logger)
    {
        _logger = logger;
        _endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT");
        _apiKey = Environment.GetEnvironmentVariable("AZURE_OPENAI_API_KEY");
        _deployment = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT");
        _isConfigured = !string.IsNullOrEmpty(_endpoint)
                     && !string.IsNullOrEmpty(_apiKey)
                     && !string.IsNullOrEmpty(_deployment);

        if (!_isConfigured)
        {
            _logger.LogWarning("Azure OpenAI is not configured. Using rule-based fallback for vehicle parsing.");
        }
    }

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

    public async Task<GenerateTripResponse> GenerateTripAsync(
        string origin, string destination, List<string> interests)
    {
        if (_isConfigured)
        {
            try
            {
                return await GenerateWithAzureOpenAI(origin, destination, interests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Azure OpenAI trip generation failed, using fallback");
            }
        }

        // Fallback suggestions
        return new GenerateTripResponse
        {
            Status = "success",
            Suggestions = new List<string>
            {
                $"Scenic route from {origin} to {destination}",
                "National parks along the route",
                "Historic landmarks at the midpoint",
                "Local restaurants and diners",
            },
        };
    }

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

    private async Task<GenerateTripResponse> GenerateWithAzureOpenAI(
        string origin, string destination, List<string> interests)
    {
        var client = new AzureOpenAIClient(
            new Uri(_endpoint!),
            new AzureKeyCredential(_apiKey!));

        var chatClient = client.GetChatClient(_deployment!);

        var interestsStr = string.Join(", ", interests);
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage("You are a road trip planner. Suggest interesting stops and activities. Return a JSON array of suggestion strings."),
            new UserChatMessage($"Plan a road trip from {origin} to {destination}. Interests: {interestsStr}"),
        };

        ChatCompletion completion = await chatClient.CompleteChatAsync(messages);
        var rawResponse = completion.Content[0].Text;

        var suggestions = JsonSerializer.Deserialize<List<string>>(rawResponse) ?? new List<string>();

        return new GenerateTripResponse
        {
            Status = "success",
            Suggestions = suggestions,
        };
    }

    /// <summary>
    /// Rule-based fallback when Azure OpenAI is unavailable.
    /// </summary>
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
            return new VehicleSpecs
            {
                VehicleType = "truck", Length = 6.0, Width = 2.0, Height = 2.0,
                Weight = 3000, MaxWeight = 5000, NumAxles = 2, IsCommercial = false,
            };
        }

        if (lower.Contains("suv") || lower.Contains("sport utility"))
        {
            return new VehicleSpecs
            {
                VehicleType = "suv", Length = 5.0, Width = 2.0, Height = 1.8,
                Weight = 2200, MaxWeight = 3000, NumAxles = 2, IsCommercial = false,
            };
        }

        if (lower.Contains("van") || lower.Contains("minivan") || lower.Contains("sprinter"))
        {
            return new VehicleSpecs
            {
                VehicleType = "van", Length = 5.5, Width = 2.0, Height = 2.0,
                Weight = 2500, MaxWeight = 3500, NumAxles = 2, IsCommercial = false,
            };
        }

        // Default: sedan/car
        return new VehicleSpecs
        {
            VehicleType = "car", Length = 4.5, Width = 1.8, Height = 1.5,
            Weight = 1500, MaxWeight = 2000, NumAxles = 2, IsCommercial = false,
        };
    }
}
