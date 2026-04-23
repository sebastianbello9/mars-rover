import type { Command } from '../domain/Command.js';
import { Direction, type DirectionCode } from '../domain/Direction.js';
import { Grid } from '../domain/Grid.js';
import { Planet } from '../domain/Planet.js';
import { Position } from '../domain/Position.js';
import { Rover } from '../domain/Rover.js';
import type { RoverStatus } from '../domain/RoverStatus.js';

export type ExecuteCommandsInput = {
  readonly grid: { readonly width: number; readonly height: number };
  readonly start: { readonly x: number; readonly y: number; readonly heading: DirectionCode };
  readonly obstacles: ReadonlyArray<{ readonly x: number; readonly y: number }>;
  readonly commands: ReadonlyArray<Command>;
};

export const executeCommands = (input: ExecuteCommandsInput): RoverStatus => {
  const grid = Grid.create(input.grid.width, input.grid.height);
  const obstacles = input.obstacles.map((o) => Position.at(o.x, o.y));
  const planet = Planet.create(grid, obstacles);

  const heading = Direction.fromCode(input.start.heading);
  if (!heading) {
    throw new RangeError(`Unknown heading code: ${input.start.heading}`);
  }

  const rover = Rover.create(planet, Position.at(input.start.x, input.start.y), heading);
  return rover.execute(input.commands);
};
