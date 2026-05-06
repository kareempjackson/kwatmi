import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TermiiService {
  private readonly logger = new Logger(TermiiService.name);
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly baseUrl = 'https://api.ng.termii.com/api';

  constructor() {
    this.apiKey = process.env.TERMII_API_KEY || '';
    this.senderId = process.env.TERMII_SENDER_ID || 'Kwatmi';
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    // In development/test mode, log OTP instead of sending
    if (process.env.NODE_ENV !== 'production' || !this.apiKey) {
      this.logger.log(`[DEV MODE] OTP for ${phoneNumber}: ${otp}`);
      return;
    }

    try {
      const payload = {
        to: phoneNumber.replace('+', ''),
        from: this.senderId,
        sms: `Your Kwatmi verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        type: 'plain',
        channel: 'generic',
        api_key: this.apiKey,
      };

      const response = await axios.post(`${this.baseUrl}/sms/send`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data.code !== 'ok') {
        this.logger.error(`Termii API error: ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException('Failed to send OTP');
      }

      this.logger.log(`OTP sent successfully to ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP via Termii: ${error.message}`);
      
      if (axios.isAxiosError(error)) {
        this.logger.error(`Termii response: ${JSON.stringify(error.response?.data)}`);
      }
      
      throw new InternalServerErrorException('Failed to send OTP. Please try again.');
    }
  }
}
