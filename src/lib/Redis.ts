import { createClient, RedisClientType } from 'redis';

/**
 * Redis 客户端封装类，支持字符串、哈希、列表、集合等常用操作。
 */
export class RedisClient {
    private client: RedisClientType;

    /**
     * 创建 RedisClient 实例
     * @param url Redis 连接地址，默认为 'redis://localhost:6379'
     */
    constructor(url: string = 'redis://localhost:6379') {
        this.client = createClient({ url });
        this.client.on('error', (err) => console.error('Redis Error:', err));
    }

    /**
     * 连接 Redis 服务器
     */
    async connect(): Promise<void> {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    /**
     * 关闭 Redis 连接
     */
    async close(): Promise<void> {
        if (this.client.isOpen) {
            await this.client.quit();
        }
    }

    // ========== String ==========
    /**
     * 获取字符串值
     * @param key 键名
     * @returns 字符串值或 null
     */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /**
     * 设置字符串值
     * @param key 键名
     * @param value 字符串值
     * @param ttl 可选，过期时间（单位：秒）
     * @returns 设置成功返回 OK
     */
    async set(key: string, value: string, ttl?: number): Promise<string | null> {
        return ttl
            ? this.client.set(key, value, { EX: ttl })
            : this.client.set(key, value);
    }

    /**
     * 删除一个或多个键
     * @param keys 键名列表
     * @returns 成功删除的键数量
     */
    async del(...keys: string[]): Promise<number> {
        return this.client.del(keys);
    }

    /**
     * 检查一个或多个键是否存在
     * @param keys 键名列表
     * @returns 存在的键数量
     */
    async exists(...keys: string[]): Promise<number> {
        return this.client.exists(...keys);
    }

    /**
     * 将键的值递增 1
     * @param key 键名
     * @returns 递增后的值
     */
    async incr(key: string): Promise<number> {
        return this.client.incr(key);
    }

    /**
     * 将键的值递减 1
     * @param key 键名
     * @returns 递减后的值
     */
    async decr(key: string): Promise<number> {
        return this.client.decr(key);
    }

    /**
     * 设置键的过期时间（秒）
     * @param key 键名
     * @param seconds 过期时间（秒）
     * @returns 是否设置成功
     */
    async expire(key: string, seconds: number): Promise<boolean> {
        return this.client.expire(key, seconds);
    }

    // ========== Hash ==========
    /**
     * 设置哈希字段的值
     * @param key 哈希键名
     * @param field 字段名
     * @param value 值
     */
    async hset(key: string, field: string, value: string): Promise<number> {
        return this.client.hSet(key, field, value);
    }

    /**
     * 获取哈希字段的值
     * @param key 哈希键名
     * @param field 字段名
     */
    async hget(key: string, field: string): Promise<string | null> {
        return this.client.hGet(key, field);
    }

    /**
     * 获取哈希中所有字段和值
     * @param key 哈希键名
     * @returns 一个对象，包含所有字段和值
     */
    async hgetall(key: string): Promise<Record<string, string>> {
        return this.client.hGetAll(key);
    }

    /**
     * 删除哈希中的一个或多个字段
     * @param key 哈希键名
     * @param fields 字段名列表
     * @returns 成功删除的字段数量
     */
    async hdel(key: string, ...fields: string[]): Promise<number> {
        return this.client.hDel(key, fields);
    }

    /**
     * 检查哈希字段是否存在
     * @param key 哈希键名
     * @param field 字段名
     */
    async hexists(key: string, field: string): Promise<boolean> {
        return this.client.hExists(key, field);
    }

    // ========== List ==========
    /**
     * 从左侧推入一个或多个元素到列表
     * @param key 列表键名
     * @param values 值列表
     */
    async lpush(key: string, ...values: string[]): Promise<number> {
        return this.client.lPush(key, values);
    }

    /**
     * 从右侧推入一个或多个元素到列表
     * @param key 列表键名
     * @param values 值列表
     */
    async rpush(key: string, ...values: string[]): Promise<number> {
        return this.client.rPush(key, values);
    }

    /**
     * 从左侧弹出一个元素
     * @param key 列表键名
     */
    async lpop(key: string): Promise<string | null> {
        return this.client.lPop(key);
    }

    /**
     * 从右侧弹出一个元素
     * @param key 列表键名
     */
    async rpop(key: string): Promise<string | null> {
        return this.client.rPop(key);
    }

    /**
     * 获取列表中指定范围的元素
     * @param key 列表键名
     * @param start 起始索引
     * @param stop 结束索引
     * @returns 元素数组
     */
    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return this.client.lRange(key, start, stop);
    }

    // ========== Set ==========
    /**
     * 添加一个或多个元素到集合
     * @param key 集合键名
     * @param members 元素列表
     */
    async sadd(key: string, ...members: string[]): Promise<number> {
        return this.client.sAdd(key, members);
    }

    /**
     * 从集合中移除一个或多个元素
     * @param key 集合键名
     * @param members 元素列表
     */
    async srem(key: string, ...members: string[]): Promise<number> {
        return this.client.sRem(key, members);
    }

    /**
     * 获取集合中的所有元素
     * @param key 集合键名
     * @returns 元素数组
     */
    async smembers(key: string): Promise<string[]> {
        return this.client.sMembers(key);
    }

    /**
     * 检查某个值是否在集合中
     * @param key 集合键名
     * @param member 要检查的元素
     * @returns 是否存在
     */
    async sismember(key: string, member: string): Promise<boolean> {
        return this.client.sIsMember(key, member);
    }
}

export const redisClient = new RedisClient();
export default redisClient;
