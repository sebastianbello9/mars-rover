import { isCommand, type Command } from '../../domain/Command.js';
import type { DirectionCode } from '../../domain/Direction.js';
import type { ExecuteCommandsInput } from '../../application/ExecuteCommandsUseCase.js';

export type ParseResult =
  | { readonly ok: true; readonly value: ExecuteCommandsInput }
  | { readonly ok: false; readonly message: string };

export type CliInput = {
  readonly args: ReadonlyArray<string>;
  readonly stdin: string;
};

const HEADINGS: ReadonlySet<DirectionCode> = new Set(['N', 'E', 'S', 'W']);

export const parseCliInput = (input: CliInput): ParseResult => {
  const flags = parseFlags(input.args);
  if (!flags.ok) return flags;

  const grid = parseGrid(flags.value.grid);
  if (!grid.ok) return grid;

  const start = parseStart(flags.value.start);
  if (!start.ok) return start;

  const obstacles = parseObstacles(flags.value.obstacles);
  if (!obstacles.ok) return obstacles;

  const commands = parseCommandsString(input.stdin);
  if (!commands.ok) return commands;

  return {
    ok: true,
    value: {
      grid: grid.value,
      start: start.value,
      obstacles: obstacles.value,
      commands: commands.value,
    },
  };
};

type Flags = { grid: string | null; start: string | null; obstacles: string | null };

const parseFlags = (
  args: ReadonlyArray<string>,
):
  | { ok: true; value: { grid: string; start: string; obstacles: string | null } }
  | { ok: false; message: string } => {
  const flags: Flags = { grid: null, start: null, obstacles: null };
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    const value = args[i + 1];
    switch (flag) {
      case '--grid':
        flags.grid = value ?? null;
        i++;
        break;
      case '--start':
        flags.start = value ?? null;
        i++;
        break;
      case '--obstacles':
        flags.obstacles = value ?? null;
        i++;
        break;
    }
  }
  if (!flags.grid) return { ok: false, message: 'Missing required flag --grid' };
  if (!flags.start) return { ok: false, message: 'Missing required flag --start' };
  return { ok: true, value: { grid: flags.grid, start: flags.start, obstacles: flags.obstacles } };
};

const parseGrid = (
  raw: string,
): { ok: true; value: { width: number; height: number } } | { ok: false; message: string } => {
  const match = /^(\d+)x(\d+)$/.exec(raw);
  if (!match) return { ok: false, message: `Invalid --grid value "${raw}", expected WxH` };
  const width = Number.parseInt(match[1]!, 10);
  const height = Number.parseInt(match[2]!, 10);
  if (width <= 0 || height <= 0) {
    return { ok: false, message: `Invalid --grid dimensions "${raw}", both must be positive` };
  }
  return { ok: true, value: { width, height } };
};

const parseStart = (
  raw: string,
):
  | { ok: true; value: { x: number; y: number; heading: DirectionCode } }
  | { ok: false; message: string } => {
  const parts = raw.trim().split(/\s+/);
  if (parts.length !== 3) {
    return { ok: false, message: `Invalid --start value "${raw}", expected "X Y HEADING"` };
  }
  const x = Number.parseInt(parts[0]!, 10);
  const y = Number.parseInt(parts[1]!, 10);
  const heading = parts[2]!;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return { ok: false, message: `Invalid start coordinates in "${raw}"` };
  }
  if (!HEADINGS.has(heading as DirectionCode)) {
    return { ok: false, message: `Invalid heading "${heading}", expected one of N, E, S, W` };
  }
  return { ok: true, value: { x, y, heading: heading as DirectionCode } };
};

const parseObstacles = (
  raw: string | null,
): { ok: true; value: Array<{ x: number; y: number }> } | { ok: false; message: string } => {
  if (!raw) return { ok: true, value: [] };
  const out: Array<{ x: number; y: number }> = [];
  for (const pair of raw.split(';')) {
    const [xs, ys] = pair.split(',');
    const x = Number.parseInt(xs ?? '', 10);
    const y = Number.parseInt(ys ?? '', 10);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { ok: false, message: `Invalid obstacle "${pair}", expected "x,y"` };
    }
    out.push({ x, y });
  }
  return { ok: true, value: out };
};

const parseCommandsString = (
  stdin: string,
): { ok: true; value: Command[] } | { ok: false; message: string } => {
  const trimmed = stdin.trim();
  const out: Command[] = [];
  for (const ch of trimmed) {
    if (!isCommand(ch)) {
      return { ok: false, message: `Invalid command character "${ch}" (expected L, R, M)` };
    }
    out.push(ch);
  }
  return { ok: true, value: out };
};
