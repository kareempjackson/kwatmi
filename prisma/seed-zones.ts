import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ZoneData {
  name: string;
  polygon: GeoJSON.Polygon;
}

const lagosZones: ZoneData[] = [
  {
    name: 'Ikeja',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3300, 6.5800],
        [3.3700, 6.5800],
        [3.3700, 6.6200],
        [3.3300, 6.6200],
        [3.3300, 6.5800],
      ]],
    },
  },
  {
    name: 'Lekki Phase 1',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4600, 6.4300],
        [3.4900, 6.4300],
        [3.4900, 6.4600],
        [3.4600, 6.4600],
        [3.4600, 6.4300],
      ]],
    },
  },
  {
    name: 'Victoria Island',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4100, 6.4200],
        [3.4500, 6.4200],
        [3.4500, 6.4500],
        [3.4100, 6.4500],
        [3.4100, 6.4200],
      ]],
    },
  },
  {
    name: 'Surulere',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3400, 6.4900],
        [3.3800, 6.4900],
        [3.3800, 6.5200],
        [3.3400, 6.5200],
        [3.3400, 6.4900],
      ]],
    },
  },
  {
    name: 'Yaba',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3700, 6.5000],
        [3.4000, 6.5000],
        [3.4000, 6.5300],
        [3.3700, 6.5300],
        [3.3700, 6.5000],
      ]],
    },
  },
  {
    name: 'Ikoyi',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4200, 6.4400],
        [3.4500, 6.4400],
        [3.4500, 6.4700],
        [3.4200, 6.4700],
        [3.4200, 6.4400],
      ]],
    },
  },
  {
    name: 'Ajah',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.5500, 6.4600],
        [3.5900, 6.4600],
        [3.5900, 6.4900],
        [3.5500, 6.4900],
        [3.5500, 6.4600],
      ]],
    },
  },
  {
    name: 'Apapa',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3500, 6.4400],
        [3.3900, 6.4400],
        [3.3900, 6.4700],
        [3.3500, 6.4700],
        [3.3500, 6.4400],
      ]],
    },
  },
  {
    name: 'Festac',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.2700, 6.4600],
        [3.3100, 6.4600],
        [3.3100, 6.4900],
        [3.2700, 6.4900],
        [3.2700, 6.4600],
      ]],
    },
  },
  {
    name: 'Mainland',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3600, 6.4700],
        [3.4000, 6.4700],
        [3.4000, 6.5000],
        [3.3600, 6.5000],
        [3.3600, 6.4700],
      ]],
    },
  },
  {
    name: 'Oshodi',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3400, 6.5400],
        [3.3700, 6.5400],
        [3.3700, 6.5700],
        [3.3400, 6.5700],
        [3.3400, 6.5400],
      ]],
    },
  },
  {
    name: 'Mushin',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3500, 6.5200],
        [3.3800, 6.5200],
        [3.3800, 6.5500],
        [3.3500, 6.5500],
        [3.3500, 6.5200],
      ]],
    },
  },
  {
    name: 'Maryland',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3600, 6.5600],
        [3.3900, 6.5600],
        [3.3900, 6.5900],
        [3.3600, 6.5900],
        [3.3600, 6.5600],
      ]],
    },
  },
  {
    name: 'Ogba',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3300, 6.6100],
        [3.3600, 6.6100],
        [3.3600, 6.6400],
        [3.3300, 6.6400],
        [3.3300, 6.6100],
      ]],
    },
  },
  {
    name: 'Ojuelegba',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3600, 6.5100],
        [3.3900, 6.5100],
        [3.3900, 6.5400],
        [3.3600, 6.5400],
        [3.3600, 6.5100],
      ]],
    },
  },
  {
    name: 'Gbagada',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3800, 6.5400],
        [3.4100, 6.5400],
        [3.4100, 6.5700],
        [3.3800, 6.5700],
        [3.3800, 6.5400],
      ]],
    },
  },
  {
    name: 'Ogudu',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3900, 6.5600],
        [3.4200, 6.5600],
        [3.4200, 6.5900],
        [3.3900, 6.5900],
        [3.3900, 6.5600],
      ]],
    },
  },
  {
    name: 'Sangotedo',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.5100, 6.4700],
        [3.5400, 6.4700],
        [3.5400, 6.5000],
        [3.5100, 6.5000],
        [3.5100, 6.4700],
      ]],
    },
  },
];

interface PricingData {
  fromZone: string;
  toZone: string;
  baseFareKeke: number;
}

