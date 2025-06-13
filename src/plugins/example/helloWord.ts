import { Context } from "koa";

export default [
    {
        meta: {
            path: "/api/hello",
            method: ["GET"]
        },
        handler: async (ctx: Context) => {
            ctx.body = { message: "Hello" };
        }
    }
]
