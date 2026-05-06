import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly termiiApiKey: string;
  private readonly termiiSenderId: string;
  private readonly termiiBaseUrl = 'https://api.ng.termii.com/api';

  constructor(private readonly configService: ConfigService) {
    this.termiiApiKey = this.configService.get<string>('TERMII_API_KEY') || '';
    this.termiiSenderId = this.configService.get<string>('TERMII_SENDER_ID') || 'Kwatmi';
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    const message = `Your Kwatmi verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

    try {
      const response = await axios.post(`${this.termiiBaseUrl}/sms/send`, {
        api_key: this.termiiApiKey,
        to: phoneNumber.replace('+', ''),
        from: this.termiiSenderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
      });

      if (response.data.code !== 'ok') {
        this.logger.error(`Termii SMS failed: ${JSON.stringify(response.data)}`);
        throw new ServiceUnavailableException('Failed to send OTP');
      }

      this.logger.log(`OTP sent to ${phoneNumber.slice(0, 7)}***`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Termii API error: ${error.message}`, error.response?.data);
      } else {
        this.logger.error(`SMS service error: ${error}`);
      }
      throw new ServiceUnavailableException('SMS service unavailable');
    }
  }
}
