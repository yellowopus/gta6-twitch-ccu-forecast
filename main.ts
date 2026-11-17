// GTA VI launch-day Twitch CCU forecaster (make.fun gta6-twitch-ccu-forecast-01).
//
// Deterministic forecast model: hourly ratio curves of comparable game
// launches on Twitch, with two unlock-type pools ensembled in log space.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const TAUS = [0.05, 0.25, 0.5, 0.75, 0.95];
const ZS = [-1.645, -0.674, 0, 0.674, 1.645];
const MIN_Q = 1;
const MAX_Q = 1e9;

interface CaseRow {
  hour: number;
  from: number;
  until: number;
  viewers?: number;
  channels?: number;
  reads?: number;
}

interface Comparable {
  day_start: string;
  unlock: string;
  hourly: Array<{ from: number; viewers: number; channels?: number }>;
}

interface CaseData {
  id: string;
  known: CaseRow[];
  forecast: CaseRow[];
  comparables?: Comparable[];
}

function mean(xs: number[]): number {
  let total = 0;
  for (const x of xs) total += x;
  return total / xs.length;
}

function stdevP(xs: number[]): number {
  const m = mean(xs);
  let total = 0;
  for (const x of xs) total += (x - m) ** 2;
  return Math.sqrt(total / xs.length);
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

function empQuantile(sorted: number[], tau: number): number {
  const n = sorted.length;
  const pos = (n - 1) * tau;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const frac = pos - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

function hourViewersMap(comp: Comparable): Map<number, number> {
  const startMs = Date.parse(comp.day_start);
  const map = new Map<number, number>();
  for (const row of comp.hourly ?? []) {
    const t = Date.parse(String(row.from));
    if (Number.isNaN(t)) continue;
    const hour = Math.round((t - startMs) / 3600000) + 1;
    if (hour >= 1 && hour <= 24 && !map.has(hour)) {
      map.set(hour, row.viewers);
    }
  }
  return map;
}

function poolForecast(
  pool: Array<{ y1: number; yh: number }>,
  p1: number,
): number[] {
  const lr = pool.length > 0 ? pool.map((m) => Math.log(m.yh / m.y1)) : [0.0];
  const sorted = [...lr].sort((a, b) => a - b);
  const mu = mean(lr);
  const s = clamp(stdevP(lr), 0.6, 1.2);
  const q: number[] = [];
  for (let t = 0; t < TAUS.length; t++) {
    const emp = empQuantile(sorted, TAUS[t]);
    q.push(p1 * Math.exp(mu + 0.4 * (emp - mu) + 0.6 * ZS[t] * s));
  }
  return q;
}

function forecastHour(comparables: Comparable[], h: number, p1: number): number[] {
  const base: Array<{ y1: number; yh: number; unlock: string }> = [];
  for (const comp of comparables) {
    const map = hourViewersMap(comp);
    const y1 = map.get(1);
    const yh = map.get(h);
    if (y1 !== undefined && y1 > 0 && yh !== undefined && yh > 0) {
      base.push({ y1, yh, unlock: (comp.unlock ?? '').toLowerCase() });
    }
  }

  const select = (pred: (unlock: string) => boolean) => {
    const pool = base.filter((m) => pred(m.unlock));
    return pool.length >= 3 ? pool : base;
  };

  const poolA = select((u) => u.includes('console') && u.includes('midnight'));
  const poolB = select((u) => u.includes('midnight'));

  const qA = poolForecast(poolA, p1);
  const qB = poolForecast(poolB, p1);

  const q: number[] = [];
  for (let t = 0; t < TAUS.length; t++) {
    q.push(Math.exp(0.3 * Math.log(qA[t]) + 0.7 * Math.log(qB[t])));
  }
  return q.map((v) => clamp(v, MIN_Q, MAX_Q)).sort((a, b) => a - b);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const files = readdirSync(INPUT_DIR).filter((f) => f.endsWith('.in')).sort();
for (const file of files) {
  const id = file.slice(0, -3);
  const c = JSON.parse(readFileSync(join(INPUT_DIR, file), 'utf8')) as CaseData;

  const hourOne = (c.known ?? []).find((k) => k.hour === 1);
  const p1 = Math.max(1, Number(hourOne?.viewers) || 0);

  const hours: Array<{ hour: number; q: number[] }> = [];
  for (let h = 2; h <= 24; h++) {
    hours.push({ hour: h, q: forecastHour(c.comparables ?? [], h, p1) });
  }

  writeFileSync(join(OUTPUT_DIR, `${id}.out`), JSON.stringify({ hours }) + '\n');
}
