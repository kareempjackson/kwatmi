import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly OTP_PREFIX = 'otp:';
  private readonly OTP_EXPIRY_SECONDS = 300;

  constructor(private readonly redisService: RedisService) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeOtp(phoneNumber: string, otp: string): Promise<void> {
    const hash = this.hashOtp(otp);
    const key = this.getOtpKey(phoneNumber);
    await this.redisService.set(key, hash, this.OTP_EXPIRY_SECONDS);
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const key = this.getOtpKey(phoneNumber);
    const storedHash = await this.redisService.get(key);
    
    if (!storedHash) {
      return false;
    }

    const providedHash = this.hashOtp(otp);
    return crypto.timingSafeEqual(
      Buffer.from(storedHash),
      Buffer.from(providedHash),
    );
  }

  async deleteOtp(phoneNumber: string): Promise<void> {
    const key = this.getOtpKey(phoneNumber);
    await this.redisService.del(key);
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  private getOtpKey(phoneNumber: string): string {
    return `${this.OTP_PREFIX}${phoneNumber}`;
  }
}
