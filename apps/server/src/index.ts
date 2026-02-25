import { bootstrapSocketServer } from './infrastructure/socketServer';

const port = Number(process.env.PORT ?? 3001);
const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

bootstrapSocketServer(port, redisUrl);
