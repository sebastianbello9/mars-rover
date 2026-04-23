import type { Direction } from './Direction.js';
import type { Position } from './Position.js';

export type RoverStatus =
  | { readonly kind: 'Ok'; readonly position: Position; readonly heading: Direction }
  | {
      readonly kind: 'Blocked';
      readonly lastPosition: Position;
      readonly heading: Direction;
      readonly obstacleAt: Position;
    };

export const ok = (position: Position, heading: Direction): RoverStatus => ({
  kind: 'Ok',
  position,
  heading,
});

export const blocked = (
  lastPosition: Position,
  heading: Direction,
  obstacleAt: Position,
): RoverStatus => ({
  kind: 'Blocked',
  lastPosition,
  heading,
  obstacleAt,
});
