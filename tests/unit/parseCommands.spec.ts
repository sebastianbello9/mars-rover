import { describe, expect, it } from 'vitest';
import { parseCliInput } from '../../src/adapters/cli/parseCommands.js';

describe('parseCliInput', () => {
  it('parses a full valid input with obstacles', () => {
    const result = parseCliInput({
      args: ['--grid', '5x5', '--start', '1 2 N', '--obstacles', '1,3;4,0'],
      stdin: 'LMLMLMLMM\n',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        grid: { width: 5, height: 5 },
        start: { x: 1, y: 2, heading: 'N' },
        obstacles: [
          { x: 1, y: 3 },
          { x: 4, y: 0 },
        ],
        commands: ['L', 'M', 'L', 'M', 'L', 'M', 'L', 'M', 'M'],
      });
    }
  });

  it('defaults obstacles to an empty list when the flag is absent', () => {
    const result = parseCliInput({
      args: ['--grid', '5x5', '--start', '0 0 E'],
      stdin: 'M',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.obstacles).toEqual([]);
    }
  });

  it('rejects missing --grid', () => {
    const result = parseCliInput({
      args: ['--start', '0 0 N'],
      stdin: 'M',
    });

    expect(result).toEqual({ ok: false, message: expect.stringMatching(/--grid/i) });
  });

  it('rejects malformed grid', () => {
    const result = parseCliInput({
      args: ['--grid', 'abc', '--start', '0 0 N'],
      stdin: 'M',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/grid/i);
  });

  it('rejects malformed start', () => {
    const result = parseCliInput({
      args: ['--grid', '5x5', '--start', '0 0 Q'],
      stdin: 'M',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/heading|start/i);
  });

  it('rejects invalid command characters in stdin', () => {
    const result = parseCliInput({
      args: ['--grid', '5x5', '--start', '0 0 N'],
      stdin: 'LMX',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/command/i);
  });

  it('rejects malformed obstacle list', () => {
    const result = parseCliInput({
      args: ['--grid', '5x5', '--start', '0 0 N', '--obstacles', '1,x'],
      stdin: 'M',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/obstacle/i);
  });

  it('trims whitespace from stdin', () => {
    const result = parseCliInput({
      args: ['--grid', '5x5', '--start', '0 0 N'],
      stdin: '  LM\n  ',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.commands).toEqual(['L', 'M']);
  });
});
