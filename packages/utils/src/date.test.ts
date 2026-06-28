import { describe, it, expect } from 'vitest';

import { toUTC, fromISO, isSameUTCDay, addMinutes } from './date.js';

describe('toUTC', () => {
  it('retorna string ISO 8601 com Z', () => {
    const d = new Date('2025-01-15T12:00:00Z');
    expect(toUTC(d)).toBe('2025-01-15T12:00:00.000Z');
  });
});

describe('fromISO', () => {
  it('parseia string ISO válida', () => {
    const d = fromISO('2025-01-15T12:00:00.000Z');
    expect(d.toISOString()).toBe('2025-01-15T12:00:00.000Z');
  });

  it('lança erro em string inválida', () => {
    expect(() => fromISO('não é uma data')).toThrow('Invalid ISO date string');
  });
});

describe('isSameUTCDay', () => {
  it('retorna true para o mesmo dia UTC', () => {
    const a = new Date('2025-01-15T00:00:00Z');
    const b = new Date('2025-01-15T23:59:59Z');
    expect(isSameUTCDay(a, b)).toBe(true);
  });

  it('retorna false para dias diferentes', () => {
    const a = new Date('2025-01-15T23:59:59Z');
    const b = new Date('2025-01-16T00:00:00Z');
    expect(isSameUTCDay(a, b)).toBe(false);
  });
});

describe('addMinutes', () => {
  it('adiciona minutos sem mutar a data original', () => {
    const original = new Date('2025-01-15T10:00:00Z');
    const result = addMinutes(original, 30);
    expect(result.toISOString()).toBe('2025-01-15T10:30:00.000Z');
    expect(original.toISOString()).toBe('2025-01-15T10:00:00.000Z');
  });
});
