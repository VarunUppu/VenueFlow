/**
 * @file middleware/rateLimit.js
 * @description In-memory push nudge rate limiter.
 * Limits each user to a maximum of 2 push nudges per session,
 * enforcing an 8-minute cooldown window between nudges.
 */

'use strict';

/** @type {Map<string, { count: number, firstNudgeAt: number, lastNudgeAt: number }>} */
const nudgeStore = new Map();

/** Maximum nudges allowed per user per 8-minute session window */
const MAX_NUDGES = 2;

/** Cooldown window in milliseconds (8 minutes) */
const COOLDOWN_MS = 8 * 60 * 1000;

/**
 * Cleans up expired entries from the nudge store to prevent memory leaks.
 * Called automatically on each middleware invocation.
 *
 * @returns {void}
 */
function pruneExpiredEntries() {
  const now = Date.now();
  for (const [uid, record] of nudgeStore.entries()) {
    if (now - record.firstNudgeAt > COOLDOWN_MS) {
      nudgeStore.delete(uid);
    }
  }
}

/**
 * Express middleware that rate-limits push nudges to MAX_NUDGES per user
 * within an 8-minute rolling window.
 * Reads the user UID from `req.user.uid` (set by auth middleware).
 *
 * @param {import('express').Request} req - Express request (expects req.user.uid).
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 */
function nudgeRateLimit(req, res, next) {
  pruneExpiredEntries();

  const uid = req.user?.uid || req.ip; // fall back to IP if no auth context
  const now = Date.now();
  const record = nudgeStore.get(uid);

  if (!record) {
    nudgeStore.set(uid, { count: 1, firstNudgeAt: now, lastNudgeAt: now });
    return next();
  }

  const windowElapsed = now - record.firstNudgeAt;

  // Reset if the 8-minute window has expired
  if (windowElapsed > COOLDOWN_MS) {
    nudgeStore.set(uid, { count: 1, firstNudgeAt: now, lastNudgeAt: now });
    return next();
  }

  if (record.count >= MAX_NUDGES) {
    const retryAfterSeconds = Math.ceil((COOLDOWN_MS - windowElapsed) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      success: false,
      data: null,
      error: `Push nudge limit reached. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
    });
  }

  record.count += 1;
  record.lastNudgeAt = now;
  nudgeStore.set(uid, record);
  return next();
}

module.exports = { nudgeRateLimit, nudgeStore, MAX_NUDGES, COOLDOWN_MS };
