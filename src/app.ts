import koa from 'koa';
import cors from '@koa/cors';
import log from './middlewares/logger';
const app = new koa();

app.use(log);
app.use(cors)

export default app;