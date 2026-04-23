import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/domain/Command.js';
import { Direction } from '../../src/domain/Direction.js';
import { Grid } from '../../src/domain/Grid.js';
import { Planet } from '../../src/domain/Planet.js';
import { Position } from '../../src/domain/Position.js';
import { Rover } from '../../src/domain/Rover.js';

const grid = Grid.create(5, 5);
const emptyPlanet = Planet.create(grid, []);

const cmds = (s: string): Command[] => s.split('') as Command[];

describe('Rover', () => {
  describe('execute — no obstacles', () => {
    it('returns Ok at the start when given no commands', () => {
      const rover = Rover.create(emptyPlanet, Position.at(1, 2), Direction.N);
      const status = rover.execute([]);
      expect(status).toEqual({ kind: 'Ok', position: Position.at(1, 2), heading: Direction.N });
    });

    it('turns left without moving', () => {
      const rover = Rover.create(emptyPlanet, Position.at(1, 2), Direction.N);
      const status = rover.execute(cmds('L'));
      expect(status).toEqual({ kind: 'Ok', position: Position.at(1, 2), heading: Direction.W });
    });

    it('turns right without moving', () => {
      const rover = Rover.create(emptyPlanet, Position.at(1, 2), Direction.N);
      const status = rover.execute(cmds('R'));
      expect(status).toEqual({ kind: 'Ok', position: Position.at(1, 2), heading: Direction.E });
    });

    it('moves one cell forward', () => {
      const rover = Rover.create(emptyPlanet, Position.at(1, 2), Direction.N);
      const status = rover.execute(cmds('M'));
      expect(status).toEqual({ kind: 'Ok', position: Position.at(1, 3), heading: Direction.N });
    });

    it('runs the canonical kata example (1,2,N) LMLMLMLMM -> (1,3,N)', () => {
      const rover = Rover.create(emptyPlanet, Position.at(1, 2), Direction.N);
      const status = rover.execute(cmds('LMLMLMLMM'));
      expect(status).toEqual({ kind: 'Ok', position: Position.at(1, 3), heading: Direction.N });
    });

    it('wraps south off the bottom edge', () => {
      const rover = Rover.create(emptyPlanet, Position.at(0, 0), Direction.S);
      const status = rover.execute(cmds('M'));
      expect(status).toEqual({ kind: 'Ok', position: Position.at(0, 4), heading: Direction.S });
    });

    it('wraps east off the right edge', () => {
      const rover = Rover.create(emptyPlanet, Position.at(4, 0), Direction.E);
      const status = rover.execute(cmds('M'));
      expect(status).toEqual({ kind: 'Ok', position: Position.at(0, 0), heading: Direction.E });
    });
  });

  describe('execute — obstacles', () => {
    it('stops before the first obstacle and reports it', () => {
      const planet = Planet.create(grid, [Position.at(1, 3)]);
      const rover = Rover.create(planet, Position.at(1, 2), Direction.N);
      const status = rover.execute(cmds('M'));
      expect(status).toEqual({
        kind: 'Blocked',
        lastPosition: Position.at(1, 2),
        heading: Direction.N,
        obstacleAt: Position.at(1, 3),
      });
    });

    it('stops mid-program and ignores remaining commands', () => {
      const planet = Planet.create(grid, [Position.at(1, 3)]);
      const rover = Rover.create(planet, Position.at(1, 2), Direction.N);
      const status = rover.execute(cmds('MRMM'));
      expect(status.kind).toBe('Blocked');
      if (status.kind === 'Blocked') {
        expect(status.lastPosition).toEqual(Position.at(1, 2));
        expect(status.heading).toBe(Direction.N);
        expect(status.obstacleAt).toEqual(Position.at(1, 3));
      }
    });

    it('does not trigger Blocked on a turn next to an obstacle', () => {
      const planet = Planet.create(grid, [Position.at(1, 3)]);
      const rover = Rover.create(planet, Position.at(1, 2), Direction.N);
      const status = rover.execute(cmds('LRLR'));
      expect(status).toEqual({ kind: 'Ok', position: Position.at(1, 2), heading: Direction.N });
    });
  });
});
