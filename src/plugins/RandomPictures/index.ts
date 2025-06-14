import path from 'path';
import fs from 'fs/promises';
import { AliasManager, loadAliasMap } from "./aliasManager";
import { PluginMeta } from '../../types/plugin.interface';

function getContentTypeByExt(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'webp': return 'image/webp';
        case 'bmp': return 'image/bmp';
        default: return 'application/octet-stream';
    }
}

class RandomPicturesPlugin {
    public readonly meta: PluginMeta;
    private aliasManager: AliasManager | null = null;
    private initialized = false;

    constructor() {
        this.meta = {
            path: '/api/random-pictures',
            method: ['GET', 'POST'],
            description: '获取随机图片',
            tags: ['图片', '随机'],
        };
    }

    public async init() {
        if (this.initialized) return;
        const filePath = path.resolve(__dirname, "name.json");
        const aliasMap = await loadAliasMap(filePath);
        this.aliasManager = new AliasManager(aliasMap);
        this.initialized = true;
    }

    public handler = async (ctx: any) => {
        if (!this.aliasManager) {
            ctx.status = 503;
            ctx.body = { message: "RandomPicturesPlugin 正在初始化，请稍后重试" };
            this.init().catch(err => {
                Logger.error('RandomPicturesPlugin 初始化失败:', err);
            });
            return;
        }

        const method = ctx.method.toUpperCase();
        const query = method === 'GET' ? ctx.query : ctx.request.body || {};
        const nameKey = String(query.name || '').trim();

        if (!nameKey) {
            ctx.status = 400;
            ctx.body = { message: "缺少必需的参数: name" };
            return;
        }

        let mainKey = this.aliasManager.findKeyByAlias(nameKey);

        const baseDataDir = path.resolve(__dirname, 'data');

        if (!mainKey) {
            const possibleDir = path.resolve(baseDataDir, nameKey);
            try {
                const stat = await fs.stat(possibleDir);
                if (stat.isDirectory()) {
                    mainKey = nameKey;
                }
            } catch {}
        }

        if (!mainKey) {
            ctx.status = 404;
            ctx.body = { message: "未找到对应的主键，也不存在对应的图片文件夹" };
            return;
        }

        const key = `statistics:random-pictures`;
        const current = await redis.hget(key, mainKey);
        const count = current ? parseInt(current, 10) + 1 : 1;
        await redis.hset(key, mainKey, count.toString());

        const imagesDir = path.resolve(baseDataDir, mainKey);
        let files: string[] = [];
        try {
            files = await fs.readdir(imagesDir);
        } catch {
            ctx.status = 404;
            ctx.body = { message: "该name没有图片资源" };
            return;
        }

        if (files.length === 0) {
            ctx.status = 404;
            ctx.body = { message: "该name没有图片资源" };
            return;
        }

        const imageFileName = files[Math.floor(Math.random() * files.length)];
        const imagePath = path.resolve(imagesDir, imageFileName);

        try {
            const imageBuffer = await fs.readFile(imagePath);
            const contentType = getContentTypeByExt(imageFileName);

            ctx.set('Content-Type', contentType);
            ctx.body = imageBuffer;
        } catch (err) {
            ctx.status = 500;
            ctx.body = { message: '读取图片失败' };
            Logger.error('读取图片失败:', err);
        }
    };

}

const pluginInstance = new RandomPicturesPlugin();

(async () => {
    try {
        await pluginInstance.init();
        Logger.info('RandomPictures plugin initialized successfully.');
    } catch (err) {
        Logger.error('RandomPictures plugin 初始化失败:', err);
    }
})();

export const meta = pluginInstance.meta;
export const handler = pluginInstance.handler;

export default [
    {
        meta,
        handler,
    }
];
