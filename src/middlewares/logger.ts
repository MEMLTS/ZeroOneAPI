import { Context, Next } from "koa";

/**
 * 日志中间件，用于记录请求信息
 */
const log = async (ctx: Context, next: Next) => {
  Logger.info(`[${ctx.ip}][Method] ${ctx.method} [Path]${decodeURIComponent(ctx.url)}`);
  await next();
  Logger.info(`[${ctx.ip}][Method] ${ctx.method} [Path]${decodeURIComponent(ctx.url)} [Status] ${ctx.status}`);
};

export default log;