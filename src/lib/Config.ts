export class Config {

    /**
     * 获取所有环境变量（只读）
     */
    public getAll(): Readonly<NodeJS.ProcessEnv> {
        return process.env;
    }

    /**
     * 获取指定环境变量
     * @param key
     */
    public get(key: string): string | undefined {
        const val = process.env[key];
        if (val === undefined) {
            return undefined;
        }
        return val;
    }

    /**
     * 获取必填环境变量，若不存在则抛出异常
     * @param key
     */
    public getRequired(key: string): string {
        const val = process.env[key];
        if (val === undefined) {
            throw new Error(`Environment variable ${key} is required but not defined.`);
        }
        return val;
    }

    /**
     * 获取数值类型环境变量
     */
    public getNumber(key: string): number | undefined {
        const val = process.env[key];
        if (val === undefined) return undefined;
        const num = Number(val);
        if (isNaN(num)) {
            return undefined;
        }
        return num;
    }

    /**
     * 获取布尔类型环境变量，默认false
     * 认为 'true', '1', 'yes', 'on','True' 是 true
     * 认为 'false', '0', 'no', 'off','False' 是 false
     * 其余情况返回 false
     */
    public getBoolean(key: string): boolean {
        const val = process.env[key];
        if (val === undefined) return false;
        const normalized = val.toLowerCase();
        if (['true', '1', 'yes', 'on','True'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off','False'].includes(normalized)) return false;
        return false;
    }
}

export default Config;