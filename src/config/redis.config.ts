import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const redisConfigFactory = async (
  configService: ConfigService,
): Promise<CacheModuleOptions> => {
  const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
  const redisPort = configService.get<number>('REDIS_PORT', 6379);
  const redisPassword = configService.get<string>('REDIS_PASSWORD');
  const redisDb = configService.get<number>('REDIS_DB', 0);

  return {
    store: await redisStore({
      socket: {
        host: redisHost,
        port: redisPort,
      },
      password: redisPassword || undefined,
      database: redisDb,
    }),
    ttl: 86400000, // 24 hours default TTL in milliseconds
  };
};
