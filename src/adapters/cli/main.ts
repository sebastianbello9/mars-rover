import { executeCommands } from '../../application/ExecuteCommandsUseCase.js';
import { formatOutput } from './formatOutput.js';
import { parseCliInput } from './parseCommands.js';

const readStdin = async (): Promise<string> => {
  if (process.stdin.isTTY) return '';
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data;
};

const main = async (): Promise<void> => {
  const stdin = await readStdin();
  const parsed = parseCliInput({ args: process.argv.slice(2), stdin });

  if (!parsed.ok) {
    process.stderr.write(`ERR: ${parsed.message}\n`);
    process.exit(2);
  }

  const status = executeCommands(parsed.value);
  process.stdout.write(`${formatOutput(status)}\n`);
  process.exit(0);
};

void main();
