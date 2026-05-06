import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
  ) {}

  async requestOtp(phoneNumber: string): Promise<void> {
    const normalizedPhone = this.normalizeNigerianPhone(phoneNumber);
    
    const otp = this.otpService.generateOtp();
    await this.otpService.storeOtp(normalizedPhone, otp);
    await this.smsService.sendOtp(normalizedPhone, otp);
  }

  async verifyOtp(
    phoneNumber: string,
    otp: string,
  ): Promise<{ accessToken: string; user: { id: string; phoneNumber: string; isNewUser: boolean } }> {
    const normalizedPhone = this.normalizeNigerianPhone(phoneNumber);
    
    const isValid = await this.otpService.verifyOtp(normalizedPhone, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.otpService.deleteOtp(normalizedPhone);

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

    const payload = { sub: user.id, phoneNumber: user.phoneNumber };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        isNewUser,
      },
    };
  }

  private normalizeNigerianPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    }
    
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    if (cleaned.length === 10) {
      return `+234${cleaned}`;
    }
    
    throw new BadRequestException('Invalid Nigerian phone number format');
  }
}
