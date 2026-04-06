using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using RoadTrip.AiService.Services;

namespace RoadTrip.AiService.Tests.Services;

/// <summary>
/// Verifies the rule-based GetFallbackSpecs logic via the public ParseVehicleAsync surface.
/// Azure OpenAI env vars are deliberately cleared so _isConfigured = false and the
/// fallback path is guaranteed to execute.
/// </summary>
public class AiParsingServiceFallbackTests
{
    private readonly AiParsingService _sut;

    public AiParsingServiceFallbackTests()
    {
        // Arrange (shared) — clear Azure OpenAI config to force the fallback path
        Environment.SetEnvironmentVariable("AZURE_OPENAI_ENDPOINT",   null);
        Environment.SetEnvironmentVariable("AZURE_OPENAI_API_KEY",    null);
        Environment.SetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT", null);

        var loggerMock = new Mock<ILogger<AiParsingService>>();
        _sut = new AiParsingService(loggerMock.Object);
    }

    // -------------------------------------------------------------------------
    //  1. Core fallback: one [InlineData] per vehicle type including the default
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("2024 Winnebago View 24D motorhome", "rv",    3.5, 8000.0)]
    [InlineData("Ford F-150 truck",                  "truck", 2.0, 3000.0)]
    [InlineData("Toyota RAV4 SUV",                   "suv",   1.8, 2200.0)]
    [InlineData("Ford Transit van",                  "van",   2.0, 2500.0)]
    [InlineData("Honda Civic",                       "car",   1.5, 1500.0)]
    public async Task ParseVehicleAsync_WithFallbackPath_ReturnsExpectedVehicleTypeAndKeyDimensions(
        string description,
        string expectedVehicleType,
        double expectedHeight,
        double expectedWeight)
    {
        // Act
        var result = await _sut.ParseVehicleAsync(description);

        // Assert
        result.Specs.VehicleType.Should().Be(expectedVehicleType);
        result.Specs.Height.Should().Be(expectedHeight);
        result.Specs.Weight.Should().Be(expectedWeight);
    }

    // -------------------------------------------------------------------------
    //  2. Alternative keyword triggers map to the same vehicle type
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("Weekend recreational vehicle journey",  "rv")]
    [InlineData("18-wheel semi crossing the state line", "truck")]
    [InlineData("Chevrolet Tahoe sport utility vehicle", "suv")]
    [InlineData("Honda Odyssey minivan",                 "van")]
    [InlineData("Mercedes Sprinter cargo carrier",       "van")]
    public async Task ParseVehicleAsync_WithAlternativeKeyword_ReturnsCorrectVehicleType(
        string description,
        string expectedVehicleType)
    {
        // Act
        var result = await _sut.ParseVehicleAsync(description);

        // Assert
        result.Specs.VehicleType.Should().Be(expectedVehicleType);
    }

    // -------------------------------------------------------------------------
    //  3. Response envelope: Status and RawAiResponse for every fallback branch
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("2024 Winnebago View 24D motorhome")]
    [InlineData("Ford F-150 truck")]
    [InlineData("Toyota RAV4 SUV")]
    [InlineData("Ford Transit van")]
    [InlineData("Honda Civic")]
    public async Task ParseVehicleAsync_WhenFallbackIsUsed_ReturnsSuccessStatusWithNullAiResponse(
        string description)
    {
        // Act
        var result = await _sut.ParseVehicleAsync(description);

        // Assert
        result.Status.Should().Be("success");
        result.RawAiResponse.Should().BeNull();
    }

    // -------------------------------------------------------------------------
    //  4. Numeric sanity: every fallback spec must have positive dimensions
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("2024 Winnebago View 24D motorhome")]
    [InlineData("Ford F-150 truck")]
    [InlineData("Toyota RAV4 SUV")]
    [InlineData("Ford Transit van")]
    [InlineData("Honda Civic")]
    public async Task ParseVehicleAsync_WhenFallbackIsUsed_AllDimensionsArePositive(
        string description)
    {
        // Act
        var result = await _sut.ParseVehicleAsync(description);

        // Assert
        result.Specs.Length.Should().BeGreaterThan(0);
        result.Specs.Width.Should().BeGreaterThan(0);
        result.Specs.Height.Should().BeGreaterThan(0);
        result.Specs.Weight.Should().BeGreaterThan(0);
        result.Specs.MaxWeight.Should().BeGreaterThan(0);
        result.Specs.NumAxles.Should().BeGreaterThan(0);
    }

    // -------------------------------------------------------------------------
    //  5. Default car path: no keyword in description falls back to "car"
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("Honda Civic 2022",    "car", 4.5, 1.8, 1.5, 1500, 2000, 2)]
    [InlineData("Tesla Model 3",       "car", 4.5, 1.8, 1.5, 1500, 2000, 2)]
    [InlineData("generic family sedan","car", 4.5, 1.8, 1.5, 1500, 2000, 2)]
    public async Task ParseVehicleAsync_WithNoKeywordMatch_ReturnsDefaultCarSpecs(
        string description,
        string expectedVehicleType,
        double expectedLength,
        double expectedWidth,
        double expectedHeight,
        double expectedWeight,
        double expectedMaxWeight,
        int    expectedNumAxles)
    {
        // Act
        var result = await _sut.ParseVehicleAsync(description);

        // Assert — full spec match for the default "car" branch
        result.Specs.VehicleType.Should().Be(expectedVehicleType);
        result.Specs.Length.Should().Be(expectedLength);
        result.Specs.Width.Should().Be(expectedWidth);
        result.Specs.Height.Should().Be(expectedHeight);
        result.Specs.Weight.Should().Be(expectedWeight);
        result.Specs.MaxWeight.Should().Be(expectedMaxWeight);
        result.Specs.NumAxles.Should().Be(expectedNumAxles);
        result.Specs.IsCommercial.Should().BeFalse();
    }
}
