type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ParamType = "string" | "boolean" | "number" | "array" | "object";

interface Param {
    type: ParamType;
    required: boolean;
    description: string;
    example: any;
}

declare global {
    interface PluginMeta {
        path: string;
        method: HttpMethod[];
        description: string;
        tags: string[];
        params: Record<string, Param>;
    }
}

export {};
