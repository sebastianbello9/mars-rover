export type Command = 'L' | 'R' | 'M';

const VALID: ReadonlySet<string> = new Set<Command>(['L', 'R', 'M']);

export const isCommand = (value: string): value is Command => VALID.has(value);
