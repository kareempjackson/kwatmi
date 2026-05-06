import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async geoAdd(key: string, longitude: number, latitude: number, member: string): Promise<number> {
    return this.client.geoAdd(key, {
      longitude,
      latitude,
      member,
    });
  }

  async geoPos(key: string, member: string): Promise<{ longitude: number; latitude: number } | null> {
    const positions = await this.client.geoPos(key, member);
    if (positions && positions[0]) {
      return {
        longitude: parseFloat(positions[0].longitude as unknown as string),
        latitude: parseFloat(positions[0].latitude as unknown as string),
      };
    }
    return null;
  }

  async geoSearch(
    key: string,
    longitude: number,
    latitude: number,
    radiusKm: number,
  ): Promise<string[]> {
    return this.client.geoSearch(key, { longitude, latitude }, { radius: radiusKm, unit: 'km' });
  }

  async geoRemove(key: string, member: string): Promise<void> {
    await this.client.zRem(key, member);
  }
}
