/**
 * @file routes/incidents.js
 * @description GET /incidents and POST /incidents
 */

'use strict';

const express = require('express');
const { db, messaging } = require('../firebase');
const { verifyToken } = require('../middleware/auth');
const { nudgeRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

/** Valid severity levels for an incident */
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];

/** Valid incident types */
const VALID_TYPES = ['overcrowding', 'medical', 'fire', 'security', 'structural', 'other'];

/**
 * GET /incidents
 * Returns recent incidents from Firebase.
 */
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.ref('/incidents')
      .orderByChild('createdAt')
      .limitToLast(50)
      .once('value');
      
    const raw = snapshot.val();
    if (!raw) {
      return res.json({ success: true, data: [], error: null });
    }

    const incidents = Object.entries(raw).map(([id, inc]) => ({
      id,
      ...inc
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, data: incidents, error: null });
  } catch (err) {
    console.error('[incidents] Error fetching incidents:', err);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
});

/**
 * POST /incidents
 * Accepts an incident report, persists it to Firebase, and sends an FCM topic notification.
 */
router.post('/', verifyToken, nudgeRateLimit, async (req, res) => {
  const { zoneId, type, severity } = req.body;

  if (!zoneId || typeof zoneId !== 'string') {
    return res.status(400).json({ success: false, data: null, error: '"zoneId" is required' });
  }
  if (!type || !VALID_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: `"type" must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }
  if (!severity || !VALID_SEVERITIES.includes(severity)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: `"severity" must be one of: ${VALID_SEVERITIES.join(', ')}`,
    });
  }

  const incident = {
    zoneId,
    type,
    severity,
    reportedBy: req.user.uid,
    createdAt: new Date().toISOString(),
    resolved: false,
  };

  try {
    const ref = await db.ref('/incidents').push(incident);
    const incidentId = ref.key;

    const topic = `zone_${zoneId}`;
    const fcmMessage = {
      topic,
      notification: {
        title: `⚠️ ${severity.toUpperCase()} Incident — Zone ${zoneId}`,
        body: `A ${type} incident has been reported. Please follow staff instructions.`,
      },
      data: {
        incidentId,
        zoneId,
        type,
        severity,
        timestamp: incident.createdAt,
      },
      android: { priority: severity === 'critical' || severity === 'high' ? 'high' : 'normal' },
      apns: {
        payload: {
          aps: {
            sound: severity === 'critical' ? 'default' : undefined,
            badge: 1,
          },
        },
      },
    };

    const fcmResponse = await messaging.send(fcmMessage);

    return res.status(201).json({
      success: true,
      data: { incidentId, fcmMessageId: fcmResponse },
      error: null,
    });
  } catch (err) {
    console.error('[incidents] Error creating incident:', err);
    return res.status(500).json({ success: false, data: null, error: err.message });
  }
});

module.exports = router;
