import Koa from 'koa';
import cors from '@koa/cors';
import log from '@middlewares/logger';
import PluginManager from '@lib/plugins/Loader';

Logger.info('Starting API Server...');
const time = Date.now();

const app = new Koa();

app.use(cors({
    origin: '*',
}));

// 日志中间件
app.use(log);

// 加载插件
PluginManager.loadPlugins(app);

Logger.info(`API Server started in ${Date.now() - time}ms`);

export default app;