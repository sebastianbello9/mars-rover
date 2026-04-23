import type { Command } from './Command.js';
import type { Direction } from './Direction.js';
import type { Planet } from './Planet.js';
import type { Position } from './Position.js';
import type { RoverStatus } from './RoverStatus.js';
import { blocked, ok } from './RoverStatus.js';

export class Rover {
  private constructor(
    private readonly planet: Planet,
    private readonly position: Position,
    private readonly heading: Direction,
  ) {}

  static create(planet: Planet, position: Position, heading: Direction): Rover {
    return new Rover(planet, position, heading);
  }

  execute(commands: ReadonlyArray<Command>): RoverStatus {
    let position = this.position;
    let heading = this.heading;

    for (const command of commands) {
      switch (command) {
        case 'L':
          heading = heading.turnLeft();
          break;
        case 'R':
          heading = heading.turnRight();
          break;
        case 'M': {
          const next = position.moveBy(heading.vector(), this.planet.grid);
          if (this.planet.isBlocked(next)) {
            return blocked(position, heading, next);
          }
          position = next;
          break;
        }
      }
    }

    return ok(position, heading);
  }
}
