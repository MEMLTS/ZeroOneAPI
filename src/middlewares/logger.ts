import { Context, Next } from "koa";

const log = async (ctx: Context, next: Next) => {
  Logger.info(`[${ctx.ip}][Method] ${ctx.method} [Path]${ctx.url}`);
  return await next();
};

export default log;