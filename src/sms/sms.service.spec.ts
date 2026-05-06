import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { SmsService, SmsTemplate } from './sms.service';
import { PrismaService } from '../prisma/prisma.service';
import { AxiosResponse } from 'axios';

describe('SmsService', () => {
  let service: SmsService;
  let httpService: HttpService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    smsLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    process.env.TERMII_API_KEY = 'test-api-key';
    process.env.TERMII_SENDER_ID = 'Kwatmi';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
    httpService = module.get<HttpService>(HttpService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.TERMII_API_KEY;
    delete process.env.TERMII_SENDER_ID;
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { message_id: 'msg123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.sendOtp('08012345678', '123456');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg123');
      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.smsLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phoneNumber: '2348012345678',
          template: SmsTemplate.OTP,
          status: 'SENT',
          costNgn: 4,
        }),
      });
    });

    it('should normalize phone numbers correctly', async () => {
      const mockResponse: AxiosResponse = {
        data: { message_id: 'msg123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.sendOtp('+2348012345678', '123456');

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          to: '2348012345678',
        }),
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      const mockError = new Error('Network error');
      const mockSuccessResponse: AxiosResponse = {
        data: { message_id: 'msg123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post
        .mockReturnValueOnce(throwError(() => mockError))
        .mockReturnValueOnce(of(mockSuccessResponse));

      const result = await service.sendOtp('08012345678', '123456');

      expect(result.success).toBe(true);
      expect(mockHttpService.post).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should fail after max retries', async () => {
      const mockError = new Error('Network error');

      mockHttpService.post.mockReturnValue(throwError(() => mockError));

      const result = await service.sendOtp('08012345678', '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(mockHttpService.post).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.smsLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'FAILED',
          costNgn: 0,
        }),
      });
    }, 15000);
  });

  describe('sendDriverOnWay', () => {
    it('should send driver on way notification', async () => {
      const mockResponse: AxiosResponse = {
        data: { message_id: 'msg456' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.sendDriverOnWay(
        '08012345678',
        'Chidi',
        'Okada',
        'ABC-123-XY',
        'https://kwatmi.ng/t/abc123',
        'ride-id-123',
      );

      expect(result.success).toBe(true);
      expect(mockPrismaService.smsLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template: SmsTemplate.DRIVER_ON_WAY,
          message: 'Driver Chidi on Okada ABC-123-XY is on the way. Track: https://kwatmi.ng/t/abc123',
          rideId: 'ride-id-123',
        }),
      });
    });
  });

  describe('sendDriverArrived', () => {
    it('should send driver arrived notification', async () => {
      const mockResponse: AxiosResponse = {
        data: { message_id: 'msg789' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.sendDriverArrived('08012345678', 'ride-id-456');

      expect(result.success).toBe(true);
      expect(mockPrismaService.smsLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template: SmsTemplate.DRIVER_ARRIVED,
          message: 'Your driver has arrived at pickup. Please proceed to the pickup point.',
          rideId: 'ride-id-456',
        }),
      });
    });
  });

  describe('getEstimatedCost', () => {
    it('should calculate SMS cost correctly', () => {
      expect(service.getEstimatedCost(1)).toBe(4);
      expect(service.getEstimatedCost(10)).toBe(40);
      expect(service.getEstimatedCost(100)).toBe(400);
    });
  });
});
