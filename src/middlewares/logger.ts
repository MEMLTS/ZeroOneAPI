import { Context, Next } from "koa";
import chalk from 'chalk';

/**
 * 日志中间件，用于记录请求信息
 */
const log = async (ctx: Context, next: Next) => {
  const startTime = Date.now();

  // 颜色
  const methodColor = chalk.cyan;  // 请求方法使用蓝色
  const pathColor = chalk.green;   // 请求路径使用绿色
  const ipColor = chalk.magenta;   // IP地址使用紫色
  const timeColor = chalk.yellow;  // 请求时间使用黄色

  Logger.info(`[${ipColor(ctx.ip)}][Method] ${methodColor(ctx.method)} [Path]${pathColor(decodeURIComponent(ctx.url))}`);

  await next();

  const endTime = Date.now();
  const statusColor = ctx.status >= 200 && ctx.status < 300 ? chalk.green : chalk.red; // 成功的状态码是绿色，失败的状态码是红色
  Logger.info(`[${ipColor(ctx.ip)}][Method] ${methodColor(ctx.method)} [Path]${pathColor(decodeURIComponent(ctx.url))} [Status] ${statusColor(ctx.status)} [Time] ${timeColor(endTime - startTime)}ms`);
};

export default log;
