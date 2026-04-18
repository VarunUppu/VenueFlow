/**
 * @file seed_firebase.js
 * @description Uploads our initial mock data directly into your Firebase Realtime database!
 */

require('dotenv').config();
const { db, IS_MOCK_MODE } = require('./firebase');

// The initial seed data
const SEED_DATA = {
  'zones': {
    zone_north: { name: 'North Gates & Sections', currentCount: 4120, capacity: 5000 },
    zone_south: { name: 'South Gates & Sections', currentCount: 4800, capacity: 5000 },
    zone_east:  { name: 'East Wing / VIP', currentCount: 1200, capacity: 2000 },
    zone_west:  { name: 'West Wing / Amenities', currentCount: 2900, capacity: 4000 }
  },
  'gates': {
    gate_n1: { name: 'Gate N1', queueDepth: 45, processingRate: 15, zoneId: 'zone_north' },
    gate_n2: { name: 'Gate N2', queueDepth: 120, processingRate: 12, zoneId: 'zone_north' },
    gate_s1: { name: 'Gate S1', queueDepth: 12, processingRate: 20, zoneId: 'zone_south' },
    gate_s2: { name: 'Gate S2', queueDepth: 190, processingRate: 10, zoneId: 'zone_south' },
  },
  'queues': {
    q_1: { name: 'Gridiron Grill & Co.', type: 'restaurant', estimatedWaitMinutes: 5, zoneId: 'zone_north' },
    q_2: { name: 'Baseline Pizza Parlor', type: 'restaurant', estimatedWaitMinutes: 12, zoneId: 'zone_east' },
    q_3: { name: 'Touchdown Tacos', type: 'restaurant', estimatedWaitMinutes: 25, zoneId: 'zone_south' },
    q_4: { name: 'North Restrooms A', type: 'restroom', estimatedWaitMinutes: 2, zoneId: 'zone_north' },
  },
  'incidents': {}
};

async function runSeed() {
  if (IS_MOCK_MODE) {
    console.error("❌ ABORTING: The script detected IS_MOCK_MODE is true.");
    console.error("This means it didn't find your .env file credentials! Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set correctly.");
    process.exit(1);
  }

  try {
    console.log(`🔥 Connecting to Firebase...`);
    // admin.app().options.databaseURL might not be directly accessible depending on the SDK version used, 
    // but we can log the env var we're using.
    console.log(`📡 Target URL: ${process.env.FIREBASE_DATABASE_URL || "Using default constructor"}`);
    
    console.log("🚀 Beginning initial seed of Realtime Database...");
    await db.ref('zones').set(SEED_DATA.zones);
    console.log("✅ Seeded Zones");
    
    await db.ref('gates').set(SEED_DATA.gates);
    console.log("✅ Seeded Gates");
    
    await db.ref('queues').set(SEED_DATA.queues);
    console.log("✅ Seeded Queues");

    await db.ref('incidents').set(SEED_DATA.incidents);
    console.log("✅ Seeded/Wiped Incidents");

    console.log("🎉 Database Seeded Successfully! Your dashboard should now load natively.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  }
}

runSeed();
