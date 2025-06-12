import koa from 'koa';
import cors from '@koa/cors';
import log from '@middlewares/logger';
import PluginManager from '@lib/plugins/loader';

const app = new koa();

app.use(log);

PluginManager.loadPlugins(app);

app.use(cors({
    origin: '*',
}));


export default app;