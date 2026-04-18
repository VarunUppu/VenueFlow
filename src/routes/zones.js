/**
 * @file routes/zones.js
 * @description GET /zones — returns all venue zones with occupancy %, status, and timestamp.
 * Data is read from Firebase Realtime Database path /zones.
 */

'use strict';

const express = require('express');
const { db } = require('../firebase');

const router = express.Router();

/**
 * Derives a human-readable status label based on occupancy percentage.
 *
 * @param {number} occupancy - Occupancy as a percentage (0–100).
 * @returns {'safe' | 'warning' | 'critical'} Status label.
 */
function deriveStatus(occupancy) {
  if (occupancy >= 90) return 'critical';
  if (occupancy >= 75) return 'warning';
  return 'safe';
}

/**
 * GET /zones
 * Returns all venue zones with current occupancy percentage, status, and timestamp.
 *
 * @route GET /zones
 * @returns {Object} JSON response { success, data: Zone[], error }
 */
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.ref('/zones').once('value');
    const raw = snapshot.val();

    if (!raw) {
      return res.json({ success: true, data: [], error: null });
    }

    const zones = Object.entries(raw).map(([id, zone]) => ({
      id,
      name: zone.name || id,
      capacity: zone.capacity || 0,
      currentCount: zone.currentCount || 0,
      occupancy: zone.capacity
        ? Math.round((zone.currentCount / zone.capacity) * 100)
        : 0,
      status: deriveStatus(
        zone.capacity ? Math.round((zone.currentCount / zone.capacity) * 100) : 0
      ),
      timestamp: zone.timestamp || new Date().toISOString(),
    }));

    return res.json({ success: true, data: zones, error: null });
  } catch (err) {
    console.error('[zones] Error fetching zones:', err);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
});

module.exports = router;
module.exports.deriveStatus = deriveStatus; // exported for unit testing
