import { Router, Request, Response } from 'express';

interface ServiceUrls {
  python: string;
  csharp: string;
  java: string;
}

interface ServiceHealth {
  status: string;
  service: string;
  responseTime?: number;
  error?: string;
}

/**
 * Aggregated health endpoint that checks all backend services.
 */
export function healthRouter(serviceUrls: ServiceUrls): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const checks: Record<string, ServiceHealth> = {};
    let allHealthy = true;

    const services = [
      { name: 'python', url: `${serviceUrls.python}/health` },
      { name: 'csharp', url: `${serviceUrls.csharp}/health` },
      { name: 'java', url: `${serviceUrls.java}/health` },
    ];

    await Promise.allSettled(
      services.map(async (svc) => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(svc.url, { signal: controller.signal });
          clearTimeout(timeout);
          const elapsed = Date.now() - start;

          if (response.ok) {
            checks[svc.name] = {
              status: 'healthy',
              service: svc.name,
              responseTime: elapsed,
            };
          } else {
            allHealthy = false;
            checks[svc.name] = {
              status: 'unhealthy',
              service: svc.name,
              responseTime: elapsed,
              error: `HTTP ${response.status}`,
            };
          }
        } catch (err) {
          allHealthy = false;
          checks[svc.name] = {
            status: 'unavailable',
            service: svc.name,
            responseTime: Date.now() - start,
            error: (err as Error).message,
          };
        }
      })
    );

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      service: 'bff',
      timestamp: new Date().toISOString(),
      backends: checks,
    });
  });

  return router;
}
