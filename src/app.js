/**
 * @file app.js
 * @description Express application entry point for VenueFlow API.
 * Configures middleware, mounts routes, serves Vite frontend, and starts the HTTP server.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const zonesRouter = require('./routes/zones');
const gatesRouter = require('./routes/gates');
const queuesRouter = require('./routes/queues');
const incidentsRouter = require('./routes/incidents');

const app = express();

// ── Security & utility middleware ────────────────────────────────────────────
// Disable helmet for static files to allow index.html to load, but keep it on for API
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', version: '1.0.0' }, error: null });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/zones', zonesRouter);
app.use('/gates', gatesRouter);
app.use('/queues', queuesRouter);
app.use('/incidents', incidentsRouter);

// ── Frontend Serve ────────────────────────────────────────────────────────────
// Serve the built Vite frontend statically
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback all unhandled GET requests to index.html for React Router
app.get('*', (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
  next();
});

// ── General 404 handler ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[VenueFlow] Unhandled error:', err);
  res.status(500).json({ success: false, data: null, error: 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[VenueFlow] Server running on port ${PORT}`);
});

module.exports = app; // exported for testing
