import { describe, it, expect } from 'vitest';
import type { CartItem, Product } from '@/types';
import {
  computeUnitPrice,
  makeLineId,
  describeOptions,
  lineTotal,
  cartTotal,
  cartCount,
} from './cart';

const baseProduct: Product = {
  id: 'kit-01',
  name: 'Kit Papá',
  description: 'Caja con regalos',
  basePrice: 25,
  imageUrl: '/products/kit-01.png',
  available: true,
};

const productWithOptions: Product = {
  ...baseProduct,
  id: 'cuadro-17',
  basePrice: 28,
  options: [
    {
      id: 'luz',
      label: 'Iluminación',
      choices: [
        { id: 'normal', label: 'Normal', priceDelta: 0 },
        { id: 'led', label: 'Con LED', priceDelta: 5 },
      ],
    },
  ],
};

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'kit-01',
    product: baseProduct,
    quantity: 1,
    selectedOptions: {},
    unitPrice: 25,
    ...overrides,
  };
}

describe('computeUnitPrice', () => {
  it('returns base price when product has no options', () => {
    expect(computeUnitPrice(baseProduct, {})).toBe(25);
  });

  it('adds priceDelta of the selected option', () => {
    expect(computeUnitPrice(productWithOptions, { luz: 'led' })).toBe(33);
  });

  it('uses base price when the selected option has zero delta', () => {
    expect(computeUnitPrice(productWithOptions, { luz: 'normal' })).toBe(28);
  });

  it('ignores unknown option selections', () => {
    expect(computeUnitPrice(productWithOptions, { luz: 'inexistente' })).toBe(28);
  });
});

describe('makeLineId', () => {
  it('returns the product id when there are no options', () => {
    expect(makeLineId('kit-01', {})).toBe('kit-01');
  });

  it('is stable regardless of option key order', () => {
    const a = makeLineId('p', { color: 'rojo', talla: 'M' });
    const b = makeLineId('p', { talla: 'M', color: 'rojo' });
    expect(a).toBe(b);
  });

  it('produces different ids for different selections', () => {
    expect(makeLineId('p', { luz: 'led' })).not.toBe(makeLineId('p', { luz: 'normal' }));
  });
});

describe('describeOptions', () => {
  it('returns empty string when no options', () => {
    expect(describeOptions(makeItem())).toBe('');
  });

  it('joins the chosen option labels', () => {
    const item = makeItem({
      product: productWithOptions,
      selectedOptions: { luz: 'led' },
    });
    expect(describeOptions(item)).toBe('Con LED');
  });
});

describe('cart totals', () => {
  it('lineTotal multiplies unit price by quantity', () => {
    expect(lineTotal(makeItem({ unitPrice: 25, quantity: 3 }))).toBe(75);
  });

  it('cartTotal sums all line totals', () => {
    const items = [
      makeItem({ id: 'a', unitPrice: 25, quantity: 2 }),
      makeItem({ id: 'b', unitPrice: 18, quantity: 1 }),
    ];
    expect(cartTotal(items)).toBe(68);
  });

  it('cartCount sums all quantities', () => {
    const items = [
      makeItem({ id: 'a', quantity: 2 }),
      makeItem({ id: 'b', quantity: 3 }),
    ];
    expect(cartCount(items)).toBe(5);
  });

  it('empty cart totals to zero', () => {
    expect(cartTotal([])).toBe(0);
    expect(cartCount([])).toBe(0);
  });
});
