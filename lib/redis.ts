import { Redis } from '@upstash/redis'

/**
 * Shared Upstash Redis client.
 * Configuration is read from environment variables:
 *   - UPSTASH_REDIS_REST_URL
 *   - UPSTASH_REDIS_REST_TOKEN
 *
 * The Upstash client automatically caches connections, so importing this
 * module across Server Components and Route Handlers is safe.
 */
export const redis = Redis.fromEnv()
