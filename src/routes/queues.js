/**
 * @file routes/queues.js
 * @description GET /queues — returns all concession stands and facilities
 * with current estimated wait time in minutes.
 * Data is read from Firebase Realtime Database path /queues.
 */

'use strict';

const express = require('express');
const { db } = require('../firebase');

const router = express.Router();

/**
 * GET /queues
 * Returns all concession stands and facilities with current estimated wait times.
 *
 * @route GET /queues
 * @returns {Object} JSON response { success, data: QueueItem[], error }
 */
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.ref('/queues').once('value');
    const raw = snapshot.val();

    if (!raw) {
      return res.json({ success: true, data: [], error: null });
    }

    const queues = Object.entries(raw).map(([id, item]) => ({
      id,
      name: item.name || id,
      type: item.type || 'facility',        // 'concession' | 'restroom' | 'facility'
      zoneId: item.zoneId || null,
      estimatedWaitMinutes: item.estimatedWaitMinutes ?? 0,
      queueDepth: item.queueDepth ?? 0,
      isOpen: item.isOpen !== false,         // default open unless explicitly false
      timestamp: item.timestamp || new Date().toISOString(),
    }));

    return res.json({ success: true, data: queues, error: null });
  } catch (err) {
    console.error('[queues] Error fetching queues:', err);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
});

module.exports = router;
