/**
 * @file tests/zones.test.js
 * @description Unit tests for zone status threshold logic in src/routes/zones.js.
 * Tests the deriveStatus function in isolation without Firebase.
 */

'use strict';

jest.mock('../src/firebase', () => ({
  db: {}
}));

const { deriveStatus } = require('../src/routes/zones');

// ── deriveStatus ──────────────────────────────────────────────────────────────

describe('deriveStatus()', () => {
  // Safe thresholds (0–74%)
  test('returns "safe" for 0% occupancy', () => {
    expect(deriveStatus(0)).toBe('safe');
  });

  test('returns "safe" for 50% occupancy', () => {
    expect(deriveStatus(50)).toBe('safe');
  });

  test('returns "safe" for 74% occupancy (boundary)', () => {
    expect(deriveStatus(74)).toBe('safe');
  });

  // Warning thresholds (75–89%)
  test('returns "warning" for exactly 75% occupancy (boundary)', () => {
    expect(deriveStatus(75)).toBe('warning');
  });

  test('returns "warning" for 80% occupancy', () => {
    expect(deriveStatus(80)).toBe('warning');
  });

  test('returns "warning" for 89% occupancy (boundary)', () => {
    expect(deriveStatus(89)).toBe('warning');
  });

  // Critical thresholds (90–100%)
  test('returns "critical" for exactly 90% occupancy (boundary)', () => {
    expect(deriveStatus(90)).toBe('critical');
  });

  test('returns "critical" for 95% occupancy', () => {
    expect(deriveStatus(95)).toBe('critical');
  });

  test('returns "critical" for 100% occupancy (full capacity)', () => {
    expect(deriveStatus(100)).toBe('critical');
  });

  // Edge / unexpected inputs
  test('returns "safe" for negative occupancy (graceful handling)', () => {
    expect(deriveStatus(-10)).toBe('safe');
  });

  test('returns "critical" for occupancy > 100 (overflow scenario)', () => {
    expect(deriveStatus(105)).toBe('critical');
  });
});
