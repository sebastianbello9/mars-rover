import { describe, expect, it } from 'vitest';
import { Direction } from '../../src/domain/Direction.js';

describe('Direction', () => {
  describe('turnLeft', () => {
    it('cycles N → W → S → E → N', () => {
      expect(Direction.N.turnLeft()).toBe(Direction.W);
      expect(Direction.W.turnLeft()).toBe(Direction.S);
      expect(Direction.S.turnLeft()).toBe(Direction.E);
      expect(Direction.E.turnLeft()).toBe(Direction.N);
    });
  });

  describe('turnRight', () => {
    it('cycles N → E → S → W → N', () => {
      expect(Direction.N.turnRight()).toBe(Direction.E);
      expect(Direction.E.turnRight()).toBe(Direction.S);
      expect(Direction.S.turnRight()).toBe(Direction.W);
      expect(Direction.W.turnRight()).toBe(Direction.N);
    });
  });

  describe('vector', () => {
    it('returns the unit step for each cardinal', () => {
      expect(Direction.N.vector()).toEqual({ dx: 0, dy: 1 });
      expect(Direction.E.vector()).toEqual({ dx: 1, dy: 0 });
      expect(Direction.S.vector()).toEqual({ dx: 0, dy: -1 });
      expect(Direction.W.vector()).toEqual({ dx: -1, dy: 0 });
    });
  });

  describe('code', () => {
    it('exposes the single-letter code for parsing / formatting', () => {
      expect(Direction.N.code).toBe('N');
      expect(Direction.E.code).toBe('E');
      expect(Direction.S.code).toBe('S');
      expect(Direction.W.code).toBe('W');
    });

    it('fromCode returns the matching direction or undefined', () => {
      expect(Direction.fromCode('N')).toBe(Direction.N);
      expect(Direction.fromCode('E')).toBe(Direction.E);
      expect(Direction.fromCode('S')).toBe(Direction.S);
      expect(Direction.fromCode('W')).toBe(Direction.W);
      expect(Direction.fromCode('X')).toBeUndefined();
    });
  });
});
