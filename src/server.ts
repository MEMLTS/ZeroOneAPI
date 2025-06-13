import app from './app';
import { Config } from '@lib/Config';
import { RedisClient } from '@lib/Redis';
import logger from '@lib/Logger';

const config = Config.getInstance();

const PORT = config.getNumber('PORT') || 2598;
const HOST = config.get('HOST') || '0.0.0.0';

//=== Redis ===
const REDIS_HOST = config.get('REDIS_HOST') || 'localhost';
const REDIS_PORT = config.getNumber('REDIS_PORT') || 6379;
const REDIS_PASSWORD = config.get('REDIS_PASSWORD') || '';
const REDIS_DB = config.getNumber('REDIS_DB') || 0;

export const redis = new RedisClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
});
// Redis Client
redis.connect();

redis.set('test', 'test');

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
