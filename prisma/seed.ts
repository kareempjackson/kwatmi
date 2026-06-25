import { PrismaClient, UserRole, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

// Lagos zone coordinates (simplified polygons for demo)
const lagosZones = [
  {
    name: 'Ikeja',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.3347, 6.6018],
        [3.3647, 6.6018],
        [3.3647, 6.6318],
        [3.3347, 6.6318],
        [3.3347, 6.6018]
      ]]
    }
  },
  {
    name: 'Lekki',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.4700, 6.4300],
        [3.5500, 6.4300],
        [3.5500, 6.4700],
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
        [3.4600, 6.4200],
        [3.4600, 6.4500],
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
        [3.4200, 6.4400],
        [3.4600, 6.4400],
        [3.4600, 6.4700],
        [3.4200, 6.4700],
        [3.4200, 6.4400]
      ]]
    }
  },
  {
    name: 'Ajah',
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [3.5500, 6.4600],
        [3.6200, 6.4600],
        [3.6200, 6.5000],
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
        [3.2700, 6.4600],
        [3.3100, 6.4600],
        [3.3100, 6.4900],
        [3.2700, 6.4900],
        [3.2700, 6.4600]
      ]]
    }
  }
];

// Base pricing in Naira (Keke prices, Okada is 60% of Keke)
const basePricing: Record<string, Record<string, number>> = {
  'Ikeja': { 'Ikeja': 500, 'Lekki': 2500, 'Victoria Island': 2000, 'Surulere': 1200, 'Yaba': 1000, 'Mainland': 1100, 'Ikoyi': 1800, 'Ajah': 3000, 'Apapa': 1500, 'Festac': 1800 },
  'Lekki': { 'Ikeja': 2500, 'Lekki': 500, 'Victoria Island': 800, 'Surulere': 2200, 'Yaba': 2000, 'Mainland': 1800, 'Ikoyi': 700, 'Ajah': 1000, 'Apapa': 2500, 'Festac': 3000 },
  'Victoria Island': { 'Ikeja': 2000, 'Lekki': 800, 'Victoria Island': 400, 'Surulere': 1500, 'Yaba': 1300, 'Mainland': 1200, 'Ikoyi': 400, 'Ajah': 1500, 'Apapa': 1800, 'Festac': 2500 },
  'Surulere': { 'Ikeja': 1200, 'Lekki': 2200, 'Victoria Island': 1500, 'Surulere': 400, 'Yaba': 600, 'Mainland': 500, 'Ikoyi': 1300, 'Ajah': 2800, 'Apapa': 800, 'Festac': 1200 },
  'Yaba': { 'Ikeja': 1000, 'Lekki': 2000, 'Victoria Island': 1300, 'Surulere': 600, 'Yaba': 400, 'Mainland': 500, 'Ikoyi': 1100, 'Ajah': 2500, 'Apapa': 1000, 'Festac': 1500 },
  'Mainland': { 'Ikeja': 1100, 'Lekki': 1800, 'Victoria Island': 1200, 'Surulere': 500, 'Yaba': 500, 'Mainland': 400, 'Ikoyi': 1000, 'Ajah': 2300, 'Apapa': 800, 'Festac': 1300 },
  'Ikoyi': { 'Ikeja': 1800, 'Lekki': 700, 'Victoria Island': 400, 'Surulere': 1300, 'Yaba': 1100, 'Mainland': 1000, 'Ikoyi': 400, 'Ajah': 1400, 'Apapa': 1500, 'Festac': 2200 },
  'Ajah': { 'Ikeja': 3000, 'Lekki': 1000, 'Victoria Island': 1500, 'Surulere': 2800, 'Yaba': 2500, 'Mainland': 2300, 'Ikoyi': 1400, 'Ajah': 500, 'Apapa': 3000, 'Festac': 3500 },
  'Apapa': { 'Ikeja': 1500, 'Lekki': 2500, 'Victoria Island': 1800, 'Surulere': 800, 'Yaba': 1000, 'Mainland': 800, 'Ikoyi': 1500, 'Ajah': 3000, 'Apapa': 400, 'Festac': 1000 },
  'Festac': { 'Ikeja': 1800, 'Lekki': 3000, 'Victoria Island': 2500, 'Surulere': 1200, 'Yaba': 1500, 'Mainland': 1300, 'Ikoyi': 2200, 'Ajah': 3500, 'Apapa': 1000, 'Festac': 400 }
};

