import logger from '@lib/Logger';
import app from './app';
import { Config } from '@lib/Config';
import { RedisClient } from '@lib/Redis';


(async () => {
    const config = Config.getInstance();

    // === Server Config ===
    const PORT = config.getNumber('PORT') || 2598;
    const HOST = config.get('HOST') || '0.0.0.0';

    // === Redis Config ===
    const redisOptions = {
        host: config.get('REDIS_HOST') || 'localhost',
        port: config.getNumber('REDIS_PORT') || 6379,
        password: config.get('REDIS_PASSWORD') || undefined,
        db: config.getNumber('REDIS_DB') || 0,
    };

    // Redis Client 初始化
    const redisClient = new RedisClient(redisOptions);
    try {
        await redisClient.connect();
        logger.info('Redis connected successfully.');
        if (!globalThis.redis) {
            globalThis.redis = redisClient
        }
    } catch (err) {
        logger.error('Failed to connect to Redis:', err);
        process.exit(1);
    }

    const logo = String.raw`
 ________                                ______                        ______   _______  ______
|        \                              /      \                      /      \ |       \|      \
 \$$$$$$$$ ______    ______    ______  |  $$$$$$\ _______    ______  |  $$$$$$\| $$$$$$$\\$$$$$$
    /  $$ /      \  /      \  /      \ | $$  | $$|       \  /      \ | $$__| $$| $$__/ $$ | $$
   /  $$ |  $$$$$$\|  $$$$$$\|  $$$$$$\| $$  | $$| $$$$$$$\|  $$$$$$\| $$    $$| $$    $$ | $$
  /  $$  | $$    $$| $$   \$$| $$  | $$| $$  | $$| $$  | $$| $$    $$| $$$$$$$$| $$$$$$$  | $$
 /  $$___| $$$$$$$$| $$      | $$__/ $$| $$__/ $$| $$  | $$| $$$$$$$$| $$  | $$| $$      _| $$_
|  $$    \\$$     \| $$       \$$    $$ \$$    $$| $$  | $$ \$$     \| $$  | $$| $$     |   $$ \
 \$$$$$$$$ \$$$$$$$ \$$        \$$$$$$   \$$$$$$  \$$   \$$  \$$$$$$$ \$$   \$$ \$$      \$$$$$$
`

    console.log(logo);

    app.listen(PORT, HOST, () => {
        logger.info(`API Server running at http://localhost:${PORT}`);
    });
})().catch(err => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});