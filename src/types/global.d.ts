import { Logger } from 'log4js';
import { RedisClient } from '@lib/Redis';
import Plugin from '@lib/plugins/Plugin';

declare global {
    var Logger: Logger;
    var redis: RedisClient;
    var P: typeof Plugin;
    type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
}

export {};
