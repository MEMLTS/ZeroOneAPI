import { Context, Next } from "koa";

/**
 * 日志中间件，用于记录请求信息
 */
const log = async (ctx: Context, next: Next) => {
  const startTime = Date.now();
  Logger.info(`[${ctx.ip}][Method] ${ctx.method} [Path]${decodeURIComponent(ctx.url)}`);
  await next();
  const endTime = Date.now();
  Logger.info(`[${ctx.ip}][Method] ${ctx.method} [Path]${decodeURIComponent(ctx.url)} [Status] ${ctx.status} [Time] ${endTime - startTime}ms`);
};

export default log;