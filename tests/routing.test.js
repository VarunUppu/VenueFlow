/**
 * @file tests/routing.test.js
 * @description Unit tests for the pure gate recommendation logic in src/services/routing.js.
 * No Firebase dependency — all tests run in isolation.
 */

'use strict';

const { recommendGate, calcWaitTime, filterGatesByZone } = require('../src/services/routing');

// ── calcWaitTime ─────────────────────────────────────────────────────────────

describe('calcWaitTime()', () => {
  test('returns correct wait time for normal inputs', () => {
    const gate = { id: 'g1', name: 'Gate 1', queueDepth: 60, processingRate: 120 };
    expect(calcWaitTime(gate)).toBe(0.5); // 60 / 120 = 0.5 min
  });

  test('returns Infinity when processingRate is 0', () => {
    const gate = { id: 'g2', name: 'Gate 2', queueDepth: 50, processingRate: 0 };
    expect(calcWaitTime(gate)).toBe(Infinity);
  });

  test('returns Infinity when processingRate is negative', () => {
    const gate = { id: 'g3', name: 'Gate 3', queueDepth: 50, processingRate: -10 };
    expect(calcWaitTime(gate)).toBe(Infinity);
  });

  test('returns 0 when queueDepth is 0', () => {
    const gate = { id: 'g4', name: 'Gate 4', queueDepth: 0, processingRate: 100 };
    expect(calcWaitTime(gate)).toBe(0);
  });

  test('rounds to 1 decimal place', () => {
    const gate = { id: 'g5', name: 'Gate 5', queueDepth: 10, processingRate: 3 };
    // 10 / 3 = 3.333... → rounds to 3.3
    expect(calcWaitTime(gate)).toBe(3.3);
  });
});

// ── recommendGate ─────────────────────────────────────────────────────────────

describe('recommendGate()', () => {
  const gates = [
    { id: 'g1', name: 'Gate 1', queueDepth: 120, processingRate: 100 }, // wait = 1.2 min
    { id: 'g2', name: 'Gate 2', queueDepth: 50,  processingRate: 100 }, // wait = 0.5 min ✓
    { id: 'g3', name: 'Gate 3', queueDepth: 200, processingRate: 100 }, // wait = 2.0 min
  ];

  test('returns the gate with the lowest wait time', () => {
    const { gate, waitTime } = recommendGate(gates);
    expect(gate.id).toBe('g2');
    expect(waitTime).toBe(0.5);
  });

  test('returns { gate: null, waitTime: 0 } for empty array', () => {
    const result = recommendGate([]);
    expect(result.gate).toBeNull();
    expect(result.waitTime).toBe(0);
  });

  test('returns { gate: null, waitTime: 0 } for null input', () => {
    const result = recommendGate(null);
    expect(result.gate).toBeNull();
    expect(result.waitTime).toBe(0);
  });

  test('returns null waitTime if all gates have infinite wait time', () => {
    const brokenGates = [
      { id: 'g1', name: 'Gate 1', queueDepth: 100, processingRate: 0 },
      { id: 'g2', name: 'Gate 2', queueDepth: 200, processingRate: 0 },
    ];
    const { waitTime } = recommendGate(brokenGates);
    expect(waitTime).toBeNull();
  });

  test('picks first gate when two have equal wait times', () => {
    const tiedGates = [
      { id: 'g1', name: 'Gate 1', queueDepth: 100, processingRate: 100 }, // 1 min
      { id: 'g2', name: 'Gate 2', queueDepth: 100, processingRate: 100 }, // 1 min
    ];
    const { gate } = recommendGate(tiedGates);
    expect(gate.id).toBe('g1');
  });

  test('handles single gate', () => {
    const { gate, waitTime } = recommendGate([gates[0]]);
    expect(gate.id).toBe('g1');
    expect(waitTime).toBe(1.2);
  });
});

// ── filterGatesByZone ─────────────────────────────────────────────────────────

describe('filterGatesByZone()', () => {
  const allGates = {
    gate_1: { name: 'Gate 1', zoneId: 'zone_north', queueDepth: 50, processingRate: 100 },
    gate_2: { name: 'Gate 2', zoneId: 'zone_north', queueDepth: 80, processingRate: 120 },
    gate_3: { name: 'Gate 3', zoneId: 'zone_south', queueDepth: 30, processingRate: 90  },
  };

  test('returns only gates for the specified zone', () => {
    const result = filterGatesByZone(allGates, 'zone_north');
    expect(result).toHaveLength(2);
    expect(result.map(g => g.id)).toEqual(expect.arrayContaining(['gate_1', 'gate_2']));
  });

  test('returns empty array for a zone with no gates', () => {
    const result = filterGatesByZone(allGates, 'zone_vip');
    expect(result).toHaveLength(0);
  });

  test('returns empty array for null allGates', () => {
    expect(filterGatesByZone(null, 'zone_north')).toEqual([]);
  });

  test('returns empty array for null zoneId', () => {
    expect(filterGatesByZone(allGates, null)).toEqual([]);
  });

  test('includes the gate id in each returned object', () => {
    const result = filterGatesByZone(allGates, 'zone_south');
    expect(result[0]).toHaveProperty('id', 'gate_3');
  });
});
