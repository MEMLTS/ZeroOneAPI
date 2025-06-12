import koa from 'koa';
import cors from '@koa/cors';
import log from './middlewares/logger';
import PluginManager from '@lib/plugins/loader';

const app = new koa();

PluginManager.loadPlugins(app);  // 加载所有插件
app.use(log);
app.use(cors)

app.use(async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`);
  await next();
});
export default app;