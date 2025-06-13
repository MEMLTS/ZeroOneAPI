import dotenv from 'dotenv';
import logger from '@lib/Logger';

export class Config {
    private static instance: Config;
    private env: NodeJS.ProcessEnv;

    private constructor(envFilePath?: string) {
        logger.info('Loading environment variables...');
        dotenv.config({ path: envFilePath });
        this.env = process.env;
    }

    /**
     * 获取单例实例
     * @param envFilePath 可选，指定 .env 文件路径
     */
    public static getInstance(envFilePath?: string): Config {
        if (!Config.instance) {
            Config.instance = new Config(envFilePath);
        }
        return Config.instance;
    }

    /**
     * 获取所有环境变量（只读）
     */
    public getAll(): Readonly<NodeJS.ProcessEnv> {
        return this.env;
    }

    /**
     * 获取指定环境变量
     * @param key
     */
    public get(key: string): string | undefined {
        const val = this.env[key];
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
        const val = this.env[key];
        if (val === undefined) {
            throw new Error(`Environment variable ${key} is required but not defined.`);
        }
        return val;
    }

    /**
     * 获取数值类型环境变量
     */
    public getNumber(key: string): number | undefined {
        const val = this.env[key];
        if (val === undefined) return undefined;
        const num = Number(val);
        if (isNaN(num)) {
            logger.warn(`Environment variable ${key} is not a valid number: ${val}`);
            return undefined;
        }
        return num;
    }

    /**
     * 获取布尔类型环境变量，默认false
     * 认为 'true', '1', 'yes' 是 true，其余是 false
     */
    public getBoolean(key: string): boolean {
        const val = this.env[key];
        if (val === undefined) return false;
        const normalized = val.toLowerCase();
        if (['true', '1', 'yes'].includes(normalized)) return true;
        if (['false', '0', 'no'].includes(normalized)) return false;
        logger.warn(`Environment variable ${key} is not a valid boolean: ${val}`);
        return false;
    }
}
