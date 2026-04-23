import { describe, expect, it } from 'vitest';
import { Grid } from '../../src/domain/Grid.js';
import { Planet } from '../../src/domain/Planet.js';
import { Position } from '../../src/domain/Position.js';

describe('Planet', () => {
  const grid = Grid.create(5, 5);

  it('exposes its grid', () => {
    const planet = Planet.create(grid, []);
    expect(planet.grid).toBe(grid);
  });

  it('reports no obstacle when registry is empty', () => {
    const planet = Planet.create(grid, []);
    expect(planet.isBlocked(Position.at(0, 0))).toBe(false);
  });

  it('reports a position as blocked when it matches an obstacle', () => {
    const planet = Planet.create(grid, [Position.at(2, 3)]);
    expect(planet.isBlocked(Position.at(2, 3))).toBe(true);
  });

  it('does not falsely report blocked for a nearby position', () => {
    const planet = Planet.create(grid, [Position.at(2, 3)]);
    expect(planet.isBlocked(Position.at(2, 4))).toBe(false);
    expect(planet.isBlocked(Position.at(3, 3))).toBe(false);
  });

  it('is unaffected by later mutations of the supplied obstacle array', () => {
    const obstacles = [Position.at(1, 1)];
    const planet = Planet.create(grid, obstacles);
    obstacles.push(Position.at(2, 2));
    expect(planet.isBlocked(Position.at(2, 2))).toBe(false);
  });
});
