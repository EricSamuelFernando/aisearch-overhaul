import { Redis } from "@upstash/redis";

// Singleton Redis client — HTTP-based, works on Vercel serverless
let client: Redis | undefined;

export function getRedis(): Redis {
  if (client) return client;
  client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return client;
}
