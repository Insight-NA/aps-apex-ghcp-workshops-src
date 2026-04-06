import { Express } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

interface ServiceUrls {
  python: string;
  csharp: string;
  java: string;
}

/**
 * Route table mapping URL prefixes to backend services.
 *
 * Uses pathFilter (NOT Express path-mounting) so that the full request path
 * is forwarded to the backend.  When you mount via app.use('/prefix', proxy),
 * Express strips the prefix from req.url, causing the backend to receive '/'
 * and return 404.
 *
 * Python backend:  auth, trips, public-trips, vehicle-specs (fallback)
 * C# backend:      vehicle-specs (AI-powered), AI trip generation
 * Java backend:    geocode, directions, search, optimize (geospatial)
 */
export function createProxyRoutes(app: Express, urls: ServiceUrls): void {
  const commonOptions: Partial<Options> = {
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward request ID for distributed tracing
        const requestId = req.headers['x-request-id'];
        if (requestId) {
          proxyReq.setHeader('x-request-id', requestId as string);
        }
        // Forward auth header
        const auth = req.headers['authorization'];
        if (auth) {
          proxyReq.setHeader('authorization', auth);
        }
        // Strip the browser Origin header before forwarding to backends.
        // The BFF is the CORS boundary — backends should not perform their own
        // CORS checks against browser origins (they are only reachable via BFF).
        proxyReq.removeHeader('origin');
      },
      error: (err, _req, res) => {
        console.error('Proxy error:', err.message);
        if ('writeHead' in res) {
          (res as any).writeHead(502, { 'Content-Type': 'application/json' });
          (res as any).end(JSON.stringify({
            error: 'BadGateway',
            message: 'Backend service unavailable',
            statusCode: 502,
          }));
        }
      },
    },
  };

  // ── C# Backend (AI Service) ──
  app.use(createProxyMiddleware({
    target: urls.csharp,
    pathFilter: ['/api/v1/parse-vehicle', '/api/v1/generate-trip'],
    ...commonOptions,
  }));

  // ── Java Backend (Geospatial Services) ──
  app.use(createProxyMiddleware({
    target: urls.java,
    pathFilter: ['/api/geocode', '/api/directions', '/api/search', '/api/optimize'],
    ...commonOptions,
  }));

  // ── Python Backend (Trips, Auth, Vehicle Specs Fallback) ──
  app.use(createProxyMiddleware({
    target: urls.python,
    pathFilter: ['/api/auth', '/api/trips', '/api/public-trips', '/api/vehicle-specs', '/api/health'],
    ...commonOptions,
  }));
}
