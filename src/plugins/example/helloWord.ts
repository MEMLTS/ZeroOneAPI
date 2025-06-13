import { Plugin, PluginMeta } from "../../types/plugin.interface";
import { Context } from "koa";

function createHelloWorldPlugin(): Plugin[] {
    const meta: PluginMeta = {
        path: "/api/hello-word",
        method: ["GET", "POST"],
        description: "A simple Hello World plugin",
        tags: ["example"],
        params: {}
    };

    const handler = async (ctx: Context) => {
        ctx.body = {
            message: "Hello World",
        };
    };

    const plugin: Plugin = {
        meta,
        handler
    };

    return [plugin];
}

const plugins: Plugin[] = createHelloWorldPlugin();
export default plugins;
