import { Context, Next } from "koa";

/**
 * 记录每个 IP 的访问次数
 * Redis 哈希表结构：
 * key = "access"
 * field = IP 地址
 * value = 访问次数（字符串形式）
 */
const statistics = async (ctx: Context, next: Next) => {
    const ip = ctx.ip || ctx.request.ip || "unknown";

    const key = "statistics:access";
    const field = ip;

    const current = await redis.hget(key, field);
    const count = current ? parseInt(current, 10) + 1 : 1;

    await redis.hset(key, field, count.toString());

    return next();
};

export default statistics;
