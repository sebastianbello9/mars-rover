import { describe, expect, it } from 'vitest';
import { isCommand } from '../../src/domain/Command.js';

describe('isCommand', () => {
  it.each(['L', 'R', 'M'])('recognizes %s as a command', (value) => {
    expect(isCommand(value)).toBe(true);
  });

  it.each(['l', 'X', '', 'LM', ' '])('rejects %s', (value) => {
    expect(isCommand(value)).toBe(false);
  });
});
