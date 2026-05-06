import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

// Lagos zones with approximate polygon coordinates (GeoJSON format)
const lagosZones = [
  {
    name: 'Victoria Island',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4100, 6.4280],
        [3.4500, 6.4280],
        [3.4500, 6.4450],
        [3.4100, 6.4450],
        [3.4100, 6.4280]
      ]]
    }
  },
  {
    name: 'Lekki',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4500, 6.4300],
        [3.5500, 6.4300],
        [3.5500, 6.4700],
        [3.4500, 6.4700],
        [3.4500, 6.4300]
      ]]
    }
  },
  {
    name: 'Ikeja',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3300, 6.5800],
        [3.3700, 6.5800],
        [3.3700, 6.6200],
        [3.3300, 6.6200],
        [3.3300, 6.5800]
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
    name: 'Surulere',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3400, 6.4900],
        [3.3700, 6.4900],
        [3.3700, 6.5200],
        [3.3400, 6.5200],
        [3.3400, 6.4900]
      ]]
    }
  }
];

// Test drivers distributed across Lagos zones
const testDrivers = [
  // Victoria Island drivers
  { name: 'Chukwuemeka Okonkwo', phone: '+2348011111101', vehicleType: VehicleType.okada, plateNumber: 'LAG-123-AA', currentLat: 6.4320, currentLng: 3.4250 },
  { name: 'Adebayo Adesina', phone: '+2348011111102', vehicleType: VehicleType.keke, plateNumber: 'LAG-124-AB', currentLat: 6.4350, currentLng: 3.4300 },
  { name: 'Ifeanyi Nnamdi', phone: '+2348011111103', vehicleType: VehicleType.okada, plateNumber: 'LAG-125-AC', currentLat: 6.4400, currentLng: 3.4200 },
  { name: 'Oluwaseun Bakare', phone: '+2348011111104', vehicleType: VehicleType.keke, plateNumber: 'LAG-126-AD', currentLat: 6.4380, currentLng: 3.4350 },
  
  // Lekki drivers
  { name: 'Tunde Ogundimu', phone: '+2348011111105', vehicleType: VehicleType.okada, plateNumber: 'LAG-127-AE', currentLat: 6.4500, currentLng: 3.4800 },
  { name: 'Emeka Eze', phone: '+2348011111106', vehicleType: VehicleType.keke, plateNumber: 'LAG-128-AF', currentLat: 6.4550, currentLng: 3.5000 },
  { name: 'Yusuf Ibrahim', phone: '+2348011111107', vehicleType: VehicleType.okada, plateNumber: 'LAG-129-AG', currentLat: 6.4600, currentLng: 3.5200 },
  { name: 'Kunle Adewale', phone: '+2348011111108', vehicleType: VehicleType.keke, plateNumber: 'LAG-130-AH', currentLat: 6.4450, currentLng: 3.4900 },
  
  // Ikeja drivers
  { name: 'Obinna Chidi', phone: '+2348011111109', vehicleType: VehicleType.okada, plateNumber: 'LAG-131-AI', currentLat: 6.5900, currentLng: 3.3400 },
  { name: 'Femi Oladipo', phone: '+2348011111110', vehicleType: VehicleType.keke, plateNumber: 'LAG-132-AJ', currentLat: 6.6000, currentLng: 3.3500 },
  { name: 'Ahmed Bello', phone: '+2348011111111', vehicleType: VehicleType.okada, plateNumber: 'LAG-133-AK', currentLat: 6.6100, currentLng: 3.3600 },
  { name: 'Gbenga Ojo', phone: '+2348011111112', vehicleType: VehicleType.keke, plateNumber: 'LAG-134-AL', currentLat: 6.5950, currentLng: 3.3550 },
  
  // Yaba drivers
  { name: 'Uche Nwachukwu', phone: '+2348011111113', vehicleType: VehicleType.okada, plateNumber: 'LAG-135-AM', currentLat: 6.5100, currentLng: 3.3800 },
  { name: 'Segun Akinwale', phone: '+2348011111114', vehicleType: VehicleType.keke, plateNumber: 'LAG-136-AN', currentLat: 6.5150, currentLng: 3.3850 },
  { name: 'Chisom Okeke', phone: '+2348011111115', vehicleType: VehicleType.okada, plateNumber: 'LAG-137-AO', currentLat: 6.5200, currentLng: 3.3900 },
  { name: 'Dotun Adeleke', phone: '+2348011111116', vehicleType: VehicleType.keke, plateNumber: 'LAG-138-AP', currentLat: 6.5050, currentLng: 3.3950 },
  
  // Surulere drivers
  { name: 'Kayode Olatunji', phone: '+2348011111117', vehicleType: VehicleType.okada, plateNumber: 'LAG-139-AQ', currentLat: 6.5000, currentLng: 3.3500 },
  { name: 'Ikechukwu Obi', phone: '+2348011111118', vehicleType: VehicleType.keke, plateNumber: 'LAG-140-AR', currentLat: 6.5050, currentLng: 3.3550 },
  { name: 'Lanre Ogunleye', phone: '+2348011111119', vehicleType: VehicleType.okada, plateNumber: 'LAG-141-AS', currentLat: 6.5100, currentLng: 3.3600 },
  { name: 'Nnamdi Azikiwe', phone: '+2348011111120', vehicleType: VehicleType.keke, plateNumber: 'LAG-142-AT', currentLat: 6.4950, currentLng: 3.3650 }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.ride.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.zone.deleteMany();

  // Seed zones
  console.log('📍 Seeding Lagos zones...');
  for (const zone of lagosZones) {
    await prisma.zone.create({
      data: {
        name: zone.name,
        polygon: zone.polygon
      }
    });
    console.log(`  ✅ Created zone: ${zone.name}`);
  }

  // Seed drivers
  console.log('🚗 Seeding test drivers...');
  for (const driver of testDrivers) {
    await prisma.driver.create({
      data: {
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        plateNumber: driver.plateNumber,
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5 and 5.0
        isActive: true,
        currentLat: driver.currentLat,
        currentLng: driver.currentLng
      }
    });
    console.log(`  ✅ Created driver: ${driver.name} (${driver.vehicleType})`);
  }

  // Create a test user
  console.log('👤 Creating test user...');
  await prisma.user.create({
    data: {
      phone: '+2348099999999',
      name: 'Test Rider'
    }
  });
  console.log('  ✅ Created test user');

  console.log('\n✨ Database seeding completed!');
  console.log(`   - ${lagosZones.length} zones created`);
  console.log(`   - ${testDrivers.length} drivers created`);
  console.log('   - 1 test user created');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
