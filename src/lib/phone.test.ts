import { describe, it, expect } from 'vitest';
import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('adds +58 if missing', () => {
    expect(normalizePhone('424 4707676')).toBe('+58 424 4707676');
  });

  it('keeps +58 if already present', () => {
    expect(normalizePhone('+58 424 4707676')).toBe('+58 424 4707676');
  });

  it('does not override other country codes', () => {
    expect(normalizePhone('+1 234 5678')).toBe('+1 234 5678');
  });

  it('handles empty input', () => {
    expect(normalizePhone('')).toBe('');
  });

  it('trims whitespace', () => {
    expect(normalizePhone('  424 4707676  ')).toBe('+58 424 4707676');
  });

  it('works with numbers only (no spaces)', () => {
    expect(normalizePhone('4244707676')).toBe('+58 4244707676');
  });
});
