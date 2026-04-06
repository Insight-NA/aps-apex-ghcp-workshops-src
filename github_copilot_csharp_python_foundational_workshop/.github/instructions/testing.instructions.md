---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/tests/**/*.py,**/*_test.py,backend-java/**/test/**/*.java,backend-csharp/**/*Tests.cs"
---
# Testing Standards — All Services

Apply the [general architecture rules](../copilot-instructions.md) alongside these testing rules.

## Core Mandate
- **TDD first**: Write the test, then write the implementation
- **Never** hit real external APIs in tests (Mapbox, Azure Maps, Azure OpenAI, Google OAuth)
- **Focus on behaviour**, not implementation details

---

## Frontend — Vitest + React Testing Library

```bash
cd frontend
npm test                   # run all
npm test -- --watch        # watch mode
npm test -- --coverage     # coverage
```

### Component Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock Zustand store
vi.mock('@/store/useTripStore', () => ({
  useTripStore: vi.fn((selector) => selector({
    stops: [],
    addStop: vi.fn(),
  })),
}));

describe('StopCard', () => {
  it('renders stop name', () => {
    render(<StopCard stop={{ id: '1', name: 'Denver', type: 'stop' }} />);
    expect(screen.getByText('Denver')).toBeInTheDocument();
  });
});
```
- See [frontend/src/test/useTripStore.test.ts](../../frontend/src/test/useTripStore.test.ts) for Zustand mock pattern
- Test files live next to source files: `ComponentName.test.tsx`

### What NOT to Test
- Internal state variables
- CSS class names (unless critical to behaviour)
- Implementation details of third-party libraries

---

## Python — Pytest + FastAPI TestClient

```bash
cd backend
pytest tests/ -v
pytest tests/test_main.py::test_health_check   # single test
pytest --cov=. --cov-report=html               # coverage
```

### Endpoint Tests
```python
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)

def test_get_trip_returns_404_when_not_found():
    response = client.get("/trips/99999")
    assert response.status_code == 404

# Always mock external services
@patch("ai_service.call_azure_openai")
def test_parse_vehicle_succeeds(mock_openai):
    mock_openai.return_value = {"make": "Ford", "model": "F-150"}
    response = client.post("/api/v1/parse-vehicle", json={"description": "2022 Ford F-150"})
    assert response.status_code == 200
```
- All tests in `backend/tests/`
- Prefix test functions: `test_`
- Use `pytest.fixture` for DB sessions and test data

---

## Java — JUnit 5 + Mockito + Spring Boot Test

```bash
cd backend-java
./mvnw test
./mvnw test -Dtest=DirectionsServiceTest
```

### Unit Tests (Service Layer)
```java
@ExtendWith(MockitoExtension.class)
class DirectionsServiceTest {
    @Mock RestTemplate restTemplate;
    @InjectMocks DirectionsService service;

    @Test
    void getDirections_returnsRoute_whenMapboxResponds() {
        // Arrange
        when(restTemplate.getForObject(anyString(), eq(MapboxResponse.class)))
            .thenReturn(new MapboxResponse(...));
        // Act & Assert
        assertThat(service.getDirections(request)).isNotNull();
    }
}
```

### Controller Tests
```java
@WebMvcTest(DirectionsController.class)
class DirectionsControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean DirectionsService directionsService;
    // ...
}
```

---

## C# — xUnit + Moq + WebApplicationFactory

```bash
cd backend-csharp
dotnet test
dotnet test --filter "DisplayName~VehicleParser"
```

### Service Tests
```csharp
public class VehicleParserServiceTests {
    [Fact]
    public async Task ParseAsync_ReturnsSpecs_WhenOpenAIResponds() {
        // Arrange
        var mockClient = new Mock<IOpenAIClient>();
        mockClient.Setup(c => c.CompleteAsync(It.IsAny<string>()))
                  .ReturnsAsync(new CompletionResult { Text = "{\"make\":\"Ford\"}" });
        var svc = new VehicleParserService(mockClient.Object, Options.Create(new AzureOpenAIOptions()));
        // Act
        var result = await svc.ParseAsync("2022 Ford F-150");
        // Assert
        Assert.Equal("Ford", result.Make);
    }
}
```
