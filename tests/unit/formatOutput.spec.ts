import { describe, expect, it } from 'vitest';
import { formatOutput } from '../../src/adapters/cli/formatOutput.js';
import { Direction } from '../../src/domain/Direction.js';
import { Position } from '../../src/domain/Position.js';
import { blocked, ok } from '../../src/domain/RoverStatus.js';

describe('formatOutput', () => {
  it('formats an Ok status as "X Y HEADING"', () => {
    expect(formatOutput(ok(Position.at(1, 3), Direction.N))).toBe('1 3 N');
  });

  it('formats a Blocked status with O: prefix and obstacle coordinates', () => {
    const status = blocked(Position.at(1, 2), Direction.N, Position.at(1, 3));
    expect(formatOutput(status)).toBe('O:1 2 N 1,3');
  });
});
