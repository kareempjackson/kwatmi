import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { RidesGateway } from './rides.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    PrismaModule,
    SmsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RidesController],
  providers: [RidesService, RidesGateway],
  exports: [RidesService, RidesGateway],
})
export class RidesModule {}
