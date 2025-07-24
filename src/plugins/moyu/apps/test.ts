import Plugin from '@lib/plugins/Plugin';
import { Context, Next } from "koa";

export class ExamplePlugin extends Plugin {
    constructor() {
        super({
            name: "example",
            description: "example plugin",
            priority: 0,
            rule: [
                {
                    path: "/api/helloa",
                    method: ["GET"],
                    handler: "helloHandlera"
                }
            ]
        });
    }

    async helloHandlera(ctx: Context, next: Next) {
        ctx.body = { "Hello World!": "example helloHandlera" };
        await next();
    }
}
