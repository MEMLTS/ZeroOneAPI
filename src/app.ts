import koa from 'koa';
import cors from '@koa/cors';
import log from '@middlewares/logger';
import PluginManager from '@lib/plugins/Loader';
import logger from '@lib/Logger';

logger.info('Starting API Server...');
const time = Date.now();
const app = new koa();

app.use(log);

PluginManager.loadPlugins(app);

app.use(cors({
    origin: '*',
}));

logger.info(`API Server started in ${Date.now() - time}ms`);

export default app;