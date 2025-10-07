import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
    limit: number;
    ttl: number;
    skipIf?: (context: any) => boolean;
}

export const Throttle = (options: ThrottleOptions) => SetMetadata(THROTTLE_KEY, options);

// Predefined throttle decorators for common use cases
export const ThrottleAuth = () => Throttle({ limit: 5, ttl: 60000 }); // 5 requests per minute
export const ThrottleUpload = () => Throttle({ limit: 10, ttl: 3600000 }); // 10 requests per hour
export const ThrottleStrict = () => Throttle({ limit: 3, ttl: 60000 }); // 3 requests per minute
export const ThrottleLoose = () => Throttle({ limit: 1000, ttl: 3600000 }); // 1000 requests per hour 