import { Context, Next } from "koa";

export class ExamplePlugin extends P {
    constructor() {
        super({
            name: "example",
            description: "example plugin",
            priority: 0,
            rule: [
                {
                    path: "/api/hello",
                    method: ["GET"],
                    handler: "helloHandler"
                }
            ]
        });
    }

    async helloHandler(ctx: Context, next: Next) {
        ctx.body = "Hello World!";
        await next();
    }
}
