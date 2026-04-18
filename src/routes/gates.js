/**
 * @file routes/gates.js
 * @description GET /gates and GET /gates/recommend
 * Returns all gates and recommended entry gates.
 */

'use strict';

const express = require('express');
const { db } = require('../firebase');
const { filterGatesByZone, recommendGate } = require('../services/routing');

const router = express.Router();

/**
 * GET /gates
 * Returns all gates and their current metrics.
 */
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.ref('/gates').once('value');
    const raw = snapshot.val();

    if (!raw) {
      return res.json({ success: true, data: [], error: null });
    }

    const gates = Object.entries(raw).map(([id, gate]) => ({
      id,
      ...gate
    }));

    return res.json({ success: true, data: gates, error: null });
  } catch (err) {
    console.error('[gates] Error fetching gates:', err);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
});

/**
 * GET /gates/recommend
 * Recommends the entry gate with the shortest queue for the specified zone.
 */
router.get('/recommend', async (req, res) => {
  const { zone: zoneId } = req.query;

  if (!zoneId) {
    return res
      .status(400)
      .json({ success: false, data: null, error: 'Query parameter "zone" is required' });
  }

  try {
    const snapshot = await db.ref('/gates').once('value');
    const allGates = snapshot.val();

    const zoneGates = filterGatesByZone(allGates, zoneId);

    if (zoneGates.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: `No gates found for zone "${zoneId}"`,
      });
    }

    const { gate, waitTime } = recommendGate(zoneGates);

    return res.json({
      success: true,
      data: {
        zoneId,
        recommendedGate: gate,
        estimatedWaitTimeMinutes: waitTime,
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (err) {
    console.error('[gates] Error fetching gates:', err);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
});

module.exports = router;
