namespace RoadTrip.AiService.Models;

/// <summary>
/// Request to parse a vehicle description into structured specs.
/// </summary>
public class ParseVehicleRequest
{
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Structured vehicle specifications parsed from natural language.
/// </summary>
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

/// <summary>
/// Response wrapper for vehicle parsing.
/// </summary>
public class ParseVehicleResponse
{
    public string Status { get; set; } = "success";
    public VehicleSpecs Specs { get; set; } = new();
    public string? RawAiResponse { get; set; }
}

/// <summary>
/// Request to generate trip suggestions.
/// </summary>
public class GenerateTripRequest
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public List<string> Interests { get; set; } = new();
}

/// <summary>
/// Response for trip generation.
/// </summary>
public class GenerateTripResponse
{
    public string Status { get; set; } = "success";
    public List<string> Suggestions { get; set; } = new();
}
