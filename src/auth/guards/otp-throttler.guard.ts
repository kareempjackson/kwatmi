import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class OtpThrottlerGuard implements CanActivate {
  private readonly RATE_LIMIT_PREFIX = 'rate_limit:otp:';
  private readonly MAX_REQUESTS = 3;
  private readonly WINDOW_SECONDS = 600;

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const phoneNumber = request.body?.phoneNumber;

    if (!phoneNumber) {
      return true;
    }

    const key = `${this.RATE_LIMIT_PREFIX}${phoneNumber}`;
    const currentCount = await this.redisService.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= this.MAX_REQUESTS) {
      const ttl = await this.redisService.ttl(key);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many OTP requests. Please try again later.',
          retryAfter: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (count === 0) {
      await this.redisService.set(key, '1', this.WINDOW_SECONDS);
    } else {
      await this.redisService.incr(key);
    }

    return true;
  }
}
