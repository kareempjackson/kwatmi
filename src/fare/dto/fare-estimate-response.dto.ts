export class ZoneInfo {
  id: string;
  name: string;
}

export class VehicleFareBreakdown {
  vehicle_type: 'okada' | 'keke';
  base_fare: number;
  zone_distance_fee: number;
  total: number;
  currency: string;
}

export class FareBreakdown {
  okada: VehicleFareBreakdown;
  keke: VehicleFareBreakdown;
}

export class FareEstimateResponseDto {
  pickup_zone: ZoneInfo;
  dropoff_zone: ZoneInfo;
  fare_breakdown: FareBreakdown;
}
