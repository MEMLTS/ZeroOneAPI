import Koa from 'koa';
import cors from '@koa/cors';
import log from '@middlewares/logger';
import Config from '@lib/Config';
import statistics from '@middlewares/statistics';
import PluginManager from '@lib/plugins/Loader';
import Router from '@koa/router';

export class ApiServer {
    private readonly app: Koa;
    private readonly config: Config;
    private readonly router: Router = new Router();

    constructor() {
        this.app = new Koa();
        this.config = new Config();
        this.router = new Router();
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

        if (this.config.getBoolean('STATIS_ENABLE')) {
            // 统计中间件
            this.app.use(statistics);
        }

        // 加载插件
        Logger.info('Loading plugins...');
        PluginManager.loadPlugins(this.app, this.router);

        // 挂载路由
        this.app.use(this.router.routes());
        this.app.use(this.router.allowedMethods());

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
