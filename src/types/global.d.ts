import { Logger } from 'log4js';
import { RedisClient } from '@lib/Redis';
import { Config } from '@lib/Config';

declare global {
    var Logger: Logger;
    var redis: RedisClient;
    var Config:  Config;
}