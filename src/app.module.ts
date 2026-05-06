import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ZonesModule } from './zones/zones.module';
import { FareModule } from './fare/fare.module';

@Module({
  imports: [PrismaModule, ZonesModule, FareModule],
})
export class AppModule {}
