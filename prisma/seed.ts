import { PrismaClient, UserRole, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

// Lagos zone coordinates (simplified polygons for major areas)
const lagosZones = [
  {
    name: 'Ikeja',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3389, 6.6018],
        [3.3689, 6.6018],
        [3.3689, 6.6318],
        [3.3389, 6.6318],
        [3.3389, 6.6018]
      ]]
    }
  },
  {
    name: 'Lekki',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4700, 6.4300],
        [3.5200, 6.4300],
        [3.5200, 6.4700],
        [3.4700, 6.4700],
        [3.4700, 6.4300]
      ]]
    }
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
        [3.4100, 6.4200]
      ]]
    }
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
        [3.3400, 6.4900]
      ]]
    }
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
        [3.3700, 6.5000]
      ]]
    }
  },
  {
    name: 'Mainland',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3500, 6.4600],
        [3.4000, 6.4600],
        [3.4000, 6.5000],
        [3.3500, 6.5000],
        [3.3500, 6.4600]
      ]]
    }
  },
  {
    name: 'Ikoyi',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4300, 6.4400],
        [3.4600, 6.4400],
        [3.4600, 6.4700],
        [3.4300, 6.4700],
        [3.4300, 6.4400]
      ]]
    }
  },
  {
    name: 'Ajah',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.5500, 6.4600],
        [3.6000, 6.4600],
        [3.6000, 6.5000],
        [3.5500, 6.5000],
        [3.5500, 6.4600]
      ]]
    }
  },
  {
    name: 'Apapa',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3500, 6.4300],
        [3.3900, 6.4300],
        [3.3900, 6.4600],
        [3.3500, 6.4600],
        [3.3500, 6.4300]
      ]]
    }
  },
  {
    name: 'Festac',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.2800, 6.4600],
        [3.3200, 6.4600],
        [3.3200, 6.5000],
        [3.2800, 6.5000],
        [3.2800, 6.4600]
      ]]
    }
  }
];

// Base prices for KEKE (tricycle) in Naira - OKADA is 60% of KEKE
const basePricesKeke: Record<string, Record<string, number>> = {
  'Ikeja': { 'Ikeja': 500, 'Lekki': 1800, 'Victoria Island': 1500, 'Surulere': 800, 'Yaba': 700, 'Mainland': 600, 'Ikoyi': 1400, 'Ajah': 2200, 'Apapa': 1000, 'Festac': 1200 },
  'Lekki': { 'Ikeja': 1800, 'Lekki': 500, 'Victoria Island': 600, 'Surulere': 1500, 'Yaba': 1400, 'Mainland': 1300, 'Ikoyi': 700, 'Ajah': 800, 'Apapa': 1700, 'Festac': 2000 },
  'Victoria Island': { 'Ikeja': 1500, 'Lekki': 600, 'Victoria Island': 500, 'Surulere': 1200, 'Yaba': 1100, 'Mainland': 1000, 'Ikoyi': 400, 'Ajah': 1100, 'Apapa': 1400, 'Festac': 1700 },
  'Surulere': { 'Ikeja': 800, 'Lekki': 1500, 'Victoria Island': 1200, 'Surulere': 500, 'Yaba': 400, 'Mainland': 500, 'Ikoyi': 1100, 'Ajah': 1900, 'Apapa': 700, 'Festac': 900 },
  'Yaba': { 'Ikeja': 700, 'Lekki': 1400, 'Victoria Island': 1100, 'Surulere': 400, 'Yaba': 500, 'Mainland': 400, 'Ikoyi': 1000, 'Ajah': 1800, 'Apapa': 800, 'Festac': 1000 },
  'Mainland': { 'Ikeja': 600, 'Lekki': 1300, 'Victoria Island': 1000, 'Surulere': 500, 'Yaba': 400, 'Mainland': 500, 'Ikoyi': 900, 'Ajah': 1700, 'Apapa': 700, 'Festac': 900 },
  'Ikoyi': { 'Ikeja': 1400, 'Lekki': 700, 'Victoria Island': 400, 'Surulere': 1100, 'Yaba': 1000, 'Mainland': 900, 'Ikoyi': 500, 'Ajah': 1200, 'Apapa': 1300, 'Festac': 1600 },
  'Ajah': { 'Ikeja': 2200, 'Lekki': 800, 'Victoria Island': 1100, 'Surulere': 1900, 'Yaba': 1800, 'Mainland': 1700, 'Ikoyi': 1200, 'Ajah': 500, 'Apapa': 2100, 'Festac': 2400 },
  'Apapa': { 'Ikeja': 1000, 'Lekki': 1700, 'Victoria Island': 1400, 'Surulere': 700, 'Yaba': 800, 'Mainland': 700, 'Ikoyi': 1300, 'Ajah': 2100, 'Apapa': 500, 'Festac': 700 },
  'Festac': { 'Ikeja': 1200, 'Lekki': 2000, 'Victoria Island': 1700, 'Surulere': 900, 'Yaba': 1000, 'Mainland': 900, 'Ikoyi': 1600, 'Ajah': 2400, 'Apapa': 700, 'Festac': 500 }
};

