import { PluginMeta } from "../../types/plugin.interface";
import { Next, Context } from "koa";

const meta: PluginMeta = {
    path: "/api/hello-word",
    method: ["GET", "POST"],
    description: "",
    tags: [],
    params: {}
};

const handler = async (ctx: Context, next: Next) => {
    ctx.body = {
        message: "Hello World",
    };
    return next();
};

export default {
    helloWord: {
        meta,
        handler,
    }
};