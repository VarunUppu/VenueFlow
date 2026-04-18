/**
 * @file middleware/auth.js
 * @description Firebase Auth ID token verification middleware.
 * Validates the Bearer token from the Authorization header on protected routes.
 */

'use strict';

const { auth } = require('../firebase');

/**
 * Express middleware that validates a Firebase Auth ID token.
 * Attaches the decoded token payload to `req.user` on success.
 * Intended for use on all POST routes.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (err) {
    console.warn('[auth] Token verification failed:', err.code || err.message);
    return res.status(403).json({
      success: false,
      data: null,
      error: 'Invalid or expired authentication token',
    });
  }
}

module.exports = { verifyToken };
