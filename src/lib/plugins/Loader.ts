import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import Router from '@koa/router';
import Plugin from './Plugin';

class PluginManager {
    private instances: Plugin[] = [];

    public loadPlugins(app: Koa, router: Router): void {
        const startTime = Date.now();
        const pluginsDir = path.join(__dirname, '../../plugins');

        this.loadPluginFromDir(path.join(pluginsDir, 'example'), router);
        this.loadPluginFromDir(path.join(pluginsDir, 'system'), router);

        // 加载 plugins 目录下所有文件夹的插件
        const pluginDirs = fs.readdirSync(pluginsDir).filter(item => fs.statSync(path.join(pluginsDir, item)).isDirectory());
        for (const pluginFolder of pluginDirs) {
            if (pluginFolder === 'example' || pluginFolder === 'system') continue;
            const pluginFolderPath = path.join(pluginsDir, pluginFolder);
            const indexFilePath = path.join(pluginFolderPath, 'index.ts');

            // 如果是一个文件夹且包含 index.ts
            if (fs.existsSync(indexFilePath)) {
                try {
                    const pluginExports = require(indexFilePath);
                    const pluginsArray: Plugin[] = pluginExports.default || pluginExports;

                    // 确保是数组
                    if (Array.isArray(pluginsArray)) {
                        for (const pluginClass of pluginsArray) {
                            this.loadPlugin(pluginClass, pluginFolder, router);
                        }
                    } else {
                        Logger.warn(`The file ${pluginFolder}/index.ts doesn't export an array of plugins.`);
                    }
                } catch (err) {
                    Logger.error(`Error loading plugin from ${pluginFolder}/index.ts:`, err);
                }
            }
        }

        this.instances.sort((a, b) => (a.meta.priority ?? 0) - (b.meta.priority ?? 0));
        Logger.info(`Loaded plugins: ${this.instances.length}`);
        Logger.info(`Loading plugins took: ${Date.now() - startTime}ms`);
    }

    private loadPluginFromDir(pluginDir: string, router: Router): void {
        if (!fs.existsSync(pluginDir)) return;

        const files = fs.readdirSync(pluginDir);
        for (const file of files) {
            if (!/\.(js|ts)$/.test(file)) continue;

            const pluginPath = path.resolve(pluginDir, file);
            try {
                delete require.cache[pluginPath];  // 清除缓存
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
                    Logger.warn(`The file ${file} is not a valid plugin class.`);
                    continue;
                }

                const instance = new PluginClass();
                this.instances.push(instance);

                Logger.debug(`Loading plugin: ${instance.meta.name}`);
                this.registerRoutes(router, instance);
            } catch (err) {
                Logger.error(`Loading plugin ${file} failed:`, err);
            }
        }
    }

    private loadPlugin(PluginClass: any, pluginFolder: string, router: Router): void {
        // 验证是否是有效的插件类
        if (!(PluginClass.prototype instanceof Plugin)) {
            Logger.warn(`The file ${pluginFolder}/index.ts does not export a valid plugin class.`);
            return;
        }

        const instance = new PluginClass();
        this.instances.push(instance);

        Logger.debug(`Loading plugin: ${instance.meta.name}`);
        this.registerRoutes(router, instance);
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
                    Logger.warn(`Plugin ${plugin.meta.name} is missing handler: ${handlerName}`);
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
                            Logger.warn(`Plugin ${plugin.meta.name} has invalid HTTP method: ${method}`);
                            break;
                    }

                    Logger.debug(`Registering route: [${method.toUpperCase()}] ${routePath}`);
                } else {
                    Logger.warn(`Plugin ${plugin.meta.name} is missing path`);
                }
            }
        }
    }
}

export default new PluginManager();