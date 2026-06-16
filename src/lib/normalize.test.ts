import { describe, it, expect } from 'vitest';
import { normalizeLabel, findDuplicateLabels } from './normalize';

describe('normalizeLabel', () => {
  it('lowercases and trims', () => {
    expect(normalizeLabel('  Rojo  ')).toBe('rojo');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeLabel('Azul   celeste')).toBe('azul celeste');
  });

  it('handles mixed case', () => {
    expect(normalizeLabel('TaLLa GrAnDe')).toBe('talla grande');
  });
});

describe('findDuplicateLabels', () => {
  it('finds exact duplicates', () => {
    expect(findDuplicateLabels(['Rojo', 'Azul', 'Rojo'])).toEqual(['rojo']);
  });

  it('finds duplicates with different casing', () => {
    expect(findDuplicateLabels(['rojo', 'ROJO', 'rOjO'])).toEqual(['rojo']);
  });

  it('finds duplicates with extra spaces', () => {
    expect(findDuplicateLabels(['Talla grande', 'talla  grande'])).toEqual(['talla grande']);
  });

  it('returns empty if no duplicates', () => {
    expect(findDuplicateLabels(['Rojo', 'Azul', 'Verde'])).toEqual([]);
  });

  it('finds multiple duplicate groups', () => {
    const result = findDuplicateLabels(['Rojo', 'rojo', 'Azul', 'AZUL']);
    expect(result).toContain('rojo');
    expect(result).toContain('azul');
  });
});
