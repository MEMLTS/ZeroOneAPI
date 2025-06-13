import { Logger } from 'log4js';
import { RedisClient } from '@lib/Redis';

declare global {
    var Logger: Logger;
    var redis: RedisClient;
}