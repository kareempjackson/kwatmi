import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LAGOS_ZONES = [
  { name: 'Ikeja', description: 'Ikeja and surrounding areas' },
  { name: 'Lekki', description: 'Lekki Peninsula and environs' },
  { name: 'Victoria Island', description: 'VI and Oniru' },
  { name: 'Surulere', description: 'Surulere and Aguda' },
  { name: 'Yaba', description: 'Yaba, Akoka, and Unilag area' },
  { name: 'Mainland', description: 'Lagos Mainland areas' },
  { name: 'Ikoyi', description: 'Ikoyi and Old Ikoyi' },
  { name: 'Ajah', description: 'Ajah and Abraham Adesanya' },
  { name: 'Apapa', description: 'Apapa and ports area' },
  { name: 'Festac', description: 'Festac Town and Amuwo-Odofin' },
];

// Zone pricing matrix (Keke prices in Naira) - roughly based on distance
// Same zone = 300, Adjacent = 500, Far = 800, Very far = 1200
const PRICING_MATRIX: Record<string, Record<string, number>> = {
  'Ikeja': { 'Ikeja': 300, 'Lekki': 1200, 'Victoria Island': 1000, 'Surulere': 500, 'Yaba': 500, 'Mainland': 500, 'Ikoyi': 800, 'Ajah': 1500, 'Apapa': 800, 'Festac': 800 },
  'Lekki': { 'Ikeja': 1200, 'Lekki': 300, 'Victoria Island': 500, 'Surulere': 1000, 'Yaba': 1000, 'Mainland': 1200, 'Ikoyi': 500, 'Ajah': 500, 'Apapa': 1500, 'Festac': 1500 },
  'Victoria Island': { 'Ikeja': 1000, 'Lekki': 500, 'Victoria Island': 300, 'Surulere': 800, 'Yaba': 800, 'Mainland': 800, 'Ikoyi': 300, 'Ajah': 800, 'Apapa': 800, 'Festac': 1200 },
  'Surulere': { 'Ikeja': 500, 'Lekki': 1000, 'Victoria Island': 800, 'Surulere': 300, 'Yaba': 300, 'Mainland': 300, 'Ikoyi': 500, 'Ajah': 1200, 'Apapa': 500, 'Festac': 500 },
  'Yaba': { 'Ikeja': 500, 'Lekki': 1000, 'Victoria Island': 800, 'Surulere': 300, 'Yaba': 300, 'Mainland': 300, 'Ikoyi': 500, 'Ajah': 1200, 'Apapa': 500, 'Festac': 800 },
  'Mainland': { 'Ikeja': 500, 'Lekki': 1200, 'Victoria Island': 800, 'Surulere': 300, 'Yaba': 300, 'Mainland': 300, 'Ikoyi': 800, 'Ajah': 1500, 'Apapa': 500, 'Festac': 500 },
  'Ikoyi': { 'Ikeja': 800, 'Lekki': 500, 'Victoria Island': 300, 'Surulere': 500, 'Yaba': 500, 'Mainland': 800, 'Ikoyi': 300, 'Ajah': 800, 'Apapa': 800, 'Festac': 1000 },
  'Ajah': { 'Ikeja': 1500, 'Lekki': 500, 'Victoria Island': 800, 'Surulere': 1200, 'Yaba': 1200, 'Mainland': 1500, 'Ikoyi': 800, 'Ajah': 300, 'Apapa': 1500, 'Festac': 1800 },
  'Apapa': { 'Ikeja': 800, 'Lekki': 1500, 'Victoria Island': 800, 'Surulere': 500, 'Yaba': 500, 'Mainland': 500, 'Ikoyi': 800, 'Ajah': 1500, 'Apapa': 300, 'Festac': 500 },
  'Festac': { 'Ikeja': 800, 'Lekki': 1500, 'Victoria Island': 1200, 'Surulere': 500, 'Yaba': 800, 'Mainland': 500, 'Ikoyi': 1000, 'Ajah': 1800, 'Apapa': 500, 'Festac': 300 },
};

async function main() {
  console.log('Seeding database...');

  // Create zones
  const zones: Record<string, string> = {};
  for (const zone of LAGOS_ZONES) {
    const created = await prisma.zone.upsert({
      where: { name: zone.name },
      update: { description: zone.description },
      create: zone,
    });
    zones[zone.name] = created.id;
    console.log(`Created zone: ${zone.name}`);
  }

  // Create zone pricing matrix
  for (const [originName, destinations] of Object.entries(PRICING_MATRIX)) {
    for (const [destName, price] of Object.entries(destinations)) {
      const originZoneId = zones[originName];
      const destinationZoneId = zones[destName];
      
      if (originZoneId && destinationZoneId) {
        await prisma.zonePricing.upsert({
          where: {
            originZoneId_destinationZoneId: {
              originZoneId,
              destinationZoneId,
            },
          },
          update: { distanceFeeKeke: price },
          create: {
            originZoneId,
            destinationZoneId,
            distanceFeeKeke: price,
          },
        });
      }
    }
  }
  console.log('Zone pricing matrix created');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
