import type { Grid } from './Grid.js';
import type { Position } from './Position.js';

export class Planet {
  private readonly obstacles: ReadonlyArray<Position>;

  private constructor(
    public readonly grid: Grid,
    obstacles: ReadonlyArray<Position>,
  ) {
    this.obstacles = [...obstacles];
  }

  static create(grid: Grid, obstacles: ReadonlyArray<Position>): Planet {
    return new Planet(grid, obstacles);
  }

  isBlocked(position: Position): boolean {
    return this.obstacles.some((obstacle) => obstacle.equals(position));
  }
}
