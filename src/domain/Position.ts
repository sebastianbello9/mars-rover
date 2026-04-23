import type { Grid } from './Grid.js';
import type { Vector } from './Direction.js';

export class Position {
  private constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  static at(x: number, y: number): Position {
    return new Position(x, y);
  }

  moveBy(vector: Vector, grid: Grid): Position {
    const next = grid.normalize({ x: this.x + vector.dx, y: this.y + vector.dy });
    return new Position(next.x, next.y);
  }

  equals(other: Position): boolean {
    return this.x === other.x && this.y === other.y;
  }
}
