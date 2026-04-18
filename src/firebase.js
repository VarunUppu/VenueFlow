/**
 * @file firebase.js
 * @description Initialises and exports the Firebase Admin SDK singleton.
 * Reads credentials from environment variables — no hardcoded secrets.
 */

'use strict';
require('dotenv').config();

const admin = require('firebase-admin');

// In-Memory Mock Data Store (used if no Firebase credentials provided)
let IS_MOCK_MODE = false;
let mockData = {
  '/zones': {
    zone_north: { name: 'North Gates & Sections', currentCount: 4120, capacity: 5000 },
    zone_south: { name: 'South Gates & Sections', currentCount: 4800, capacity: 5000 },
    zone_east:  { name: 'East Wing / VIP', currentCount: 1200, capacity: 2000 },
    zone_west:  { name: 'West Wing / Amenities', currentCount: 2900, capacity: 4000 }
  },
  '/gates': {
    gate_n1: { name: 'Gate N1', queueDepth: 45, processingRate: 15, zoneId: 'zone_north' },
    gate_n2: { name: 'Gate N2', queueDepth: 120, processingRate: 12, zoneId: 'zone_north' },
    gate_s1: { name: 'Gate S1', queueDepth: 12, processingRate: 20, zoneId: 'zone_south' },
    gate_s2: { name: 'Gate S2', queueDepth: 190, processingRate: 10, zoneId: 'zone_south' },
  },
  '/queues': {
    q_1: { name: 'Gridiron Grill & Co.', type: 'restaurant', estimatedWaitMinutes: 5, zoneId: 'zone_north' },
    q_2: { name: 'Baseline Pizza Parlor', type: 'restaurant', estimatedWaitMinutes: 12, zoneId: 'zone_east' },
    q_3: { name: 'Touchdown Tacos', type: 'restaurant', estimatedWaitMinutes: 25, zoneId: 'zone_south' },
    q_4: { name: 'North Restrooms A', type: 'restroom', estimatedWaitMinutes: 2, zoneId: 'zone_north' },
  },
  '/incidents': {}
};

// Start simulation loop if running in mock mode
const startMockSimulation = () => {
  console.log('[VenueFlow] ⚠️ Starting IN-MEMORY SIMULATION MODE. Firebase credentials not found.');
  setInterval(() => {
    // Randomize queues
    Object.values(mockData['/gates']).forEach(g => {
      g.queueDepth = Math.max(0, g.queueDepth + Math.floor(Math.random() * 21) - 10);
    });
    // Randomize zones
    Object.values(mockData['/zones']).forEach(z => {
      z.currentCount = Math.min(z.capacity, Math.max(0, z.currentCount + Math.floor(Math.random() * 101) - 50));
    });
    // Randomize wait times
    Object.values(mockData['/queues']).forEach(q => {
      q.estimatedWaitMinutes = Math.max(1, q.estimatedWaitMinutes + Math.floor(Math.random() * 5) - 2);
    });
  }, 10000);
};

// Provide a fake snapshot response to map to standard implementation
class MockSnapshot {
  constructor(val) { this._val = val; }
  val() { return this._val; }
}

const mockDbFactory = () => ({
  ref: (path) => ({
    once: async () => new MockSnapshot(mockData[path]),
    push: async (data) => {
      const id = 'inc_' + Date.now();
      mockData['/incidents'][id] = data;
      return { key: id };
    },
    orderByChild: () => ({
      limitToLast: () => ({
        once: async () => new MockSnapshot(mockData[path])
      })
    })
  })
});

const mockMessagingFactory = () => ({
  send: async (msg) => {
    console.log('[MOCK FCM] Sending message to topic:', msg.topic);
    return 'mock_message_id_' + Date.now();
  }
});

const mockAuthFactory = () => ({
  verifyIdToken: async (token) => {
    if (token === 'dummy-token') return { uid: 'mock_user_uid' };
    throw new Error('Mock Auth Token Invalid');
  }
});

let db, messaging, auth;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY 
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    });
  }
  db = admin.database();
  messaging = admin.messaging();
  auth = admin.auth();
} else {
  IS_MOCK_MODE = true;
  startMockSimulation();
  db = mockDbFactory();
  messaging = mockMessagingFactory();
  auth = mockAuthFactory();
}

module.exports = { admin, db, messaging, auth, IS_MOCK_MODE };
