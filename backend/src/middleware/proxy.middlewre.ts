import { Injectable, NestMiddleware } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
    use(req: any, res: any, next: (error?: any) => void) {
        // Check if the request path is not handled by existing routes
        if (req.baseUrl.startsWith('/payments')) {
            console.log(`🔄 Redirecting ${req.baseUrl} to another service from proxy middleware`);

            // Proxy requests to another service (e.g., Payment Service)
            createProxyMiddleware({
                target: 'http://localhost:5000', // Change this to your actual service URL
                changeOrigin: true,
                pathRewrite: (path, req: any) => {
                    return req.originalUrl; // Forward the full path without modifications
                },
                selfHandleResponse: false
            })(req, res, next);
        } else {
            next(); // Continue to existing routes
        }
    }
}