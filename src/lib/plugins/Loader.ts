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
            Logger.error(`The plugin directory does not exist: ${pluginDir}`);
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

        this.instances.sort((a, b) => (a.meta.priority ?? 0) - (b.meta.priority ?? 0));
        Logger.info(`Loaded plugins: ${this.instances.length}`);
        Logger.info(`Loading plugins took: ${Date.now() - startTime}ms`);
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
