import logger from "@lib/logger";
import { Context, Next } from "koa";

const log = async (ctx: Context, next: Next) => {
  logger.info(`[${ctx.ip}] [Method]${ctx.method} [Path]${ctx.url}`);
  return await next();
};

export default log;