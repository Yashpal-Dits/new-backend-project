import { createClient } from "redis";
import logger from "./logger";

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});


redisClient.on('error', (err) =>
    logger.error(`Redis Client Error: ${err}`));

redisClient.on('connect', () => {
    logger.info(`Redis Connected successfully`)
});

export const connectRedis = async (): Promise<void> => {
    if(!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('Redis connection established'); 
    }
}

export const getCache = async (key: string): Promise<string | null> => {
    return await redisClient.get(key);
};

export const setCache = async (key: string, value: any, ttl: number = 3600): Promise<void> => {
   
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
};

export const delCache = async (key: string): Promise<void> => {
    await redisClient.del(key);
};


export const delPattern = async(pattern: string): Promise<void> => {
    const keys = await redisClient.keys(pattern);

    if(keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Redis: Deleted${keys.length} Keys matching pattern ${pattern}`);
    }
}

export default redisClient;

