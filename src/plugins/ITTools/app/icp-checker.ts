import { PluginMeta } from "../../../types/plugin.interface";
import { Context } from "koa";
import { extractRootDomain } from "../utils/extractRootDomain";


export const meta: PluginMeta = {
    path: "/api/icp-checker",
    method: ["GET", "POST"],
    description: "查询ICP备案信息",
    tags: ["ICP", "备案"],
    params: {
        domain: {
            type: "string",
            required: true,
            description: "需要查询的域名、备案号或单位名",
            example: "baidu.com"
        },
        cache: {
            type: "boolean",
            required: false,
            description: "是否使用缓存, 默认启用缓存",
            example: true
        },
        pageNum: {
            type: "number",
            required: false,
            description: "分页页码，仅 POST 支持",
            example: 1
        },
        pageSize: {
            type: "number",
            required: false,
            description: "分页大小，仅 POST 支持",
            example: 20
        }
    }
};

export const handler = async (ctx: Context) => {
    const method = ctx.method;
    const query = method === "GET" ? ctx.query : ctx.body;

    let {
        domain,
        cache = true,
        pageNum,
        pageSize
    } = query as {
        domain: string;
        cache?: boolean;
        pageNum?: number;
        pageSize?: number;
    };

    if (!domain) {
        ctx.status = 400;
        ctx.body = { code: 101, msg: "参数错误，请指定 domain 参数" };
        return;
    }

    domain = extractRootDomain(domain) || domain;

    const cacheKey = `ittool:icp-checker:${domain}`;
    ctx.set("Content-Type", "application/json");

    if (cache && redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
            Logger.debug(`[ICP] 命中缓存: ${domain}`);
            ctx.body = JSON.parse(cached);
            return;
        }
    }

    // 构造远程请求 URL
    const remoteURL = method === "GET"
        ? `http://192.168.1.24:16181/query/web?search=${encodeURIComponent(domain)}`
        : `http://192.168.1.24:16181/query/web`;

    try {
        const fetchResponse = await fetch(remoteURL, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            ...(method === "POST"
                ? {
                    body: JSON.stringify({
                        search: domain,
                        ...(pageNum ? { pageNum } : {}),
                        ...(pageSize ? { pageSize } : {})
                    })
                }
                : {})
        });

        const responseData = await fetchResponse.json();

        if (responseData?.code === 200) {
            if (cache && redis) {
                await redis.set(
                    cacheKey,
                    JSON.stringify({ message: "查询成功", data: responseData }),
                    259200 // 3天
                );
            }

            ctx.body = {
                message: "查询成功",
                data: responseData
            };
        } else {
            Logger.warn(`[ICP] 查询失败: ${domain}, code: ${responseData?.code}`);
            ctx.body = {
                message: "查询失败",
                data: responseData
            };
        }

    } catch (err: any) {
        Logger.error(`[ICP] 请求异常:`, err);
        ctx.status = 502;
        ctx.body = {
            message: "服务请求失败",
            error: err?.message || "未知错误"
        };
    }
};
