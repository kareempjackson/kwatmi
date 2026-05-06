import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export enum SmsTemplate {
  OTP = 'OTP',
  DRIVER_ON_WAY = 'DRIVER_ON_WAY',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
}

export interface SmsTemplateVariables {
  [SmsTemplate.OTP]: { otp: string };
  [SmsTemplate.DRIVER_ON_WAY]: {
    driverName: string;
    vehicleType: string;
    plateNumber: string;
    trackingLink: string;
  };
  [SmsTemplate.DRIVER_ARRIVED]: Record<string, never>;
}

interface TermiiResponse {
  message_id?: string;
  message?: string;
  balance?: number;
  user?: string;
  code?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly baseUrl = 'https://api.ng.termii.com/api';
  private readonly maxRetries = 3;
  private readonly costPerSms = 4; // ₦4 per SMS

  private readonly templates: Record<SmsTemplate, string> = {
    [SmsTemplate.OTP]: 'Your Kwatmi verification code is {otp}. Valid for 5 minutes. Do not share.',
    [SmsTemplate.DRIVER_ON_WAY]:
      'Driver {driverName} on {vehicleType} {plateNumber} is on the way. Track: {trackingLink}',
    [SmsTemplate.DRIVER_ARRIVED]: 'Your driver has arrived at pickup. Please proceed to the pickup point.',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = process.env.TERMII_API_KEY || '';
    this.senderId = process.env.TERMII_SENDER_ID || 'Kwatmi';

    if (!this.apiKey) {
      this.logger.warn('TERMII_API_KEY not configured - SMS will not be sent');
    }
  }

  private substituteVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, attempt - 1) * 1000;
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove spaces, dashes, and other characters
    let normalized = phone.replace(/[\s\-()]/g, '');

    // Convert Nigerian local format to international
    if (normalized.startsWith('0')) {
      normalized = '234' + normalized.substring(1);
    } else if (normalized.startsWith('+')) {
      normalized = normalized.substring(1);
    }

    return normalized;
  }

  async sendSms<T extends SmsTemplate>(
    phoneNumber: string,
    template: T,
    variables: SmsTemplateVariables[T],
    rideId?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const message = this.substituteVariables(
      this.templates[template],
      variables as Record<string, string>,
    );

    let lastError: string | undefined;
    let messageId: string | undefined;
    let success = false;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        if (!this.apiKey) {
          this.logger.warn(`SMS (dry run) to ${normalizedPhone}: ${message}`);
          success = true;
          messageId = `dry-run-${Date.now()}`;
          break;
        }

        const response = await firstValueFrom(
          this.httpService.post<TermiiResponse>(`${this.baseUrl}/sms/send`, {
            api_key: this.apiKey,
            to: normalizedPhone,
            from: this.senderId,
            sms: message,
            type: 'plain',
            channel: 'generic',
          }),
        );

        if (response.data.message_id) {
          messageId = response.data.message_id;
          success = true;
          this.logger.log(
            `SMS sent successfully to ${normalizedPhone}, messageId: ${messageId}`,
          );
          break;
        } else {
          lastError = response.data.message || 'Unknown error from Termii';
          this.logger.warn(
            `SMS attempt ${attempt}/${this.maxRetries} failed: ${lastError}`,
          );
        }
      } catch (error) {
        const axiosError = error as AxiosError<TermiiResponse>;
        lastError =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Network error';
        this.logger.warn(
          `SMS attempt ${attempt}/${this.maxRetries} error: ${lastError}`,
        );
      }

      if (attempt < this.maxRetries) {
        const backoffMs = this.calculateBackoff(attempt);
        this.logger.debug(`Retrying in ${backoffMs}ms...`);
        await this.delay(backoffMs);
      }
    }

    // Log to database
    await this.logSms({
      phoneNumber: normalizedPhone,
      template,
      message,
      success,
      messageId,
      error: lastError,
      rideId,
      costNgn: success ? this.costPerSms : 0,
    });

    return { success, messageId, error: lastError };
  }

  private async logSms(data: {
    phoneNumber: string;
    template: string;
    message: string;
    success: boolean;
    messageId?: string;
    error?: string;
    rideId?: string;
    costNgn: number;
  }): Promise<void> {
    try {
      await this.prisma.smsLog.create({
        data: {
          phoneNumber: data.phoneNumber,
          template: data.template,
          message: data.message,
          status: data.success ? 'SENT' : 'FAILED',
          messageId: data.messageId,
          errorMessage: data.error,
          rideId: data.rideId,
          costNgn: data.costNgn,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log SMS to database', error);
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> {
    return this.sendSms(phoneNumber, SmsTemplate.OTP, { otp });
  }

  async sendDriverOnWay(
    phoneNumber: string,
    driverName: string,
    vehicleType: string,
    plateNumber: string,
    trackingLink: string,
    rideId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendSms(
      phoneNumber,
      SmsTemplate.DRIVER_ON_WAY,
      { driverName, vehicleType, plateNumber, trackingLink },
      rideId,
    );
  }

  async sendDriverArrived(
    phoneNumber: string,
    rideId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendSms(
      phoneNumber,
      SmsTemplate.DRIVER_ARRIVED,
      {} as SmsTemplateVariables[SmsTemplate.DRIVER_ARRIVED],
      rideId,
    );
  }

  getEstimatedCost(smsCount: number): number {
    return smsCount * this.costPerSms;
  }
}
