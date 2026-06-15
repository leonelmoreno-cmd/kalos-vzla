import { describe, it, expect } from 'vitest';
import type { CheckoutForm } from '@/types';
import {
  validateName,
  validatePhone,
  validateAddress,
  validateMrw,
  validateCheckout,
} from './validation';

describe('validateName', () => {
  it('rejects empty names', () => {
    expect(validateName('')).toBeDefined();
    expect(validateName('   ')).toBeDefined();
  });
  it('rejects single-character names', () => {
    expect(validateName('A')).toBeDefined();
  });
  it('accepts a valid name', () => {
    expect(validateName('María González')).toBeUndefined();
  });
});

describe('validatePhone', () => {
  it('requires a country code with +', () => {
    expect(validatePhone('04244707676')).toBeDefined();
  });
  it('rejects a leading zero right after the +', () => {
    expect(validatePhone('+0424 4707676')).toBeDefined();
  });
  it('rejects letters', () => {
    expect(validatePhone('+58 424 ABC')).toBeDefined();
  });
  it('accepts a valid Venezuelan number', () => {
    expect(validatePhone('+58 424 4707676')).toBeUndefined();
  });
});

describe('validateAddress', () => {
  it('is always valid when not delivery', () => {
    expect(validateAddress('', false)).toBeUndefined();
    expect(validateAddress(undefined, false)).toBeUndefined();
  });
  it('is OPTIONAL for delivery (empty is allowed as reference point)', () => {
    expect(validateAddress('', true)).toBeUndefined();
    expect(validateAddress(undefined, true)).toBeUndefined();
  });
  it('rejects a too-short reference when something is typed', () => {
    expect(validateAddress('ab', true)).toBeDefined();
  });
  it('accepts a proper reference', () => {
    expect(validateAddress('Piso 5, apto 5C', true)).toBeUndefined();
  });
});

describe('validateMrw', () => {
  it('returns no errors when not MRW', () => {
    expect(validateMrw(undefined, false)).toEqual({});
  });
  it('flags every missing MRW field', () => {
    const errs = validateMrw(
      { agency: '', cedula: '', recipientPhone: '', recipientName: '' },
      true,
    );
    expect(Object.keys(errs)).toHaveLength(4);
  });
  it('passes with all MRW fields present', () => {
    const errs = validateMrw(
      { agency: 'MRW Centro', cedula: 'V-12345678', recipientPhone: '+58 412 1112233', recipientName: 'Pedro' },
      true,
    );
    expect(errs).toEqual({});
  });
});

describe('validateCheckout', () => {
  const validForm: CheckoutForm = {
    fullName: 'María González',
    phone: '+58 424 4707676',
    shipping: 'pickup',
    payment: 'cash',
  };

  it('passes a valid pickup form', () => {
    expect(validateCheckout(validForm)).toEqual({});
  });

  it('requires a shipping method', () => {
    const errs = validateCheckout({ ...validForm, shipping: '' as CheckoutForm['shipping'] });
    expect(errs.shipping).toBeDefined();
  });

  it('requires a payment method', () => {
    const errs = validateCheckout({ ...validForm, payment: '' as CheckoutForm['payment'] });
    expect(errs.payment).toBeDefined();
  });

  it('allows delivery without an address (optional reference)', () => {
    const errs = validateCheckout({ ...validForm, shipping: 'delivery', address: '' });
    expect(errs.address).toBeUndefined();
  });
});
