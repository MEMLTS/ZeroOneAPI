import logger from "@lib/logger";
import { Context, Next } from "koa";

const log = async (ctx: Context, next: Next) => {
  logger.info(`${ctx.method} ${ctx.url}`);
};

export default log;