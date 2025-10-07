import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        // Use IP address as the default tracker
        return req.ips.length ? req.ips[0] : req.ip;
    }

    protected async handleRequest(
        requestProps: any,
    ): Promise<boolean> {
        const request = requestProps.context.switchToHttp().getRequest();

        // Apply stricter throttling for authentication endpoints
        if (request.url?.includes('/auth/login') || request.url?.includes('/auth/register')) {
            // Override the throttler options for auth endpoints
            requestProps.limit = 5; // 5 requests per minute for auth endpoints
            requestProps.ttl = 60000; // 1 minute
        }

        // Apply different throttling for file uploads
        if (request.url?.includes('/files/upload')) {
            // Override the throttler options for upload endpoints
            requestProps.limit = 10; // 10 uploads per hour
            requestProps.ttl = 3600000; // 1 hour
        }

        // Default throttling for other endpoints
        return super.handleRequest(requestProps);
    }
} 