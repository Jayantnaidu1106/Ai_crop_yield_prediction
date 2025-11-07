import dotenv from 'dotenv';
dotenv.config();
import Redis from 'ioredis';

let redis = null;
let redisEnabled = true;

// Only create Redis client if credentials are provided
if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        enableReadyCheck: false,
        retryStrategy: (times) => {
            // Stop retrying after 3 attempts
            if (times > 3) {
                console.log('Redis connection failed after 3 attempts. Running without Redis.');
                redisEnabled = false;
                return null; // Stop retrying
            }
            return Math.min(times * 100, 2000);
        },
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false
    });

    redis.on('connect', () => {
        console.log('Connected to Redis');
        redisEnabled = true;
    });

    redis.on('error', (err) => {
        if (redisEnabled) {
            console.error('Redis error:', err.message);
            console.log('Continuing without Redis caching...');
        }
        redisEnabled = false;
    });
} else {
    console.log('Redis credentials not found. Running without Redis.');
}

// Export a proxy that handles Redis being unavailable
export default new Proxy({}, {
    get: (target, prop) => {
        if (!redis || !redisEnabled) {
            // Return no-op functions when Redis is not available
            return async () => null;
        }
        return redis[prop].bind(redis);
    }
});

export const isRedisConnected = () => redisEnabled && redis && redis.status === 'ready';