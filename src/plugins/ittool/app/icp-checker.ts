import { PluginMeta } from "../../../types/plugin.interface";
import { Context } from "koa";

export const meta: PluginMeta = {
    path: "/api/icp-checker",
    method: ["GET", "POST"],
    description: "查询ICP备案信息",
    tags: ["ICP", "备案"],
    params: {
        domain: {
            type: "string",
            required: true,
            description: "需要查询的域名",
            example: "example.com"
        },
        cache: {
            type: "boolean",
            required: false,
            description: "是否使用缓存, 默认启用缓存",
            example: true
        }
    }
};

export const handler = async (ctx: Context) => {
    const { domain, cache = true } = ctx.query;
    ctx.set("Content-Type", "application/json");

    redis.set("icp-checker:domain", domain as string);

    ctx.body = {
        message: "Headers set successfully",
        data: await getIcpInfo(domain as string, cache as boolean),
    };
};

const getIcpInfo = async (domain: string, cache: boolean) => {
    return {
        domain,
        cache,
    };
}