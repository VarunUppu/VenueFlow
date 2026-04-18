/**
 * @file services/routing.js
 * @description Pure gate recommendation logic — no Firebase dependency.
 * All functions are deterministic and unit-testable in isolation.
 */

'use strict';

/**
 * @typedef {Object} Gate
 * @property {string} id - Unique gate identifier.
 * @property {string} name - Human-readable gate name.
 * @property {number} queueDepth - Current number of people in the gate queue.
 * @property {number} processingRate - People processed per minute.
 */

/**
 * Calculates estimated wait time in minutes for a gate.
 *
 * @param {Gate} gate - The gate object.
 * @returns {number} Estimated wait time in minutes (rounded to 1 decimal).
 */
function calcWaitTime(gate) {
  if (!gate.processingRate || gate.processingRate <= 0) return Infinity;
  return Math.round((gate.queueDepth / gate.processingRate) * 10) / 10;
}

/**
 * Selects the recommended gate with the lowest estimated wait time.
 * If multiple gates share the minimum wait time the first one (by array order) is returned.
 *
 * @param {Gate[]} gates - Array of gate objects for a given zone.
 * @returns {{ gate: Gate | null, waitTime: number }} The recommended gate and its wait time.
 */
function recommendGate(gates) {
  if (!gates || gates.length === 0) {
    return { gate: null, waitTime: 0 };
  }

  let bestGate = null;
  let bestWait = Infinity;

  for (const gate of gates) {
    const wait = calcWaitTime(gate);
    if (wait < bestWait) {
      bestWait = wait;
      bestGate = gate;
    }
  }

  return { gate: bestGate, waitTime: bestWait === Infinity ? null : bestWait };
}

/**
 * Filters gates belonging to a specific zone.
 *
 * @param {Object} allGates - Raw gates map from Firebase (keyed by gate ID).
 * @param {string} zoneId - The zone to filter by.
 * @returns {Gate[]} Array of gate objects for the given zone.
 */
function filterGatesByZone(allGates, zoneId) {
  if (!allGates || !zoneId) return [];
  return Object.entries(allGates)
    .filter(([, gate]) => gate.zoneId === zoneId)
    .map(([id, gate]) => ({ id, ...gate }));
}

module.exports = { recommendGate, calcWaitTime, filterGatesByZone };
