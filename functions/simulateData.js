/**
 * @file functions/simulateData.js
 * @description Firebase Cloud Function that runs on a 30-second Pub/Sub schedule.
 * Writes randomised but realistic zone occupancy (40–95%) and queue wait times
 * (2–18 mins) to simulate live IoT sensor data in the Realtime Database.
 */

'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();

/**
 * Returns a random integer between min and max (inclusive).
 *
 * @param {number} min - Lower bound (inclusive).
 * @param {number} max - Upper bound (inclusive).
 * @returns {number} Random integer in [min, max].
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random float rounded to 1 decimal place between min and max.
 *
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number} Random float in [min, max].
 */
function randFloat(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

/**
 * Simulated zone configuration (mirrors expected Firebase RTDB structure).
 * In production this would come from the DB itself.
 */
const ZONE_CONFIG = [
  { id: 'zone_north', name: 'North Stand', capacity: 5000 },
  { id: 'zone_south', name: 'South Stand', capacity: 4800 },
  { id: 'zone_east',  name: 'East Stand',  capacity: 3200 },
  { id: 'zone_west',  name: 'West Stand',  capacity: 3200 },
  { id: 'zone_vip',   name: 'VIP Lounge',  capacity: 800  },
];

const QUEUE_CONFIG = [
  { id: 'concession_a', name: 'Concession Stand A', type: 'concession', zoneId: 'zone_north' },
  { id: 'concession_b', name: 'Concession Stand B', type: 'concession', zoneId: 'zone_south' },
  { id: 'concession_c', name: 'Concession Stand C', type: 'concession', zoneId: 'zone_east'  },
  { id: 'restroom_n',   name: 'Restrooms North',    type: 'restroom',   zoneId: 'zone_north' },
  { id: 'restroom_s',   name: 'Restrooms South',    type: 'restroom',   zoneId: 'zone_south' },
  { id: 'merch_main',   name: 'Main Merchandise',   type: 'facility',   zoneId: 'zone_west'  },
];

const GATE_CONFIG = [
  { id: 'gate_1', name: 'Gate 1', zoneId: 'zone_north', processingRate: 120 },
  { id: 'gate_2', name: 'Gate 2', zoneId: 'zone_north', processingRate: 100 },
  { id: 'gate_3', name: 'Gate 3', zoneId: 'zone_south', processingRate: 110 },
  { id: 'gate_4', name: 'Gate 4', zoneId: 'zone_south', processingRate: 95  },
  { id: 'gate_5', name: 'Gate 5', zoneId: 'zone_east',  processingRate: 130 },
  { id: 'gate_6', name: 'Gate 6', zoneId: 'zone_west',  processingRate: 115 },
];

/**
 * Firebase Cloud Function — simulates live sensor data by writing randomised
 * but realistic occupancy and queue wait times to Firebase RTDB every 30 seconds.
 *
 * @type {functions.CloudFunction}
 */
exports.simulateLiveData = functions
  .pubsub
  .schedule('every 1 minutes') // Pub/Sub minimum is 1 min; use Cloud Scheduler for 30s
  .onRun(async (_context) => {
    const timestamp = new Date().toISOString();
    const updates = {};

    // ── Simulate zone occupancy ───────────────────────────────────────────────
    for (const zone of ZONE_CONFIG) {
      const occupancyPct = randInt(40, 95);
      const currentCount = Math.round((occupancyPct / 100) * zone.capacity);
      updates[`/zones/${zone.id}`] = {
        name: zone.name,
        capacity: zone.capacity,
        currentCount,
        timestamp,
      };
    }

    // ── Simulate queue wait times ─────────────────────────────────────────────
    for (const queue of QUEUE_CONFIG) {
      const waitMinutes = randFloat(2, 18);
      const queueDepth = randInt(5, 60);
      updates[`/queues/${queue.id}`] = {
        name: queue.name,
        type: queue.type,
        zoneId: queue.zoneId,
        estimatedWaitMinutes: waitMinutes,
        queueDepth,
        isOpen: true,
        timestamp,
      };
    }

    // ── Simulate gate queue depths ────────────────────────────────────────────
    for (const gate of GATE_CONFIG) {
      updates[`/gates/${gate.id}`] = {
        name: gate.name,
        zoneId: gate.zoneId,
        queueDepth: randInt(10, 200),
        processingRate: gate.processingRate + randInt(-10, 10), // slight variance
        timestamp,
      };
    }

    await db.ref('/').update(updates);
    console.log(`[simulateLiveData] Updated ${Object.keys(updates).length} paths at ${timestamp}`);
    return null;
  });
