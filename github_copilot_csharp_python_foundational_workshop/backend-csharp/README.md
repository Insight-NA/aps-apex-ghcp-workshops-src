# C# AI Service (ASP.NET Web API)

Replaces the original Go ai-service. Provides AI-powered vehicle specification parsing
and trip generation using Azure OpenAI.

## Endpoints

| Method | Path                    | Description                              |
|--------|-------------------------|------------------------------------------|
| POST   | `/api/v1/parse-vehicle` | Parse vehicle description → structured specs |
| POST   | `/api/v1/generate-trip` | Generate trip suggestions via AI         |
| GET    | `/health`               | Health check                             |

## Environment Variables

| Variable                    | Required | Description                      |
|-----------------------------|----------|----------------------------------|
| `AZURE_OPENAI_ENDPOINT`    | No*      | Azure OpenAI endpoint URL        |
| `AZURE_OPENAI_API_KEY`     | No*      | Azure OpenAI API key             |
| `AZURE_OPENAI_DEPLOYMENT`  | No*      | Azure OpenAI deployment/model    |
| `PORT`                      | No       | Listen port (default: 8081)      |

*When not configured, the service uses rule-based fallback parsing.

## Local Development

```bash
dotnet run
# or
dotnet watch run
```

## Docker

```bash
docker build -t roadtrip-ai-csharp .
docker run -p 8081:8081 roadtrip-ai-csharp
```
