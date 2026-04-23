import { describe, expect, it } from 'vitest';
import { Grid } from '../../src/domain/Grid.js';

describe('Grid', () => {
  describe('create', () => {
    it('accepts positive width and height', () => {
      const g = Grid.create(5, 7);
      expect(g.width).toBe(5);
      expect(g.height).toBe(7);
    });

    it.each([
      [0, 5],
      [5, 0],
      [-1, 5],
      [5, -1],
      [1.5, 3],
      [3, 1.5],
    ])('rejects non-positive or non-integer dimensions (%s, %s)', (w, h) => {
      expect(() => Grid.create(w, h)).toThrowError(/width|height/i);
    });
  });

  describe('normalize', () => {
    const g = Grid.create(5, 5);

    it('returns identical coordinates when already in range', () => {
      expect(g.normalize({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
    });

    it('wraps past the east edge', () => {
      expect(g.normalize({ x: 6, y: 3 })).toEqual({ x: 1, y: 3 });
    });

    it('wraps past the north edge', () => {
      expect(g.normalize({ x: 3, y: 6 })).toEqual({ x: 3, y: 1 });
    });

    it('wraps negative x to the east side', () => {
      expect(g.normalize({ x: -1, y: 0 })).toEqual({ x: 4, y: 0 });
    });

    it('wraps negative y to the north side', () => {
      expect(g.normalize({ x: 0, y: -1 })).toEqual({ x: 0, y: 4 });
    });

    it('wraps large negatives correctly (math-true modulo)', () => {
      expect(g.normalize({ x: -7, y: -12 })).toEqual({ x: 3, y: 3 });
    });
  });
});
