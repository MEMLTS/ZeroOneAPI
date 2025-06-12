import { Context } from 'koa';

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ParamType = "string" | "boolean" | "number" | "array" | "object";

interface Param {
    type: ParamType;
    required: boolean;
    description: string;
    example: any;
}

export interface PluginMeta {
    path: string;
    method: HttpMethod[];
    description?: string;
    tags?: string[];
    params?: Record<string, Param>;
}

export interface Plugin {
  meta: PluginMeta;
  handler: (ctx: Context, next?: any) => Promise<void>;
}