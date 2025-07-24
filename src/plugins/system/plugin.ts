import Plugin from '@lib/plugins/Plugin';
import { Context, Next } from "koa";
import PluginManager from '@lib/plugins/Loader';

export class GetAPIList extends Plugin {
    constructor() {
        super({
            name: "system",
            description: "system plugin",
            priority: 0,
            rule: [
                {
                    path: "/system/getAPIList",
                    method: ["GET"],
                    handler: "getAPIListHandler"
                }
            ]
        });
    }

    async getAPIListHandler(ctx: Context, next: Next) {
        ctx.body = { "plugins": PluginManager.getPlugins() };
        await next();
    }
}
