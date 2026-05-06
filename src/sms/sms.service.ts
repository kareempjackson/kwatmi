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
    this.apiKey = this.configService.get<string>('TERMII_API_KEY');
    this.senderId = this.configService.get<string>('TERMII_SENDER_ID', 'Kwatmi');
  }

  /**
   * Send SMS notification when ride is accepted
   */
  async sendRideAcceptedSms(
    phoneNumber: string,
    driverName: string,
    vehiclePlate: string,
    etaMinutes: number,
  ): Promise<boolean> {
    const message = `Your Kwatmi ride has been accepted! Driver: ${driverName}, Plate: ${vehiclePlate}. ETA: ${etaMinutes} mins. Track your ride in the app.`;

    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send generic SMS via Termii API
   */
  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    // Format Nigerian phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    if (!this.apiKey) {
      this.logger.warn('TERMII_API_KEY not configured, skipping SMS');
      this.logger.debug(`Would send to ${formattedPhone}: ${message}`);
      return true; // Return true in dev mode
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sms/send`, {
        api_key: this.apiKey,
        to: formattedPhone,
        from: this.senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
      });

      if (response.data.code === 'ok') {
        this.logger.log(`SMS sent successfully to ${formattedPhone}`);
        return true;
      } else {
        this.logger.error(`SMS send failed: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`SMS send error: ${error.message}`);
      return false;
    }
  }

  /**
   * Format Nigerian phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove spaces and dashes
    let cleaned = phone.replace(/[\s-]/g, '');

    // Convert local format to international
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    } else if (!cleaned.startsWith('234')) {
      cleaned = '234' + cleaned;
    }

    return cleaned;
  }
}
