import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZonesService } from '../zones/zones.service';
import { FareResponseDto } from './dto/fare-response.dto';

@Injectable()
export class PricingService {
  private readonly BASE_FARE_OKADA = 200;
  private readonly BASE_FARE_KEKE = 350;
  private readonly PER_KM_OKADA = 50;
  private readonly PER_KM_KEKE = 80;

  constructor(
    private readonly prisma: PrismaService,
    private readonly zonesService: ZonesService,
  ) {}

  async calculateFare(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
    vehicleType: 'okada' | 'keke',
  ): Promise<FareResponseDto> {
    const pickupZoneId = await this.zonesService.findZoneByCoordinates(pickupLat, pickupLng);
    const dropoffZoneId = await this.zonesService.findZoneByCoordinates(dropoffLat, dropoffLng);

    if (!pickupZoneId) {
      throw new NotFoundException('Pickup location is not within a supported zone');
    }

    if (!dropoffZoneId) {
      throw new NotFoundException('Dropoff location is not within a supported zone');
    }

    const distanceKm = this.calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);

    let zonePricing = await this.prisma.zonePricing.findFirst({
      where: {
        fromZoneId: pickupZoneId,
        toZoneId: dropoffZoneId,
      },
    });

    if (!zonePricing && pickupZoneId !== dropoffZoneId) {
      zonePricing = await this.prisma.zonePricing.findFirst({
        where: {
          fromZoneId: dropoffZoneId,
          toZoneId: pickupZoneId,
        },
      });
    }

    const baseFare = vehicleType === 'okada' ? this.BASE_FARE_OKADA : this.BASE_FARE_KEKE;
    const perKmRate = vehicleType === 'okada' ? this.PER_KM_OKADA : this.PER_KM_KEKE;

    let fareNaira: number;

    if (zonePricing) {
      const zoneBaseFare = vehicleType === 'okada' 
        ? Math.round(zonePricing.baseFareKeke * 0.6) 
        : zonePricing.baseFareKeke;
      fareNaira = zoneBaseFare + Math.round(distanceKm * perKmRate);
    } else {
      fareNaira = baseFare + Math.round(distanceKm * perKmRate);
    }

    fareNaira = Math.max(200, Math.min(fareNaira, 5000));

    const pickupZone = await this.prisma.zone.findUnique({ where: { id: pickupZoneId } });
    const dropoffZone = await this.prisma.zone.findUnique({ where: { id: dropoffZoneId } });

    return {
      fare_naira: fareNaira,
      distance_km: Math.round(distanceKm * 10) / 10,
      vehicle_type: vehicleType,
      pickup_zone: pickupZone?.name || 'Unknown',
      dropoff_zone: dropoffZone?.name || 'Unknown',
      currency: 'NGN',
    };
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
