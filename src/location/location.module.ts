import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { GoogleMapsService } from './google-maps.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register(),
  ],
  controllers: [LocationController],
  providers: [LocationService, GoogleMapsService],
  exports: [LocationService],
})
export class LocationModule {}
