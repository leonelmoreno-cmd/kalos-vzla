import { describe, it, expect } from 'vitest';
import { haversineKm, deliveryPrice, deliveryPriceFromCoords } from './delivery';
import { STORE } from './constants';

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(10.6653, -71.6044, 10.6653, -71.6044)).toBe(0);
  });

  it('computes a known distance approximately (Maracaibo → Caracas ≈ 520 km)', () => {
    const km = haversineKm(10.6653, -71.6044, 10.4806, -66.9036);
    expect(km).toBeGreaterThan(500);
    expect(km).toBeLessThan(540);
  });

  it('is symmetric', () => {
    const a = haversineKm(10.6, -71.6, 10.7, -71.5);
    const b = haversineKm(10.7, -71.5, 10.6, -71.6);
    expect(a).toBeCloseTo(b, 10);
  });
});

describe('deliveryPrice', () => {
  it('applies the minimum price for very short distances', () => {
    expect(deliveryPrice(1)).toBe(STORE.deliveryMinPrice);
  });

  it('charges per km above the minimum', () => {
    // 10 km * 0.5 = 5.0, above the 1.5 minimum
    expect(deliveryPrice(10)).toBe(5);
  });

  it('never returns less than the minimum', () => {
    expect(deliveryPrice(0)).toBe(STORE.deliveryMinPrice);
  });
});

describe('deliveryPriceFromCoords', () => {
  it('returns the minimum price and ~0 km at the store location', () => {
    const { price, km } = deliveryPriceFromCoords(STORE.lat, STORE.lng);
    expect(price).toBe(STORE.deliveryMinPrice);
    expect(km).toBe(0);
  });

  it('returns a rounded km and a numeric price for a nearby point', () => {
    const { price, km } = deliveryPriceFromCoords(STORE.lat + 0.05, STORE.lng);
    expect(km).toBeGreaterThan(0);
    expect(Number.isFinite(price)).toBe(true);
  });
});
