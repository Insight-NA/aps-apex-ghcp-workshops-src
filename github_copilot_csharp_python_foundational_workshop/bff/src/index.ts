import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { createProxyRoutes } from './routes/proxy';
import { healthRouter } from './routes/health';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';

config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Service URLs (Docker network names)
const SERVICE_URLS = {
  python: process.env.PYTHON_BACKEND_URL || 'http://backend-python:8000',
  csharp: process.env.CSHARP_BACKEND_URL || 'http://backend-csharp:8081',
  java: process.env.JAVA_BACKEND_URL || 'http://backend-java:8082',
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(requestIdMiddleware);

// Health check (aggregated from all backends)
app.use('/health', healthRouter(SERVICE_URLS));

// Proxy routes - order matters (most specific first)
createProxyRoutes(app, SERVICE_URLS);

// Error handling
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BFF API Gateway listening on port ${PORT}`);
  console.log(`Routing to Python: ${SERVICE_URLS.python}`);
  console.log(`Routing to C#:     ${SERVICE_URLS.csharp}`);
  console.log(`Routing to Java:   ${SERVICE_URLS.java}`);
});

export default app;
