import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import Router from '@koa/router';
import Plugin from './Plugin';

export class PluginManager {
    private instances: Plugin[] = [];

    public loadPlugins(app: Koa, router: Router): void {
        const startTime = Date.now();
        const pluginDir = path.join(__dirname, '../../plugins/example');
        if (!fs.existsSync(pluginDir)) {
            Logger.error(`插件目录不存在: ${pluginDir}`);
            return;
        }

        const files = fs.readdirSync(pluginDir);

        for (const file of files) {
            if (!/\.(js|ts)$/.test(file)) continue;

            const pluginPath = path.resolve(pluginDir, file);

            try {
                delete require.cache[pluginPath];
                const exports = require(pluginPath);
                let PluginClass: (new () => Plugin) | null = null;

                if (exports?.default && typeof exports.default === 'function') {
                    PluginClass = exports.default;
                } else if (typeof exports === 'function') {
                    PluginClass = exports;
                } else {
                    for (const key in exports) {
                        const value = exports[key];
                        if (typeof value === 'function' && value.prototype instanceof Plugin) {
                            PluginClass = value;
                            break;
                        }
                    }
                }

                if (!PluginClass || !(PluginClass.prototype instanceof Plugin)) {
                    Logger.warn(`文件 ${file} 不是合法插件类`);
                    continue;
                }

                const instance = new PluginClass();
                this.instances.push(instance);

                Logger.debug(`加载插件：${instance.meta.name}`);
                this.registerRoutes(router, instance);
            } catch (err) {
                Logger.error(`加载插件 ${file} 出错:`, err);
            }
        }

        this.instances.sort((a, b) => (a.meta.priority ?? 0) - (b.meta.priority ?? 0));
        Logger.info(`插件加载完成，数量：${this.instances.length}`);
        Logger.info(`插件加载耗时：${Date.now() - startTime}ms`);
    }

    public getPlugins(): Plugin[] {
        return this.instances;
    }

    private registerRoutes(router: Router, plugin: Plugin): void {
        const rules = plugin.meta?.rule;
        if (!Array.isArray(rules)) return;

        for (const rule of rules) {
            const methods = rule.method?.length ? rule.method : ['GET'];

            for (const method of methods) {
                const handlerName = rule.handler;
                if (!handlerName || typeof (plugin as any)[handlerName] !== 'function') {
                    Logger.warn(`插件 ${plugin.meta.name} 缺少 handler: ${handlerName}`);
                    continue;
                }

                const fn = (plugin as any)[handlerName].bind(plugin);
                const routePath = rule.path;

                if (routePath) {
                    switch (method.toUpperCase()) {
                        case 'GET':
                            router.get(routePath, fn);
                            break;
                        case 'POST':
                            router.post(routePath, fn);
                            break;
                        case 'PUT':
                            router.put(routePath, fn);
                            break;
                        case 'DELETE':
                            router.delete(routePath, fn);
                            break;
                        case 'PATCH':
                            router.patch(routePath, fn);
                            break;
                        default:
                            Logger.warn(`插件 ${plugin.meta.name} 的 HTTP 方法非法: ${method}`);
                            break;
                    }

                    Logger.debug(`注册路由: [${method.toUpperCase()}] ${routePath}`);
                } else {
                    Logger.warn(`插件 ${plugin.meta.name} 缺少 path`);
                }
            }
        }
    }
}

export default new PluginManager();
