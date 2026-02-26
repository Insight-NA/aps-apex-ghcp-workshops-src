# BFF API Gateway

Lightweight Node.js (Express) API gateway for the Road Trip Planner polyglot architecture.

## Responsibilities

- Routes frontend requests to the correct backend service (Python, C#, Java)
- Aggregated health checks across all backends
- Request ID propagation for distributed tracing
- CORS handling (single origin configuration point)
- Uniform error response normalization

## Route Table

| Frontend Path         | Backend Service     | Port |
|-----------------------|---------------------|------|
| `/api/auth/*`         | Python (FastAPI)    | 8000 |
| `/api/trips*`         | Python (FastAPI)    | 8000 |
| `/api/public-trips*`  | Python (FastAPI)    | 8000 |
| `/api/vehicle-specs`  | Python (FastAPI)    | 8000 |
| `/api/v1/parse-vehicle` | C# (ASP.NET)     | 8081 |
| `/api/v1/generate-trip` | C# (ASP.NET)     | 8081 |
| `/api/geocode*`       | Java (Spring Boot)  | 8082 |
| `/api/directions*`    | Java (Spring Boot)  | 8082 |
| `/api/search*`        | Java (Spring Boot)  | 8082 |
| `/api/optimize*`      | Java (Spring Boot)  | 8082 |
| `/health`             | BFF (aggregated)    | 3000 |

## Local Development

```bash
npm install
npm run dev   # starts on port 3000 with hot reload
```

## Environment Variables

| Variable              | Default                        | Description                |
|-----------------------|--------------------------------|----------------------------|
| `PORT`                | `3000`                         | BFF listen port            |
| `PYTHON_BACKEND_URL`  | `http://backend-python:8000`   | Python service URL         |
| `CSHARP_BACKEND_URL`  | `http://backend-csharp:8081`   | C# service URL             |
| `JAVA_BACKEND_URL`    | `http://backend-java:8082`     | Java service URL           |
| `ALLOWED_ORIGINS`     | `http://localhost:5173`        | CORS allowed origins (CSV) |
