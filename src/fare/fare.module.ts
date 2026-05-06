import { Module } from '@nestjs/common';
import { FareController } from './fare.controller';
import { FareService } from './fare.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ZonesModule } from '../zones/zones.module';

@Module({
  imports: [PrismaModule, ZonesModule],
  controllers: [FareController],
  providers: [FareService],
  exports: [FareService],
})
export class FareModule {}