// Sample driver data
const sampleDrivers = [
  { phone: '08011111111', name: 'Chukwuemeka Obi', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-123-AA', lat: 6.6050, lng: 3.3500 },
  { phone: '08022222222', name: 'Adebayo Oluwaseun', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-456-BB', lat: 6.4500, lng: 3.5000 },
  { phone: '08033333333', name: 'Ibrahim Musa', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-789-CC', lat: 6.4350, lng: 3.4300 },
  { phone: '08044444444', name: 'Tunde Bakare', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-012-DD', lat: 6.5050, lng: 3.3600 },
  { phone: '08055555555', name: 'Emeka Nwosu', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-345-EE', lat: 6.5150, lng: 3.3850 },
  { phone: '08066666666', name: 'Yakubu Abubakar', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-678-FF', lat: 6.4800, lng: 3.3700 },
  { phone: '08077777777', name: 'Femi Adeyemi', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-901-GG', lat: 6.4550, lng: 3.4400 },
  { phone: '08088888888', name: 'Kingsley Eze', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-234-HH', lat: 6.4850, lng: 3.5800 },
  { phone: '08099999999', name: 'Segun Ogundimu', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-567-II', lat: 6.4450, lng: 3.3700 },
  { phone: '08012121212', name: 'Uche Okwu', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-890-JJ', lat: 6.4750, lng: 3.2900 },
  { phone: '08013131313', name: 'Babajide Okonkwo', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-111-KK', lat: 6.6100, lng: 3.3450 },
  { phone: '08014141414', name: 'Chijioke Amaechi', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-222-LL', lat: 6.4400, lng: 3.4900 },
  { phone: '08015151515', name: 'Olumide Afolabi', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-333-MM', lat: 6.4250, lng: 3.4150 },
  { phone: '08016161616', name: 'Nasiru Danladi', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-444-NN', lat: 6.5100, lng: 3.3550 },
  { phone: '08017171717', name: 'Obiora Nnamdi', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-555-OO', lat: 6.5200, lng: 3.3900 },
  { phone: '08018181818', name: 'Adesola Oyelaran', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-666-PP', lat: 6.4700, lng: 3.3650 },
  { phone: '08019191919', name: 'Ike Okoye', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-777-QQ', lat: 6.4600, lng: 3.4500 },
  { phone: '08020202020', name: 'Abdullahi Sani', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-888-RR', lat: 6.4900, lng: 3.5900 },
  { phone: '08021212121', name: 'Gbenga Oyewole', vehicleType: VehicleType.OKADA, plateNumber: 'LAG-999-SS', lat: 6.4400, lng: 3.3600 },
  { phone: '08023232323', name: 'Chidi Anyanwu', vehicleType: VehicleType.KEKE, plateNumber: 'LAG-000-TT', lat: 6.4800, lng: 3.2850 }
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.ride.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.zone.deleteMany();

  // Create zones
  console.log('📍 Creating Lagos zones...');
  const createdZones: Record<string, string> = {};
  for (const zone of lagosZones) {
    const created = await prisma.zone.create({
      data: {
        name: zone.name,
        polygon: zone.polygon
      }
    });
    createdZones[zone.name] = created.id;
    console.log(`  ✓ Created zone: ${zone.name}`);
  }

  // Create pricing matrix
  console.log('💰 Creating pricing matrix...');
  for (const [fromZone, toZones] of Object.entries(basePricing)) {
    for (const [toZone, keKePrice] of Object.entries(toZones)) {
      const okadaPrice = Math.round(keKePrice * 0.6);
      
      // Create Keke pricing
      await prisma.pricing.create({
        data: {
          fromZoneId: createdZones[fromZone],
          toZoneId: createdZones[toZone],
          vehicleType: VehicleType.KEKE,
          priceNaira: keKePrice
        }
      });

      // Create Okada pricing (60% of Keke)
      await prisma.pricing.create({
        data: {
          fromZoneId: createdZones[fromZone],
          toZoneId: createdZones[toZone],
          vehicleType: VehicleType.OKADA,
          priceNaira: okadaPrice
        }
      });
    }
  }
  console.log(`  ✓ Created pricing for ${Object.keys(basePricing).length * Object.keys(basePricing).length * 2} routes`);

  // Create sample drivers
  console.log('🚗 Creating sample drivers...');
  for (const driverData of sampleDrivers) {
    const user = await prisma.user.create({
      data: {
        phone: driverData.phone,
        name: driverData.name,
        role: UserRole.DRIVER
      }
    });

    await prisma.driver.create({
      data: {
        userId: user.id,
        vehicleType: driverData.vehicleType,
        plateNumber: driverData.plateNumber,
        isOnline: true,
        currentLat: driverData.lat,
        currentLng: driverData.lng
      }
    });
    console.log(`  ✓ Created driver: ${driverData.name} (${driverData.vehicleType})`);
  }

  // Create sample passengers
  console.log('👥 Creating sample passengers...');
  const passengers = [
    { phone: '08030303030', name: 'Ngozi Okafor' },
    { phone: '08040404040', name: 'Fatima Bello' },
    { phone: '08050505050', name: 'Chidinma Eze' }
  ];

  for (const passenger of passengers) {
    await prisma.user.create({
      data: {
        phone: passenger.phone,
        name: passenger.name,
        role: UserRole.PASSENGER
      }
    });
    console.log(`  ✓ Created passenger: ${passenger.name}`);
  }

  console.log('\n✅ Database seeding completed!');
  console.log(`   - ${lagosZones.length} zones`);
  console.log(`   - ${Object.keys(basePricing).length * Object.keys(basePricing).length * 2} pricing routes`);
  console.log(`   - ${sampleDrivers.length} drivers`);
  console.log(`   - ${passengers.length} passengers`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
