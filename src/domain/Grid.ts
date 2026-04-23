export type Coordinate = { readonly x: number; readonly y: number };

export class Grid {
  private constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}

  static create(width: number, height: number): Grid {
    if (!Number.isInteger(width) || width <= 0) {
      throw new RangeError(`Grid width must be a positive integer, got ${width}`);
    }
    if (!Number.isInteger(height) || height <= 0) {
      throw new RangeError(`Grid height must be a positive integer, got ${height}`);
    }
    return new Grid(width, height);
  }

  normalize(coord: Coordinate): Coordinate {
    return {
      x: mod(coord.x, this.width),
      y: mod(coord.y, this.height),
    };
  }
}

const mod = (n: number, m: number): number => ((n % m) + m) % m;
