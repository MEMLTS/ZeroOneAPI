import Koa from 'koa';
import cors from '@koa/cors';
import log from '@middlewares/logger';
import Config from '@lib/Config';
import statistics from '@middlewares/statistics';
import PluginManager from '@lib/plugins/Loader';

export class ApiServer {
    private readonly app: Koa;

    constructor() {
        this.app = new Koa();
    }

    /**
     * 初始化中间件、插件等
     */
    public async initialize(): Promise<void> {
        Logger.info('Starting API Server...');
        const start = Date.now();

        this.app.use(cors({ origin: '*' }));

        // 日志中间件
        this.app.use(log);

        if(Config.getBoolean('STATIS_ENABLE')) {
            // 统计中间件
            this.app.use(statistics);
        }

        // 加载插件
        PluginManager.loadPlugins(this.app);

        Logger.info(`API Server started in ${Date.now() - start}ms`);
    }

    /**
     * 获取 Koa 实例
     */
    public getApp(): Koa {
        return this.app;
    }

    /**
     * 启动服务监听
     */
    public async listen(port: number, host: string = '0.0.0.0'): Promise<void> {
        await this.initialize();
        this.app.listen(port, host, () => {
            Logger.info(`API Server is listening on http://${host}:${port}`);
        });
    }
}
