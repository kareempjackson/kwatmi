import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly MAX_REQUESTS = 3;
  private readonly WINDOW_SECONDS = 300; // 5 minutes

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const phoneNumber = request.body?.phoneNumber;

    if (!phoneNumber) {
      return true; // Let validation handle missing phone number
    }

    const key = `rate_limit:otp_request:${phoneNumber}`;
    const currentCount = await this.redisService.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= this.MAX_REQUESTS) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many OTP requests. Please try again in 5 minutes.',
          retryAfter: this.WINDOW_SECONDS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    if (count === 0) {
      await this.redisService.set(key, '1', this.WINDOW_SECONDS);
    } else {
      await this.redisService.incr(key);
    }

    return true;
  }
}
