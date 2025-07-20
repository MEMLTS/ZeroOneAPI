import { LoggerFactory } from '@lib/Logger';
import { ApiServer } from './app';
import config from '@lib/Config';
import { RedisClient } from '@lib/Redis';

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

//=== Logger 初始化 ===
LoggerFactory.getLogger();

Logger.info('Starting server...');

(async () => {
    config.load();

    // === Server Config ===
    const PORT = config.getNumber('PORT') || 2598;
    const HOST = config.get('HOST') || '0.0.0.0';

    if (config.getBoolean('REDIS_ENABLE')) {
        Logger.info('Redis enabled.');

        // === Redis Config ===
        const redisOptions = {
            host: Config.get('REDIS_HOST') || 'localhost',
            port: Config.getNumber('REDIS_PORT') || 6379,
            password: Config.get('REDIS_PASSWORD') || undefined,
            db: Config.getNumber('REDIS_DB') || 0,
        };

        // Redis Client 初始化
        const redisClient = new RedisClient(redisOptions);
        try {
            await redisClient.connect();
            Logger.info('Redis connected successfully.');
            if (!globalThis.redis) {
                globalThis.redis = redisClient
            }
        } catch (err) {
            Logger.error('Failed to connect to Redis:', err);
            process.exit(1);
        }
    } else {
        Logger.info('Redis disabled.');
    }
    const server = new ApiServer();
    server.listen(PORT, HOST);
})().catch(err => {
    Logger.error('Failed to start server:', err);
    process.exit(1);
});