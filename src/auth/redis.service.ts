import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;
  private memoryStore = new Map<string, { value: string; expiresAt: number }>();

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    try {
      this.client = createClient({ url: redisUrl });
      
      this.client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}. Using in-memory fallback.`);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      this.logger.warn(`Failed to connect to Redis: ${error.message}. Using in-memory fallback.`);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.isConnected) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      // In-memory fallback
      this.memoryStore.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected) {
      return this.client.get(key);
    }
    
    // In-memory fallback
    const item = this.memoryStore.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    
    return item.value;
  }

  async del(key: string): Promise<void> {
    if (this.isConnected) {
      await this.client.del(key);
    } else {
      this.memoryStore.delete(key);
    }
  }

  async incr(key: string): Promise<number> {
    if (this.isConnected) {
      return this.client.incr(key);
    }
    
    // In-memory fallback
    const item = this.memoryStore.get(key);
    const currentValue = item ? parseInt(item.value, 10) : 0;
    const newValue = currentValue + 1;
    
    this.memoryStore.set(key, {
      value: newValue.toString(),
      expiresAt: item?.expiresAt || Date.now() + 300000,
    });
    
    return newValue;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (this.isConnected) {
      await this.client.expire(key, ttlSeconds);
    } else {
      const item = this.memoryStore.get(key);
      if (item) {
        item.expiresAt = Date.now() + ttlSeconds * 1000;
      }
    }
  }
}
