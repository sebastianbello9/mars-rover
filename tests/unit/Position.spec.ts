import { describe, expect, it } from 'vitest';
import { Direction } from '../../src/domain/Direction.js';
import { Grid } from '../../src/domain/Grid.js';
import { Position } from '../../src/domain/Position.js';

describe('Position', () => {
  const grid = Grid.create(5, 5);

  describe('at', () => {
    it('holds x and y', () => {
      const p = Position.at(1, 2);
      expect(p.x).toBe(1);
      expect(p.y).toBe(2);
    });
  });

  describe('moveBy', () => {
    it('moves one step north within the grid', () => {
      const p = Position.at(1, 2).moveBy(Direction.N.vector(), grid);
      expect(p.x).toBe(1);
      expect(p.y).toBe(3);
    });

    it('moves one step east within the grid', () => {
      const p = Position.at(1, 2).moveBy(Direction.E.vector(), grid);
      expect(p).toEqual(Position.at(2, 2));
    });

    it('wraps east → west', () => {
      const p = Position.at(0, 0).moveBy({ dx: -1, dy: 0 }, grid);
      expect(p).toEqual(Position.at(4, 0));
    });

    it('wraps north → south on the y axis', () => {
      const p = Position.at(0, 0).moveBy({ dx: 0, dy: -1 }, grid);
      expect(p).toEqual(Position.at(0, 4));
    });
  });

  describe('equals', () => {
    it('is true for two positions with the same coordinates', () => {
      expect(Position.at(3, 4).equals(Position.at(3, 4))).toBe(true);
    });

    it('is false when x differs', () => {
      expect(Position.at(3, 4).equals(Position.at(2, 4))).toBe(false);
    });

    it('is false when y differs', () => {
      expect(Position.at(3, 4).equals(Position.at(3, 5))).toBe(false);
    });
  });
});
