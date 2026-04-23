import type { RoverStatus } from '../../domain/RoverStatus.js';

export const formatOutput = (status: RoverStatus): string => {
  switch (status.kind) {
    case 'Ok':
      return `${status.position.x} ${status.position.y} ${status.heading.code}`;
    case 'Blocked':
      return `O:${status.lastPosition.x} ${status.lastPosition.y} ${status.heading.code} ${status.obstacleAt.x},${status.obstacleAt.y}`;
  }
};
