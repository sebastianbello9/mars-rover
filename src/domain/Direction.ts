export type Vector = { readonly dx: number; readonly dy: number };

export type DirectionCode = 'N' | 'E' | 'S' | 'W';

export type Direction = {
  readonly code: DirectionCode;
  turnLeft(): Direction;
  turnRight(): Direction;
  vector(): Vector;
};

const VECTORS: Readonly<Record<DirectionCode, Vector>> = {
  N: { dx: 0, dy: 1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: -1 },
  W: { dx: -1, dy: 0 },
};

const LEFT_OF: Readonly<Record<DirectionCode, DirectionCode>> = {
  N: 'W',
  W: 'S',
  S: 'E',
  E: 'N',
};

const RIGHT_OF: Readonly<Record<DirectionCode, DirectionCode>> = {
  N: 'E',
  E: 'S',
  S: 'W',
  W: 'N',
};

const make = (code: DirectionCode): Direction => ({
  code,
  turnLeft: () => BY_CODE[LEFT_OF[code]],
  turnRight: () => BY_CODE[RIGHT_OF[code]],
  vector: () => VECTORS[code],
});

const BY_CODE: Readonly<Record<DirectionCode, Direction>> = {
  N: make('N'),
  E: make('E'),
  S: make('S'),
  W: make('W'),
};

export const Direction = {
  N: BY_CODE.N,
  E: BY_CODE.E,
  S: BY_CODE.S,
  W: BY_CODE.W,
  fromCode(code: string): Direction | undefined {
    return BY_CODE[code as DirectionCode];
  },
} as const;
