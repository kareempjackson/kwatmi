import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly baseUrl = 'https://api.ng.termii.com/api';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TERMII_API_KEY') || '';
    this.senderId = this.configService.get<string>('TERMII_SENDER_ID') || 'Kwatmi';
  }

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    // Format phone number for Nigeria (ensure +234 prefix)
    const formattedNumber = this.formatNigerianNumber(phoneNumber);

    if (!this.apiKey) {
      this.logger.warn(`SMS not sent (no API key configured): ${message} to ${formattedNumber}`);
      return false;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sms/send`, {
        api_key: this.apiKey,
        to: formattedNumber,
        from: this.senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
      });

      if (response.data.code === 'ok') {
        this.logger.log(`SMS sent successfully to ${formattedNumber}`);
        return true;
      } else {
        this.logger.error(`SMS failed: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`SMS error: ${error.message}`);
      return false;
    }
  }

  private formatNigerianNumber(phoneNumber: string): string {
    // Remove any spaces or special characters
    let cleaned = phoneNumber.replace(/[^0-9+]/g, '');

    // Handle different formats
    if (cleaned.startsWith('+234')) {
      return cleaned;
    } else if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    } else {
      return '+234' + cleaned;
    }
  }
}
