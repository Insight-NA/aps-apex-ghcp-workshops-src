using RoadTrip.AiService.Models;

namespace RoadTrip.AiService.Services;

public interface IAiParsingService
{
    Task<ParseVehicleResponse> ParseVehicleAsync(string description);
    Task<GenerateTripResponse> GenerateTripAsync(string origin, string destination, List<string> interests);
}
