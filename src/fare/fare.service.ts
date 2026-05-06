import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZonesService } from '../zones/zones.service';
import { FareEstimateResponseDto, VehicleFareBreakdown } from './dto/fare-estimate-response.dto';

@Injectable()
export class FareService {
  private readonly BASE_FARE_OKADA = 200;
  private readonly BASE_FARE_KEKE = 350;
  private readonly OKADA_PRICE_RATIO = 0.6;

  constructor(
    private readonly prisma: PrismaService,
    private readonly zonesService: ZonesService,
  ) {}

  async calculateFareEstimate(
    pickupZoneId: string,
    dropoffZoneId: string,
  ): Promise<FareEstimateResponseDto> {
    if (!pickupZoneId || !dropoffZoneId) {
      throw new BadRequestException('Both pickup_zone_id and dropoff_zone_id are required');
    }

    const [pickupZone, dropoffZone] = await Promise.all([
      this.zonesService.getZoneById(pickupZoneId),
      this.zonesService.getZoneById(dropoffZoneId),
    ]);

    if (!pickupZone) {
      throw new NotFoundException(`Pickup zone with id '${pickupZoneId}' not found`);
    }
    if (!dropoffZone) {
      throw new NotFoundException(`Dropoff zone with id '${dropoffZoneId}' not found`);
    }

    const pricing = await this.prisma.zonePricing.findUnique({
      where: {
        originZoneId_destinationZoneId: {
          originZoneId: pickupZoneId,
          destinationZoneId: dropoffZoneId,
        },
      },
    });

    if (!pricing) {
      throw new NotFoundException(
        `No pricing found for route from '${pickupZone.name}' to '${dropoffZone.name}'`,
      );
    }

    const zoneDistanceFeeKeke = pricing.distanceFeeKeke;
    const zoneDistanceFeeOkada = Math.round(zoneDistanceFeeKeke * this.OKADA_PRICE_RATIO);

    const okadaFare: VehicleFareBreakdown = {
      vehicle_type: 'okada',
      base_fare: this.BASE_FARE_OKADA,
      zone_distance_fee: zoneDistanceFeeOkada,
      total: this.BASE_FARE_OKADA + zoneDistanceFeeOkada,
      currency: 'NGN',
    };

    const kekeFare: VehicleFareBreakdown = {
      vehicle_type: 'keke',
      base_fare: this.BASE_FARE_KEKE,
      zone_distance_fee: zoneDistanceFeeKeke,
      total: this.BASE_FARE_KEKE + zoneDistanceFeeKeke,
      currency: 'NGN',
    };

    return {
      pickup_zone: {
        id: pickupZone.id,
        name: pickupZone.name,
      },
      dropoff_zone: {
        id: dropoffZone.id,
        name: dropoffZone.name,
      },
      fare_breakdown: {
        okada: okadaFare,
        keke: kekeFare,
      },
    };
  }
}
