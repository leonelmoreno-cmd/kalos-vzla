import { describe, it, expect } from 'vitest';
import { receiptPath } from './receipt';

describe('receiptPath', () => {
  it('always lands inside the receipts/ folder', () => {
    expect(receiptPath('foto.png', 1000)).toBe('receipts/1000-comprobante.png');
  });

  it('lowercases and keeps the extension', () => {
    expect(receiptPath('IMG_0001.JPG', 1000)).toBe('receipts/1000-comprobante.jpg');
  });

  it('strips spaces, accents and special characters from the key', () => {
    const path = receiptPath('comprobante págo #1 (final).pdf', 1000);
    expect(path).toBe('receipts/1000-comprobante.pdf');
    expect(path).not.toMatch(/[^a-z0-9/.-]/);
  });

  it('handles names without an extension', () => {
    expect(receiptPath('screenshot', 1000)).toBe('receipts/1000-comprobante');
  });

  it('produces unique paths for different timestamps', () => {
    expect(receiptPath('a.png', 1)).not.toBe(receiptPath('a.png', 2));
  });
});
