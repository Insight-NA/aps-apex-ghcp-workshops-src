---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/tests/**/*.py,**/*_test.py,backend-java/**/test/**/*.java,backend-csharp/**/*Tests.cs"
---
# TDD + Behaviour-Driven Testing — All Services

Apply the [general testing standards](testing.instructions.md) alongside these TDD/BDD rules.

---

## The Only Allowed Workflow: Red → Green → Refactor

1. **Red** — Write a failing test that describes a behaviour. Run it and confirm it fails.
2. **Green** — Write the **minimum** production code to make the test pass. Nothing more.
3. **Refactor** — Clean up without changing behaviour. All tests must remain green.

> **NEVER** write production code before a failing test exists for it.

---

## Tests Must Describe Behaviour, Not Implementation

A behaviour is something observable from **outside** the unit under test — the effect it has on callers, on stored data, or on collaborators through their public interface.

### The Naming Rule

| ❌ FORBIDDEN — describes implementation | ✅ REQUIRED — describes behaviour |
|---|---|
| `test_parse_vehicle_function` | `test_parse_vehicle_returns_make_and_model_from_description` |
| `test_openai_client_called` | `test_vehicle_parsing_succeeds_when_description_is_valid` |
| `TestCalculateRoute` | `given_two_stops_when_route_requested_then_returns_ordered_waypoints` |
| `it('calls addStop')` | `it('adds a new stop to the trip when user submits the form')` |
| `it('setState is called')` | `it('shows a loading spinner while the trip is saving')` |

**Pattern for all languages:**

```
given_<precondition>_when_<action>_then_<observable_outcome>
# or the shorter form when context is clear:
<action>_returns_<outcome>_when_<precondition>
```

---

## What Is and Is NOT a Behaviour Test

### ✅ Behaviour — test this
- Return values and HTTP response codes
- Errors or exceptions raised for invalid inputs
- State visible through the public API (e.g., a record appears in the DB)
- Messages emitted to collaborators that matter to the domain (e.g., an event is published)

### ❌ Implementation detail — NEVER test this
- Private / internal methods
- How many times a mock was called (unless the call IS the contract, e.g., sending an email)
- Specific argument shapes passed to a third-party SDK
- Internal state variables or fields not exposed via a public accessor
- Whether a specific class or function is used internally

---

## Language-Specific Templates

### TypeScript / React (Vitest + RTL)

```tsx
// ✅ CORRECT — Given/When/Then expressed as describe blocks
describe('TripForm', () => {
  describe('given the form is empty', () => {
    it('shows a validation error when the user submits', async () => {
      render(<TripForm onSubmit={vi.fn()} />);
      await userEvent.click(screen.getByRole('button', { name: /save trip/i }));
      expect(screen.getByRole('alert')).toHaveTextContent('Trip name is required');
    });
  });

  describe('given a valid trip name', () => {
    it('calls onSubmit with the trip data when the user submits', async () => {
      const handleSubmit = vi.fn();
      render(<TripForm onSubmit={handleSubmit} />);
      await userEvent.type(screen.getByLabelText(/trip name/i), 'Pacific Coast');
      await userEvent.click(screen.getByRole('button', { name: /save trip/i }));
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Pacific Coast' })
      );
    });
  });
});
```

```ts
// ❌ WRONG — tests an internal store action, not observable behaviour
it('calls addStop action', () => {
  const addStop = vi.spyOn(store, 'addStop');
  component.handleAdd();
  expect(addStop).toHaveBeenCalled();          // ← implementation detail
});

// ✅ CORRECT — tests the result the user sees
it('displays the new stop in the list after it is added', async () => {
  render(<StopList />);
  await userEvent.click(screen.getByRole('button', { name: /add stop/i }));
  await userEvent.type(screen.getByLabelText(/stop name/i), 'Denver');
  await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
  expect(screen.getByText('Denver')).toBeInTheDocument();
});
```

### Python (Pytest)

```python
# ✅ CORRECT — one file per feature area, classes group related scenarios
class TestVehicleParsingBehaviour:
    def test_returns_make_and_model_when_description_is_a_known_vehicle(self, client, mock_openai):
        mock_openai.return_value = {"make": "Ford", "model": "F-150", "year": 2022}
        response = client.post("/api/v1/parse-vehicle", json={"description": "2022 Ford F-150"})
        assert response.status_code == 200
        data = response.json()
        assert data["make"] == "Ford"
        assert data["model"] == "F-150"

    def test_returns_400_when_description_is_empty(self, client):
        response = client.post("/api/v1/parse-vehicle", json={"description": ""})
        assert response.status_code == 400

    def test_returns_503_when_openai_is_unavailable(self, client, mock_openai):
        mock_openai.side_effect = OpenAIServiceError("timeout")
        response = client.post("/api/v1/parse-vehicle", json={"description": "Toyota Camry"})
        assert response.status_code == 503
```

