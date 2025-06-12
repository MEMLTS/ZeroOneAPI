import koa from 'koa';
import cors from '@koa/cors';
import log from './middlewares/logger';
import PluginManager from '@lib/plugins/loader';

const app = new koa();

app.use(log);

PluginManager.loadPlugins(app);  // 加载所有插件

app.use(cors)


export default app;