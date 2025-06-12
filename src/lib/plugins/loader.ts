import fs from 'fs';
import path from 'path';
import { Plugin } from '../../types/plugin.interface';
import KoaRouter from 'koa-router';
import logger from '@lib/logger';

export class PluginManager {
    private plugins: Plugin[] = [];
    private router = new KoaRouter();

    // 加载插件
    loadPlugins(app: any) {
        const pluginDir = path.join(__dirname, "../../plugins");
        const dirs = fs.readdirSync(pluginDir).filter(file =>
            fs.lstatSync(path.join(pluginDir, file)).isDirectory()
        );
        dirs.forEach(dir => {
            const pluginModule = require(path.join(pluginDir, dir, 'index.ts')).default;
            if (pluginModule && pluginModule.meta && pluginModule.handler) {
                this.plugins.push(pluginModule);
                this.registerRoute(pluginModule);  // 注册路由
            }
        });
        app.use(this.router.routes());
        app.use(this.router.allowedMethods());

        logger.info(`Loaded ${this.plugins.length} plugins.`);
    }


    registerRoute(plugin: Plugin) {
        const { path, method } = plugin.meta;
        const { handler } = plugin;

        method.forEach((m) => {
            const httpMethod = m.toLowerCase() as "get" | "post" | "put" | "delete" | "patch";

            if (["get", "post", "put", "delete", "patch"].includes(httpMethod)) {
                this.router[httpMethod](path, async (ctx, next) => {
                    await handler(ctx, next);
                });
                logger.debug(`Route registered for: ${path} with method ${httpMethod.toUpperCase()}`);
            } else {
                logger.warn(`Invalid HTTP method: ${m} for route: ${path}`);
            }
        });
    }

    getPlugins() {
        return this.plugins;
    }
}

export default new PluginManager();
