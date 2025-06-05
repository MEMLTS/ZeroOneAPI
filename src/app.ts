import koa from 'koa';
import cors from '@koa/cors';
import koaBody from 'koa-body';
import koaRouter from 'koa-router';

const app = new koa();
const router = new koaRouter();

app.use(cors)

export default app;