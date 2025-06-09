// HTTP 请求方法
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// 参数类型
type ParamType = "string" | "boolean" | "number" | "array" | "object";

// 参数结构
interface Param {
    type: ParamType;
    required: boolean;
    description: string;
    example: any;
}

// 插件元数据接口
export interface PluginMeta {
    path: string;                             // API路径
    method: HttpMethod[];                     // 只允许 GET, POST, PUT, DELETE, PATCH
    description: string;                      // 描述，必须是字符串
    tags: string[];                           // 标签，数组形式
    params: Record<string, Param>;            // 参数对象，键为参数名，值为参数的类型和描述等信息
}