```python
# ❌ WRONG — verifies the internal call, not the behaviour
def test_openai_client_is_called_once(mock_openai):
    svc.parse("Toyota Camry")
    mock_openai.assert_called_once()        # ← implementation detail

# ❌ WRONG — name describes a method, not a behaviour
def test_parse_vehicle():
    ...
```

### Java (JUnit 5 + Mockito)

```java
// ✅ CORRECT — @DisplayName states the behaviour
@ExtendWith(MockitoExtension.class)
class DirectionsServiceBehaviourTest {

    @Mock RestTemplate restTemplate;
    @InjectMocks DirectionsService service;

    @Test
    @DisplayName("returns an ordered list of waypoints when Mapbox responds successfully")
    void returnsOrderedWaypoints_whenMapboxRespondsSuccessfully() {
        when(restTemplate.getForObject(anyString(), eq(MapboxResponse.class)))
            .thenReturn(validMapboxResponse());

        RouteResult result = service.getDirections(twoStopRequest());

        assertThat(result.waypoints()).hasSize(2);
        assertThat(result.waypoints().get(0).name()).isEqualTo("Denver");
    }

    @Test
    @DisplayName("throws RouteUnavailableException when Mapbox returns no routes")
    void throwsRouteUnavailableException_whenMapboxReturnsNoRoutes() {
        when(restTemplate.getForObject(anyString(), eq(MapboxResponse.class)))
            .thenReturn(emptyMapboxResponse());

        assertThatThrownBy(() -> service.getDirections(twoStopRequest()))
            .isInstanceOf(RouteUnavailableException.class);
    }
}
```

```java
// ❌ WRONG — tests the number of internal calls
verify(restTemplate, times(1)).getForObject(anyString(), any());  // ← implementation detail
```

### C# (xUnit + Moq)

```csharp
// ✅ CORRECT — method name is a sentence describing behaviour
public class VehicleParserServiceBehaviourTests
{
    [Fact]
    public async Task ReturnsVehicleSpecs_WhenDescriptionIsAKnownVehicle()
    {
        var mockClient = new Mock<IOpenAIClient>();
        mockClient.Setup(c => c.CompleteAsync(It.IsAny<string>()))
                  .ReturnsAsync(new CompletionResult { Text = "{\"make\":\"Ford\",\"model\":\"F-150\"}" });
        var svc = new VehicleParserService(mockClient.Object, Options.Create(new AzureOpenAIOptions()));

        var result = await svc.ParseAsync("2022 Ford F-150");

        Assert.Equal("Ford", result.Make);
        Assert.Equal("F-150", result.Model);
    }

    [Fact]
    public async Task ThrowsArgumentException_WhenDescriptionIsEmpty()
    {
        var svc = BuildService();
        await Assert.ThrowsAsync<ArgumentException>(() => svc.ParseAsync(""));
    }
}
```

```csharp
// ❌ WRONG — verifies a specific internal call count
mockClient.Verify(c => c.CompleteAsync(It.IsAny<string>()), Times.Once);  // ← implementation detail
```

---

## Anti-Patterns — Reject These in Code Review

| Anti-pattern | Why it's forbidden | Correct alternative |
|---|---|---|
| Test name contains a method/function name | Pins to implementation | Name the observable outcome |
| `assert_called_once_with(...)` / `verify(..., times(1))` on non-contract calls | Brittle when refactoring | Assert the output, not the path |
| Testing a private method directly | Breaks encapsulation | Drive it through the public API |
| Asserting on internal state fields | Couples test to structure | Assert on the public result |
| `// Arrange / Act / Assert` without a behaviour name | Hides intent | Name the test with the expected behaviour |
| One giant test asserting many behaviours | Hard to diagnose failures | One behaviour per `it` / `@Test` / `[Fact]` |

---

## One Assertion Per Behaviour

Each test case must assert **one observable outcome**. Multiple `expect`/`assert` calls are permitted only when they together describe a single composite outcome (e.g., both `status_code` and `body` of an HTTP response).

```python
# ✅ CORRECT — both assertions describe the same outcome
assert response.status_code == 200
assert response.json()["make"] == "Ford"

# ❌ WRONG — two separate behaviours in one test
assert response.status_code == 200
assert audit_log_was_written()          # separate concern → separate test
```

---

## Fixtures and Helpers Must Not Leak Logic

Test fixtures exist to set up **preconditions**, not to encode business rules. If a fixture computes a domain value, move that value to a constant or a factory function with a clear name.

```python
# ✅ CORRECT
@pytest.fixture
def authenticated_client(client, user_token):
    client.headers["Authorization"] = f"Bearer {user_token}"
    return client

# ❌ WRONG — business logic inside a fixture
@pytest.fixture
def client_with_calculated_discount(client):
    discount = round(base_price * 0.15, 2)   # ← domain logic in fixture
    ...
```
