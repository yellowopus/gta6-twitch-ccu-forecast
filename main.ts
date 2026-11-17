// GTA VI launch-day Twitch CCU forecaster (make.fun gta6-twitch-ccu-forecast-01).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
const files = readdirSync(INPUT_DIR).filter((f) => f.endsWith('.in')).sort();
for (const file of files) {
  const id = file.slice(0, -3);
  const c = JSON.parse(readFileSync(join(INPUT_DIR, file), 'utf8'));
  const p1 = Math.max(1, c.known.find((k: any) => k.hour === 1).viewers);
  const hours = c.forecast.map(({ hour }: any) => ({ hour, q: [p1, p1, p1, p1, p1] }));
  writeFileSync(join(OUTPUT_DIR, `${id}.out`), JSON.stringify({ hours }) + '\n');
}