// Sample test drivers
const testDrivers = [
  { phone: '+2348012345001', name: 'Adebayo Okonkwo', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-001-OKD' },
  { phone: '+2348012345002', name: 'Chinedu Eze', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-002-OKD' },
  { phone: '+2348012345003', name: 'Ibrahim Musa', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-001-KKE' },
  { phone: '+2348012345004', name: 'Oluwaseun Adeleke', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-002-KKE' },
  { phone: '+2348012345005', name: 'Tunde Bakare', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-003-OKD' },
  { phone: '+2348012345006', name: 'Emeka Nwankwo', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-003-KKE' },
  { phone: '+2348012345007', name: 'Yusuf Abdullahi', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-004-OKD' },
  { phone: '+2348012345008', name: 'Femi Adeyemi', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-004-KKE' },
  { phone: '+2348012345009', name: 'Chisom Okoro', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-005-OKD' },
  { phone: '+2348012345010', name: 'Segun Fashola', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-005-KKE' },
  { phone: '+2348012345011', name: 'Uche Okafor', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-006-OKD' },
  { phone: '+2348012345012', name: 'Kunle Ajayi', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-006-KKE' },
  { phone: '+2348012345013', name: 'Ahmed Bello', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-007-OKD' },
  { phone: '+2348012345014', name: 'Gbenga Oladipo', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-007-KKE' },
  { phone: '+2348012345015', name: 'Obinna Agu', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-008-OKD' },
  { phone: '+2348012345016', name: 'Dayo Ogunleye', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-008-KKE' },
  { phone: '+2348012345017', name: 'Chukwudi Nwosu', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-009-OKD' },
  { phone: '+2348012345018', name: 'Sola Adeniyi', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-009-KKE' },
  { phone: '+2348012345019', name: 'Ifeanyi Onyeka', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-010-OKD' },
  { phone: '+2348012345020', name: 'Bode Akintola', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-010-KKE' }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create zones
  console.log('Creating Lagos zones...');
  const createdZones: Record<string, string> = {};
  
  for (const zone of lagosZones) {
    const created = await prisma.zone.upsert({
      where: { name: zone.name },
      update: { polygon: zone.polygon },
      create: {
        name: zone.name,
        polygon: zone.polygon
      }
    });
    createdZones[zone.name] = created.id;
    console.log(`  ✓ Created zone: ${zone.name}`);
  }

  // Create pricing matrix
  console.log('Creating pricing matrix...');
  for (const [fromZoneName, toPrices] of Object.entries(basePricesKeke)) {
    for (const [toZoneName, kekePrice] of Object.entries(toPrices)) {
      const fromZoneId = createdZones[fromZoneName];
      const toZoneId = createdZones[toZoneName];
      
      if (!fromZoneId || !toZoneId) continue;

      // Create KEKE pricing
      await prisma.pricing.upsert({
        where: {
          fromZoneId_toZoneId_vehicleType: {
            fromZoneId,
            toZoneId,
            vehicleType: VehicleType.KEKE
          }
        },
        update: { priceNaira: kekePrice },
        create: {
          fromZoneId,
          toZoneId,
          vehicleType: VehicleType.KEKE,
          priceNaira: kekePrice
        }
      });

      // Create OKADA pricing (60% of KEKE)
      const okadaPrice = Math.round(kekePrice * 0.6);
      await prisma.pricing.upsert({
        where: {
          fromZoneId_toZoneId_vehicleType: {
            fromZoneId,
            toZoneId,
            vehicleType: VehicleType.OKADA
          }
        },
        update: { priceNaira: okadaPrice },
        create: {
          fromZoneId,
          toZoneId,
          vehicleType: VehicleType.OKADA,
          priceNaira: okadaPrice
        }
      });
    }
  }
  console.log('  ✓ Created pricing for all zone combinations');

  // Create test drivers
  console.log('Creating test drivers...');
  for (const driver of testDrivers) {
    const user = await prisma.user.upsert({
      where: { phone: driver.phone },
      update: { name: driver.name, role: UserRole.DRIVER },
      create: {
        phone: driver.phone,
        name: driver.name,
        role: UserRole.DRIVER
      }
    });

    await prisma.driver.upsert({
      where: { userId: user.id },
      update: {
        vehicleType: driver.vehicleType,
        plateNumber: driver.plateNumber
      },
      create: {
        userId: user.id,
        vehicleType: driver.vehicleType,
        plateNumber: driver.plateNumber,
        isOnline: false
      }
    });
    console.log(`  ✓ Created driver: ${driver.name} (${driver.vehicleType})`);
  }

  // Create a test passenger
  console.log('Creating test passenger...');
  await prisma.user.upsert({
    where: { phone: '+2348099999999' },
    update: { name: 'Test Passenger' },
    create: {
      phone: '+2348099999999',
      name: 'Test Passenger',
      role: UserRole.PASSENGER
    }
  });
  console.log('  ✓ Created test passenger');

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });