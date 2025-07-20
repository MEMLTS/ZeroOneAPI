type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export interface PluginRule {
    /** 插件生效路径 */
    path?: string;
    /** 插件生效方法 */
    method?: HttpMethod[];
    /** 插件调用方法 */
    handler?: string;
}

export interface PluginMeta {
    /** 插件名称 */
    name: string;
    /** 插件描述 */
    description?: string;
    /** 插件优先级，越高越先执行 */
    priority?: number;
    /** 插件生效规则 */
    rule?: PluginRule[];
}

/**
 * Plugin class definition.
 */
export default class plugin {
    public meta: PluginMeta;

    constructor(meta: PluginMeta) {
        this.meta = {
            ...meta,
            priority: meta.priority ?? 0,
            rule: meta.rule ?? [],
        };
    }

    /**
     * 获取所有 rule 中声明的 handler 方法名
     */
    getHandlerNames(): string[] {
        return this.meta.rule?.map(r => r.handler).filter(Boolean) as string[];
    }
}