const zonePricingMatrix: PricingData[] = [
  { fromZone: 'Ikeja', toZone: 'Ikeja', baseFareKeke: 350 },
  { fromZone: 'Ikeja', toZone: 'Maryland', baseFareKeke: 450 },
  { fromZone: 'Ikeja', toZone: 'Oshodi', baseFareKeke: 400 },
  { fromZone: 'Ikeja', toZone: 'Ogba', baseFareKeke: 400 },
  { fromZone: 'Ikeja', toZone: 'Yaba', baseFareKeke: 600 },
  { fromZone: 'Ikeja', toZone: 'Victoria Island', baseFareKeke: 1200 },
  { fromZone: 'Ikeja', toZone: 'Lekki Phase 1', baseFareKeke: 1400 },
  { fromZone: 'Victoria Island', toZone: 'Victoria Island', baseFareKeke: 350 },
  { fromZone: 'Victoria Island', toZone: 'Ikoyi', baseFareKeke: 400 },
  { fromZone: 'Victoria Island', toZone: 'Lekki Phase 1', baseFareKeke: 500 },
  { fromZone: 'Victoria Island', toZone: 'Surulere', baseFareKeke: 700 },
  { fromZone: 'Victoria Island', toZone: 'Yaba', baseFareKeke: 650 },
  { fromZone: 'Lekki Phase 1', toZone: 'Lekki Phase 1', baseFareKeke: 350 },
  { fromZone: 'Lekki Phase 1', toZone: 'Ajah', baseFareKeke: 600 },
  { fromZone: 'Lekki Phase 1', toZone: 'Sangotedo', baseFareKeke: 550 },
  { fromZone: 'Lekki Phase 1', toZone: 'Ikoyi', baseFareKeke: 550 },
  { fromZone: 'Surulere', toZone: 'Surulere', baseFareKeke: 350 },
  { fromZone: 'Surulere', toZone: 'Yaba', baseFareKeke: 400 },
  { fromZone: 'Surulere', toZone: 'Mainland', baseFareKeke: 400 },
  { fromZone: 'Surulere', toZone: 'Ojuelegba', baseFareKeke: 350 },
  { fromZone: 'Surulere', toZone: 'Mushin', baseFareKeke: 400 },
  { fromZone: 'Yaba', toZone: 'Yaba', baseFareKeke: 350 },
  { fromZone: 'Yaba', toZone: 'Gbagada', baseFareKeke: 450 },
  { fromZone: 'Yaba', toZone: 'Mainland', baseFareKeke: 350 },
  { fromZone: 'Yaba', toZone: 'Ikoyi', baseFareKeke: 500 },
  { fromZone: 'Apapa', toZone: 'Apapa', baseFareKeke: 350 },
  { fromZone: 'Apapa', toZone: 'Festac', baseFareKeke: 500 },
  { fromZone: 'Apapa', toZone: 'Surulere', baseFareKeke: 600 },
  { fromZone: 'Festac', toZone: 'Festac', baseFareKeke: 350 },
  { fromZone: 'Festac', toZone: 'Oshodi', baseFareKeke: 700 },
  { fromZone: 'Ajah', toZone: 'Ajah', baseFareKeke: 350 },
  { fromZone: 'Ajah', toZone: 'Sangotedo', baseFareKeke: 400 },
  { fromZone: 'Gbagada', toZone: 'Gbagada', baseFareKeke: 350 },
  { fromZone: 'Gbagada', toZone: 'Ogudu', baseFareKeke: 400 },
  { fromZone: 'Gbagada', toZone: 'Maryland', baseFareKeke: 400 },
  { fromZone: 'Oshodi', toZone: 'Oshodi', baseFareKeke: 350 },
  { fromZone: 'Oshodi', toZone: 'Mushin', baseFareKeke: 350 },
  { fromZone: 'Oshodi', toZone: 'Maryland', baseFareKeke: 400 },
  { fromZone: 'Maryland', toZone: 'Maryland', baseFareKeke: 350 },
  { fromZone: 'Maryland', toZone: 'Ogudu', baseFareKeke: 400 },
];

async function seedZonesAndPricing() {
  console.log('Seeding Lagos zones and pricing matrix...');

  const zoneMap = new Map<string, string>();

  for (const zoneData of lagosZones) {
    const existingZone = await prisma.zone.findFirst({
      where: { name: zoneData.name },
    });

    if (existingZone) {
      zoneMap.set(zoneData.name, existingZone.id);
      console.log(`Zone ${zoneData.name} already exists`);
    } else {
      const zone = await prisma.zone.create({
        data: {
          name: zoneData.name,
          polygon: zoneData.polygon as object,
        },
      });
      zoneMap.set(zoneData.name, zone.id);
      console.log(`Created zone: ${zoneData.name}`);
    }
  }

  for (const pricing of zonePricingMatrix) {
    const fromZoneId = zoneMap.get(pricing.fromZone);
    const toZoneId = zoneMap.get(pricing.toZone);

    if (!fromZoneId || !toZoneId) {
      console.warn(`Skipping pricing: ${pricing.fromZone} -> ${pricing.toZone} (zone not found)`);
      continue;
    }

    const existingPricing = await prisma.zonePricing.findFirst({
      where: {
        fromZoneId,
        toZoneId,
      },
    });

    if (!existingPricing) {
      await prisma.zonePricing.create({
        data: {
          fromZoneId,
          toZoneId,
          baseFareKeke: pricing.baseFareKeke,
        },
      });
      console.log(`Created pricing: ${pricing.fromZone} -> ${pricing.toZone}: ₦${pricing.baseFareKeke}`);
    }
  }

  console.log('Seeding completed!');
}

seedZonesAndPricing()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
