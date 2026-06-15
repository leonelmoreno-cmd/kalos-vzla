import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats whole numbers with two decimals', () => {
    expect(formatPrice(25)).toBe('$25.00');
  });
  it('formats decimals', () => {
    expect(formatPrice(3.5)).toBe('$3.50');
  });
  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});
