using Microsoft.AspNetCore.Mvc;
using RoadTrip.AiService.Models;
using RoadTrip.AiService.Services;

namespace RoadTrip.AiService.Controllers;

[ApiController]
[Route("api/v1")]
public class VehicleController : ControllerBase
{
    private readonly IAiParsingService _aiService;
    private readonly ILogger<VehicleController> _logger;

    public VehicleController(IAiParsingService aiService, ILogger<VehicleController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>
    /// Parse a vehicle description into structured specs using Azure OpenAI.
    /// Falls back to rule-based parsing when AI is unavailable.
    /// </summary>
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

    /// <summary>
    /// Generate trip suggestions using Azure OpenAI.
    /// </summary>
    [HttpPost("generate-trip")]
    public async Task<ActionResult<GenerateTripResponse>> GenerateTrip(
        [FromBody] GenerateTripRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Origin) || string.IsNullOrWhiteSpace(request.Destination))
        {
            return BadRequest(new { error = "origin and destination are required" });
        }

        _logger.LogInformation("Generating trip: {Origin} → {Destination}", request.Origin, request.Destination);
        var result = await _aiService.GenerateTripAsync(request.Origin, request.Destination, request.Interests);
        return Ok(result);
    }
}
