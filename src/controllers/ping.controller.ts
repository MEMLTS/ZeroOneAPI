import { Context } from 'koa';

export const ping = async (ctx: Context) => {
  ctx.body = { message: 'pong' };
};
