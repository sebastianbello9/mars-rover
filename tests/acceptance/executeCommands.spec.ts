import { describe, expect, it } from 'vitest';
import { executeCommands } from '../../src/application/ExecuteCommandsUseCase.js';

describe('ExecuteCommandsUseCase', () => {
  it('solves the canonical kata example', () => {
    const status = executeCommands({
      grid: { width: 5, height: 5 },
      start: { x: 1, y: 2, heading: 'N' },
      obstacles: [],
      commands: 'LMLMLMLMM'.split('') as Array<'L' | 'R' | 'M'>,
    });

    expect(status.kind).toBe('Ok');
    if (status.kind === 'Ok') {
      expect(status.position.x).toBe(1);
      expect(status.position.y).toBe(3);
      expect(status.heading.code).toBe('N');
    }
  });

  it('wraps around the toroidal grid', () => {
    const status = executeCommands({
      grid: { width: 5, height: 5 },
      start: { x: 0, y: 0, heading: 'S' },
      obstacles: [],
      commands: ['M'],
    });

    expect(status.kind).toBe('Ok');
    if (status.kind === 'Ok') {
      expect(status.position.x).toBe(0);
      expect(status.position.y).toBe(4);
    }
  });

  it('halts at an obstacle and reports the last valid state', () => {
    const status = executeCommands({
      grid: { width: 5, height: 5 },
      start: { x: 1, y: 2, heading: 'N' },
      obstacles: [{ x: 1, y: 3 }],
      commands: ['M', 'M', 'M'],
    });

    expect(status.kind).toBe('Blocked');
    if (status.kind === 'Blocked') {
      expect(status.lastPosition.x).toBe(1);
      expect(status.lastPosition.y).toBe(2);
      expect(status.obstacleAt.x).toBe(1);
      expect(status.obstacleAt.y).toBe(3);
      expect(status.heading.code).toBe('N');
    }
  });

  it('accepts obstacles defined in grid coordinates exactly', () => {
    const status = executeCommands({
      grid: { width: 5, height: 5 },
      start: { x: 0, y: 0, heading: 'E' },
      obstacles: [
        { x: 2, y: 0 },
        { x: 3, y: 3 },
      ],
      commands: ['M', 'M', 'M'],
    });

    expect(status.kind).toBe('Blocked');
    if (status.kind === 'Blocked') {
      expect(status.lastPosition.x).toBe(1);
      expect(status.obstacleAt.x).toBe(2);
      expect(status.obstacleAt.y).toBe(0);
    }
  });
});
