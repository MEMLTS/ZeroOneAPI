import fs from 'fs';
import path from 'path';
import KoaRouter from 'koa-router';
import { Plugin } from '../../types/plugin.interface';
import logger from '@lib/Logger';
import { Context, Next } from 'koa';

export class PluginManager {
    private plugins: Plugin[] = [];
    private router = new KoaRouter();

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
            const pluginList = this.normalizePluginExports(pluginModule);

            for (const plugin of pluginList) {
                if (this.isValidPlugin(plugin)) {
                    this.plugins.push(plugin);
                    this.registerRoute(plugin);
                }
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
                const pluginList = this.normalizePluginExports(pluginModule);

                for (const plugin of pluginList) {
                    if (this.isValidPlugin(plugin)) {
                        this.plugins.push(plugin);
                        this.registerRoute(plugin);
                    }
                }
            }
        }

        // 挂载路由到 Koa 应用
        app.use(this.router.routes());
        app.use(this.router.allowedMethods());

        logger.info(`Loaded ${this.plugins.length} plugins.`);
    }

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

    getPlugins(): Plugin[] {
        return this.plugins;
    }

    private isValidPlugin(mod: any): mod is Plugin {
        return mod && typeof mod.meta === 'object' && typeof mod.handler === 'function';
    }

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

    /**
     * 支持插件导出为单个插件、插件对象集
     */
    private normalizePluginExports(mod: any): Plugin[] {
        if (!mod) return [];
        if (typeof mod === 'object') {
            const list: Plugin[] = [];
            for (const key in mod) {
                const item = mod[key];
                if (this.isValidPlugin(item)) {
                    list.push(item);
                }
            }
            return list;
        }

        if (this.isValidPlugin(mod)) {
            return [mod];
        }

        return [];
    }
}

export default new PluginManager();
