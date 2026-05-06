import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import { TermiiService } from './termii.service';
import { RedisService } from './redis.service';

export interface JwtPayload {
  userId: string;
  role: string;
  phone: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly termiiService: TermiiService,
    private readonly redisService: RedisService,
  ) {}

  async requestOtp(phoneNumber: string): Promise<{ message: string; expiresIn: number }> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    
    // Check rate limit for OTP verification attempts
    const attemptsKey = `otp_attempts:${normalizedPhone}`;
    const attempts = await this.redisService.get(attemptsKey);
    
    if (attempts && parseInt(attempts, 10) >= 3) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again in 5 minutes.',
      );
    }

    // Generate and store OTP
    const otp = this.otpService.generateOtp();
    const hashedOtp = await this.otpService.hashOtp(otp);
    
    const otpKey = `otp:${normalizedPhone}`;
    await this.redisService.set(otpKey, hashedOtp, 300); // 5 minutes TTL

    // Send OTP via Termii
    await this.termiiService.sendOtp(normalizedPhone, otp);

    return {
      message: 'OTP sent successfully',
      expiresIn: 300,
    };
  }

  async verifyOtp(
    phoneNumber: string,
    otp: string,
  ): Promise<{ accessToken: string; user: any; isNewUser: boolean }> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    
    // Check verification attempts rate limit
    const attemptsKey = `verify_attempts:${normalizedPhone}`;
    const attempts = await this.redisService.get(attemptsKey);
    const currentAttempts = attempts ? parseInt(attempts, 10) : 0;
    
    if (currentAttempts >= 3) {
      throw new BadRequestException(
        'Too many verification attempts. Please request a new OTP.',
      );
    }

    // Increment attempts
    await this.redisService.set(
      attemptsKey,
      (currentAttempts + 1).toString(),
      300,
    );

    // Get stored OTP hash
    const otpKey = `otp:${normalizedPhone}`;
    const storedHashedOtp = await this.redisService.get(otpKey);

    if (!storedHashedOtp) {
      throw new UnauthorizedException('OTP expired or not found. Please request a new one.');
    }

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(otp, storedHashedOtp);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Clear OTP and attempts after successful verification
    await this.redisService.del(otpKey);
    await this.redisService.del(attemptsKey);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    let isNewUser = false;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber: normalizedPhone,
        },
      });
      isNewUser = true;
    }

    // Generate JWT
    const payload: JwtPayload = {
      userId: user.id,
      role: 'rider',
      phone: user.phoneNumber,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      isNewUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Nigerian phone number formats
    if (cleaned.startsWith('234')) {
      // Already in international format
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      // Local format: 08012345678 -> +2348012345678
      return `+234${cleaned.substring(1)}`;
    } else if (cleaned.length === 10) {
      // Without leading zero: 8012345678 -> +2348012345678
      return `+234${cleaned}`;
    }
    
    // Return with + prefix if not already
    return phone.startsWith('+') ? phone : `+${cleaned}`;
  }
}
