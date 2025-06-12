import fs from 'fs';
import path from 'path';
import KoaRouter from 'koa-router';
import { Plugin } from '../../types/plugin.interface';
import logger from '@lib/Logger';
import { Context, Next } from 'koa';

export class PluginManager {
    private plugins: Plugin[] = [];
    private router = new KoaRouter();

    /**
     * 加载所有插件并注册到 Koa 应用中
     * @param app - Koa 实例（通常是 `new Koa()`）
     */
    loadPlugins(app: any): void {
        const pluginDir = path.resolve(__dirname, '../../plugins');

        // 加载目录式插件（除了 example）
        const pluginFolders = fs.readdirSync(pluginDir).filter((name) => {
            const dirPath = path.join(pluginDir, name);
            return fs.statSync(dirPath).isDirectory() && name !== 'example';
        });

        for (const folder of pluginFolders) {
            const indexPath = path.join(pluginDir, folder, 'index');
            const pluginModule = this.requireModule(indexPath);

            if (this.isValidPlugin(pluginModule)) {
                this.plugins.push(pluginModule);
                this.registerRoute(pluginModule);
            }
        }

        // 加载 example 中的单文件插件
        const exampleDir = path.join(pluginDir, 'example');
        if (fs.existsSync(exampleDir)) {
            const exampleFiles = fs.readdirSync(exampleDir).filter((file) =>
                file.endsWith('.ts') || file.endsWith('.js')
            );

            for (const file of exampleFiles) {
                const pluginModule = this.requireModule(path.join(exampleDir, file.replace(/\.(ts|js)$/, '')));
                if (this.isValidPlugin(pluginModule)) {
                    this.plugins.push(pluginModule);
                    this.registerRoute(pluginModule);
                }
            }
        }

        // 挂载路由到 Koa 应用
        app.use(this.router.routes());
        app.use(this.router.allowedMethods());

        logger.info(`Loaded ${this.plugins.length} plugins.`);
    }

    /**
     * 注册插件中的路由到 Koa Router
     * @param plugin - 插件对象，包含 meta 信息与 handler 函数
     */
    registerRoute(plugin: Plugin): void {
        const { path, method } = plugin.meta;
        const { handler } = plugin;

        method.forEach((m) => {
            const httpMethod = m.toLowerCase() as keyof typeof this.router;

            if (typeof this.router[httpMethod] === 'function') {
                (this.router[httpMethod] as Function)(path, async (ctx: Context, next: Next) => {
                    await handler(ctx, next);
                });
            } else {
                logger.warn(`Invalid HTTP method: ${m} for route: ${path}`);
            }
        });
    }

    /**
     * 获取所有已加载的插件
     */
    getPlugins(): Plugin[] {
        return this.plugins;
    }

    /**
     * 判断模块是否为合法插件（存在 meta 和 handler）
     * @param mod - 动态导入的模块
     */
    private isValidPlugin(mod: any): mod is Plugin {
        return mod && typeof mod.meta === 'object' && typeof mod.handler === 'function';
    }

    /**
     * 动态加载模块，兼容 `.ts`, `.js`，避免扩展名带来的 require 问题
     * @param modulePath - 模块路径（不包含扩展名）
     */
    private requireModule(modulePath: string): any {
        try {
            const resolvedPath = require.resolve(modulePath);
            const mod = require(resolvedPath);
            return mod?.default ?? mod;
        } catch (err: unknown) {
            logger.warn(`Failed to load plugin at ${modulePath}: ${err}`);
            return null;
        }
    }
}

export default new PluginManager();
