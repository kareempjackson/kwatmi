import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpThrottlerGuard } from './guards/otp-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OtpThrottlerGuard)
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ message: string; expiresIn: number }> {
    await this.authService.requestOtp(dto.phoneNumber);
    return {
      message: 'OTP sent successfully',
      expiresIn: 300,
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<{ accessToken: string; user: { id: string; phoneNumber: string; isNewUser: boolean } }> {
    return this.authService.verifyOtp(dto.phoneNumber, dto.otp);
  }
}
