import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import { Context, Next } from 'koa';

export class PluginManager {
    private plugins: typeof P[] = [];
    private router = new Koa();

    /**
     * 加载插件
     * @param app Koa 实例
     */
    public loadPlugins(app: Koa): void {
        const pluginDir = path.resolve(__dirname, '../../plugins');

    }
    /**
     * 获取所有插件
     */
    public getPlugins(): typeof P[] {
        return this.plugins;
    }
}
export default new PluginManager();